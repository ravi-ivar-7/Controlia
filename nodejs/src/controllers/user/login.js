const { connectToSchemaLessDatabase } = require('../../databases/mongoDB');
const { generateToken } = require('../../middlewares/generateToken');
const bcrypt = require('bcryptjs'); 

const loginUser = async (req, res) => {
    let client;

    try {
        const { userId, password } = req.body;
        if (!(userId && password)) {
            return res.status(209).json({ message: "Email/username and/or password are required!" });
        }

        const { client: dbClient, collection } = await connectToSchemaLessDatabase('controlia', 'user');
        client = dbClient;

        const userDocument = await collection.findOne({ $or: [{ email: userId }, { userId: userId }] });
        if (!userDocument) {
            return res.status(209).json({ message: "User not found" });
        }
        const passwordMatch = await bcrypt.compare(password, userDocument.password);

        if (passwordMatch) {
            const tokenData = {userId, name:userDocument.name}
            const token = generateToken(tokenData);
            return res.status(200).json({ message: 'Successful login.', token,user:tokenData});
        }

        return res.status(209).json({ message: "Invalid credentials" });

    } catch (error) {
        console.error('ERROR DURING LOGIN: ', error);
        res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

module.exports = { loginUser };
