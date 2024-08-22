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


const getContainerInfo = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    let user;
    try {
        const { decodedToken, container } = req.body;

        if (!decodedToken || !container || !container.containerId || !container.volumeName) {
            return res.status(400).json({ warn: 'Missing required fields in request body.' });
        }

        await client.connect();

        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const containersCollection = db.collection('containers');
        const resourcesCollection = db.collection('resources');

        user = await usersCollection.findOne({ userId: decodedToken.userId });
        if (!user) {
            throw new Error(`User with ID ${decodedToken.userId} not found.`);
        }

        const projectContainer = await containersCollection.findOne({ userId: user.userId, containerId: container.containerId });
        if (!projectContainer) {
            throw new Error(`Container with ID ${container.containerId} for user ${user.username} not found in the database.`);
        }

        const containerInstance = docker.getContainer(container.containerId);
        const containerData = await containerInstance.inspect();

        const volume = docker.getVolume(container.volumeName);
        const volumeData = await volume.inspect();

        const userResources = await resourcesCollection.findOne({ userId: user.userId });

        return res.status(200).json({
            info: 'Fetched workspace details.',
            containerData,
            volumeData,
            userResources
        });

    } catch (error) {
        logger.error(`ERROR IN GETTING CONTAINER INFO: ${error.message}`);

        let mailOptions = {
            from: process.env.FROM_ERROR_MAIL,
            subject: `An error occurred during fetching project container info.`,
            to: process.env.TO_ERROR_MAIL,
            text: `Function: getContainerInfo\nUsername: ${user?.username || 'unknown'}\nError: ${error.message}`
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


const startCodeServer = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    let newPID, user;
    
    try {
        const { decodedToken, container } = req.body;
        await client.connect();

        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const containersCollection = db.collection('containers');

        user = await usersCollection.findOne({ userId: decodedToken.userId });
        const codeServerContainer = await containersCollection.findOne({ userId: user.userId, containerId: container.containerId });

        if (!codeServerContainer) {
            throw new Error(`Container ${container.containerId} for user ${user.username} not found.`);
        }

        const newCodeserverAuthString = await generateBasicAuth(`${user.username}_codeserver`, `${user.username}_password`);
        console.log(newCodeserverAuthString)

        const containerInstance = docker.getContainer(container.containerId);
        await containerInstance.update({
            Labels: {
                [`traefik.http.middlewares.codeserver_auth.basicauth.users`]: newCodeserverAuthString,
            },
        });

        // Kill previous Code Server instance if it exists
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
            Cmd: ['sh', '-c', `nohup code-server --bind-addr 0.0.0.0:${codeServerContainer.ports['codeServerPort']} --auth none --disable-telemetry --user-data-dir /root > /dev/null 2>&1 & echo $!`],
            AttachStdout: true,
            AttachStderr: true,
            Tty: false,
        });
        

        const stream = await exec.start();
        let output = '';

        stream.on('data', (data) => {
            output += data.toString();
        });

        await new Promise((resolve) => {
            stream.on('end', resolve);
        });

        newPID = output.replace(/[^\x20-\x7E]/g, '').trim();

        if (!newPID) {
            throw new Error('Failed to retrieve new PID for the Code Server.');
        }

        // Update the container's PID  and auth sting in MongoDB
        await containersCollection.findOneAndUpdate(
            { userId: decodedToken.userId, containerName: container.containerName }, 
            { 
                $set: { 
                    codeServerPID: newPID, 
                    'authStrings.codeserverAuthString': newCodeserverAuthString 
                }
            }
        );

        return res.status(200).json({ info: 'Code Server started successfully.', newPID });

    } catch (error) {
        logger.error(`ERROR IN STARTING CODE SERVER: ${error.message}`);
        const mailOptions = {
            from: process.env.FROM_ERROR_MAIL,
            subject: `An error occurred during starting Code Server.`,
            to: process.env.TO_ERROR_MAIL,
            text: `Function: startCodeServer\nUsername: ${user?.username || 'unknown'}\nError: ${error.message}`,
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
    const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
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

        if (!codeServerContainer || !codeServerContainer.codeServerPID) {
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


const changeContainerResource = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        const { decodedToken, container, newCpus, newMemoryLimit } = req.body;

        if (!decodedToken || !container || newCpus === undefined || newMemoryLimit === undefined) {
            return res.status(400).json({ warn: 'Missing required parameters.' });
        }

        await client.connect();
        const db = client.db("controlia");
        const containersCollection = db.collection('containers');
        const resourcesCollection = db.collection('resources');

        // Fetch the container entry from MongoDB
        const containerToChange = await containersCollection.findOne({ userId: decodedToken.userId, containerName: container.containerName });
        if (!containerToChange) {
            return res.status(404).json({ warn: 'Container not found.' });
        }

        // Get Docker container instance
        const containerInstance = docker.getContainer(containerToChange.containerId);

        // Update the container's resources
        await containerInstance.update({
            NanoCpus: newCpus * 1e9, // Convert CPU cores to nanoseconds
            Memory: newMemoryLimit * 1024 * 1024  // Convert MB to bytes
        });

        // Update container entry in MongoDB
        const newResourceAllocated = {
            Memory: newMemoryLimit * 1024 * 1024,
            NanoCpus: newCpus * 1e9
        };

        await containersCollection.updateOne(
            { userId: decodedToken.userId, containerName: container.containerName },
            { $set: { resourceAllocated: newResourceAllocated } }
        );

        // Retrieve the user's current resource usage
        const userResources = await resourcesCollection.findOne({ userId: decodedToken.userId });
        if (!userResources) {
            return res.status(404).json({ warn: 'User resources not found.' });
        }

        // Calculate the updated resource usage
        const updatedResources = {
            usedResources: {
                Memory: userResources.usedResources.Memory + newResourceAllocated.Memory,
                NanoCpus: userResources.usedResources.NanoCpus + newResourceAllocated.NanoCpus
            }
        };

        // Update the user's resource usage in MongoDB
        await resourcesCollection.updateOne(
            { userId: decodedToken.userId },
            { $set: updatedResources }
        );

        return res.status(200).json({ info: `${container.containerName} successfully updated.` });
    } catch (error) {
        console.error('Error during changing container resources:', error);

        // Clean up resources if needed
        // await cleanUp();

        let mailOptions = {
            from: process.env.FROM_ERROR_MAIL,
            subject: 'An error occurred during changing container resources.',
            to: process.env.TO_ERROR_MAIL,
            text: `Function: changeContainerResource\nUsername: ${decodedToken.userId}, NanoCpus: ${newCpus}, Memory: ${newMemoryLimit}, Error: ${error.message}`,
        };

        addToErrorMailQueue(mailOptions)
            .then(() => {
                console.log('Error mail added.');
            })
            .catch((err) => {
                console.error(`Failed to add error mail alert. ${err}`);
            });

        return res.status(500).json({ warn: 'Error during resource update', error: error.message });
    } finally {
        await client.close();
    }
};

module.exports = { getContainerInfo , changeContainerResource};
