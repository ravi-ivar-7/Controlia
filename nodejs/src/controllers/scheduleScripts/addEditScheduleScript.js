require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const schedule = require('node-schedule');
const { sendMail } = require('../../utils/sendMail');
const { runScheduleScript } = require('./runScheduleScript')
const { base62 } = require('base-id');

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
  let client;
  try {

    const { decodedToken, scriptInfo } = req.body;
    if (!scriptInfo) {
      return res.status(422).json({ info: 'scriptInfo missing from body.' });
    }
    client = new MongoClient(process.env.MONGODB_URL);

    await client.connect();

    const db = client.db("controlia");
    const scheduleCollection = db.collection('scheduleScripts');
    const scriptCollection = db.collection('executeScripts');

    const scheduledScript = await scheduleCollection.findOne({
      userId: decodedToken.userId,
      scriptId: scriptInfo.scriptId
    });

    const callback = () => {
      console.log('Scheduled job executed:', scriptInfo.scriptId);
      runScheduleScript(scriptInfo);
    };

    let newScheduleJob;
    let scheduleId = await base62.generateToken(24, 'ss_');

    if (scriptInfo.scheduleType === 'fixed') {
      const dateTime = await formateDateTime(scriptInfo.scheduleRule);
      newScheduleJob = schedule.scheduleJob(scheduleId, dateTime, callback);
    } else if (scriptInfo.scheduleType === 'recurring') {
      newScheduleJob = schedule.scheduleJob(scheduleId, scriptInfo.scheduleRule, callback);
    } else {
      return res.status(422).json({ info: 'Unsupported schedule rule.' });
    }
    if(!newScheduleJob){
      return res.status(209).json({ info: 'Failed to schedule.' });
    }
    if (scheduledScript) {
      schedule.cancelJob(scheduledScript.scheduleId);

      const scheduleUpdateFields = {
        $set: {
          scheduleRule: scriptInfo.scheduleRule,
          scheduleType: scriptInfo.scheduleType,
          scheduleId: scheduleId,
          date: new Date(),
        }
      };

      await scheduleCollection.findOneAndUpdate(
        { userId: decodedToken.userId, scriptId: scriptInfo.scriptId },
        scheduleUpdateFields,
        { returnDocument: 'after', upsert: true }
      );
      message = `Schedule updated for script ${scriptInfo.scriptId}`;
    }
    else {
      const scheduleDocument = {
        userId: decodedToken.userId,
        email: decodedToken.email,
        name: decodedToken.name,

        title: scriptInfo.title,
        scriptId: scriptInfo.scriptId,
        language: scriptInfo.language,
        script: scriptInfo.script,
        argumentsList:scriptInfo.argumentsList,

        scheduleRule: scriptInfo.scheduleRule,
        scheduleType: scriptInfo.scheduleType,
        scheduleId: scheduleId,
        date: new Date(),
      };
      await scheduleCollection.insertOne(scheduleDocument);
      message = `Schedule added for script ${scriptInfo.scriptId}`;
    }

    const scriptUpdateFields = {
      $set: {
        scheduleId: scheduleId,
        date: new Date(),
      }
    };

    await scriptCollection.findOneAndUpdate(
      { userId: decodedToken.userId, scriptId: scriptInfo.scriptId },
      scriptUpdateFields,
      { returnDocument: 'after', upsert: true }
    );

    // let mailOptions = {
    //   from: process.env.ADD_SCHEDULE_EMAIL,
    //   subject: 'Job scheduled',
    //   to: decodedToken.email,
    //   text: `Title: ${scriptInfo.title} . \nScheduleId: ${scheduleId} . \nSchedule Rule: ${scriptInfo.scheduleRule} .`,
    // };
    // await sendMail(mailOptions);

    const scripts = await scriptCollection.find({ userId: decodedToken.userId }).toArray()
    const scheduleScripts = await scheduleCollection.find({ userId: decodedToken.userId }).toArray()
    const nonScheduleScripts = scripts.filter(script => script.scheduleId === '');

    res.status(200).json({ message, scheduleScripts, nonScheduleScripts });

  } catch (error) {
    console.error('ERROR IN ADD/EDIT SCHEDULE SCRIPT: ', error);
    res.status(500).json({ info: 'INTERNAL SERVER ERROR', error });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

module.exports = {
  addEditScheduleScript
};
