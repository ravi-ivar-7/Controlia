require('dotenv').config({ path: '../../../.env' });
const MongoClient = require('mongodb').MongoClient;
const schedule = require('node-schedule');
const logger = require('../../services/winstonLogger')

const deleteScheduleScript = async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URL);
  let info;

  try {
    await client.connect();

    const { decodedToken, scriptInfo } = req.body;
    if(!scriptInfo){
      return res.status(209).json({warn:'scriptInfo is missing in body.'})
    }
    const db = client.db("controlia");
    const scheduleCollection = db.collection('scheduleScripts');
    const scriptCollection = db.collection('executeScripts');

    const scheduleDocument = await scheduleCollection.findOne({ userId: decodedToken.userId, scriptId: scriptInfo.scriptId });

    if (!scheduleDocument) {
      return res.status(209).json({ warn: 'Scheduled script not found.' });
    }
    else{
      schedule.cancelJob(scheduleDocument.scheduleId);
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
