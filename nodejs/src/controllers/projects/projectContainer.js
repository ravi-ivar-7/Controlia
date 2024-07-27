const { MongoClient } = require('mongodb');
const logger = require('../../services/logs/winstonLogger');
const Docker = require('dockerode');
const net = require('net');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });

async function findAvailablePort(start, end) {
    for (let port = start; port <= end; port++) {
        const isAvailable = await checkPortAvailability(port);
        if (isAvailable) {
            return port;
        }
    }
    throw new Error('No available ports found in the specified range');
}

function checkPortAvailability(port) {
    return new Promise((resolve, reject) => {
        const server = net.createServer();

        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(false);
            } else {
                reject(err);
            }
        });

        server.once('listening', () => {
            server.close();
            resolve(true);
        });

        server.listen(port);
    });
}

const createProjectContainer = async (decodedToken) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const projectsContainerCollection = db.collection('projectsContainer');
        const user = await usersCollection.findOne({ userId: decodedToken.userId });
        const volumeName = `pv_${user.userId}`;
        const volume = await docker.createVolume({ Name: volumeName });

        if (!volume) {
            throw new Error('Failed to create volume for user.');
        }

        const containerName = `pc_${user.userId}`;

        const USERNAME = user.userId;
        const UID = user.UID;
        const GID = user.GID;

        const hostPortMappings = await Promise.all([
            findAvailablePort(9001, 10000), // for port 80
            findAvailablePort(10001, 11000), // for port 443
            findAvailablePort(11001, 12000),  // for port 3001
            findAvailablePort(12001, 13000), // for port 3002
            findAvailablePort(13001, 14000), // for port 3003
            findAvailablePort(14001, 15000), // for port 3004
        ]);

        const [hostPort80, hostPort443, hostPort3001, hostPort3002, hostPort3003, hostPort3004] = hostPortMappings;

        const containerCmd = `
            groupadd -g ${GID} ${USERNAME} \
            && useradd -u ${UID} -g ${GID} -m ${USERNAME} \
            && usermod -aG sudo ${USERNAME} \
            && mkdir -p /${USERNAME} \
            && mkdir -p /${USERNAME}/temp \
            && mkdir -p /${USERNAME}/projects \
            && chown -R ${USERNAME}:${USERNAME} /${USERNAME} \
            && apt-get update \
            && su - ${USERNAME} -c "while :; do sleep 604800 ; done"
            `;

        const container = await docker.createContainer({
            Image: 'controlia:latest',
            name: containerName,
            Cmd: ['sh', '-c', containerCmd],
            HostConfig: {
                CpuShares: 100,
                Memory: 100 * 1024 * 1024,
                Binds: [`${volumeName}:/${USERNAME}`],
                PortBindings: {
                    "80/tcp": [{ "HostPort": `${hostPort80}` }],
                    "443/tcp": [{ "HostPort": `${hostPort443}` }],
                    "3001/tcp": [{ "HostPort": `${hostPort3001}` }],
                    "3002/tcp": [{ "HostPort": `${hostPort3002}` }],
                    "3003/tcp": [{ "HostPort": `${hostPort3003}` }],
                    "3004/tcp": [{ "HostPort": `${hostPort3004}` }],
                }
            },
            ExposedPorts: {
                "80/tcp": {},
                "443/tcp": {},
                "3001/tcp": {},
                "3002/tcp": {},
                "3003/tcp": {},
                "3004/tcp": {},
            },
            Env: [
                `USER_ID=${UID}`,
                `GROUP_ID=${GID}`,
                `USER_NAME=${USERNAME}`,
            ],
        });

        if (!container) {
            throw new Error('Failed to create project container.');
        }

        await container.start();

        const newProjectContainer = {
            userId: user.userId,
            email: user.email,
            name: user.name,
            UID: UID,
            GID: GID,
            projectContainerId: container.id,
            projectContainerName: containerName,
            projectVolumeName: volumeName,

            // port80: { status: 'free', projectName: '', projectId: '', host: '', internalPort: 80, externalPort: hostPort80 },
            // port443: { status: 'free', projectName: '', projectId: '', host: '', internalPort: 443, externalPort: hostPort443 },
            port3001: { status: 'free', projectName: '', projectId: '', host: '', internalPort: 3001, externalPort: hostPort3001, pid:'' },
            port3002: { status: 'free', projectName: '', projectId: '', host: '', internalPort: 3002, externalPort: hostPort3002, pid:'' },
            port3003: { status: 'free', projectName: '', projectId: '', host: '', internalPort: 3003, externalPort: hostPort3003, pid:'' },
            port3004: { status: 'free', projectName: '', projectId: '', host: '', internalPort: 3004, externalPort: hostPort3004, pid:'' },

        };

        await projectsContainerCollection.insertOne(newProjectContainer);

        const userUpdateFields = {
            $set: {
                projectContainerId: container.id,
                projectContainerName: containerName,
                projectVolumeName: volumeName,
            }
        };

        const updatedUser = await usersCollection.findOneAndUpdate(
            { userId: user.userId },
            userUpdateFields,
            { returnDocument: 'after' }
        );

        return container

    } catch (error) {
        logger.error(`ERROR DURING PROJECT CREATION: ${error.message}`);
        throw error

    } finally {
        await client.close();
    }
};

module.exports = { createProjectContainer };
