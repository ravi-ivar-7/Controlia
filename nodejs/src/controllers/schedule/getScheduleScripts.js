require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const logger = require('../../services/logs/winstonLogger');

const getScheduleScripts = async (req, res) => {
    let client;
    try {
        const { decodedToken } = req.body;

        client = new MongoClient(process.env.MONGODB_URL);
        await client.connect();
        const db = client.db("controlia");
        const scriptsCollection = db.collection('scripts');
        
        const scheduleScripts = await scriptsCollection.find({
            userId: decodedToken.userId,
            scheduleId: { $exists: true, $ne: '' }, // Check if scheduleName exists and is not an empty string
        }).toArray();

        const info = `Scheduled scripts fetched successfully.`;
        res.status(200).json({ info,scheduleScripts });

    } catch (error) {
        console.error('ERROR IN ADD/EDIT SCHEDULE SCRIPT: ', error);
        res.status(500).json({ info: 'INTERNAL SERVER ERROR', error });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

module.exports = { getScheduleScripts };
