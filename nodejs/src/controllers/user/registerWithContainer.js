require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { generateToken } = require('../../middlewares/generateToken');
const { addToErrorMailQueue } = require('../../services/mail/manageMail');
const bcrypt = require('bcryptjs');
const logger = require('../../services/logs/winstonLogger');
const Docker = require('dockerode');
const { v4: uuidv4 } = require('uuid');
const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock' || '//./pipe/docker_engine' });

const registerWithContainer = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    let volume, container, userId;
    let username, email, name, password, CpuShares = process.env.DEFAULT_CONTAINER_CPUSHARES, Memory = process.env.DEFAULT_CONTAINER_MEMORY;
    let openPort = process.env.MAIN_OPEN_PORT || 3000;

    const cleanup = async () => {
        if (container) {
            try {
                await container.stop();
                await container.remove();
            } catch (err) {
                logger.error(`ERROR CLEANING UP CONTAINER: ${err.message}`);
            }
        }

        if (volume) {
            try {
                await docker.getVolume(volume.name).remove();
            } catch (err) {
                logger.error(`ERROR CLEANING UP VOLUME: ${err.message}`);
            }
        }

        if (client.isConnected()) {
            const db = client.db("controlia");
            await db.collection('users').deleteOne({ userId });
            await db.collection('accounts').deleteOne({ userId });
            await db.collection('containers').deleteOne({ userId });
            await db.collection('resources').deleteOne({ userId });
        }
    };

    try {
        await client.connect();
        const db = client.db("controlia");

        const usersCollection = db.collection('users');
        const accountsCollection = db.collection('accounts');
        const containersCollection = db.collection('containers');
        const resourcesCollection = db.collection('resources');

        ({ username, email, name, password, CpuShares, Memory } = req.body);

        if (!(email && name && username && password)) {
            return res.status(209).json({warn:`Something missing! name: ${name}, username: ${username}, email: ${email}, password: ${password}, Memory: ${Memory}, CpuShares: ${CpuShares}` });
        }

        const existingUser = await usersCollection.findOne({ $or: [{ email: email }, { username: username }] });
        if (existingUser) {
            return res.status(209).json({warn:`${username} already exists.` });
           
        }

        const volumeName = `${username}_main_volume`;
        const containerName = `${username}_main_container`;
        const mainSubdomain = `${username}_main_server`;

        volume = await docker.createVolume({ Name: volumeName });
        if (!volume) {
            throw new Error(`Failed to create volume for ${username}`);
        }

        // Create container
        container = await docker.createContainer({
            Image: `controlia:${process.env.BASE_IMAGE_VERSION}`,
            name: containerName,
            Cmd: ['sh', '-c', 'while :; do sleep 2073600; done'],
            HostConfig: {
                CpuShares: CpuShares,
                Memory: Memory,
                Binds: [`${volumeName}:/root`],
                NetworkMode: 'web'
            },
            ExposedPorts: {
                "80/tcp": {},
                "443/tcp": {},
                [`${openPort}/tcp`]: {},
            },
            Env: [
                `USERNAME=${username}`,
                `USERPASSWORD=${password}`
            ],
            Labels: {
                "traefik.enable": "true",
                [`traefik.http.routers.${mainSubdomain}.entrypoints`]: "http",
                [`traefik.http.routers.${mainSubdomain}.rule`]: `Host(\`${mainSubdomain}.bycontrolia.com\`)`,
                [`traefik.http.middlewares.${mainSubdomain}-https-redirect.redirectscheme.scheme`]: "https",
                [`traefik.http.routers.${mainSubdomain}-secure.entrypoints`]: "https",
                [`traefik.http.routers.${mainSubdomain}-secure.rule`]: `Host(\`${mainSubdomain}.bycontrolia.com\`)`,
                [`traefik.http.routers.${mainSubdomain}-secure.tls`]: "true",
                [`traefik.http.routers.${mainSubdomain}-secure.tls.certresolver`]: "cloudflare",
                [`traefik.http.routers.${mainSubdomain}.service`]: `${mainSubdomain}`,
                [`traefik.http.services.${mainSubdomain}.loadbalancer.server.port`]: `${openPort}`,
            },
        });

        if (!container) {
            throw new Error(`Failed to create container for ${username}`);
        }

        await container.start();

        const hashedPassword = await bcrypt.hash(password, 10);

        userId = uuidv4();
        const newUser = {
            userId,
            username,
            email,
            name,
            password: hashedPassword,
            isVerified: false,
        };
        await usersCollection.insertOne(newUser);

        const newAccount = {
            userId,
            registrationDate: new Date(),
            address: null,
            city: null,
            state: null,
            postalCode: null,
            phoneNumber: null,
            subscription: 'free',
            subscriptionStart: null,
            subscriptionEnd: null,
            accountProvider: 'email',
            role: 'user'
        };
        await accountsCollection.insertOne(newAccount);

        const newContainer = {
            userId,
            containerId: container.id,
            containerName,
            type: 'main',
            volumeName,
            resourceAllocated: { Memory: Memory, CpuShares: CpuShares },
            createdAt: new Date(),
            status: 'running',
            containerDomains: {
                [openPort]: mainSubdomain,
                // [anotherPort]: anotherSubdomain,
            },
            anySchedule: false,
            containerConfig: {}
        };
        await containersCollection.insertOne(newContainer);

        const newResources = {
            userId,
            totalResources: { Memory: process.env.TOTAL_FREE_MEMORY, CpuShares: process.env.TOTAL_FREE_CPUSHARES },
            usedResources: { ...newContainer.resourceAllocated },
        };
        await resourcesCollection.insertOne(newResources);

        const tokenData = { email, username, userId, name, isVerified: newUser.isVerified };
        const token = generateToken(tokenData);

        return res.status(200).json({ info: "Account created successfully", token, user: tokenData });

    } catch (error) {
        logger.error(`ERROR DURING REGISTRATION: ${error}`);

        let mailOptions = {
            from: process.env.FROM_ERROR_MAIL,
            subject: `An error occurred during registration.`,
            to: process.env.TO_ERROR_MAIL,
            text: `Function : registerWithContainer \nname: ${name}, username: ${username}, email: ${email}, password: ${password}, CpuShares: ${CpuShares}, Memory: ${Memory}, openPort: ${openPort} \n Error: ${error}`,
        };

        addToErrorMailQueue(mailOptions)
            .then(() => {
                logger.info('Error mail added.');
            })
            .catch((error) => {
                logger.error(`Failed to add error mail alert. ${error}`);
            });

        await cleanup();

        return res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error: error.message });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

module.exports = { registerWithContainer };
