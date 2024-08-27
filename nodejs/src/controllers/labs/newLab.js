require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { addToErrorMailQueue } = require('../../services/mail/manageMail');
const Docker = require('dockerode');
const { createLabContainer } = require('./labContainer');
const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock' });

// Execute a command inside a Docker container
const execCommandInContainer = async (containerId, command) => {
    const container = docker.getContainer(containerId);
    try {
        const exec = await container.exec({
            Cmd: ['sh', '-c', command],
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
        });

        const stream = await exec.start({ hijack: true });

        return new Promise((resolve, reject) => {
            let stdout = '';
            let stderr = '';

            stream.on('data', (data) => {
                stdout += data.toString();
            });

            stream.on('error', (error) => {
                stderr += error.toString();
                reject(new Error(`Error executing command '${command}': ${stderr}`));
            });

            stream.on('end', () => {
                if (stderr) {
                    reject(new Error(`Error executing command '${command}': ${stderr}`));
                } else {
                    resolve(stdout);
                }
            });
        });
    } catch (error) {
        throw new Error(`Failed to execute command '${command}' in container '${containerId}': ${error.message}`);
    }
};

// Create a new lab container
const newLabContainer = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    let accessToken, selectedRepo, decodedToken, containerName, volumeName, labName, user;
    let volume, container, newContainerEntry, newVolumeEntry, updatedResources, ports, labPassword, subdomains, NanoCpus, Memory, cpus, memory, storage, labSource;

    // Clean up resources if an error occurs
    const cleanUp = async () => {
        if (container) {
            try {
                await container.stop();
                await container.remove();
            } catch (err) {
                console.error(`Failed to remove container ${container.name}:`, err.message);
            }
        }

        if (volume) {
            try {
                await volume.remove();
            } catch (err) {
                console.error(`Failed to remove volume:`, err.message);
            }
        }

        if (newContainerEntry) {
            try {
                await containersCollection.deleteOne({ containerId: newContainerEntry.containerId });
            } catch (err) {
                console.error(`Failed to remove container entry ${newContainerEntry.containerId}:`, err.message);
            }
        }
        if (newVolumeEntry) {
            try {
                await volumesCollection.deleteOne({ userId: user.userId, volumeName: volumeName });
            } catch (err) {
                console.error(`Failed to remove volume entry ${newVolumeEntry.volumeName}:`, err.message);
            }
        }
        if (updatedResources) {
            try {
                await resourcesCollection.updateOne(
                    { userId: updatedResources.userId },
                    { $inc: { 'usedResources.Memory': -updatedResources.usedResources.Memory, 'usedResources.NanoCpus': -updatedResources.usedResources.NanoCpus } }
                );
            } catch (err) {
                console.error(`Failed to update resource usage for ${updatedResources.userId}:`, err.message);
            }
        }
    };

    try {
        ({ accessToken, selectedRepo, decodedToken, cpus, memory, storage, labSource, selectedVolume, labName ,labPassword , labUsername} = req.body);

        // Validate required parameters
        if (!labName) {
            return res.status(209).json({ warn: `Missing: labSource: ${labSource} or labName: ${labName}` });
        }
        if (labSource === 'github' && (!selectedRepo || !accessToken)) {
            return res.status(209).json({ warn: `Missing: selectedRepo: ${selectedRepo} or accessToken: ${accessToken}` });
        }

        NanoCpus = cpus * 1e9; // Convert cores to nanoseconds
        Memory = memory * 1024 * 1024; // Convert MB to bytes

        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const containersCollection = db.collection('containers');
        const volumesCollection = db.collection('volumes');
        const resourcesCollection = db.collection('resources');
        user = await usersCollection.findOne({ userId: decodedToken.userId });
        const userResources = await resourcesCollection.findOne({ userId: user.userId });

        // Determine volume and container names
        if (selectedVolume.volumeName === 'New Volume') {
            volumeName = `${user.username}_${labName}_lab_volume`;
            containerName = `${user.username}_${labName}_lab_container`;
        } else {
            volumeName = selectedVolume.volumeName;
            containerName = `${user.username}_${labName}_lab_container`;
            await volumesCollection.findOneAndUpdate(
                { userId: user.userId, volumeName: volumeName },
                { $set: { containerName: containerName, labName: labName } },
            );
        }

        // Check if the container name already exists
        const containers = await docker.listContainers({ all: true });
        if (containers.some(container => container.Names.includes(`/${containerName}`))) {
            return res.status(209).json({ warn: `${labName} already exists.` });
        }

        // Create the lab container
        ({ container, volume, subdomains, ports, authStrings } = await createLabContainer(user, Memory, NanoCpus, storage, containerName, volumeName, labName,labUsername, labPassword));

        // Handle GitHub repository source
        if (labSource === 'github') {
            const zipUrl = `https://github.com/${selectedRepo.full_name}/archive/refs/heads/${selectedRepo.default_branch}.zip`;
            const LAB_DIR = `root`;
            const zipFilePath = `root/${selectedRepo.name}.zip`;
            const targetDirName = `root/${selectedRepo.name}`;

            const fetchCommand = `curl -L -H "Authorization: token ${accessToken}" -H "Accept: application/vnd.github.v3.raw" ${zipUrl} -o ${zipFilePath}`;
            await execCommandInContainer(container.id, fetchCommand);

            const cleanupCommand = `
                rm -rf ${targetDirName} && \
                unzip -o ${zipFilePath} -d ${LAB_DIR} && \
                mv ${LAB_DIR}/${selectedRepo.name}-${selectedRepo.default_branch} ${targetDirName} && \
                rm ${zipFilePath}
            `;
            await execCommandInContainer(container.id, cleanupCommand);
        }

        // Insert new container and volume records into the database
        newContainerEntry = {
            userId: user.userId,
            containerId: container.id,
            containerName,
            labName,
            type: 'jupyterLab',
            volumeName,
            resourceAllocated: { Memory: Memory, NanoCpus: NanoCpus, Storage: Number(storage) },
            createdAt: new Date(),
            subdomains,
            ports,
            labServerPID: null,
            containerConfig: {}
        };
        await containersCollection.insertOne(newContainerEntry);

        newVolumeEntry = {
            userId: user.userId,
            containerName: newContainerEntry.containerName,
            volumeName: volumeName,
            labName,
            createdAt: new Date(),
        };
        await volumesCollection.insertOne(newVolumeEntry);


        updatedResources = {
            userId: user.userId,
            usedResources: {
                Memory: userResources.usedResources.Memory + Memory,
                NanoCpus: userResources.usedResources.NanoCpus + NanoCpus,
                Storage: Number(userResources.usedResources.Storage) + Number(storage)
            }
        };
        await resourcesCollection.updateOne(
            { userId: user.userId },
            { $set: updatedResources }
        );

        // Send success response
        res.status(200).json({ success: `Container ${containerName} created successfully.` });

    } catch (err) {
        await cleanUp();
        console.error(err);
        addToErrorMailQueue({
            subject: `Error creating lab container for ${decodedToken.userId}`,
            message: err.message
        });
        res.status(500).json({ error: 'An error occurred while creating the container. Please try again later.' });
    } finally {
        await client.close();
    }
};

module.exports = { newLabContainer };
