require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const logger = require('../../services/logs/winstonLogger');
const Docker = require('dockerode');
const { addToErrorMailQueue } = require('../../services/mail/manageMail');
const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock' || '//./pipe/docker_engine' });


async function generateBasicAuth(user, password) {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const authString = `${user}:${hashedPassword}`;
        return authString;
    } catch (error) {
        console.error('Error generating hash:', error);
        throw error;
    }
}


const restartCodeServer = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    let newPID, user;

    try {
        const { decodedToken, container, newUsername, newPassword } = req.body;
        await client.connect();

        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const containersCollection = db.collection('containers');

        user = await usersCollection.findOne({ userId: decodedToken.userId });
        const codeServerContainer = await containersCollection.findOne({ userId: user.userId, containerId: container.containerId });

        if (!codeServerContainer) {
            throw new Error(`Container ${container.containerId} for user ${user.username} not found.`);
        }

        const containerInstance = docker.getContainer(container.containerId);

        if (newUsername && newPassword) {
            const newCodeserverAuthString = await generateBasicAuth(`${newUsername}`, `${newPassword}`);
            console.log(newCodeserverAuthString)
            await containerInstance.update({
                Labels: {
                    [`traefik.http.middlewares.codeserver_auth.basicauth.users`]: newCodeserverAuthString,
                },
            });
            
        }


        // Kill previous Code Server instance if it exists
        console.log(`Killing ${codeServerContainer.codeServerPID} process`);

        if (codeServerContainer.codeServerPID) {
            const execKill = await containerInstance.exec({
                Cmd: ['sh', '-c', `kill -9 ${codeServerContainer.codeServerPID}`],
                AttachStdout: true,
                AttachStderr: true,
                Tty: false,
            });
            await execKill.start();
        }

        const exec = await containerInstance.exec({
            Cmd: [
                'sh',
                '-c',
                `PASSWORD='1234' code-server --bind-addr 0.0.0.0:${codeServerContainer.ports['codeServerPort']} --auth password --disable-telemetry --user-data-dir /root > /dev/null 2>&1 & echo $!`
            ],
            AttachStdout: true,
            AttachStderr: true,
            Tty: false,
        });


        // Start the exec command and get the stream
        const stream = await exec.start();

        let output = '';

        // Pipe the output to process stdout and stderr
        stream.on('data', (data) => {
            console.log(data.toString());
            output += data.toString();  // Accumulate output to capture the new PID
        });

        await new Promise((resolve) => {
            stream.on('end', resolve);
        });

        // Clean the output to extract the new PID
        const newPID = output.replace(/[^\x20-\x7E]/g, '').trim();
        console.log('New PID:', newPID);

        if (!newPID) {
            throw new Error('Failed to retrieve new PID for the Code Server.');
        }

        // Update the container's document with the new PID in the database
        await containersCollection.findOneAndUpdate(
            { userId: decodedToken.userId, containerName: container.containerName },
            {
                $set: {
                    codeServerPID: newPID,
                }
            }
        );
        return res.status(200).json({ info: 'Code Server started successfully.', codeServerUrl: `${container.subdomains['codeServer']}` });


    } catch (error) {
        logger.error(`ERROR IN STARTING CODE SERVER: ${error.message}`);
        const mailOptions = {
            from: process.env.FROM_ERROR_MAIL,
            subject: `An error occurred during starting Code Server.`,
            to: process.env.TO_ERROR_MAIL,
            text: `Function: restartCodeServer\nUsername: ${user?.username || 'unknown'}\nError: ${error.message}`,
        };

        try {
            await addToErrorMailQueue(mailOptions);
            logger.info('Error mail added.');
        } catch (mailError) {
            logger.error(`Failed to add error mail alert: ${mailError.message}`);
        }

        return res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error: error.message });
    } finally {
        try {
            await client.close();
        } catch (closeError) {
            logger.error(`Failed to close MongoDB client: ${closeError.message}`);
        }
    }
};

const stopCodeServer = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL,);
    let user;
    try {
        const { decodedToken, container } = req.body;
        await client.connect();

        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const containersCollection = db.collection('containers');

        // Retrieve user and container information
        user = await usersCollection.findOne({ userId: decodedToken.userId });
        const codeServerContainer = await containersCollection.findOne({ userId: user.userId, containerId: container.containerId });

        if (!codeServerContainer) {
            throw new Error(`Code-server for container ${container.containerName} is not running or PID is not found.`);
        }

        // Stop the code-server process
        const containerToStop = docker.getContainer(codeServerContainer.containerId);
        const execKill = await containerToStop.exec({
            Cmd: ['sh', '-c', `kill -9 ${codeServerContainer.codeServerPID}`],
            AttachStdout: true,
            AttachStderr: true,
            Tty: false,
        });

        // Execute the kill command
        await execKill.start();

        // Update the container record to remove the stored PID
        await containersCollection.updateOne(
            { userId: user.userId, containerId: container.containerId },
            { $unset: { codeServerPID: "" } }
        );

        return res.status(200).json({ info: 'Code-server stopped successfully.' });

    } catch (error) {
        logger.error(`ERROR IN STOPPING CODE-SERVER: ${error.message}`);
        let mailOptions = {
            from: process.env.FROM_ERROR_MAIL,
            subject: `An error occurred during stopping code-server.`,
            to: process.env.TO_ERROR_MAIL,
            text: `Function: stopCodeServer\nUsername: ${user?.username || 'unknown'}\nError: ${error.message}`,
        };

        try {
            await addToErrorMailQueue(mailOptions);
            logger.info('Error mail added.');
        } catch (mailError) {
            logger.error(`Failed to add error mail alert: ${mailError.message}`);
        }

        return res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error: error.message });
    } finally {
        try {
            await client.close();
        } catch (closeError) {
            logger.error(`Failed to close MongoDB client: ${closeError.message}`);
        }
    }
};


module.exports = { restartCodeServer, stopCodeServer }

// docker exec  hello_3_workspace_container code-server --bind-addr localhost:8081 .
