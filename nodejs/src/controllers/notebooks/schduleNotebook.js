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

const scheduleNotebookQueue = new Queue('scheduleNotebookQueue', { connection });

const scheduleNotebook = async (req, res) => {
    let client;
    try {
        const { decodedToken, notebook } = req.body;
        if (!notebook) {
            return res.status(209).json({ warn: 'notebook info missing from body.' });
        }
        client = new MongoClient(process.env.MONGODB_URL);
        await client.connect();
        const db = client.db("controlia");
        const notebooksCollection = db.collection('notebooks');

        let jobOptions = {};

        if (notebook.scheduleType === 'fixed') {
            const fixedDatetime = new Date(notebook.scheduleRule);
            const delay = fixedDatetime.getTime() - new Date().getTime() + (process.env.TIME_DIFFERENCE * 1000 || 0);
            if (isNaN(delay) || !isFinite(delay)) {
                return res.status(209).json({ warn: 'Invalid schedule rule.' });
            }
            jobOptions = { delay: delay };
        } else if (notebook.scheduleType === 'recurring') {
            jobOptions = { repeat: { cron: notebook.scheduleRule } };
        } else {
            return res.status(209).json({ warn: 'Unsupported schedule rule.' });
        }
        const jobPayload = { userId: decodedToken.userId, email: decodedToken.email, notebookName: notebook.notebookName };

        let newScheduleJob ;
        newScheduleJob = await scheduleNotebookQueue.add('runBgNotebookFile', jobPayload, jobOptions);
    
        if (!newScheduleJob) {
            return res.status(209).json({ info: 'Failed to schedule.' });
        }

        const notebookUpdateFields = {
            scheduleId: newScheduleJob.id,
            scheduleName: notebook.scheduleName,
            scheduleOutputFileName: notebook.scheduleOutputFileName,
            scheduleOptions: notebook.scheduleOptions || [],
            scheduleType: notebook.scheduleType,
            scheduleRule: notebook.scheduleRule,
            notebookName: notebook.notebookName,
            date: new Date(),
        };
        
        await notebooksCollection.findOneAndUpdate(
            { userId: decodedToken.userId, notebookName: notebook.notebookName },
            { $set: notebookUpdateFields },
            { returnDocument: 'after', upsert: true }
        );
        
        let mailOptions = {
            from: process.env.NODEJS_FROM_EMAIL,
            subject: `${notebook.notebookName} added successfully to schedule.`,
            to: decodedToken.email,
            text: `Title: ${notebook.notebookName} \nSchedule Name: ${notebook.scheduleName} \nSchedule Rule: ${notebook.scheduleRule} \nSchedule options: ${notebook.scheduleOptions}`,
        };
        addToMailQueue(mailOptions)
            .then(() => {
                logger.info('New schedule mail alert added.');
            })
            .catch((error) => {
                logger.error(`Failed to add schedule mail alert. ${error}`);
            });
        const info = `${notebook.notebookName} added successfully. Check mail.`;
        return res.status(200).json({ info });

    } catch (error) {
        console.error('ERROR IN ADD/EDIT SCHEDULE NOTEBOOK: ', error);
        res.status(500).json({ info: 'INTERNAL SERVER ERROR', error });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

module.exports = { scheduleNotebook, scheduleNotebookQueue };
