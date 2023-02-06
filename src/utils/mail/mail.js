import { MESSAGES, STATICDATA } from '../static/index.js'
import VerificationLinkTemplate from './templates/template.verification.js'
import mailTransporter from './transport.js'

export default function Mailer() {
    const { APPLICATIONNAME } = STATICDATA
    const { VERIFICATION_SUBJECT } = MESSAGES.MAILS
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
    return {
        TransitVerificationLink
    }
}