require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { Queue } = require('bullmq');
const { addToMailQueue } = require('../../services/mail/manageMail');
const logger = require('../../services/logs/winstonLogger');
const {scheduleScriptQueue} = require('./scheduleScript')

const ResetScheduleScript = async (req, res) => {
    let client;
    try {
        const { decodedToken, script } = req.body;
        if (!script) {
            return res.status(209).json({ warn: 'script info missing from body.' });
        }
        client = new MongoClient(process.env.MONGODB_URL);
        await client.connect();
        const db = client.db("controlia");
        const scriptsCollection = db.collection('scripts');

        const job = await scheduleScriptQueue.getJob(script.scheduleId);

        if (job) {
          await job.remove();
        } else {
            return res.status(209).json({warn: `Schedule ${script.scheduleName} not found.`})
        }

        const scriptUpdateFields = {
            scheduleName: '',
            scheduleOutputFileName: '',
            ScheduleOptions:  [],
            scheduleType: '',
            scheduleRule: '',
            date: new Date(),
        };
        
        await scriptsCollection.findOneAndUpdate(
            { userId: decodedToken.userId, scriptId: script.scriptId },
            { $set: scriptUpdateFields },
            { returnDocument: 'after', upsert: true }
        );
        
        const scheduleScripts = await scriptsCollection.find({
            userId: decodedToken.userId,
            scheduleName: { $exists: true, $ne: '' }, // Check if scheduleName exists and is not an empty string
            scheduleRule: { $exists: true, $ne: '' }, // Check if scheduleRule exists and is not an empty string
        }).toArray();

        const info = `${script.scriptName} removed successfully.`;
        return res.status(200).json({ info,scheduleScripts });

    } catch (error) {
        console.error('ERROR IN ADD/EDIT SCHEDULE SCRIPT: ', error);
        return res.status(500).json({ info: 'INTERNAL SERVER ERROR', error });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

module.exports = { ResetScheduleScript };
