const nodemailer = require('nodemailer');
const fs = require('fs/promises');
const handlebars = require('handlebars');
const path = require('path');

const user = process.env.EMAIL_USERNAME;
const pass = process.env.EMAIL_PASSWORD;

const config = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user,
        pass,
    },
};

const transport = nodemailer.createTransport(config);

const sendText = (options = { to, subject, content }, callback) =>
    transport.sendMail(
        {
            from: `Qrious <${user}>`,
            to: options.to,
            subject: options.subject,
            text: options.content,
        },
        callback
    );

const sendHtml = (options = { to, subject, content }, callback) =>
    transport.sendMail(
        {
            from: `Qrious <${user}>`,
            to: options.to,
            subject: options.subject,
            html: options.content,
        },
        callback
    );

const sendUser_Password = async (options = { to, password }, callback) => {
    try {
        const template = await fs.readFile(
            path.join(__dirname, 'templates', '_new_user.min.html'),
            'utf8'
        );
        const replacement = {
            passgenerated: options.password,
        };
        const compiled = handlebars.compile(template);
        const html = compiled(replacement);
        sendHtml(
            {
                to: options.to,
                subject: `Your Password - Qrious`,
                content: html,
            },
            callback
        );
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = {
    sendText,
    sendHtml,
    sendUser_Password,
};
