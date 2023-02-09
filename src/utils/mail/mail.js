import { MESSAGES, STATICDATA } from '../static/index.js'
import OTPDataTemplate from './templates/template.OTP.js'
import PasswordRecoveryLinkTemplate from './templates/template.passwordrecovery.js'
import VerificationLinkTemplate from './templates/template.verification.js'
import mailTransporter from './transport.js'

export default function Mailer() {
    const { APPLICATIONNAME } = STATICDATA
    const { VERIFICATION_SUBJECT, PASSWORDRECOVERY_SUBJECT, DEFAULT_USERNAME, OTP_SUBJECT } = MESSAGES.MAILS
    const TransitVerificationLink = async (data) => {
        const { email, link, name } = data
        const transporter = mailTransporter()
        const template = VerificationLinkTemplate(name, link)
        return await transporter.sendMail({
            from: `${APPLICATIONNAME} < ${process.env.SVCMSMS_MAIL_ADDRESS}>`,
            to: `${name} < ${email}>`,
            subject: VERIFICATION_SUBJECT,
            html: template,
        }).then(info => {
            if (info.accepted.includes(email)) return { status: true }
        }).catch(err => {
            return { status: false }
        })
    }
    const TransitPasswordResetLink = async (data) => {
        const { email, link, name } = data
        const transporter = mailTransporter()
        const template = PasswordRecoveryLinkTemplate(name, link)
        return transporter.sendMail({
            from: `${APPLICATIONNAME} < ${process.env.SVCMSMS_MAIL_ADDRESS}>`,
            to: `${name} < ${email}>`,
            subject: PASSWORDRECOVERY_SUBJECT,
            html: template,
        }).then(info => {
            if (info.accepted.includes(email)) return { status: true }
        }).catch(err => {
            return { status: false }
        })
    }
    const TransitOTPData = async (receiver, code) => {
        const transporter = mailTransporter()
        const template = OTPDataTemplate(code)
        return await transporter.sendMail({
            from: `${APPLICATIONNAME} < ${process.env.SVCMSMS_MAIL_ADDRESS}>`,
            to: `${DEFAULT_USERNAME} < ${receiver}>`,
            subject: OTP_SUBJECT,
            html: template,
        }).then(info => {
            if (info.accepted.includes(receiver)) return { status: true }
        }).catch(err => {
            console.warn(err)
            return { status: false }
        })
    }
    return {
        TransitVerificationLink, TransitPasswordResetLink, TransitOTPData
    }
}