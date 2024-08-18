require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { addToErrorMailQueue } = require('../../services/mail/manageMail');
const Docker = require('dockerode');
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

const downloadGithubRepoToNewContainer = async (req, res) => {
    const codeServerPort = 8080;
    const containerServerPort = 3000;
    const client = new MongoClient(process.env.MONGODB_URL);
    let accessToken, selectedRepo, decodedToken, CpuShares = process.env.DEFAULT_CONTAINER_CPUSHARES, Memory = process.env.DEFAULT_CONTAINER_MEMORY, containerName;
    let volume, container, newContainer, updatedResources;

    const cleanUp = async () => {
        if (volume) {
            try {
                await volume.remove(); 
            } catch (err) {
                console.error(`Failed to remove volume ${volume.name}:`, err.message);
            }
        }
        if (container) {
            try {
                await container.stop();
                await container.remove(); 
            } catch (err) {
                console.error(`Failed to remove container ${container.name}:`, err.message);
            }
        }
        if (newContainer) {
            try {
                await containersCollection.deleteOne({ containerId: newContainer.containerId }); 
            } catch (err) {
                console.error(`Failed to remove container entry ${newContainer.containerId}:`, err.message);
            }
        }
        if (updatedResources) {
            try {
                await resourcesCollection.updateOne(
                    { userId: updatedResources.userId },
                    { $inc: { 'usedResources.Memory': -updatedResources.usedResources.Memory, 'usedResources.CpuShares': -updatedResources.usedResources.CpuShares } }
                );
            } catch (err) {
                console.error(`Failed to update resource usage for ${updatedResources.userId}:`, err.message);
            }
        }
    };

    try {
        ({ accessToken, selectedRepo, decodedToken, CpuShares, Memory, containerName } = req.body);
        if (!accessToken || !selectedRepo) {
            throw new Error(`Missing: selectedRepo: ${selectedRepo}, accessToken: ${accessToken}, CpuShares: ${CpuShares}, Memory: ${Memory}`);
        }
        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const containersCollection = db.collection('containers');
        const resourcesCollection = db.collection('resources');
        const user = await usersCollection.findOne({ userId: decodedToken.userId });
        const userResources = await resourcesCollection.findOne({ userId: user.userId });


        const codeServerSubDomain = `${user.username}_${containerName}`;
        const projectContainerName = `${user.username}_${containerName}_container`;
        const containerServerSubdomin = `${user.username}_${containerName}_main`;
        const projectVolumeName = `${user.username}_${containerName}_volume`;

        volume = await docker.createVolume({ Name: projectVolumeName });
        if (!volume) {
            throw new Error(`Failed to create project volume for ${user.username}`);
        }

        // Create container
        container = await docker.createContainer({
            Image: `controlia:${process.env.BASE_IMAGE_VERSION}`,
            name: projectContainerName,
            Cmd: ['sh', '-c', 'while :; do sleep 2073600; done'],
            HostConfig: {
                CpuShares: CpuShares,
                Memory: Memory,
                Binds: [`${projectVolumeName}:/root`],
                NetworkMode: 'web'
            },
            ExposedPorts: {
                "80/tcp": {},
                "443/tcp": {},
                [`${codeServerPort}/tcp`]: {},
                [`${containerServerPort}/tcp`]: {},
            },
            Env: [
                `USERNAME=${user.username}`,
            ],
            Labels: {
                "traefik.enable": "true",
                [`traefik.http.routers.${codeServerSubDomain}.entrypoints`]: "http",
                [`traefik.http.routers.${codeServerSubDomain}.rule`]: `Host(\`${codeServerSubDomain}.bycontrolia.com\`)`,
                [`traefik.http.middlewares.${codeServerSubDomain}-https-redirect.redirectscheme.scheme`]: "https",
                [`traefik.http.routers.${codeServerSubDomain}-secure.entrypoints`]: "https",
                [`traefik.http.routers.${codeServerSubDomain}-secure.rule`]: `Host(\`${codeServerSubDomain}.bycontrolia.com\`)`,
                [`traefik.http.routers.${codeServerSubDomain}-secure.tls`]: "true",
                [`traefik.http.routers.${codeServerSubDomain}-secure.tls.certresolver`]: "cloudflare",
                [`traefik.http.routers.${codeServerSubDomain}.service`]: `${codeServerSubDomain}`,
                [`traefik.http.services.${codeServerSubDomain}.loadbalancer.server.port`]: `${codeServerPort}`,
            },
        });

        if (!container) {
            throw new Error(`Failed to create new project container for ${user.username}`);
        }

        await container.start();

        const zipUrl = `https://github.com/${selectedRepo.full_name}/archive/refs/heads/${selectedRepo.default_branch}.zip`;

        const PROJECTS_DIR = `root`;
        const zipFilePath = `root/${selectedRepo.name}.zip`;
        const targetDirName = `root/${selectedRepo.name}`;

        const fetchCommand = `curl -L -H "Authorization: token ${accessToken}" -H "Accept: application/vnd.github.v3.raw" ${zipUrl} -o ${zipFilePath}`;
        await execCommandInContainer(container.id, fetchCommand);
        const cleanupCommand = `
            rm -rf ${targetDirName} && \
            unzip -o ${zipFilePath} -d ${PROJECTS_DIR} && \
            mv ${PROJECTS_DIR}/${selectedRepo.name}-${selectedRepo.default_branch} ${targetDirName} && \
            rm ${zipFilePath}
        `;
        await execCommandInContainer(container.id, cleanupCommand);

        newContainer = {
            userId: user.userId,
            containerId: container.id,
            containerName: projectContainerName,
            type: 'projects',
            volumeName: projectVolumeName,
            resourceAllocated: { Memory: Memory, CpuShares: CpuShares },
            createdAt: new Date(),
            status: 'running',
            containerServer: {port: containerServerPort, subdomain: containerServerSubdomin},
            codeServer: {port : codeServerPort, subdomain: codeServerSubDomain},
            otherServers: {},
            anySchedule: false,
            containerConfig: {}
        };
        await containersCollection.insertOne(newContainer);

        updatedResources = {
            userId: user.userId,
            usedResources: { Memory: userResources.Memory + Memory, CpuShares: userResources.CpuShares + CpuShares },
        };
        await resourcesCollection.updateOne(
            { userId: user.userId },
            { $set: updatedResources }
        );

        return res.status(200).json({ info: 'Repositories downloaded, unzipped, and saved successfully to new container.', projectName: selectedRepo.name });

    } catch (error) {
        console.error('Error during repo downloading:', error.message);

        await cleanUp();

        let mailOptions = {
            from: process.env.FROM_ERROR_MAIL,
            subject: `An error occurred during creating new project container.`,
            to: process.env.TO_ERROR_MAIL,
            text: `Function : downloadGithubRepoToNewContainer \nusername: ${user.username}, CpuShares: ${CpuShares}, Memory: ${Memory}, codeServerPort: ${codeServerPort} \n Error: ${error}`,
        };

        addToErrorMailQueue(mailOptions)
            .then(() => {
                logger.info('Error mail added.');
            })
            .catch((error) => {
                logger.error(`Failed to add error mail alert. ${error}`);
            });

        return res.status(500).json({ warn: 'Error during repo downloading', error: error.message });
    }
};

module.exports = { downloadGithubRepoToNewContainer };
