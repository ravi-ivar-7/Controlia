require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { Queue } = require('bullmq');
const { addToMailQueue } = require('../../services/manageMail');
const { base62 } = require('base-id');
const logger = require('../../services/winstonLogger');

const REDIS_URL = process.env.REDIS_URL
const scheduleScriptQueue = new Queue('scheduleScriptQueue', { connection: REDIS_URL });

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

    let scheduleId = await base62.generateToken(24, 'ss_');

    let jobOptions = {};

    if (scriptInfo.scheduleType === 'fixed') {
      const fixedDatetime = new Date(scriptInfo.scheduleRule);

      const delay = fixedDatetime - new Date();
      jobOptions = { delay: fixedDatetime - new Date() };
    } else if (scriptInfo.scheduleType === 'recurring') {
      jobOptions = { repeat: { cron: scriptInfo.scheduleRule } };
    } else {
      return res.status(422).json({ info: 'Unsupported schedule rule.' });
    }

    const jobPayload = { scriptInfo };

    const newScheduleJob = await scheduleScriptQueue.add('runScheduleScript', jobPayload, jobOptions);

    if (!newScheduleJob) {
      return res.status(209).json({ info: 'Failed to schedule.' });
    }

    let message;

    if (scheduledScript) { // update existing
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
    } else { // a new schedule
      const scheduleDocument = {
        userId: decodedToken.userId,
        email: decodedToken.email,
        name: decodedToken.name,
        title: scriptInfo.title,
        scriptId: scriptInfo.scriptId,
        language: scriptInfo.language,
        script: scriptInfo.script,
        argumentsList: scriptInfo.argumentsList,
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

    let mailOptions = {
      from: process.env.NODEJS_FROM_EMAIL,
      subject: 'Job scheduled',
      to: decodedToken.email,
      text: `Title: ${scriptInfo.title} . \nScheduleId: ${newScheduleJob.id} . \nSchedule Rule: ${scriptInfo.scheduleRule} .`,
    };

    addToMailQueue(mailOptions)
      .then(() => {
        logger.info('Mail job added to queue successfully.');
      })
      .catch((error) => {
        logger.error('Error adding mail job to queue:', error);
      });

    const scripts = await scriptCollection.find({ userId: decodedToken.userId }).toArray();
    const scheduleScripts = await scheduleCollection.find({ userId: decodedToken.userId }).toArray();
    const nonScheduleScripts = scripts.filter(script => !script.scheduleId);

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

module.exports = { addEditScheduleScript, scheduleScriptQueue };






