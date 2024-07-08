const { connectToSchemaLessDatabase } = require('../../databases/mongoDB');
const { generateToken } = require('../../middlewares/generateToken');
const bcrypt = require('bcryptjs'); // Assuming you're using bcryptjs for hashing

const registerUser = async (req, res) => {
    let client;

    try {
        const { userId, email, name, password } = req.body;
        if (!(email && name && userId && password)) {
            return res.status(209).json({ message: "All fields are required!" });
        }

        const { client: dbClient, collection } = await connectToSchemaLessDatabase('controlia', 'user');
        client = dbClient;

        const existingUser = await collection.findOne({ $or: [{ email: email }, { userId: userId }] });

        if (existingUser) {
            return res.status(209).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            userId: userId,
            email: email,
            name: name,
            password: hashedPassword
        };

        await collection.insertOne(newUser); // Await the insert operation

        const tokenData = {userId,name}
        const token = generateToken(tokenData);

        return res.status(200).json({ message: "Account created successfully", token , user:tokenData});

    } catch (error) {
        console.error('ERROR DURING REGISTRATION: ', error);
        res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

module.exports = { registerUser };
