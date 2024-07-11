require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { generateToken } = require('../../middlewares/generateToken');
const bcrypt = require('bcryptjs');
const logger = require('../../services/winstonLogger');

const registerUser = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {

        const { userId, email, name, password } = req.body;
        if (!(email && name && userId && password)) {
            return res.status(209).json({ warn: "All fields are required!" });
        }
        await client.connect();
        const db = client.db("controlia");
        const userCollection = db.collection('user');

        const existingUser = await userCollection.findOne({ $or: [{ email: email }, { userId: userId }] });

        if (existingUser) {
            return res.status(209).json({ warn: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            userId: userId,
            email: email,
            name: name,
            password: hashedPassword
        };

        await userCollection.insertOne(newUser); // Await the insert operation

        const tokenData = { email, userId, name }
        const token = generateToken(tokenData);

        return res.status(200).json({ info: "Account created successfully", token, user: tokenData });

    } catch (error) {
        logger.error(`ERROR DURING REGISTRATION: ${error}`);
        res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

module.exports = { registerUser };
