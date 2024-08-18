require('dotenv').config({ path: '../../.env' });
const { Worker } = require('bullmq');
// const { runScheduleScript } = require("../controllers/scheduleScripts/runScheduleScript");
const { sendMail } = require('./manageMail');
const logger = require('./winstonLogger');
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

const jobHandlers = {
    // runScheduleScript,
    sendMail,
};

const processScheduleScriptJob = async (job) => {
    const handler = jobHandlers[job.name];
    if (handler) {
        logger.info(`Processing job ${job.id} in scheduleScriptQueue: ${job.name}`);
        try {
            await handler(job);
        } catch (error) {
            logger.error(`Error processing job ${job.id} in scheduleScriptQueue: ${error}`);
            throw error;
        }
    } else {
        logger.error(`No handler found for job ${job.name} in scheduleScriptQueue`);
        throw new Error(`No handler found for job ${job.name} in scheduleScriptQueue`);
    }
};

const processSendMailJob = async (job) => {
    const handler = jobHandlers[job.name];
    if (handler) {
        console.log(`Processing job ${job.id} in mailQueue: ${job.name}`);
        try {
            await handler(job);
        } catch (error) {
            logger.error(`Error processing job ${job.id} in mailQueue:`, error);
            throw error;
        }
    } else {
        logger.error(`No handler found for job ${job.name} in mailQueue`);
        throw new Error(`No handler found for job ${job.name} in mailQueue`);
    }
};

const sendMailWorker = new Worker('mailQueue',
    async (job) => {
        await processSendMailJob(job);
        logger.info(`Started mail job ${job.id}`);
    },
    {
        connection,
        concurrency: 10,
    }
);

const scheduleScriptWorker = new Worker('scheduleScriptQueue',
    async (job) => {
        await processScheduleScriptJob(job);
        logger.info(`Started schedule script job ${job.id}`);
    },
    {
        connection,
        concurrency: 10,
    }
);

scheduleScriptWorker.on("completed", (job) => {
    logger.info(`Job ${job.id} in scheduleScriptQueue has completed!`);
});

scheduleScriptWorker.on("failed", (job, err) => {
    logger.info(`Job ${job.id} in scheduleScriptQueue has failed with ${err.message}`);
});

sendMailWorker.on("completed", (job) => {
    logger.info(`Job ${job.id} in mailQueue has completed!`);
});

sendMailWorker.on("failed", (job, err) => {
    logger.info(`Job ${job.id} in mailQueue has failed with ${err.message}`);
});

logger.info("Workers started!");
