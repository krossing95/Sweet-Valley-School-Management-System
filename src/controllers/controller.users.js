import DatabaseConnection from '../configs/config.connection.js'
import UserQueryStmt from '../queries/query.users.js'
import { ObjectId } from 'bson'
import UserValidators from '../utils/validators/validator.users.js'
import { MESSAGES, SUCCESSFULREGISTRATIONCOOKIE, REGEX, OTPCONFIRMATIONCOOKIE, TOKENCOOKIECONFIG, TOKENTRACKERCOOKIECONFIG } from '../utils/static/index.js'
import TextFormatters from '../utils/algos/text.formatters.js'
import { genSaltSync, hashSync, compareSync } from 'bcrypt'
import { v4 } from 'uuid'
import Mailer from '../utils/mail/mail.js'
import moment from 'moment'
import GoogleBotChecker from '../utils/algos/google.captcha.js'
import * as JWT from 'jsonwebtoken'

const UserControllers = () => {
    const { BRS, WSWW } = MESSAGES.MESSAGES
    const { EHBT, SRMESS, SNRF, ARF, SFPLS, IVLF, AVS, VLEAYRNVL, PRLSS, IL, PUS, IEA, IC, SUCCL, SL } = MESSAGES.USERS
    const { IEAV, IOTP } = MESSAGES.VALIDATOR
    const { EMAIL, MONGOOBJECT } = REGEX
    const { sign } = JWT.default
    const SALT = genSaltSync(10)
    const { pool } = DatabaseConnection()
    const { INSERTAUSER, CHECKEMAILEXISTENCE, INSERTVERIFICATIONDATA, DELETEUSERBYSLUG, DELETEVERIFICATIONDATA,
        GETUSERBYSLUG, GETVERIFICATIONDATA, VERIFYUSER, DELETEALLFORUSERBYSLUG, CREATENEWPASSWORDRESETDATA,
        GETPASSWORDRESETDATA, UPDATEUSERPASSWORD, DELETEMANYCODESFORUSER, CREATENEWOTPDATA, GETOTPBYUSER,
        SAVETOKEN
    } = UserQueryStmt()
    const { userRegistrationValidator, passwordResetValidator, loginValidator, otpValidator } = UserValidators()
    const { capitalize } = TextFormatters()
    const { TransitVerificationLink, TransitPasswordResetLink, TransitOTPData } = Mailer()


    const trashAccountWithReason = (id, res) => {
        pool.query(DELETEUSERBYSLUG, [id], (err, found) => res.status(500).json({ error: WSWW }))
    }
    const userRegistration = async (req, res) => {
        let { firstname, lastname, othername, phone, email, password, captchacode } = req.body
        // if (!captchacode) return res.status(412).json({ error: BRS })
        // return await GoogleBotChecker(req, captchacode, () => {
        const register = userRegistrationValidator(req.body, () => {
            firstname = capitalize(firstname), lastname = capitalize(lastname), othername = othername.length >= 3 ? capitalize(othername) : '', phone = parseInt(phone), password = hashSync(password, SALT), email = email.trim()
            const timestamp = (new Date()).toISOString(), slug = (new ObjectId()).toString()
            pool.query(CHECKEMAILEXISTENCE, [email], (err, found) => {
                if (err) return res.status(500).json({ error: WSWW })
                if (found.rowCount > 0) return res.status(412).json({ error: EHBT })
                pool.query(INSERTAUSER, [firstname, lastname, email, phone, timestamp, slug, othername, password], (error, result) => {
                    if (error) return res.status(500).json({ error: WSWW })
                    pool.query(DELETEVERIFICATIONDATA, [slug])
                    const verificationCode = v4()
                    const hashedCode = hashSync(verificationCode, SALT)
                    pool.query(INSERTVERIFICATIONDATA, [slug, hashedCode, timestamp], async (vError, done) => {
                        if (vError) return trashAccountWithReason(slug, res)
                        const mail = await TransitVerificationLink({ email, link: `${process.env.SVCMSMS_CLIENT_URL}verify?code=${verificationCode}&user=${slug}`, name: lastname })
                        if (!mail) return trashAccountWithReason(slug, res)
                        if (!mail.status) return trashAccountWithReason(slug, res)
                        res.cookie('__successfullyRegistered', { registered_email: email, status: true, message: SRMESS }, { ...SUCCESSFULREGISTRATIONCOOKIE })
                        return res.status(201).json({ message: SRMESS, newlyCreatedUser: { firstname, lastname, othername, email, phone, slug, timestamp } })
                    })
                })
            })
        })
        if (register !== undefined) return res.status(412).json({ error: register.error })
        return register
        // })
    }

    const resendVerificationLink = (req, res) => {
        const { email } = req.body
        if (!email.match(EMAIL)) return res.status(400).json({ error: BRS })
        pool.query(CHECKEMAILEXISTENCE, [email], async (error, result) => {
            if (error) return res.status(500).json({ error: WSWW })
            if (result.rowCount !== 1) return res.status(404).json({ error: SNRF })
            if (result.rows[0].status === 2) return res.status(412).json({ error: ARF })
            const userObj = result.rows[0]
            const verificationCode = v4()
            pool.query(DELETEVERIFICATIONDATA, [userObj.slug])
            const mail = await TransitVerificationLink({ email, link: `${process.env.SVCMSMS_CLIENT_URL}verify?code=${verificationCode}&user=${userObj.slug}`, name: userObj.lastname })
            if (mail === undefined) return trashAccountWithReason(userObj.slug, res)
            if (!mail.status) return trashAccountWithReason(userObj.slug, res)
            const hashedCode = hashSync(verificationCode, SALT)
            const timestamp = (new Date()).toISOString()
            pool.query(INSERTVERIFICATIONDATA, [userObj.slug, hashedCode, timestamp], async (vError, done) => {
                if (vError) return trashAccountWithReason(userObj.slug, res)
                res.cookie('__successfullyRegistered', { registered_email: email, status: true, message: SRMESS }, { ...SUCCESSFULREGISTRATIONCOOKIE })
                return res.status(200).json({ message: SFPLS })
            })
        })
    }

    const verifyUser = (req, res) => {
        const { code, user } = req.body
        if (!code || !user) return res.status(400).json({ error: BRS })
        if (code.length < 36 || !user.match(MONGOOBJECT)) return res.status(400).json({ error: BRS })
        pool.query(GETUSERBYSLUG, [user], (error, result) => {
            if (error) return res.status(500).json({ error: WSWW })
            if (result.rowCount !== 1) return res.status(404).json({ error: SNRF })
            if (result.rows[0].status === 2) return res.status(412).json({ error: ARF })
            const userObj = result.rows[0]
            pool.query(GETVERIFICATIONDATA, [userObj.slug], async (err, found) => {
                if (err) return res.status(500).json({ error: WSWW })
                if (found.rowCount !== 1) return res.status(404).json({ error: SNRF })
                const verificationObj = found.rows[0]
                const compareCode = compareSync(code, verificationObj.verification_code)
                if (!compareCode) return res.status(412).json({ error: IVLF })
                if (compareCode) {
                    const registrationDate = moment(verificationObj.timestamp)
                    const currentTime = moment((new Date()).toISOString())
                    const diffTime = currentTime.diff(registrationDate, 'minutes')
                    const verificationCode = v4()
                    if (diffTime <= 60) {
                        pool.query(VERIFYUSER, [2, user], (updateError, response) => {
                            console.log(updateError);
                            if (updateError) return res.status(500).json({ error: WSWW })
                            pool.query(DELETEVERIFICATIONDATA, [userObj.slug])
                            return res.status(200).json({ message: AVS })
                        })
                        return null
                    }
                    pool.query(DELETEVERIFICATIONDATA, [userObj.slug])
                    const hashedCode = hashSync(verificationCode, SALT)
                    const mail = await TransitVerificationLink({ email: userObj.email, link: `${process.env.SVCMSMS_CLIENT_URL}verify?code=${verificationCode}&user=${userObj.slug}`, name: userObj.lastname })
                    if (!mail) return trashAccountWithReason(userObj.slug, res)
                    if (!mail.status) return trashAccountWithReason(userObj.slug, res)
                    const timestamp = (new Date()).toISOString()
                    pool.query(INSERTVERIFICATIONDATA, [userObj.slug, hashedCode, timestamp], async (vError, done) => {
                        if (vError) return trashAccountWithReason(userObj.slug, res)
                        return res.status(200).json({ message: VLEAYRNVL })
                    })
                }
            })
        })
    }

    const passwordRecovery = async (req, res) => {
        const { email, captchacode } = req.body
        if (!captchacode.length) return res.status(400).json({ error: BRS })
        if (!email.match(EMAIL)) return res.status(412).json({ error: IEAV })
        // return await GoogleBotChecker(req, captchacode, () => {
        pool.query(CHECKEMAILEXISTENCE, [email], async (error, result) => {
            if (error) return res.status(500).json({ error: WSWW })
            if (result.rowCount !== 1) return res.status(404).json({ error: SNRF })
            const uniqueCode = v4()
            const userObj = result.rows[0]
            const hashedCode = hashSync(uniqueCode, SALT)
            const timestamp = (new Date()).toISOString()
            pool.query(DELETEALLFORUSERBYSLUG, [userObj.slug])
            const mail = await TransitPasswordResetLink({ email, name: userObj.lastname, link: `${process.env.SVCMSMS_CLIENT_URL}reset-password?code=${uniqueCode}&user=${userObj.slug}` })
            if (!mail) return res.status(500).json({ error: WSWW })
            if (!mail.status) return res.status(500).json({ error: WSWW })
            pool.query(CREATENEWPASSWORDRESETDATA, [userObj.slug, hashedCode, timestamp], (err, done) => {
                if (err) return res.status(500).json({ error: WSWW })
                return res.status(200).json({ message: PRLSS })
            })
        })
        // })
    }

    const passwordReset = async (req, res) => {
        const { user, code, password, password_confirmation, captchacode } = req.body
        if (user.length === 0 || code.length === 0 || password.length === 0 || password_confirmation.length === 0 || !captchacode) return res.status(400).json({ error: BRS })
        // return await GoogleBotChecker(req, captchacode, () => {
        const reset = passwordResetValidator(password, password_confirmation, () => {
            pool.query(GETPASSWORDRESETDATA, [user], (error, result) => {
                if (error) return res.status(500).json({ error: WSWW })
                if (result.rowCount === 0) return res.status(404).json({ error: SNRF })
                const dataObj = result.rows[0]
                const compareCode = compareSync(code, dataObj.code)
                if (!compareCode) return res.status(412).json({ error: SNRF })
                if (compareCode) {
                    const requestTime = moment(dataObj.timestamp)
                    const currentTime = moment((new Date()).toISOString())
                    const diffTime = currentTime.diff(requestTime, 'minutes')
                    if (diffTime > 30) {
                        pool.query(DELETEALLFORUSERBYSLUG, [user])
                        return res.status(412).json({ error: IL })
                    }
                    const hashedPassword = hashSync(password, SALT)
                    pool.query(UPDATEUSERPASSWORD, [hashedPassword, user], (err, done) => {
                        if (err) return res.status(500).json({ error: WSWW })
                        pool.query(DELETEALLFORUSERBYSLUG, [user])
                        return res.status(200).json({ message: PUS })
                    })
                }
            })
        })
        if (reset !== undefined) return res.status(412).json({ error: reset.error })
        return reset
        // })
    }

    const firstStepUserLogin = async (req, res) => {
        const { email, password, captcha } = req.body
        if (email.length === 0 || captcha.length === 0 || password.length === 0) return res.status(400).json({ error: BRS })
        // return await GoogleBotChecker(req, captcha, () => {
        const validate = loginValidator(email, password, () => {
            pool.query(CHECKEMAILEXISTENCE, [email], (error, found) => {
                if (error) return res.status(500).json({ error: WSWW })
                if (found.rowCount !== 1) return res.status(404).json({ error: SNRF })
                const userObj = found.rows[0]
                console.log(userObj);
                if (userObj.verified !== 2) return res.status(412).json({ error: IEA })
                const comparePassword = compareSync(password, userObj.password)
                if (!comparePassword) return res.status(412).json({ error: IC })
                if (comparePassword) {
                    const OTP = Math.random().toString().substring(2, 7)
                    const hashedOTP = hashSync(OTP, SALT), timestamp = (new Date()).toISOString()
                    pool.query(DELETEMANYCODESFORUSER, [userObj.slug])
                    pool.query(CREATENEWOTPDATA, [userObj.slug, hashedOTP, timestamp], async (err, done) => {
                        if (err) return res.status(500).json({ error: WSWW })
                        const mail = await TransitOTPData(email, OTP)
                        if (!mail) return res.status(412).json({ error: WSWW })
                        if (!mail.status) return res.status(412).json({ error: WSWW })
                        res.cookie('__OTPConfirmation', { message: SUCCL, user: userObj.slug, status: true }, { ...OTPCONFIRMATIONCOOKIE })
                        return res.status(200).json({ message: SUCCL })
                    })
                }
            })
        })
        if (validate !== undefined) return res.status(412).json({ error: validate.error })
        return validate
        // })
    }

    const secondStepUserLogin = async (req, res) => {
        const { user, captcha, otp } = req.body
        if (user.length === 0 || captcha.length === 0 || otp.length === 0) return res.status(412).json({ error: BRS })
        // return await GoogleBotChecker(req, captcha, async () => {
        const confirmLogin = otpValidator(user, otp, async () => {
            pool.query(GETOTPBYUSER, [user], (error, result) => {
                if (error) return res.status(500).json({ error: WSWW })
                if (result.rowCount !== 1) return res.status(400).json({ error: BRS })
                const otpDataObj = result.rows[0]
                return res.json(otpDataObj)
                // const compareOTP = compareSync(otp, otpDataObj.code)
                // console.log(compareOTP, otpDataObj);
                // if (!compareOTP) return res.status(412).json({ error: IOTP })
                // if (compareOTP) {
                //     const requestTime = moment(otpDataObj.timestamp)
                //     const currentTime = moment((new Date()).toISOString())
                //     const diffTime = currentTime.diff(requestTime, 'minutes')
                //     pool.query(DELETEMANYCODESFORUSER, [user])
                //     if (diffTime > 5) return res.status(412).json({ error: IOTP })
                //     pool.query(GETUSERBYSLUG, [user], (err, userInfo) => {
                //         if (err) return res.status(500).json({ error: WSWW })
                //         const userObj = userInfo.rows[0]
                //         const signedInUser = { user_id: user, firstname: userObj.firstname, lastname: userObj.lastname, email: userObj.email, usertype: userObj.usertype }
                //         return sign({ ...signedInUser }, process.env.SVCMSMS_JWT_SECRET, { expiresIn: '2h' }, async (tokenerror, token) => {
                //             if (tokenerror) return res.status(500).json({ error: WSWW })
                //             const hashedToken = hashSync(token, SALT)
                //             pool.query(SAVETOKEN, [user, hashedToken, true, (new Date()).toISOString()])
                //             res.cookie(process.env.SVCMSMS_SERVICE_KEY, token, { ...TOKENCOOKIECONFIG }).cookie(process.env.SVCMSMS_AUTHED_USER, { ...signedInUser }, { ...TOKENTRACKERCOOKIECONFIG })
                //             return res.status(200).json({ message: SL })
                //         })
                //     })
                //     return null
                // }
            })
        })
        if (confirmLogin !== undefined) return res.status(412).json({ error: confirmLogin.error })
        return confirmLogin
        // })
    }

    const fetchUsers = async (req, res) => {
        // return pool.query(SelectAllUsers, (err, result) => {
        //     if (err) return res.status(500).json({ error: 'Error' })
        //     return res.json({ result: result.rows, id: (new ObjectId()).toString() })
        // })
    }
    return {
        userRegistration, fetchUsers, resendVerificationLink, verifyUser, passwordRecovery, passwordReset, firstStepUserLogin,
        secondStepUserLogin
    }
}
export default UserControllers