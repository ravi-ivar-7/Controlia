require('dotenv').config({ path: '../../../config/env/.env' });
const MongoClient = require('mongodb').MongoClient;
const schedule = require('node-schedule');

const deleteScheduleScript = async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URL);
  let message;

  try {
    await client.connect();

    const { decodedToken, scriptInfo } = req.body;
    const db = client.db("controlia");
    const jobCollection = db.collection('schedules');
    const scriptCollection = db.collection('scripts');

    const scheduledJob = await jobCollection.findOne({ userId: decodedToken.userId, scriptId: scriptInfo.scriptId });

    if (!scheduledJob) {
      return res.status(209).json({ message: 'Scheduled script not found.' });
    }
    else{
      schedule.cancelJob(scheduledJob.scheduleJobName);
      await jobCollection.findOneAndDelete({ userId: decodedToken.userId, scriptId: scriptInfo.scriptId });

      const scriptUpdateFields = {
        $set: {
          schedule: '',
          scheduleType: '',
          scheduleJobName: '',
          date: new Date(),
        }
      };

      const updatedScript = await scriptCollection.findOneAndUpdate(
        { userId: decodedToken.userId, scriptId: scriptInfo.scriptId },
        scriptUpdateFields,
        { returnDocument: 'after', upsert: true }
      );

      message = 'Schedule deleted successfully.';
    }
    const scripts = await scriptCollection.find({ userId: decodedToken.userId }).toArray() || [];
    return res.status(200).json({ message, scripts });

  } catch (error) {
    console.error('ERROR IN DELETE SCHEDULE SCRIPT: ', error);
    return res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

module.exports = {
  deleteScheduleScript
};
