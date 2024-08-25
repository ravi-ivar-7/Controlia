require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { addToErrorMailQueue } = require('../../services/mail/manageMail');
const Docker = require('dockerode');
const { createWorkspaceContainer } = require('./workspaceContainer');
const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock' });

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

const newWorkspaceContainer = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    let accessToken, selectedRepo, decodedToken, containerName, volumeName, workspaceName, workspaceVolume, user;
    let volume, container, newContainerEntry, newVolumeEntry, updatedResources, ports, authStrings, subdomains, NanoCpus, Memory, cpus, memory,storage, workspaceSource

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
        ({ accessToken, selectedRepo, decodedToken, cpus, memory, storage, workspaceSource, selectedVolume, workspaceName } = req.body);

        if (!workspaceName) {
            return res.status(209).json({ warn: `Missing: workspaceSource: ${workspaceSource} or workspaceName: ${workspaceName}` });
        }
        if (workspaceSource === 'github' && (!selectedRepo || !accessToken)) {
            return res.status(209).json({ warn: `Missing: selectedRepo: ${selectedRepo} or accessToken: ${accessToken}` });
        }
        // console.log(accessToken, selectedRepo, decodedToken, cpus, memory, workspaceSource, selectedVolume, workspaceName)

        NanoCpus = cpus * 1e9; // 1 core = 1 billion nanoseconds
        // Convert memory from MB to bytes
        Memory = memory * 1024 * 1024; // 1 MB = 1 million bytes
        

        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const containersCollection = db.collection('containers');
        const volumesCollection = db.collection('volumes');
        const resourcesCollection = db.collection('resources');
        user = await usersCollection.findOne({ userId: decodedToken.userId });
        const userResources = await resourcesCollection.findOne({ userId: user.userId });

        if (selectedVolume.volumeName == 'New Volume') {
            volumeName = `${user.username}_${workspaceName}_workspace_volume`;
        }
        else {
            const existingVolume = await volumesCollection.findOne({ userId: user.userId, volumeName: selectedVolume.volumeName })
            if (existingVolume.containerName) {
                return res.status(209).json({ warn: `${workspaceVolume} is linked with ${existingVolume.containerName}. To use this volume, first free by deleting only container.` })
            }
            volumeName = selectedVolume.volumeName
        }
        containerName = `${user.username}_${workspaceName}_workspace_container`;

        const containers = await docker.listContainers({ all: true });// all stopped/ running
        // Check if any container has the desired name
        if(containers.some(container => container.Names.includes(`/${containerName}`))){
            return res.status(209).json({warn: `${workspaceName} already exitst.`})
        }
        ({ container, volume, subdomains, ports, authStrings } = await createWorkspaceContainer(user, Memory, NanoCpus, storage, containerName, volumeName, workspaceName))

        if (workspaceSource === 'github') {
            const zipUrl = `https://github.com/${selectedRepo.full_name}/archive/refs/heads/${selectedRepo.default_branch}.zip`;

            const WORKSPACE_DIR = `root`;
            const zipFilePath = `root/${selectedRepo.name}.zip`;
            const targetDirName = `root/${selectedRepo.name}`;

            const fetchCommand = `curl -L -H "Authorization: token ${accessToken}" -H "Accept: application/vnd.github.v3.raw" ${zipUrl} -o ${zipFilePath}`;
            await execCommandInContainer(container.id, fetchCommand);
            const cleanupCommand = `
            rm -rf ${targetDirName} && \
            unzip -o ${zipFilePath} -d ${WORKSPACE_DIR} && \
            mv ${WORKSPACE_DIR}/${selectedRepo.name}-${selectedRepo.default_branch} ${targetDirName} && \
            rm ${zipFilePath}
        `;
            await execCommandInContainer(container.id, cleanupCommand);
        }

        newContainerEntry = {
            userId: user.userId,
            containerId: container.id,
            containerName,
            workspaceName,
            type: 'workspace',
            volumeName,
            resourceAllocated: { Memory: Memory, NanoCpus: NanoCpus, Storage:storage },
            createdAt: new Date(),
            subdomains,
            ports,
            codeServerPID: null,
            mainServerPID: null,
            // authStrings,
            containerConfig: {}
        };
        await containersCollection.insertOne(newContainerEntry);

        const updatedResources = {
            userId: user.userId,
            usedResources: {
                Memory: parseInt(userResources.usedResources.Memory, 10) + Memory,
                NanoCpus: parseInt(userResources.usedResources.NanoCpus, 10) + NanoCpus,
                Storage: parseInt(userResources.usedResources.Storage,10) + storage
            },
        };

        await resourcesCollection.updateOne(
            { userId: user.userId },
            { $set: updatedResources }
        );

        newVolumeEntry = {
            userId: user.userId,
            containerName: container.containerName,
            volumeName:volumeName,
            workspaceName,
            createdAt: new Date(),
        };
        await volumesCollection.insertOne(newVolumeEntry);

        return res.status(200).json({ info: 'Your workspace is ready.' });

    } catch (error) {
        console.error('Error during creating new workspace container:', error);

        await cleanUp();

        let mailOptions = {
            from: process.env.FROM_ERROR_MAIL,
            subject: `An error occurred during creating new workspace container.`,
            to: process.env.TO_ERROR_MAIL,
            text: `Function: newWorkspaceContainer\nUsername: ${user.username}, NanoCpus: ${NanoCpus}, Memory: ${Memory}, Error: ${error.message}`,
        };

        addToErrorMailQueue(mailOptions)
            .then(() => {
                console.log('Error mail added.');
            })
            .catch((error) => {
                console.error(`Failed to add error mail alert. ${error}`);
            });

        return res.status(500).json({ warn: 'Error during creating workspace', error: error.message });
    } finally {
        await client.close();
    }
};


module.exports = { newWorkspaceContainer };
