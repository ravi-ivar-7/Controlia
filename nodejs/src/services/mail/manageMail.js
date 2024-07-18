require('dotenv').config({ path: '../../.env' });
const nodemailer = require('nodemailer');
const logger = require('../logs/winstonLogger');
const { Queue } = require('bullmq');


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEJS_FROM_EMAIL,  
        pass: process.env.NODEJS_FROM_EMAIL_PASSWORD,   
    }
});


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

const mailQueue = new Queue('mailQueue', { connection });

const addToMailQueue = async (mailOptions) => {
    try {
        const jobPayload = { mailOptions };

        const newMailJob = await mailQueue.add('sendMail', jobPayload);

        if (!newMailJob) {
            logger.error('Error occurred during adding mail to mailQueue');
            throw new Error('Error occurred during adding mail to mailQueue');
        }
    } catch (error) {
        logger.error(`Error occurred during adding mail to mailQueue: ${error}`);
        throw error;
    }
};

const sendMail = async (job) => {
    const {mailOptions} = job.data;
    try {
        let info = await transporter.sendMail(mailOptions);
        logger.info(`Mail sent with id: ${info.messageId}`)
        return info;
    } catch (error) {
        logger.error(`Error occured during sending mail: ${error}`);
        throw error;
    }
};

module.exports = { sendMail , addToMailQueue, mailQueue};

// let mailOptions = {
//     from: 'your_email@gmail.com',
//     to: 'recipient@example.com',
//     subject: 'Sending Email with Attachments',
//     html: '<h1>Hello from Node.js!</h1><p>This is a test email with HTML content.</p>',
//     text: 'Hello from Node.js!',  // Plain text body,
//     attachments: [
//         {
//             filename: 'report.pdf',
//             path: '/path/to/report.pdf'  // Replace with the path to your file
//         }
//     ]
// };
