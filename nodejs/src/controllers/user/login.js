require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { generateToken } = require('../../middlewares/generateToken');
const bcrypt = require('bcryptjs');
const logger = require('../../services/winstonLogger');

const loginUser = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    console.log(process.env.MONGODB_URL)
    try {

        const { userId, password } = req.body;
        if (!(userId && password)) {
            return res.status(209).json({ warn: "Email/username and/or password are required!" });
        }
        await client.connect();
        const db = client.db("controlia");
        const userCollection = db.collection('user');

        const userDocument = await userCollection.findOne({ $or: [{ email: userId }, { userId: userId }] });
        if (!userDocument) {
            return res.status(209).json({ warn: "User not found" });
        }
        const passwordMatch = await bcrypt.compare(password, userDocument.password);

        if (passwordMatch) {
            const tokenData = { email: userDocument.email, userId: userDocument.userId, name: userDocument.name }
            const token = generateToken(tokenData);
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

module.exports = { loginUser };
