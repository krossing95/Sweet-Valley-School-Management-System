import nodemailer from 'nodemailer'

export default function mailTransporter() {
    const transporter = nodemailer.createTransport({
        host: process.env.SVCMSMS_MAIL_SERVER,
        port: 587,
        secure: false,
        auth: {
            user: process.env.SVCMSMS_MAIL_ADDRESS,
            pass: process.env.SVCMSMS_MAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        },
        requireTLS: true
    })
    return transporter
}