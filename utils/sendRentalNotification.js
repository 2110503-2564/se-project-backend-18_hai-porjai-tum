const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.NODEMAIL_MAIL,  // official email
            pass: process.env.NODEMAIL_PASS   // pass
        }
    });

    const mailOptions = {
        from: process.env.NODEMAIL_MAIL,
        to: options.email, // Customer's email
        subject: options.subject,
        text: options.message
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
