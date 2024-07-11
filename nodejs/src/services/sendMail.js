require('dotenv').config({ path: '../../../.env' });
const nodemailer = require('nodemailer');
const logger = require('../services/winstonLogger');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEJS_FROM_EMAIL,  
        pass: process.env.NODEJS_FROM_EMAIL_PASSWORD,   
    }
});

const sendMail = async (mailOptions) => {
    try {
        let info = await transporter.sendMail(mailOptions);
        logger.info(`Message sent. ID: ${info.messageId}`)
        return info;
    } catch (error) {
        logger.error(`Error occured during sending mail: ${error}`);
        throw error;
    }
};

module.exports = { sendMail };

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
