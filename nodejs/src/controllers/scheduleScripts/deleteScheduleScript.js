require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const logger = require('../../services/winstonLogger');
const { scheduleScriptQueue } = require('./addEditScheduleScript'); // Ensure this is the correct path to your scheduler

const deleteScheduleScript = async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URL);
  let info;

  try {
    await client.connect();

    const { decodedToken, scriptInfo } = req.body;
    if (!scriptInfo) {
      return res.status(209).json({ warn: 'scriptInfo is missing in body.' });
    }

    const db = client.db("controlia");
    const scheduleCollection = db.collection('scheduleScripts');
    const scriptCollection = db.collection('executeScripts');

    const scheduleDocument = await scheduleCollection.findOne({ userId: decodedToken.userId, scriptId: scriptInfo.scriptId });

    if (!scheduleDocument) {
      return res.status(209).json({ warn: 'Scheduled script not found.' });
    } else {
      // Cancel the job in BullMQ queue
      const job = await scheduleScriptQueue.getJob(scheduleDocument.scheduleId);
      if (job) {
        await job.remove();
      } else {
        logger.warn(`Job with scheduleId ${scheduleDocument.scheduleId} not found in the queue.`);
      }

      await scheduleCollection.findOneAndDelete({ userId: decodedToken.userId, scriptId: scriptInfo.scriptId });

      const scriptUpdateFields = {
        $set: {
          scheduleId: '',
          date: new Date(),
        }
      };

      const updatedScript = await scriptCollection.findOneAndUpdate(
        { userId: decodedToken.userId, scriptId: scriptInfo.scriptId },
        scriptUpdateFields,
        { returnDocument: 'after', upsert: true }
      );

      info = 'Schedule deleted successfully.';
      return res.status(200).json({ info, updatedScript });
    }

  } catch (error) {
    logger.error(`ERROR IN DELETE SCHEDULE SCRIPT: ${error}`);
    return res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

module.exports = {
  deleteScheduleScript
};
