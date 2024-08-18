require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const logger = require('../../services/logs/winstonLogger');
const Docker = require('dockerode');
const { addToErrorMailQueue } = require('../../services/mail/manageMail');
const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock' || '//./pipe/docker_engine' });

const deleteProjectContainer = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    let user;
    try {
        const { decodedToken, container } = req.body;
        await client.connect();

        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const containersCollection = db.collection('containers');
        const resourcesCollection = db.collection('resources');

        user = await usersCollection.findOne({ userId: decodedToken.userId });
        const projectContainer = await containersCollection.findOne({ userId: user.userId, containerId: container.containerId });

        if (!projectContainer) {
            throw new Error(`${container.containerName} for ${user.username} not found in database.`);
        }

        const containerToDelete = docker.getContainer(projectContainer.containerId);

        if (!containerToDelete) {
            await containersCollection.deleteOne({ userId: user.userId, containerId: container.containerId });
            throw new Error(`${container.containerId} not found.`);
        }

        await containerToDelete.stop();
        await containerToDelete.remove();

        await containersCollection.deleteOne({ userId: user.userId, containerId: container.containerId });

        const updatedResources = {
            userId: user.userId,
            usedResources: {
                Memory: -projectContainer.resourceAllocated.Memory,
                CpuShares: -projectContainer.resourceAllocated.CpuShares
            }
        };

        await resourcesCollection.updateOne(
            { userId: updatedResources.userId },
            { $inc: { 'usedResources.Memory': updatedResources.usedResources.Memory, 'usedResources.CpuShares': updatedResources.usedResources.CpuShares } }
        );

        return res.status(200).json({ info: 'Project container deleted successfully.' });

    } catch (error) {
        logger.error(`ERROR IN DELETING PROJECT CONTAINER: ${error.message}`);
        let mailOptions = {
            from: process.env.FROM_ERROR_MAIL,
            subject: `An error occurred during deleting project container.`,
            to: process.env.TO_ERROR_MAIL,
            text: `Function : deleteProjectContainer \nusername: ${user?.username || 'unknown'}\n Error: ${error}`,
        };

        addToErrorMailQueue(mailOptions)
            .then(() => {
                logger.info('Error mail added.');
            })
            .catch((mailError) => {
                logger.error(`Failed to add error mail alert. ${mailError.message}`);
            });

        return res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error: error.message });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

module.exports = { deleteProjectContainer };
