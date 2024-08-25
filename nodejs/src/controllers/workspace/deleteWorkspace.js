
require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const logger = require('../../services/logs/winstonLogger');
const Docker = require('dockerode');
const { addToErrorMailQueue } = require('../../services/mail/manageMail');
const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock' || '//./pipe/docker_engine' });



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

const deleteWorkspaceContainer = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    let user;
    try {
        const { decodedToken, container, deleteType } = req.body;
        await client.connect();

        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const containersCollection = db.collection('containers');
        const resourcesCollection = db.collection('resources');
        const volumesCollection = db.collection('volumes');

        user = await usersCollection.findOne({ userId: decodedToken.userId });
        const workspaceContainer = await containersCollection.findOne({ userId: user.userId, containerId: container.containerId });

        if (!workspaceContainer) {
            throw new Error(`Container ${container.containerName} for ${user.username} not found in the database.`);
        }

        const containerToDelete = docker.getContainer(workspaceContainer.containerId);
        const containerInspect = await containerToDelete.inspect();

        if (!containerInspect) {
            await containersCollection.deleteOne({ userId: user.userId, containerId: container.containerId });
            throw new Error(`Container ${container.containerId} not found.`);
        }

        await containerToDelete.stop();
        await containerToDelete.remove();
        await containersCollection.deleteOne({ userId: user.userId, containerId: container.containerId });

        const updatedResources = {
            userId: user.userId,
            usedResources: {
                Memory: -Number(workspaceContainer.resourceAllocated.Memory),
                NanoCpus: -Number(workspaceContainer.resourceAllocated.NanoCpus),
                Storage: -Number(workspaceContainer.resourceAllocated.Storage),
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
        

        if (deleteType === 'deleteOnlyContainer') {
            await volumesCollection.updateOne(
                { userId: user.userId, volumeName: container.volumeName },
                { $unset: { containerId: "" , workspaceName:''} }
            );
        } else if (deleteType === 'deleteContainerAndVolume') {
            await deleteVolume(container.volumeName);
            await volumesCollection.findOneAndDelete({ userId: user.userId, volumeName: container.volumeName });
        }

        return res.status(200).json({ info: 'workspace container deleted successfully.' });

    } catch (error) {
        logger.error(`ERROR IN DELETING workspace CONTAINER: ${error.message}`);
        let mailOptions = {
            from: process.env.FROM_ERROR_MAIL,
            subject: `An error occurred during deleting workspace container.`,
            to: process.env.TO_ERROR_MAIL,
            text: `Function: deleteWorkspaceContainer\nUsername: ${user?.username || 'unknown'}\nError: ${error.message}`,
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
module.exports = { deleteWorkspaceContainer };
