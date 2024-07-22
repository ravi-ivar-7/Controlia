require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');

const logger = require('../../services/logs/winstonLogger');

const getAllNotebooks = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        const { decodedToken } = req.body;

        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const user = usersCollection.findOne({ userId: decodedToken.userId })
        const notebooksCollection = db.collection('notebooks');
       
        const notebooks = await notebooksCollection.find({ userId: decodedToken.userId }).toArray() || []

        return res.status(200).json({ info: 'Fetched notebooks successfully...', notebooks });

    } catch (error) {
        logger.error(`ERROR IN GETING notebooks: ${error}`);
        return res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error });
    } finally {
        if (client) {
            await client.close();
        }
    }
};



module.exports = {  getAllNotebooks };
