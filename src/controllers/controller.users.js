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
import url from 'url'
import StudentQueries from '../queries/query.students.js'

const UserControllers = () => {
    const { BRS, WSWW, NCFY } = MESSAGES.MESSAGES
    const { ADS, EHBT, SRMESS, SNRF, ARF, SFPLS, IVLF, AVS, VLEAYRNVL, PRLSS, IL, PUS, IEA, SUCCL, SL, UIUS } = MESSAGES.USERS
    const { NSRFFP } = MESSAGES.STUDENTS
    const { ACNBE } = MESSAGES.MESSAGES
    const { IEAV, IOTP, IC } = MESSAGES.VALIDATOR
    const { EMAIL, MONGOOBJECT } = REGEX
    const { sign } = JWT.default
    const SALT = genSaltSync(10)
    const { pool } = DatabaseConnection()
    const { INSERTAUSER, CHECKEMAILEXISTENCE, INSERTVERIFICATIONDATA, DELETEUSERBYSLUG, DELETEVERIFICATIONDATA,
        GETUSERBYSLUG, GETVERIFICATIONDATA, VERIFYUSER, DELETEALLFORUSERBYSLUG, CREATENEWPASSWORDRESETDATA,
        GETPASSWORDRESETDATA, UPDATEUSERPASSWORD, DELETEMANYCODESFORUSER, CREATENEWOTPDATA, GETOTPBYUSER,
        SAVETOKEN, CLEARALLSAVEDTOKENS, SELECTUSERS, UPDATEUSERINFO
    } = UserQueryStmt()
    const { SELECTSTUDENTSBYPARENT, SELECTALLINFO } = StudentQueries()
    const { userRegistrationValidator, passwordResetValidator, loginValidator, otpValidator, userUpdateValidate } = UserValidators()
    const { capitalize } = TextFormatters()
    const { TransitVerificationLink, TransitPasswordResetLink, TransitOTPData } = Mailer()

    const trashAccountWithReason = (id, res) => {
        pool.query(DELETEUSERBYSLUG, [id]).then(function () {
            res.status(500).json({ error: WSWW })
        }).catch(function (err) {
            res.status(500).json({ error: WSWW })
        })
    }
    const userRegistration = async (req, res) => {
        let { firstname, lastname, othername, phone, email, password, captchacode } = req.body
        if (!captchacode) return res.status(412).json({ error: BRS })
        return await GoogleBotChecker(req, captchacode, () => {
            const register = userRegistrationValidator(req.body, () => {
                firstname = capitalize(firstname), lastname = capitalize(lastname), othername = othername.length >= 3 ? capitalize(othername) : '', phone = parseInt(phone), password = hashSync(password, SALT), email = email.trim()
                const timestamp = (new Date()).toISOString(), slug = (new ObjectId()).toString()
                pool.query(CHECKEMAILEXISTENCE, [email]).then(result => {
                    if (result.rowCount > 0) return res.status(412).json({ error: EHBT })
                    pool.query(INSERTAUSER, [firstname, lastname, email, phone, timestamp, slug, othername, password]).then(response => {
                        pool.query(DELETEVERIFICATIONDATA, [slug]).catch(err => console.warn(err))
                        const verificationCode = v4()
                        const hashedCode = hashSync(verificationCode, SALT)
                        pool.query(INSERTVERIFICATIONDATA, [slug, hashedCode, timestamp]).then(async iresponse => {
                            const mail = await TransitVerificationLink({ email, link: `${process.env.SVCMSMS_CLIENT_URL}verify?code=${verificationCode}&user=${slug}`, name: lastname })
                            if (!mail) return trashAccountWithReason(slug, res)
                            if (!mail.status) return trashAccountWithReason(slug, res)
                            res.cookie('__successfullyRegistered', { registered_email: email, status: true, message: SRMESS }, { ...SUCCESSFULREGISTRATIONCOOKIE })
                            return res.status(201).json({ message: SRMESS, newlyCreatedUser: { firstname, lastname, othername, email, phone, slug, timestamp } })
                        }).catch(err => {
                            return trashAccountWithReason(slug, res)
                        })
                    }).catch(err => {
                        return res.status(500).json({ error: WSWW })
                    })
                }).catch(err => {
                    return res.status(500).json({ error: WSWW })
                })
            })
            if (register !== undefined) return res.status(412).json({ error: register.error })
            return register
        })
    }

    const resendVerificationLink = (req, res) => {
        const { email } = req.body
        if (!email.match(EMAIL)) return res.status(400).json({ error: BRS })
        pool.query(CHECKEMAILEXISTENCE, [email]).then(async result => {
            if (result.rowCount !== 1) return res.status(404).json({ error: SNRF })
            if (result.rows[0].status === 2) return res.status(412).json({ error: ARF })
            const userObj = result.rows[0]
            const verificationCode = v4()
            pool.query(DELETEVERIFICATIONDATA, [userObj.slug]).catch(err => console.warn(err))
            const mail = await TransitVerificationLink({ email, link: `${process.env.SVCMSMS_CLIENT_URL}verify?code=${verificationCode}&user=${userObj.slug}`, name: userObj.lastname })
            if (mail === undefined) return trashAccountWithReason(userObj.slug, res)
            if (!mail.status) return trashAccountWithReason(userObj.slug, res)
            const hashedCode = hashSync(verificationCode, SALT)
            const timestamp = (new Date()).toISOString()
            pool.query(INSERTVERIFICATIONDATA, [userObj.slug, hashedCode, timestamp]).then(async done => {
                res.cookie('__successfullyRegistered', { registered_email: email, status: true, message: SRMESS }, { ...SUCCESSFULREGISTRATIONCOOKIE })
                return res.status(200).json({ message: SFPLS })
            }).catch(err => {
                return trashAccountWithReason(userObj.slug, res)
            })
        }).catch(err => {
            return res.status(500).json({ error: WSWW })
        })
    }

    const verifyUser = (req, res) => {
        const { code, user } = req.body
        if (!code || !user) return res.status(400).json({ error: BRS })
        if (code.length < 36 || !user.match(MONGOOBJECT)) return res.status(400).json({ error: BRS })
        pool.query(GETUSERBYSLUG, [user]).then(result => {
            if (result.rowCount !== 1) return res.status(404).json({ error: SNRF })
            if (result.rows[0].status === 2) return res.status(412).json({ error: ARF })
            const userObj = result.rows[0]
            pool.query(GETVERIFICATIONDATA, [userObj.slug]).then(async found => {
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
                        return pool.query(VERIFYUSER, [2, user]).then(response => {
                            pool.query(DELETEVERIFICATIONDATA, [userObj.slug]).catch(err => console.warn(err))
                            return res.status(200).json({ message: AVS })
                        }).catch(err => {
                            return res.status(500).json({ error: WSWW })
                        })
                    }
                    pool.query(DELETEVERIFICATIONDATA, [userObj.slug]).catch(err => console.warn(err))
                    const hashedCode = hashSync(verificationCode, SALT)
                    const mail = await TransitVerificationLink({ email: userObj.email, link: `${process.env.SVCMSMS_CLIENT_URL}verify?code=${verificationCode}&user=${userObj.slug}`, name: userObj.lastname })
                    if (!mail) return trashAccountWithReason(userObj.slug, res)
                    if (!mail.status) return trashAccountWithReason(userObj.slug, res)
                    const timestamp = (new Date()).toISOString()
                    pool.query(INSERTVERIFICATIONDATA, [userObj.slug, hashedCode, timestamp]).then(async done => {
                        return res.status(200).json({ message: VLEAYRNVL })
                    }).catch(err => {
                        return trashAccountWithReason(userObj.slug, res)
                    })
                }
            }).catch(err => {
                return res.status(500).json({ error: WSWW })
            })
        }).catch(err => {
            return res.status(500).json({ error: WSWW })
        })
    }

    const passwordRecovery = async (req, res) => {
        const { email, captchacode } = req.body
        if (!captchacode.length) return res.status(400).json({ error: BRS })
        if (!email.match(EMAIL)) return res.status(412).json({ error: IEAV })
        return await GoogleBotChecker(req, captchacode, () => {
            pool.query(CHECKEMAILEXISTENCE, [email]).then(async result => {
                if (result.rowCount !== 1) return res.status(404).json({ error: SNRF })
                const uniqueCode = v4()
                const userObj = result.rows[0]
                const hashedCode = hashSync(uniqueCode, SALT)
                const timestamp = (new Date()).toISOString()
                pool.query(DELETEALLFORUSERBYSLUG, [userObj.slug]).catch(err => console.warn(err))
                const mail = await TransitPasswordResetLink({ email, name: userObj.lastname, link: `${process.env.SVCMSMS_CLIENT_URL}reset-password?code=${uniqueCode}&user=${userObj.slug}` })
                if (!mail) return res.status(500).json({ error: WSWW })
                if (!mail.status) return res.status(500).json({ error: WSWW })
                pool.query(CREATENEWPASSWORDRESETDATA, [userObj.slug, hashedCode, timestamp]).then(done => {
                    return res.status(200).json({ message: PRLSS })
                }).catch(err => {
                    return res.status(500).json({ error: WSWW })
                })
            }).catch(err => {
                return res.status(500).json({ error: WSWW })
            })
        })
    }

    const passwordReset = async (req, res) => {
        const { user, code, password, password_confirmation, captchacode } = req.body
        if (user.length === 0 || code.length === 0 || password.length === 0 || password_confirmation.length === 0 || !captchacode) return res.status(400).json({ error: BRS })
        return await GoogleBotChecker(req, captchacode, () => {
            const reset = passwordResetValidator(password, password_confirmation, () => {
                pool.query(GETPASSWORDRESETDATA, [user]).then(result => {
                    if (result.rowCount === 0) return res.status(404).json({ error: SNRF })
                    const dataObj = result.rows[0]
                    const compareCode = compareSync(code, dataObj.code)
                    if (!compareCode) return res.status(412).json({ error: SNRF })
                    if (compareCode) {
                        const requestTime = moment(dataObj.timestamp)
                        const currentTime = moment((new Date()).toISOString())
                        const diffTime = currentTime.diff(requestTime, 'minutes')
                        if (diffTime > 30) {
                            pool.query(DELETEALLFORUSERBYSLUG, [user]).catch(err => console.warn(err))
                            return res.status(412).json({ error: IL })
                        }
                        const hashedPassword = hashSync(password, SALT)
                        pool.query(UPDATEUSERPASSWORD, [hashedPassword, user]).then(done => {
                            pool.query(DELETEALLFORUSERBYSLUG, [user]).catch(err => console.warn(err))
                            return res.status(200).json({ message: PUS })
                        }).catch(err => {
                            return res.status(500).json({ error: WSWW })
                        })
                    }
                }).catch(err => {
                    return res.status(500).json({ error: WSWW })
                })
            })
            if (reset !== undefined) return res.status(412).json({ error: reset.error })
            return reset
        })
    }

    const firstStepUserLogin = async (req, res) => {
        const { email, password, captcha } = req.body
        if (email.length === 0 || captcha.length === 0 || password.length === 0) return res.status(400).json({ error: BRS })
        return await GoogleBotChecker(req, captcha, () => {
            const validate = loginValidator(email, password, () => {
                pool.query(CHECKEMAILEXISTENCE, [email]).then(found => {
                    if (found.rowCount !== 1) return res.status(404).json({ error: SNRF })
                    const userObj = found.rows[0]
                    if (userObj.verified !== 2) return res.status(412).json({ error: IEA })
                    const comparePassword = compareSync(password, userObj.password)
                    if (!comparePassword) return res.status(412).json({ error: IC })
                    if (comparePassword) {
                        const OTP = Math.random().toString().substring(2, 7)
                        const hashedOTP = hashSync(OTP, SALT), timestamp = (new Date()).toISOString()
                        pool.query(DELETEMANYCODESFORUSER, [userObj.slug]).catch(err => console.warn(err))
                        pool.query(CREATENEWOTPDATA, [userObj.slug, hashedOTP, timestamp]).then(async done => {
                            const mail = await TransitOTPData(email, OTP)
                            if (!mail) return res.status(412).json({ error: WSWW })
                            if (!mail.status) return res.status(412).json({ error: WSWW })
                            res.cookie('__OTPConfirmation', { message: SUCCL, user: userObj.slug, status: true }, { ...OTPCONFIRMATIONCOOKIE })
                            return res.status(200).json({ message: SUCCL })
                        }).catch(err => {
                            return res.status(500).json({ error: WSWW })
                        })
                    }
                }).catch(err => {
                    return res.status(500).json({ error: WSWW })
                })
            })
            if (validate !== undefined) return res.status(412).json({ error: validate.error })
            return validate
        })
    }

    const secondStepUserLogin = async (req, res) => {
        const { user, captcha, otp } = req.body
        if (user.length === 0 || captcha.length === 0 || otp.length === 0) return res.status(412).json({ error: BRS })
        return await GoogleBotChecker(req, captcha, async () => {
            const confirmLogin = otpValidator(user, otp, async () => {
                pool.query(GETOTPBYUSER, [user]).then(result => {
                    if (result.rowCount !== 1) return res.status(400).json({ error: BRS })
                    const otpDataObj = result.rows[0]
                    const compareOTP = compareSync(otp, otpDataObj.code)
                    if (!compareOTP) return res.status(412).json({ error: IOTP })
                    if (compareOTP) {
                        const requestTime = moment(otpDataObj.timestamp)
                        const currentTime = moment((new Date()).toISOString())
                        const diffTime = currentTime.diff(requestTime, 'minutes')
                        pool.query(DELETEMANYCODESFORUSER, [user]).catch(err => console.warn(err))
                        if (diffTime > 5) return res.status(412).json({ error: IOTP })
                        pool.query(GETUSERBYSLUG, [user]).then(userInfo => {
                            const userObj = userInfo.rows[0]
                            const signedInUser = { user_id: user, firstname: userObj.firstname, lastname: userObj.lastname, email: userObj.email, usertype: userObj.usertype }
                            return sign({ ...signedInUser }, process.env.SVCMSMS_JWT_SECRET, { expiresIn: '2h' }, async (tokenerror, token) => {
                                if (tokenerror) return res.status(500).json({ error: WSWW })
                                const hashedToken = hashSync(token, SALT)
                                pool.query(CLEARALLSAVEDTOKENS, [user]).catch(err => console.warn(err))
                                pool.query(SAVETOKEN, [user, hashedToken, true, (new Date()).toISOString()]).catch(err => console.warn(err))
                                res.cookie(process.env.SVCMSMS_SERVICE_KEY, token, { ...TOKENCOOKIECONFIG }).cookie(process.env.SVCMSMS_AUTHED_USER, { ...signedInUser }, { ...TOKENTRACKERCOOKIECONFIG })
                                return res.status(200).json({ message: SL })
                            })
                        }).catch(err => {
                            return res.status(500).json({ error: WSWW })
                        })
                    }
                }).catch(err => {
                    return res.status(500).json({ error: WSWW })
                })
            })
            if (confirmLogin !== undefined) return res.status(412).json({ error: confirmLogin.error })
            return confirmLogin
        })
    }

    const fetchUsers = (req, res) => {
        const params = new URLSearchParams(url.parse(req.url, true).query)
        const limit = !params.get('limit') ? 50 : Number(params.get('limit'))
        const getUsers = pool.query(SELECTUSERS).then(result => {
            const hasmore = result.rowCount > limit ? true : false
            return res.status(200).json({ users: [...result.rows], hasmore })
        }).catch(err => {
            return res.status(500).json({ error: WSWW })
        })
        return getUsers
    }
    const fetchUser = (req, res) => {
        const params = new URLSearchParams(url.parse(req.url, true).query)
        if (!params.get('user_id')) return res.status(400).json({ error: BRS })
        const user_id = params.get('user_id')
        if (!user_id.match(MONGOOBJECT)) return res.status(400).json({ error: BRS })
        const getUser = pool.query(GETUSERBYSLUG, [user_id]).then(result => {
            if (result.rowCount !== 1) return res.status(404).json({ error: SNRF })
            const user = result.rows[0]
            user.password = undefined, user.id = undefined
            return res.status(200).json({ ...user })
        }).catch(err => {
            return res.status(500).json({ error: WSWW })
        })
        return getUser
    }
    const updateUser = (req, res) => {
        let { user_id, firstname, lastname, email, phone, usertype, othername } = req.body
        const validate = userUpdateValidate(req.body, () => {
            pool.query(CHECKEMAILEXISTENCE, [email]).then(result => {
                usertype = parseInt(usertype), firstname = capitalize(firstname), lastname = capitalize(lastname), othername = othername.length >= 3 ? capitalize(othername) : '', phone = parseInt(phone), email = email.trim()
                const update = () => {
                    const patch = pool.query(UPDATEUSERINFO, [firstname, lastname, email, phone, othername, usertype, user_id]).then(response => {
                        if (response.rowCount === 0) return res.status(500).json({ message: ACNBE })
                        return res.status(200).json({ message: UIUS })
                    }).catch(err => {
                        return res.status(500).json({ error: WSWW })
                    })
                    return patch
                }
                if (result.rowCount === 0) return update()
                const user = result.rows[0]
                if (user.firstname === firstname && user.lastname === lastname && user.email === email && user.phone === Number(phone.toString().slice(0)) && user.othername === othername && user.usertype === Number(usertype)) return res.status(412).json({ error: NCFY })
                if (user.slug !== user_id) return res.status(412).json({ error: EHBT })
                return update()
            }).catch(err => {
                return res.status(500).json({ error: WSWW })
            })
        })
        if (validate !== undefined) return res.status(412).json({ error: validate.error })
        return validate
    }
    const deleteUser = (req, res) => {
        const params = new URLSearchParams(url.parse(req.url, true).query)
        if (!params.get('user')) return res.status(400).json({ error: BRS })
        const user = params.get('user')
        if (!user.match(MONGOOBJECT)) return res.status(400).json({ error: BRS })
        // check if there's a student attached and anonym
        pool.query(DELETEUSERBYSLUG, [user]).then(response => {
            if (response.rowCount > 0) return res.status(200).json({ message: ADS })
            return res.status(500).json({ error: ACNBE })
        }).catch(err => {
            return res.status(500).json({ error: WSWW })
        })
    }
    return {
        userRegistration, fetchUsers, resendVerificationLink, verifyUser, passwordRecovery, passwordReset, firstStepUserLogin,
        secondStepUserLogin, fetchUser, updateUser, deleteUser
    }
}
export default UserControllers