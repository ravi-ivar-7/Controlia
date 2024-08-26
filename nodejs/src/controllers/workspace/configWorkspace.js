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


const getWorkspaceInfo = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL,);
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
        const volumesCollection = db.collection('volumes');

        user = await usersCollection.findOne({ userId: decodedToken.userId });
        if (!user) {
            throw new Error(`User with ID ${decodedToken.userId} not found.`);
        }

        const workspaceInfo = await containersCollection.findOne({ userId: user.userId, containerId: container.containerId });
        if (!workspaceInfo) {
            throw new Error(`Container with ID ${container.containerId} for user ${user.username} not found in the database.`);
        }

        const containerInstance = docker.getContainer(container.containerId);
        const containerData = await containerInstance.inspect();

        // const volume = docker.getVolume(container.volumeName);
        // const volumeData = await volume.inspect();

        const volumeData = await volumesCollection.findOne({ userId: decodedToken.userId, volumeName: container.volumeName })

        const userResources = await resourcesCollection.findOne({ userId: user.userId });
        return res.status(200).json({
            info: 'Fetched workspace details.',
            containerData,
            volumeData,
            userResources,
            workspaceInfo,
            user
        });

    } catch (error) {
        logger.error(`ERROR IN GETTING CONTAINER INFO: ${error.message}`);

        let mailOptions = {
            from: process.env.FROM_ERROR_MAIL,
            subject: `An error occurred during fetching workspace container info.`,
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

const changeWorkspaceResource = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    let decodedToken, container, newCpus, newMemoryLimit
    try {
        ({ decodedToken, container, newCpus, newMemoryLimit } = req.body)
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
            Memory: Number(newMemoryLimit * 1024 * 1024),
            NanoCpus: Number(newCpus * 1e9),
            Storage: Number(containerToChange.resourceAllocated.Storage)
        };

        console.log(newResourceAllocated, '1')

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
                Memory: Number(userResources.usedResources.Memory + newResourceAllocated.Memory - containerToChange.resourceAllocated.Memory),
                NanoCpus: Number(userResources.usedResources.NanoCpus + newResourceAllocated.NanoCpus - containerToChange.resourceAllocated.NanoCpus),
                Storage: Number(userResources.usedResources.Storage)
            }
        };

        console.log(updatedResources)
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

const workspaceAction = async (req, res) => {
    let decodedToken, container, workspaceAction, workspacePassword
    try {
        ({ decodedToken, container, workspaceAction, workspacePassword } = req.body);

        if (!decodedToken || !container || !workspaceAction) {
            return res.status(400).json({ warn: 'Missing required parameters.' });
        }
        const containerInstance = docker.getContainer(container.containerId);
        const containerData = await containerInstance.inspect();
        if (workspaceAction === 'activate') {
            if (containerData.State.Status === 'running') {
                return res.status(200).json({ info: 'Workspace is already running.' });
            }

            await containerInstance.start();
            return res.status(200).json({ info: 'Workspace activated successfully.' });

        } else if (workspaceAction === 'deactivate') {
            if (containerData.State.Status !== 'running') {
                return res.status(200).json({ info: 'Workspace is already stopped.' });
            }

            await containerInstance.stop();
            return res.status(200).json({ info: 'Workspace deactivated successfully.' });

        } else if (workspaceAction === 'restartCodeserver') {
            if (containerData.State.Status === 'running') {
                // Stop the running code-server instance
                const stopExec = await containerInstance.exec({
                    Cmd: [
                        'sh',
                        '-c',
                        `pkill -f "code-server --bind-addr"`
                    ],
                    AttachStdout: true,
                    AttachStderr: true,
                    Tty: false,
                });

                // Start the exec command and wait for it to complete
                const stopExecStream = await stopExec.start();

                // Collect the output to ensure it completes
                await new Promise((resolve, reject) => {
                    stopExecStream.on('data', (chunk) => {
                        console.log('Output:', chunk.toString());
                    });
                    stopExecStream.on('end', resolve);
                    stopExecStream.on('error', reject);
                });
            }

            // Start code-server with the new password
            const exec = await containerInstance.exec({
                Cmd: [
                    'sh',
                    '-c',
                    `code-server --bind-addr 0.0.0.0:${container.ports['codeServerPort']} --auth password --disable-telemetry --user-data-dir /root > /dev/null 2>&1 & echo $!`
                ],
                Env: [
                    `PASSWORD=${workspacePassword}`
                ],
                AttachStdout: true,
                AttachStderr: true,
                Tty: false,
            });

            const execStream = await exec.start();

            // Handle the output stream of the exec command
            await new Promise((resolve, reject) => {
                execStream.on('data', (chunk) => {
                    console.log('Output:', chunk.toString());
                });
                execStream.on('end', resolve);
                execStream.on('error', reject);
            });

            return res.status(200).json({ info: 'Workspace restarted successfully.' });



        } else {
            return res.status(400).json({ warn: 'Invalid workspace action.' });
        }

    } catch (error) {
        console.error('Error during container action:', error);

        let mailOptions = {
            from: process.env.FROM_ERROR_MAIL,
            subject: 'An error occurred during container action.',
            to: process.env.TO_ERROR_MAIL,
            text: `Function: workspaceAction\nUsername: ${decodedToken.userId}, Error: ${error.message}`,
        };

        try {
            await addToErrorMailQueue(mailOptions);
            console.log('Error mail added.');
        } catch (err) {
            console.error(`Failed to add error mail alert. ${err}`);
        }

        return res.status(500).json({ warn: 'Error during workspace action', error: error.message });
    }
}



module.exports = { getWorkspaceInfo, changeWorkspaceResource, workspaceAction };