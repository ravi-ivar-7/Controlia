require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const logger = require('../../services/logs/winstonLogger');
const Docker = require('dockerode');
const { addToErrorMailQueue } = require('../../services/mail/manageMail');

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock' || '//./pipe/docker_engine' });

// Function to delete a Docker volume
const deleteVolume = async (volumeName) => {
    try {
        const volumeToDelete = docker.getVolume(volumeName);
        await volumeToDelete.inspect();
        await volumeToDelete.remove();
    } catch (error) {
        logger.error(`ERROR IN DELETING VOLUME: ${error.message}`);
        throw new Error(`Error deleting volume ${volumeName}: ${error.message}`);
    }
};

// Function to delete a lab container
const deleteLabContainer = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    let user;
    try {
        const { decodedToken, container, deleteType } = req.body;

        console.log(decodedToken, container, deleteType)
        // Validate inputs
        if (!decodedToken || !container || !deleteType) {
            return res.status(400).json({ error: 'Invalid request data.' });
        }

        

        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const containersCollection = db.collection('containers');
        const resourcesCollection = db.collection('resources');
        const volumesCollection = db.collection('volumes');

        // Fetch user and lab container data
        user = await usersCollection.findOne({ userId: decodedToken.userId });
        const labContainer = await containersCollection.findOne({ userId: user.userId, containerId: container.containerId });

        if (!labContainer) {
            throw new Error(`Container ${container.containerName} for ${user.username} not found in the database.`);
        }

        const containerToDelete = await docker.getContainer(labContainer.containerId);
        const containerInspect = await containerToDelete.inspect();

        if (!containerInspect) {
            await containersCollection.deleteOne({ userId: user.userId, containerId: container.containerId });
            throw new Error(`Container ${container.containerId} not found.`);
        }

        // Stop the container if it's running
        if (containerInspect.State.Running) {
            console.log('Stopping the container...');
            await containerToDelete.stop();
        } else {
            console.log('Container is already stopped.');
        }

        // Remove the container
        console.log('Removing the container...');
        await containerToDelete.remove();
        console.log('Container removed successfully.');

        // Remove container record from database
        await containersCollection.deleteOne({ userId: user.userId, containerId: container.containerId });

        // Update resource usage
        const updatedResources = {
            userId: user.userId,
            usedResources: {
                Memory: -Number(labContainer.resourceAllocated.Memory),
                NanoCpus: -Number(labContainer.resourceAllocated.NanoCpus),
                Storage: -Number(labContainer.resourceAllocated.Storage),
            }
        };

        await resourcesCollection.updateOne(
            { userId: updatedResources.userId },
            { $inc: {
                'usedResources.Memory': updatedResources.usedResources.Memory,
                'usedResources.NanoCpus': updatedResources.usedResources.NanoCpus,
                'usedResources.Storage': updatedResources.usedResources.Storage
            }}
        );

        // Handle volume deletion based on deleteType
        if (deleteType === 'deleteOnlyContainer') {
            await volumesCollection.updateOne(
                { userId: user.userId, volumeName: container.volumeName },
                { $set: { containerName: '', labName: '' } }
            );
        } else if (deleteType === 'deleteContainerAndVolume') {
            await deleteVolume(container.volumeName);
            await volumesCollection.findOneAndDelete({ userId: user.userId, volumeName: container.volumeName });
        } else {
            return res.status(400).json({ warn: `Unsupported delete operation: ${deleteType}` });
        }

        return res.status(200).json({ info: 'Lab container deleted successfully.' });

    } catch (error) {
        logger.error(`ERROR IN DELETING LAB CONTAINER: ${error.message}`);

        // Prepare and send error notification
        let mailOptions = {
            from: process.env.FROM_ERROR_MAIL,
            subject: `An error occurred during deleting Lab container.`,
            to: process.env.TO_ERROR_MAIL,
            text: `Function: deleteLabContainer\nUsername: ${user?.username || 'unknown'}\nError: ${error.message}`,
        };

        try {
            await addToErrorMailQueue(mailOptions);
            logger.info('Error mail added.');
        } catch (mailError) {
            logger.error(`Failed to add error mail alert: ${mailError.message}`);
        }

        return res.status(500).json({ error: 'INTERNAL SERVER ERROR', details: error.message });
    } finally {
        try {
            await client.close();
        } catch (closeError) {
            logger.error(`Failed to close MongoDB client: ${closeError.message}`);
        }
    }
};

module.exports = { deleteLabContainer };
