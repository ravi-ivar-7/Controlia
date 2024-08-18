const { OAuth2Client } = require('google-auth-library');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const { addToErrorMailQueue } = require('../../services/mail/manageMail');
const logger = require('../../services/logs/winstonLogger');

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_REDIRECT_URI;

const googleClient = new OAuth2Client(clientId, clientSecret, redirectUri);

const googleAuth = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    let userId;
    let username, email, name, isVerified;
    let newUser, newAccount, newResources;

    const { credential } = req.body.response;
    if (!credential) {
        return res.status(209).json({ warn: `No credential provided.` });
    }

    const cleanUp = async () => {
        try {
            if (newUser) await client.db("controlia").collection('users').deleteOne({ userId });
            if (newAccount) await client.db("controlia").collection('accounts').deleteOne({ userId });
            if (newResources) await client.db("controlia").collection('resources').deleteOne({ userId });
        } catch (cleanupError) {
            logger.error(`Cleanup error: ${cleanupError.message}`);
        }
    };

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: clientId,
        });

        const payload = ticket.getPayload();
        isVerified = payload.email_verified;
        email = payload.email;
        name = payload.name;

        if (!isVerified) {
            return res.status(209).json({ warn: `${email} not verified by Google.` });
        }

        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const accountsCollection = db.collection('accounts');
        const resourcesCollection = db.collection('resources');

        const existingUser = await usersCollection.findOne({ $or: [{ email: email }, { username: username }] });

        if (existingUser) {
            const tokenData = {
                email: existingUser.email,
                username: existingUser.username,
                userId: existingUser.userId,
                name: existingUser.name,
                isVerified: existingUser.isVerified
            };
            const token = generateToken(tokenData);

            return res.status(200).json({ info: "Google login successful.", token, user: tokenData });
        } else {
            username = email.split('@')[0];
            userId = uuidv4();

            newUser = {
                userId,
                username,
                email,
                name,
                password: null,
                isVerified,
                accountProvider: 'google',
                phoneNumber: null,
                subscription: 'free',
                subscriptionStart: null,
                subscriptionEnd: null,
                role: 'user'
            };
            await usersCollection.insertOne(newUser);

            newAccount = {
                userId,
                registrationDate: new Date(),
                address: null,
                city: null,
                state: null,
                postalCode: null,
            };
            await accountsCollection.insertOne(newAccount);

            newResources = {
                userId,
                totalResources: {
                    Memory: process.env.TOTAL_FREE_MEMORY,
                    CpuShares: process.env.TOTAL_FREE_CPUSHARES
                },
                usedResources: { Memory: 0, CpuShares: 0 },
            };
            await resourcesCollection.insertOne(newResources);

            const tokenData = { email, username, userId, name, isVerified: newUser.isVerified };
            const token = generateToken(tokenData);

            return res.status(200).json({ info: "Google login successful.", token, user: tokenData });
        }

    } catch (error) {
        logger.error(`Google callback error: ${error.message}`);
        await cleanUp();

        let mailOptions = {
            from: process.env.FROM_ERROR_MAIL,
            subject: `An error occurred during Google authentication.`,
            to: process.env.TO_ERROR_MAIL,
            text: `Function : googleAuth\nname: ${name || 'unknown'}, username: ${username || 'unknown'}, email: ${email || 'unknown'}, \nError: ${error.message}`,
        };

        addToErrorMailQueue(mailOptions)
            .then(() => {
                logger.info('Error mail added.');
            })
            .catch((mailError) => {
                logger.error(`Failed to add error mail alert. ${mailError.message}`);
            });

        return res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error: error.message });
    } finally {
        await client.close();
    }
};

module.exports = { googleAuth };
