import { DATATYPES, MESSAGES, REGEX } from '../static/index.js'

export default function UserValidators() {
    const { AFAR, NATL, ONNIR, NMBEA, PSMESS, IEAV, LOPV, PMD, PNINS, UAPR, IC, IOTP } = MESSAGES.VALIDATOR
    const { UNDEFINED } = DATATYPES
    const { PASSWORD, EMAIL, ALPHA, NUMERICAL, MONGOOBJECT } = REGEX

    const userRegistrationValidator = (data, next) => {
        const { firstname, lastname, othername, phone, email, password, password_confirmation } = data
        if (!firstname.length || !lastname.length || !email.length || !phone.length || !password.length) return { error: AFAR }
        if (!firstname.match(ALPHA) || !lastname.match(ALPHA)) return { error: NMBEA }
        if (!password.match(PASSWORD)) return { error: PSMESS }
        if (!email.match(EMAIL)) return { error: IEAV }
        if (!phone.match(NUMERICAL) || phone.length !== 10) return { error: PNINS }
        if (firstname.length < 3 || firstname.length > 30 || lastname.length < 3 || lastname.length > 30) return { error: NATL }
        if (typeof othername !== UNDEFINED) {
            if (othername.length > 30) return { error: ONNIR }
        }
        if (password.length < 8) return { error: LOPV }
        if (password !== password_confirmation) return { error: PMD }
        return next()
    }
    const passwordResetValidator = (password, password_confirmation, next) => {
        if (password.length < 8) return { error: LOPV }
        if (!password.match(PASSWORD)) return { error: PSMESS }
        if (password !== password_confirmation) return { error: PMD }
        return next()
    }
    const loginValidator = (email, password, next) => {
        if (!email.length || !password.length) return { error: UAPR }
        if (password.length < 8 || !password.match(PASSWORD)) return { error: IC }
        if (!email.match(EMAIL)) return { error: IC }
        return next()
    }
    const otpValidator = (user, otp, next) => {
        if (!user.match(MONGOOBJECT)) return { error: BRS }
        if (!otp.match(NUMERICAL)) return { error: IOTP }
        if (otp.length !== 5) return { error: IOTP }
        next()
    }

    return {
        userRegistrationValidator, passwordResetValidator, loginValidator, otpValidator
    }
}