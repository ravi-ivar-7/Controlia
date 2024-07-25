require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { generateToken } = require('../../middlewares/generateToken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });

const logger = require('../../services/logs/winstonLogger');

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

const loginWithContainer = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    console.log(process.env.MONGODB_URL)
    try {

        const { userId, password } = req.body;
        if (!(userId && password)) {
            return res.status(209).json({ warn: "Email/username and/or password are required!" });
        }
        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ $or: [{ email: userId }, { userId: userId }] });
        if (!user) {
            return res.status(209).json({ warn: "User not found" });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            const tokenData = { email: user.email, userId: user.userId, name: user.name }
            const token = generateToken(tokenData);

            const containerName = user.containerName;
            const containerId = user.containerId;
            const volumeName = user.volumeName;

            const USERNAME = userId;
            const UID = user.UID;
            const PASSWORD = password;
            const GID = user.GID || 1001;

            if (containerId) {
                try {
                    const oldContainer = docker.getContainer(containerId);
                    await oldContainer.stop().catch(err => {
                        if (err.statusCode !== 304) { // Ignore error if container is already stopped
                            console.log(`Some other error occured apart from already stopped container: ${err}`)
                            return res.status(209).json({ warn:`Error occured: ${err}` });


                        }
                    });
                    await oldContainer.remove();
                    console.log(`Old container ${containerId} removed successfully.`);
                } catch (err) {
                    console.error(`Error removing old container ${containerId}:`, err.message);
                    return res.status(209).json({ warn:`Error occured: ${err}` });
                }
            }

            const hostPortMappings = await Promise.all([
                findAvailablePort(9001, 10000), // for port 80
                findAvailablePort(10001, 11000), // for port 443
                findAvailablePort(13001, 14000),  // for port 3000
                findAvailablePort(11001, 12000), // for port 3001
                findAvailablePort(12001, 13000), // for port 3002
                findAvailablePort(8000, 9000), // for port 8888
                
            ]);

            const [ hostPort80, hostPort443, hostPort3000,hostPort3001, hostPort3002,hostPort8888 ] = hostPortMappings;

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
                return { status: 209, json: { warn: "Failed to login due to container creation failure." } };
            }

            await container.start();
            // Update the user record with the new container ID
            const updateFields = {
                $set: {
                    containerId: container.id,
                    hostPort80,
                    hostPort443,
                    hostPort3000,
                    hostPort3001,
                    hostPort3002,
                    hostPort8888,
                    lastLogin: new Date(),
                }
            };

            const updatedUser = await usersCollection.findOneAndUpdate(
                { userId: user.userId },
                updateFields,
                { returnDocument: 'after' }
            );

            return res.status(200).json({ info: 'Successful login.', token, user: tokenData });
        }

        return res.status(209).json({ warn: "Invalid credentials" });

    } catch (error) {
        logger.error(`ERROR DURING LOGIN: ${error}`);
        res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

module.exports = { loginWithContainer };
