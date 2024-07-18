require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { Queue } = require('bullmq');
const { addToMailQueue } = require('../../services/mail/manageMail');
const logger = require('../../services/logs/winstonLogger');

const REDIS_URL = process.env.REDIS_URL;

const IORedis = require('ioredis');

const redisOptions = {
    port: 6379,
    host: 'singapore-redis.render.com',
    username: 'red-cq807v8gph6c73eva79g',
    password: 'zQPCwEqbsnAinoGzYKaipiJepPIajWfB',
    tls: {},
    maxRetriesPerRequest: null
};

const connection = new IORedis(redisOptions);

const scheduleScriptQueue = new Queue('scheduleScriptQueue', { connection });

const scheduleScript = async (req, res) => {
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

        let jobOptions = {};

        if (script.scheduleType === 'fixed') {
            const fixedDatetime = new Date(script.scheduleRule);
            const delay = fixedDatetime.getTime() - new Date().getTime() + (process.env.TIME_DIFFERENCE * 1000 || 0);
            if (isNaN(delay) || !isFinite(delay)) {
                return res.status(209).json({ warn: 'Invalid schedule rule.' });
            }
            jobOptions = { delay: delay };
        } else if (script.scheduleType === 'recurring') {
            jobOptions = { repeat: { cron: script.scheduleRule } };
        } else {
            return res.status(209).json({ warn: 'Unsupported schedule rule.' });
        }
        const jobPayload = { userId: decodedToken.userId, email: decodedToken.email, scriptId :  script.scriptId, scriptName: script.scheduleName };

        let newScheduleJob ;
        if(script.language === 'cpp'){
            newScheduleJob =await scheduleScriptQueue.add('runBgCppFile', jobPayload, jobOptions);
        }
        else if(script.language === 'python'){
            newScheduleJob = await scheduleScriptQueue.add('runBgPythonFile', jobPayload, jobOptions);
        }
        else if(script.language === 'javascript'){
            newScheduleJob = await scheduleScriptQueue.add('runBgJavaScriptFile', jobPayload, jobOptions);
        }
        else if(script.language === 'shell'){
            newScheduleJob = await scheduleScriptQueue.add('runBgShellFile', jobPayload, jobOptions);
        }
        else{
            return res.status(209).json({ warn: 'Unsupported language  for script to be scheduled.' }); 
        }
        

        if (!newScheduleJob) {
            return res.status(209).json({ info: 'Failed to schedule.' });
        }

        const scriptUpdateFields = {
            scheduleId: newScheduleJob.id,
            scheduleName: script.scheduleName,
            scheduleOutputFileName: script.scheduleOutputFileName,
            scheduleOptions: script.scheduleOptions || [],
            scheduleType: script.scheduleType,
            scheduleRule: script.scheduleRule,
            date: new Date(),
        };
        
        await scriptsCollection.findOneAndUpdate(
            { userId: decodedToken.userId, scriptId: script.scriptId },
            { $set: scriptUpdateFields },
            { returnDocument: 'after', upsert: true }
        );
        
        let mailOptions = {
            from: process.env.NODEJS_FROM_EMAIL,
            subject: `${script.scheduleName} added successfully to schedule.`,
            to: decodedToken.email,
            text: `Title: ${script.scriptName} \nSchedule Name: ${script.scheduleName} \nSchedule Rule: ${script.scheduleRule} \n Schedule options: ${script.scheduleOptions}`,
        };
        // addToMailQueue(mailOptions)
        //     .then(() => {
        //         logger.info('New schedule mail alert added.');
        //     })
        //     .catch((error) => {
        //         logger.error(`Failed to add schedule mail alert. ${error}`);
        //     });
        const info = `${script.scriptName} added successfully. Check mail.`;
        return res.status(200).json({ info });

    } catch (error) {
        console.error('ERROR IN ADD/EDIT SCHEDULE SCRIPT: ', error);
        res.status(500).json({ info: 'INTERNAL SERVER ERROR', error });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

module.exports = { scheduleScript, scheduleScriptQueue };
