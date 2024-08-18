require('dotenv').config({ path: '../../.env' });
const nodemailer = require('nodemailer');
const logger = require('../logs/winstonLogger');
const { Queue } = require('bullmq');

const REDIS_URL = process.env.REDIS_URL
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

let scheduleMailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.FROM_SCHEDULE_MAIL,  
        pass: process.env.SCHEDULE_MAIL_PASSWORD,   
    }
});

let errorMailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.FROM_ERROR_MAIL,  
        pass: process.env.ERROR_MAIL_PASSWORD,   
    }
});

let directMailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.FROM_DIRECT_MAIL,  
        pass: process.env.DIRECT_MAIL_PASSWORD,   
    }
});



const scheduleMailQueue = new Queue('mailQueue', { connection });
const addToScheduleMailQueue = async (mailOptions) => {
    try {
        const jobPayload = { mailOptions };

        const newMailJob = await scheduleMailQueue.add('sendScheduleMail', jobPayload);

        if (!newMailJob) {
            logger.error('Error occurred during adding mail to scheduleMailQueue');
            throw new Error('Error occurred during adding mail to scheduleMailQueue');
        }
    } catch (error) {
        logger.error(`Error occurred during adding mail to scheduleMailQueue: ${error}`);
        throw error;
    }
};
const sendScheduleMail = async (job) => {
    const {mailOptions} = job.data;
    try {
        let info = await scheduleMailTransporter.sendMail(mailOptions);
        logger.info(`Mail sent with id: ${info.messageId}`)
        return info;
    } catch (error) {
        logger.error(`Error occured during sending mail: ${error}`);
        throw error;
    }
};

const errorMailQueue = new Queue('errorMailQueue', {connection});
const addToErrorMailQueue = async (mailOptions) => {
    try {
        const jobPayload = { mailOptions };

        const newMailJob = await errorMailQueue.add('sendErrorMail', jobPayload);

        if (!newMailJob) {
            logger.error('Error occurred during adding mail to errorMailQueue');
            throw new Error('Error occurred during adding mail to errorMailQueue');
        }
    } catch (error) {
        logger.error(`Error occurred during adding mail to errorMailQueue: ${error}`);
        throw error;
    }
};

const sendErrorMail = async (job) => {
    const {mailOptions} = job.data;
    try {
        let info = await errorMailTransporter.sendMail(mailOptions);
        logger.info(`Error Mail sent with id: ${info.messageId}`)
        return info;
    } catch (error) {
        logger.error(`Error occured during sending error mail: ${error}`);
        throw error;
    }
};


const sendDirectMail = async(mailOptions)=>{
    try {
        let info = await directMailTransporter.sendMail(mailOptions);
        logger.info(`Mail sent with id: ${info.messageId}`)
        return info;
    } catch (error) {
        logger.error(`Error occured during sending mail: ${error}`);
        throw error;
    }
}

module.exports = { sendDirectMail, sendScheduleMail , addToScheduleMailQueue, sendErrorMail, addToErrorMailQueue, errorMailQueue , scheduleMailQueue};