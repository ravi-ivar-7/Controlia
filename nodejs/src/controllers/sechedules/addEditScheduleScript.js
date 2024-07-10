require('dotenv').config({path:'../../../config/env/.env'});
const MongoClient = require('mongodb').MongoClient;
const schedule = require('node-schedule');

const formateDateTime = async (dateTime) => {
  const newDateTime = new Date(dateTime);

  const year = newDateTime.getFullYear();
  const month = ('0' + (newDateTime.getMonth() + 1)).slice(-2); // Months are zero indexed
  const day = ('0' + newDateTime.getDate()).slice(-2);
  const hours = ('0' + newDateTime.getHours()).slice(-2);
  const minutes = ('0' + newDateTime.getMinutes()).slice(-2);

  const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

  return formattedDateTime;
};

const addEditScheduleScript = async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URL);
  let message;

  try {
    const { decodedToken, scriptInfo } = req.body;

    await client.connect();

    const db = client.db("controlia");
    const jobCollection = db.collection('schedules');
    const scriptCollection = db.collection('scripts')

    const scheduledScript = await jobCollection.findOne({ userId: decodedToken.userId, scriptId: scriptInfo.scriptId });
    

    const callback = () => {
      console.log('Scheduled job executed:', scriptInfo.scriptId);
      // Add logic to execute the script here
    };

    let newScheduleJob;
    let jobName;
    if (scriptInfo.scheduleType === 'fixed') {
      const dateTime = await formateDateTime(scriptInfo.schedule);
      jobName = `${scriptInfo.scriptId}?${dateTime}?fixed`; 
      newScheduleJob = schedule.scheduleJob(jobName, dateTime, callback);
    } else if (scriptInfo.scheduleType === 'recurring') {
      jobName = `${scriptInfo.scriptId}?${scriptInfo.schedule}?recurring`; 
      newScheduleJob = schedule.scheduleJob(jobName, scriptInfo.schedule, callback);
    } else {
      return res.status(400).json({ message: 'Unsupported scheduling input.' });
    }
    console.log(scriptInfo.schedule)
    if (scheduledScript) {
      schedule.cancelJob(scheduledScript.scheduleJobName);
      
      const scheduleUpdateFields = {
        $set: {
          schedule: scriptInfo.schedule,
          scheduleType: scriptInfo.scheduleType,
          scheduleJobName: jobName,
          date: new Date(),
        }
      };

      const updatedSchedule = await jobCollection.findOneAndUpdate(
        { userId: decodedToken.userId, scriptId: scriptInfo.scriptId },
        scheduleUpdateFields,
        { returnDocument: 'after', upsert: true }
      );

      message = 'Schedule updated.';
    } else {
      const scheduleDocument = {
        userId: decodedToken.userId,
        scriptId: scriptInfo.scriptId,
        schedule: scriptInfo.schedule,
        scheduleType: scriptInfo.scheduleType,
        scheduleJobName: jobName,
        date: new Date(),
      };

      const newSchedule = await jobCollection.insertOne(scheduleDocument);

      message = 'Schedule added.';
    }

    const scriptUpdateFields = {
      $set: {
        schedule: scriptInfo.schedule,
        scheduleType: scriptInfo.scheduleType,
        scheduleJobName: jobName,
        date: new Date(),
      }
    };

    const updatedScript = await scriptCollection.findOneAndUpdate(
      { userId: decodedToken.userId, scriptId: scriptInfo.scriptId },
      scriptUpdateFields,
      { returnDocument: 'after', upsert: true }
    );

    const scripts = await scriptCollection.find({ userId: decodedToken.userId }).toArray() || [];

    res.status(200).json({ message, scripts });

  } catch (error) {
    console.error('ERROR IN ADD/EDIT SCHEDULE SCRIPT: ', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

module.exports = {
  addEditScheduleScript
};
