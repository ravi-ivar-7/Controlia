require('dotenv').config({ path: '../../../.env' });
const MongoClient = require('mongodb').MongoClient;
const schedule = require('node-schedule');

const deleteScheduleScript = async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URL);
  let message;

  try {
    await client.connect();

    const { decodedToken, scriptInfo } = req.body;
    if(!scriptInfo){
      return res.status(422).json({info:'scriptInfo is missing in body.'})
    }
    const db = client.db("controlia");
    const scheduleCollection = db.collection('scheduleScripts');
    const scriptCollection = db.collection('executeScripts');

    const scheduleDocument = await scheduleCollection.findOne({ userId: decodedToken.userId, scriptId: scriptInfo.scriptId });

    if (!scheduleDocument) {
      return res.status(422).json({ info: 'Scheduled script not found.' });
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

      message = 'Schedule deleted successfully.';
      return res.status(200).json({ message, updatedScript });
    }
    
  } catch (error) {
    console.error('ERROR IN DELETE SCHEDULE SCRIPT: ', error);
    return res.status(500).json({ info: 'INTERNAL SERVER ERROR', error });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

module.exports = {
  deleteScheduleScript
};
