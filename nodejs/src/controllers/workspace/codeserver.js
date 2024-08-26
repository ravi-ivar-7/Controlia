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
        const { decodedToken, container, newPassword } = req.body;
        await client.connect();
        console.log('starting container')

        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const containersCollection = db.collection('containers');

        user = await usersCollection.findOne({ userId: decodedToken.userId });
        const codeServerContainer = await containersCollection.findOne({ userId: user.userId, containerId: container.containerId });

        if (!codeServerContainer) {
            throw new Error(`Container ${container.containerId} for user ${user.username} not found.`);
        }

        const containerInstance = docker.getContainer(container.containerId);

        try {
            const containerInfo = await containerInstance.inspect();
            if (containerInfo.State.Status !== 'running') {
                console.log(`Container ${container.containerId} is not running. Attempting to start...`);
                await containerInstance.start();
                console.log(`Container ${container.containerId} has been started.`);
            } else {
                console.log(`Container ${container.containerId} is already running.`);
            }
        } catch (error) {
            console.error(`Error while starting the container: ${error.message}`);
        }
        if(!newPassword){
            return res.status(209).json({warn:`Password is requried`})
        }


        // Kill previous Code Server instance if it exists
        console.log(`Killing process with PID: ${codeServerContainer.codeServerPID}`);

        if (codeServerContainer.codeServerPID) {
            try {
                const execKill = await containerInstance.exec({
                    Cmd: ['sh', '-c', `kill -9 ${codeServerContainer.codeServerPID}`],
                    AttachStdout: true,
                    AttachStderr: true,
                    Tty: false,
                });
                await execKill.start();
                console.log(`Successfully killed process with PID: ${codeServerContainer.codeServerPID}`);
            } catch (error) {
                console.error(`Failed to kill process with PID: ${codeServerContainer.codeServerPID}`, error);
            }
        }
        console.log(newPassword)
        
        const exec = await containerInstance.exec({
            Cmd: [
                'sh',
                '-c',
                `code-server --bind-addr 0.0.0.0:${codeServerContainer.ports['codeServerPort']} --auth password --disable-telemetry --user-data-dir /root > /dev/null 2>&1 & echo $!`
            ],
            Env: [
                `PASSWORD=${newPassword}`
            ],
            AttachStdout: true,
            AttachStderr: true,
            Tty: false,
        });
        
        // Start the exec command and get the stream
        const stream = await exec.start();
        
        let output = '';
        
        // Capture the output to get the new PID
        stream.on('data', (data) => {
            output += data.toString();  // Accumulate output to capture the new PID
        });
        
        await new Promise((resolve) => {
            stream.on('end', resolve);
        });
        
        // Clean the output to extract the new PID
        newPID = output.replace(/[^\x20-\x7E]/g, '').trim();
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
