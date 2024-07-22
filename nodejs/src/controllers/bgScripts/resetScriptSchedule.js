require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');

const logger = require('../../services/logs/winstonLogger')

const resetScriptSchedule = async (user, script) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        if (!script) {
            return res.status(209).json({ warn: 'script is missing.' });
        }

        await client.connect();
        const db = client.db("controlia");
        const scriptsCollection = db.collection('scripts')

        
        const scriptUpdateFields = {
            scheduleName: '',
            scheduleOutputFileName:'',
            ScheduleOptions: [],
            scheduleType: '',
            scheduleRule:'',
            date: new Date(),
        };
        
        await scriptsCollection.findOneAndUpdate(
            { userId: user.userId, scriptId: script.scriptId },
            { $set: scriptUpdateFields },
            { returnDocument: 'after', upsert: true }
        );

        return `Successfully deleted/updated scipt schedule.`

    } catch (error) {
        logger.error(`ERROR IN DELETING SCRIPT SCHEDULE: ${error}`);
        throw error;
    }
};

module.exports = {
    resetScriptSchedule
};
