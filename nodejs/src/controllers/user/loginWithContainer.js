// TODO: Handle removed and dead state of container

require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { generateToken } = require('../../middlewares/generateToken');
const { addToErrorMailQueue } = require('../../services/mail/manageMail');
const bcrypt = require('bcryptjs');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock' });
const logger = require('../../services/logs/winstonLogger');

const loginWithContainer = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    let username, password, user, oldContainer;

    const cleanup = async () => {
        if (oldContainer) {
            try {
                await oldContainer.stop();
                await oldContainer.remove();
                logger.info(`Container ${oldContainer.id} cleaned up.`);
            } catch (err) {
                logger.error(`ERROR CLEANING UP CONTAINER: ${err.message}`);
            }
        }
    };

    try {
        ({ username, password } = req.body);
        if (!(username && password)) {
            return res.status(209).json({warn: `Username/email and/or password are missing!` });
        }

        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const containersCollection = db.collection('containers');

        user = await usersCollection.findOne({ $or: [{ email: username }, { username: username }] });
        if (!user) {
            return res.status(209).json({warn: `${username} not found.` });
        }
        if (!user.isVerified) {
            return res.status(209).json({warn: `${user.email} not verified.`});
          
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(209).json({warn: `Invalid credentials.`});
        }

        const containerData = await containersCollection.findOne({ userId: user.userId });
        if (!containerData) {
            return res.status(209).json({warn:`Container for ${username} not found.`});
          
        }

        const containerName = containerData.containerName;
        oldContainer = docker.getContainer(containerName);
        const containerInspect = await oldContainer.inspect();
        const containerState = containerInspect.State.Status;

        switch (containerState) {
            case 'running':
                logger.info(`Container ${containerName} is already running.`);
                break;

            case 'exited':
            case 'created':
                await oldContainer.start();
                logger.info(`Old container ${containerName} started successfully.`);
                break;

            case 'paused':
                await oldContainer.unpause();
                logger.info(`Container ${containerName} was paused and has been unpaused.`);
                break;

            case 'restarting':
                logger.warn(`Container ${containerName} is currently restarting.`);
                break;

            case 'removing':
            case 'dead':
                throw new Error(`Container ${containerName} is not in a recoverable state. Contact administration.`);

            default:
                throw new Error(`Unknown state for container ${containerName}: ${containerState}`);
        }

        const tokenData = {
            userId: user.userId,
            username: user.username,
            email: user.email,
            name: user.name,
            isVerified: user.isVerified,
            loginTime: new Date(),
        };
        const token = generateToken(tokenData);

        return res.status(200).json({ info: "Login successful.", token, user: tokenData });

    } catch (error) {
        logger.error(`ERROR DURING LOGIN: ${error.message}`);

        let mailOptions = {
            from: process.env.FROM_ERROR_MAIL,
            subject: `An error occurred during login.`,
            to: process.env.TO_ERROR_MAIL,
            text: `Function: loginWithContainer\nUsername: ${username}, Email: ${user?.email}, Error: ${error.message}`,
        };

        addToErrorMailQueue(mailOptions)
            .then(() => logger.info('Error mail added.'))
            .catch((mailError) => logger.error(`Failed to add error mail alert: ${mailError.message}`));

        // await cleanup();

        return res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error: error.message });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

module.exports = { loginWithContainer };
