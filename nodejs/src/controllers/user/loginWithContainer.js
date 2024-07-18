require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { generateToken } = require('../../middlewares/generateToken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });

const logger = require('../../services/logs/winstonLogger');

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
            const GID = 1001;

            // Check if the container exists and remove it
            if (containerId) {
                try {
                    const oldContainer = docker.getContainer(containerId);
                    await oldContainer.stop().catch(err => {
                        if (err.statusCode !== 304) { // Ignore error if container is already stopped
                            throw err;
                        }
                    });
                    await oldContainer.remove();
                    console.log(`Old container ${containerId} removed successfully.`);
                } catch (err) {
                    console.error(`Error removing old container ${containerId}:`, err.message);
                }
            }

            // Command to create user and setup environment inside container
            const containerCmd = `
            groupadd -g ${GID} ${USERNAME} \
            && useradd -u ${UID} -g ${GID} -m ${USERNAME} \
            && echo "${USERNAME}:${PASSWORD}" | chpasswd \
            && usermod -aG sudo ${USERNAME} \
            && mkdir -p /${USERNAME} \
            && chown -R ${USERNAME}:${USERNAME} /${USERNAME} \
            && su - ${USERNAME} -c "while :; do sleep 2073600; done"
        `;

            // Create the new container
            const container = await docker.createContainer({
                Image: `controlia:latest`,
                name: containerName,
                Cmd: ['sh', '-c', containerCmd],
                HostConfig: {
                    CpuShares: 100,
                    Memory: 100 * 1024 * 1024,
                    Binds: [`${volumeName}:/${USERNAME}`],  // Bind the volume to /home/USERNAME in the container
                },
                Env: [
                    `USER_ID=${UID}`,
                    `GROUP_ID=${GID}`,
                    `USER_NAME=${USERNAME}`,
                    `USER_PASSWORD=${PASSWORD}`
                ],
            });

            if (!container) {
                return res.status(209).json({ warn: "Failed to login due to container creation failure." });
            }

            await container.start();

            // Update the user record with the new container ID
            const updateFields = {
                $set: {
                    containerId: container.id,
                    date: new Date(),
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
