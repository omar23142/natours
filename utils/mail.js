const nodemailer = require ('nodemailer');
const ejs = require ('ejs');
//import { htmlToText } from 'html-to-text';
const {htmlToText} = require('html-to-text');

class Email {
    constructor(user, url) {
        this.to = user.email;
        this.from = process.env.EMAIL_FROM;
        this.url = url;
        this.firstName = user.name.split(' ')[0]
    }
    creatTransporter() {
        if(process.env.NODE_ENV === 'production') {
            return nodemailer.createTransport({service: 'SendGrid',
            auth: {
                user: process.env.SENDGRID_USERNAME,
                pass: process.env.SENDGRID_PASSWORD,
            }});
        }
        // development
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        return transporter;
    }
    async sendEmail(template, subject) {
        // 1 render html based on ejs
        const html =await ejs.renderFile(`${__dirname}/../views/email/${template}`, { firstname : this.firstName, url : this.url});
        //2 options
        // 2 define the email options
        const emailOptions = {
            from:this.from,
            to:this.to,
            subject: subject,
            html: html,
            text: htmlToText(html)
        }
        //3 create transporter and send email
        await this.creatTransporter().sendMail(emailOptions);
    }

    async sendWilcome() {
       await this.sendEmail('welcome.ejs','WELCOME TO THE NATOURS FAMILY !!');
    }

    async sendResetPass() {
        await this.sendEmail('passReset.ejs', 'your password reset token is valid for 10 min')
    }
}

module.exports = Email;

// const sendMail = async (options) => {
// // 1 create transporter
// //console.log('tessst',process.env.EMAIL_USER)
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });
//
// // 2 define the email options
// const emailOptions = {
//     from:'suport@natours.io',
//     to:options.email,
//     subject:options.subject,
//     text:options.message
// }
// // 3 send Email
// await transporter.sendMail(emailOptions);
// }
//
// module.exports = sendMail;



