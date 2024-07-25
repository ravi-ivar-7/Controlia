const { MongoClient } = require('mongodb');
const { generateToken } = require('../../middlewares/generateToken');
const bcrypt = require('bcryptjs');
const logger = require('../../services/logs/winstonLogger');
const tar = require('tar-stream');
const fs = require('fs');
const path = require('path');
const Docker = require('dockerode');
const { v4: uuidv4 } = require('uuid');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });

function generateUniqueUid() {
    const uuid = uuidv4(); // Generate a UUID
    const compressedId = parseInt(uuid.replace(/-/g, '').slice(0, 12), 16) % 60000;
    return compressedId;
}

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
        const server = require('net').createServer();

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


const registerWithContainer = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);

    try {
        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');

        const { userId, email, name, password } = req.body;

        if (!(email && name && userId && password)) {
            return res.status(209).json({ warn: "All fields are required!" });
        }

        const existingUser = await usersCollection.findOne({ $or: [{ email: email }, { userId: userId }] });
        if (existingUser) {
            return res.status(209).json({ warn: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const volumeName = `v_${userId}`;
        const volume = await docker.createVolume({ Name: volumeName });

        if (!volume) {
            throw new Error('Failed to create volume for user.');
        }

        const containerName = `c_${userId}`;

        const USERNAME = userId;
        const UID = generateUniqueUid(userId);
        const PASSWORD = password
        const GID = 1001;

        const hostPortMappings = await Promise.all([
            findAvailablePort(9001, 10000), // for port 80
            findAvailablePort(10001, 11000), // for port 443
            findAvailablePort(13001, 14000),  // for port 3000
            findAvailablePort(11001, 12000), // for port 3001
            findAvailablePort(12001, 13000), // for port 3002
            findAvailablePort(8000, 9000), // for port 8888

        ]);

        const [hostPort80, hostPort443, hostPort3000, hostPort3001, hostPort3002, hostPort8888] = hostPortMappings;

        const containerCmd = `
            groupadd -g ${GID} ${USERNAME} \
            && useradd -u ${UID} -g ${GID} -m ${USERNAME} \
            && echo "${USERNAME}:${PASSWORD}" | chpasswd \
            && usermod -aG sudo ${USERNAME} \
            && mkdir -p /${USERNAME} \
            && mkdir -p /${USERNAME}/temp \
            && mkdir -p /${USERNAME}/scripts \
            && mkdir -p /${USERNAME}/notebooks \
            && mkdir -p /${USERNAME}/projects \
            && chown -R ${USERNAME}:${USERNAME} /${USERNAME} \
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
                        "3000/tcp": [{ "HostPort": `${hostPort3000}` }],
                        "3001/tcp": [{ "HostPort": `${hostPort3001}` }],
                        "3002/tcp": [{ "HostPort": `${hostPort3002}` }],
                        "8888/tcp": [{ "HostPort": `${hostPort8888}` }],
                    }
                },
                ExposedPorts: {
                    "80/tcp": {},
                    "443/tcp": {},
                    "3000/tcp": {},
                    "3001/tcp": {},
                    "3002/tcp": {},
                    "8888/tcp": {},
                    
                },
                Env: [
                    `USER_ID=${UID}`,
                    `GROUP_ID=${GID}`,
                    `USER_NAME=${USERNAME}`,
                    `USER_PASSWORD=${PASSWORD}`
                ],
            });
    
            if (!container) {
                return { status: 209, json: { warn: "Failed to register. Try Again" } };
            }

            await container.start();

        const newUser = {
            userId: userId,
            email: email,
            name: name,
            password: hashedPassword,
            UID: UID,
            GID: GID,
            hostPort80,
            hostPort443,
            hostPort3000,
            hostPort3001,
            hostPort3002,
            hostPort8888,
            containerId: container.id,
            containerName: containerName,
            volumeName: volumeName,
        };

        await usersCollection.insertOne(newUser);

        const tokenData = { email, userId, name };
        const token = generateToken(tokenData);

        return res.status(200).json({ info: "Account created successfully", token, user: tokenData });

    } catch (error) {
        logger.error(`ERROR DURING REGISTRATION: ${error}`);
        return res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error: error.message });

    } finally {
        if (client) {
            await client.close();
        }
    }
};

module.exports = { registerWithContainer };
