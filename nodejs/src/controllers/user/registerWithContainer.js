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



const registerWithContainer = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');

        const { userId, email, name, password } = req.body;

        // Validate input
        if (!(email && name && userId && password)) {
            return res.status(400).json({ warn: "All fields are required!" });
        }

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ $or: [{ email: email }, { userId: userId }] });
        if (existingUser) {
            return res.status(409).json({ warn: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create Docker volume
        const volumeName = `v_${userId}`;
        const volume = await docker.createVolume({ Name: volumeName });

        if (!volume) {
            throw new Error('Failed to create volume for user.');
        }

        // Create Docker container
        const containerName = `c_${userId}`;

        const USERNAME = userId;
        const UID = generateUniqueUid(userId);
        const PASSWORD = password
        const GID = 1001;

        const containerCmd = `
        groupadd -g ${GID} ${USERNAME} \
        && useradd -u ${UID} -g ${GID} -m ${USERNAME} \
        && echo "${USERNAME}:${PASSWORD}" | chpasswd \
        && usermod -aG sudo ${USERNAME} \
        && mkdir -p /${USERNAME} \
        && chown -R ${USERNAME}:${USERNAME} /${USERNAME} \
        && su - ${USERNAME} -c "while :; do sleep 2073600; done"
        `;

        const container = await docker.createContainer({
            Image: `controlia:latest`,
            name: containerName,
            Cmd: ['sh', '-c', containerCmd],
            HostConfig: {
                CpuShares: 100,
                Memory: 100 * 1024 * 1024,
                Binds: [`${volumeName}:/${USERNAME}`],
                PortBindings: {
                    "8881/tcp": [
                        {
                            "HostPort": "8881"
                        }
                    ]
                }
            },
            ExposedPorts: {
                "8881/tcp": {}
            },
            Env: [
                `USER_ID=${UID}`,
                `GROUP_ID=${GID}`,
                `USER_NAME=${USERNAME}`,
                `USER_PASSWORD=${PASSWORD}`
            ],
        });
        if (!container) {
            throw new Error('Failed to create container for user.');
        }

        await container.start();

        // Example usage to allow sudo without password
        // execCommand(container, `echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers`).catch(console.error);


        // Store user information in MongoDB
        const newUser = {
            userId: userId,
            email: email,
            name: name,
            UID:UID,
            GID:GID,
            password: hashedPassword,
            containerId: container.id,
            containerName: containerName,
            volumeName: volumeName,
        };

        await usersCollection.insertOne(newUser);

        // Generate token for user
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
