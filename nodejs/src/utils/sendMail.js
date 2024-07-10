const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ravikumar117211@gmail.com',  
        pass: 'qgwi xdrv lkcy abge'   
    }
});

const sendMail = async (mailOptions) => {
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error occurred:', error.message);
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
