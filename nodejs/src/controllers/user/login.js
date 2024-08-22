// TODO: Handle removed and dead state of container

require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { generateToken } = require('../../middlewares/generateToken');
const { addToErrorMailQueue } = require('../../services/mail/manageMail');
const bcrypt = require('bcryptjs');
const logger = require('../../services/logs/winstonLogger');

const login= async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    let username, password, user;

    try {
        ({ username, password } = req.body);
        if (!(username && password)) {
            return res.status(209).json({warn: `Username/email and/or password are missing!` });
        }

        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');

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
            text: `Function: loginWith\nUsername: ${username}, Email: ${user?.email}, Error: ${error.message}`,
        };

        addToErrorMailQueue(mailOptions)
            .then(() => logger.info('Error mail added.'))
            .catch((mailError) => logger.error(`Failed to add error mail alert: ${mailError.message}`));

        return res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error: error.message });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

module.exports = { login };
