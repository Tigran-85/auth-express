const nodemailer = require('nodemailer');

async function main(html) {

    let testAccount = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });


   const info = await transporter.sendMail({
            from: '"Iguan Systems" <foo@example.com>',  // sender address
            to: "tigranpoghosyan94@gmail.com", // list of receivers
            subject: "Mail from Website", // Subject line
            html, // html body
        })
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

module.exports = main;