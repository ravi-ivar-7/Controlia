require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const logger = require('../../services/logs/winstonLogger');
const Docker = require('dockerode');
const bcrypt = require('bcryptjs');
const { addToErrorMailQueue } = require('../../services/mail/manageMail');

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock' || '//./pipe/docker_engine' });

// TODO: updating labels of contaier to update password of domain

// Function to generate basic auth string
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


const getLabInfo = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    let user;
    try {
        const { decodedToken, container } = req.body;

        if (!decodedToken || !container || !container.containerId || !container.volumeName) {
            return res.status(400).json({ warn: 'Missing required fields in request body.' });
        }

        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const containersCollection = db.collection('containers'); // Updated collection name
        const resourcesCollection = db.collection('resources');
        const volumesCollection = db.collection('volumes');

        user = await usersCollection.findOne({ userId: decodedToken.userId });
        if (!user) {
            throw new Error(`User with ID ${decodedToken.userId} not found.`);
        }
        const labInfo = await containersCollection.findOne({ userId: user.userId, containerId: container.containerId });
        if (!labInfo) {
            throw new Error(`Container with ID ${container.containerId} for user ${user.username} not found in the database.`);
        }

        const containerInstance = docker.getContainer(container.containerId);
        const containerData = await containerInstance.inspect();
        const volumeData = await volumesCollection.findOne({ userId: decodedToken.userId, volumeName: container.volumeName });
        const userResources = await resourcesCollection.findOne({ userId: user.userId });

        return res.status(200).json({
            info: 'Fetched lab details.', // Updated message
            containerData,
            volumeData,
            userResources,
            labInfo,
            user
        });

    } catch (error) {
        logger.error(`ERROR IN GETTING LAB INFO: ${error.message}`); // Updated error message

        let mailOptions = {
            from: process.env.FROM_ERROR_MAIL,
            subject: 'An error occurred during fetching lab info.',
            to: process.env.TO_ERROR_MAIL,
            text: `Function: getLabInfo\nUsername: ${user?.username || 'unknown'}\nError: ${error.message}`
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


const changeLabResource = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    let decodedToken, container, newCpus, newMemoryLimit;
    try {
        ({ decodedToken, container, newCpus, newMemoryLimit } = req.body);

        if (!decodedToken || !container || newCpus === undefined || newMemoryLimit === undefined) {
            return res.status(400).json({ warn: 'Missing required parameters.' });
        }

        await client.connect();
        const db = client.db("controlia");
        const containersCollection = db.collection('labs'); // Updated collection name
        const resourcesCollection = db.collection('resources');

        const containerToChange = await containersCollection.findOne({ userId: decodedToken.userId, containerName: container.containerName });
        if (!containerToChange) {
            return res.status(404).json({ warn: 'Container not found.' });
        }

        const containerInstance = docker.getContainer(containerToChange.containerId);

        await containerInstance.update({
            NanoCpus: newCpus * 1e9,
            Memory: newMemoryLimit * 1024 * 1024
        });

        const newResourceAllocated = {
            Memory: Number(newMemoryLimit * 1024 * 1024),
            NanoCpus: Number(newCpus * 1e9),
            Storage: Number(containerToChange.resourceAllocated.Storage)
        };

        await containersCollection.updateOne(
            { userId: decodedToken.userId, containerName: container.containerName },
            { $set: { resourceAllocated: newResourceAllocated } }
        );

        const userResources = await resourcesCollection.findOne({ userId: decodedToken.userId });
        if (!userResources) {
            return res.status(404).json({ warn: 'User resources not found.' });
        }

        const updatedResources = {
            usedResources: {
                Memory: Number(userResources.usedResources.Memory + newResourceAllocated.Memory - containerToChange.resourceAllocated.Memory),
                NanoCpus: Number(userResources.usedResources.NanoCpus + newResourceAllocated.NanoCpus - containerToChange.resourceAllocated.NanoCpus),
                Storage: Number(userResources.usedResources.Storage)
            }
        };

        await resourcesCollection.updateOne(
            { userId: decodedToken.userId },
            { $set: updatedResources }
        );

        return res.status(200).json({ info: `${container.containerName} successfully updated.` });
    } catch (error) {
        console.error('Error during changing lab resources:', error); // Updated error message

        let mailOptions = {
            from: process.env.FROM_ERROR_MAIL,
            subject: 'An error occurred during changing lab resources.',
            to: process.env.TO_ERROR_MAIL,
            text: `Function: changeLabResource\nUsername: ${decodedToken.userId}, NanoCpus: ${newCpus}, Memory: ${newMemoryLimit}, Error: ${error.message}`
        };

        try {
            await addToErrorMailQueue(mailOptions);
            console.log('Error mail added.');
        } catch (err) {
            console.error(`Failed to add error mail alert: ${err.message}`);
        }

        return res.status(500).json({ warn: 'Error during resource update', error: error.message });
    } finally {
        try {
            await client.close();
        } catch (closeError) {
            logger.error(`Failed to close MongoDB client: ${closeError.message}`);
        }
    }
};


const labAction = async (req, res) => {
    let decodedToken, container, labAction, labPassword,labUsername;
    try {
        ({ decodedToken, container, labAction, labPassword, labUsername } = req.body);
        if (!decodedToken || !container || !labAction) {
            return res.status(400).json({ warn: 'Missing required parameters.' });
        }

        const containerInstance = docker.getContainer(container.containerId);
        const containerData = await containerInstance.inspect();
        if (labAction === 'activate') {
            if (containerData.State.Status === 'running') {
                return res.status(200).json({ info: 'Lab is already running.' }); 
            }

            // if (!labPassword || !labUsername) {
            //     return res.status(200).json({ warn: `Username and password is required to activate lab server` }); 
            // }
            try{
                await containerInstance.stop();
            }catch(err){
                console.log(`${err}`)
            }
            

            // const newLabAuthString = await generateBasicAuth(labUsername, labPassword);
            // const currentLabels = containerData.Config.Labels || {};

            // console.log('verify these:', currentLabels, 'and ' ,newLabAuthString)

            // const updatedLabels = {
            //     ...currentLabels,
            //     [`traefik.http.middlewares.${container.subdomains['labServer']}-auth.basicauth.users`]: `${newLabAuthString}`
            // };
            // await containerInstance.update({
            //     Labels: updatedLabels
            // });

            await containerInstance.start();
            return res.status(200).json({ info: 'Lab activated successfully.' }); 

        } else if (labAction === 'deactivate') {
            if (containerData.State.Status !== 'running') {
                return res.status(200).json({ info: 'Lab is already stopped.' }); 
            }

            await containerInstance.stop();
            return res.status(200).json({ info: 'Lab deactivated successfully.' }); 

        } else {
            return res.status(400).json({ warn: 'Invalid lab action.' });
        }

    } catch (error) {
        console.error('Error during lab action:', error);

        let mailOptions = {
            from: process.env.FROM_ERROR_MAIL,
            subject: 'An error occurred during lab action.',
            to: process.env.TO_ERROR_MAIL,
            text: `Function: labAction\nUsername: ${decodedToken.userId}, Error: ${error.message}`
        };

        try {
            await addToErrorMailQueue(mailOptions);
            console.log('Error mail added.');
        } catch (err) {
            console.error(`Failed to add error mail alert: ${err.message}`);
        }

        return res.status(500).json({ warn: 'Error during lab action', error: error.message });
    }
};


module.exports = { getLabInfo, changeLabResource, labAction }