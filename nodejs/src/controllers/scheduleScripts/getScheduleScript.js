require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');

const getScheduleScript = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);

    try {
        const { decodedToken } = req.body;

        await client.connect();
        const db = client.db("controlia");
        const scriptCollection = db.collection('executeScripts');
        const scheduleCollection = db.collection('scheduleScripts');

        const scripts = await scriptCollection.find({ userId: decodedToken.userId }).toArray() 
        const scheduleScripts = await scheduleCollection.find({ userId: decodedToken.userId}).toArray()
        const nonScheduleScripts = scripts.filter(script => script.scheduleId === '');
         
        return res.status(200).json({ message: 'Successfully fetched schedule and non schedule scripts.', scheduleScripts, nonScheduleScripts });

    } catch (error) {
        console.error('ERROR GETING SCHEDULE SCRIPTS: ', error);
        return res.status(500).json({ info: 'INTERNAL SERVER ERROR', error });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

module.exports = { getScheduleScript };
