require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { generateToken } = require('../../middlewares/generateToken');
const bcrypt = require('bcryptjs');
const logger = require('../../services/logs/winstonLogger');

const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });

const registerUser = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        const { userId, email, name, password } = req.body;
        
        // Validate required fields
        if (!(email && name && userId && password)) {
            return res.status(400).json({ warn: "All fields are required!" });
        }

        await client.connect();
        const db = client.db("controlia");
        const userCollection = db.collection('user');

        // Check if user already exists
        const existingUser = await userCollection.findOne({ $or: [{ email: email }, { userId: userId }] });
        if (existingUser) {
            return res.status(209).json({ warn: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create Docker volume and container
        const volumeName = `vol_${userId}`;
        const containerName = `cont_${userId}`;
        const volume = await docker.createVolume({ Name: volumeName });

        if (volume) {
            const container = await docker.createContainer({
                Image: 'controlia:latest',
                Cmd: ['/bin/bash', '-c', 'while :; do sleep 2073600; done'],
                name: containerName,
                HostConfig: {
                    CpuShares: 100,
                    Memory: 100 * 1024 * 1024,
                    Binds: [
                        `${volumeName}:/data`,
                    ],
                },
            });

            if (container) {
                await container.start();

                const newUser = {
                    userId: userId,
                    email: email,
                    name: name,
                    password: hashedPassword,
                    containerId: container.id,
                    volumeId: volumeName,
                };

                // Store user information in MongoDB
                await userCollection.insertOne(newUser);
                console.log(newUser, 'new account')
                // Generate token for user
                const tokenData = { email, userId, name };
                const token = generateToken(tokenData);

                return res.status(200).json({ info: "Account created successfully", token, user: tokenData });
            }
        }

        throw new Error('Failed to register user');

    } catch (error) {
        logger.error(`ERROR DURING REGISTRATION: ${error}`);
        res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error: error.message });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

module.exports = { registerUser };
