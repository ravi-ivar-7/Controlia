require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { generateToken } = require('../../middlewares/generateToken');
const { addToErrorMailQueue } = require('../../services/mail/manageMail');
const bcrypt = require('bcryptjs');
const logger = require('../../services/logs/winstonLogger');
const { v4: uuidv4 } = require('uuid');

// TODO: implement isVerified

const register = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    let username, email, name, password, userId

    const cleanup = async () => {

        if (client.isConnected()) {
            const db = client.db("controlia");
            await db.collection('users').deleteOne({ userId });
            await db.collection('accounts').deleteOne({ userId });
            await db.collection('resources').deleteOne({ userId });
        }
    };

    try {
        await client.connect();
        const db = client.db("controlia");

        const usersCollection = db.collection('users');
        const accountsCollection = db.collection('accounts');
        const resourcesCollection = db.collection('resources');

        ({ username, email, name, password } = req.body);

        if (!(email && name && username && password)) {
            return res.status(209).json({warn:`Something missing! name: ${name}, username: ${username}, email: ${email}, password: ${password}` });
        }

        const existingUser = await usersCollection.findOne({ $or: [{ email: email }, { username: username }] });
        if (existingUser) {
            return res.status(209).json({warn:`${username} already exists.` });
           
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        userId = uuidv4();
        const newUser = {
            userId,
            username,
            email,
            name,
            password: hashedPassword,
            isVerified: true,
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

        const newResources = {
            userId,
            totalResources: { Memory: Number(process.env.TOTAL_FREE_MEMORY), NanoCpus: Number(process.env.TOTAL_FREE_NANOCPUS), Storage: Number(process.env.TOTAL_FREE_STORAGE) },
            usedResources: { Memory: 0, NanoCpus:0 , Storage: 0},
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
            text: `Function : register \nname: ${name}, username: ${username}, email: ${email}, password: ${password}, CpuShares: ${CpuShares}, Memory: ${Memory}, openPort: ${openPort} \n Error: ${error}`,
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

module.exports = { register };
