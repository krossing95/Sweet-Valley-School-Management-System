import DatabaseConnection from '../configs/config.connection.js'
import UserQueryStmt from '../queries/query.users.js'
import { ObjectId } from 'bson'
import UserValidators from '../utils/validators/validator.users.js'
import { MESSAGES, SUCCESSFULREGISTRATIONCOOKIE, REGEX } from '../utils/static/index.js'
import TextFormatters from '../utils/algos/text.formatters.js'
import { genSaltSync, hashSync, compareSync } from 'bcrypt'
import { v4 } from 'uuid'
import Mailer from '../utils/mail/mail.js'
import moment from 'moment'
import GoogleBotChecker from '../utils/algos/google.captcha.js'

const UserControllers = () => {
    const { BRS, WSWW } = MESSAGES.MESSAGES
    const { EHBT, SRMESS, SNRF, ARF, SFPLS, IVLF, AVS, VLEAYRNVL } = MESSAGES.USERS
    const { IEAV } = MESSAGES.VALIDATOR
    const { EMAIL, MONGOOBJECT } = REGEX
    const SALT = genSaltSync(10)
    const { pool } = DatabaseConnection()
    const { INSERTAUSER, CHECKEMAILEXISTENCE, INSERTVERIFICATIONDATA, DELETEUSERBYSLUG, DELETEVERIFICATIONDATA,
        GETUSERBYSLUG, GETVERIFICATIONDATA, VERIFYUSER
    } = UserQueryStmt()
    const { userRegistrationValidator } = UserValidators()
    const { capitalize } = TextFormatters()
    const { TransitVerificationLink } = Mailer()


    const trashAccountWithReason = (id, res) => {
        pool.query(DELETEUSERBYSLUG, [id], (err, found) => res.status(500).json({ error: WSWW }))
    }
    const userRegistration = (req, res) => {
        let { firstname, lastname, othername, phone, email, password, password_confirmation, captchacode } = req.body
        // if (!captchacode) return res.status(412).json({ error: BRS })
        const register = userRegistrationValidator(req.body, async () => {
            firstname = capitalize(firstname), lastname = capitalize(lastname), othername = othername.length >= 3 ? capitalize(othername) : '', phone = parseInt(phone), password = hashSync(password, SALT), email = email.trim()
            const timestamp = (new Date()).toISOString(), slug = (new ObjectId()).toString(), verificationCode = v4()
            pool.query(CHECKEMAILEXISTENCE, [email], (err, found) => {
                if (err) return res.status(500).json({ error: WSWW })
                if (found.rowCount > 0) return res.status(412).json({ error: EHBT })
                pool.query(INSERTAUSER, [firstname, lastname, email, phone, timestamp, slug, othername, password], (error, result) => {
                    if (error) return res.status(500).json({ error: WSWW })
                    pool.query(DELETEVERIFICATIONDATA, [slug])
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
        if (register.error !== undefined) return res.status(412).json({ error: register.error })
        return register
    }

    const resendVerificationLink = (req, res) => {
        const { email } = req.body
        if (!email.match(EMAIL)) return res.status(400).json(BRS)
        pool.query(CHECKEMAILEXISTENCE, [email], async (error, result) => {
            if (error) return res.status(500).json({ error: WSWW })
            if (result.rowCount !== 1) return res.status(404).json({ error: SNRF })
            if (result.rows[0].status === 2) return res.status(412).json({ error: ARF })
            const userObj = result.rows[0]
            const verificationCode = v4()
            const mail = await TransitVerificationLink({ email, link: `${process.env.SVCMSMS_CLIENT_URL}verify?code=${verificationCode}&user=${userObj.slug}`, name: userObj.lastname })
            if (!mail) return trashAccountWithReason(userObj.slug, res)
            if (!mail.status) return trashAccountWithReason(userObj.slug, res)
            const hashedCode = hashSync(verificationCode, SALT)
            const timestamp = (new Date()).toISOString()
            pool.query(DELETEVERIFICATIONDATA, [userObj.slug])
            pool.query(INSERTVERIFICATIONDATA, [userObj.slug, hashedCode, timestamp], async (vError, done) => {
                if (vError) return trashAccountWithReason(userObj.slug, res)
                res.cookie('__successfullyRegistered', { registered_email: email, status: true, message: SRMESS }, { ...SUCCESSFULREGISTRATIONCOOKIE })
                return res.status(200).json({ message: SFPLS })
            })
        })
    }

    const verifyUser = (req, res) => {
        const { code, user } = req.body
        if (!code || !user) return res.status(400).json(BRS)
        if (code.length < 36 || !user.match(MONGOOBJECT)) return res.status(400).json(BRS)
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
                        pool.query(VERIFYUSER, [2], (updateError, response) => {
                            if (updateError) return res.status(500).json({ error: WSWW })
                            pool.query(DELETEVERIFICATIONDATA, [userObj.slug])
                            return res.status(200).json({ message: AVS })
                        })
                    }
                    const hashedCode = hashSync(verificationCode, SALT)
                    const mail = await TransitVerificationLink({ email: userObj.email, link: `${process.env.SVCMSMS_CLIENT_URL}verify?code=${verificationCode}&user=${userObj.slug}`, name: userObj.lastname })
                    if (!mail) return trashAccountWithReason(userObj.slug, res)
                    if (!mail.status) return trashAccountWithReason(userObj.slug, res)
                    pool.query(DELETEVERIFICATIONDATA, [userObj.slug])
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
        return await GoogleBotChecker(req, captchacode, async () => {
            pool.query(CHECKEMAILEXISTENCE, [email], (error, result) => {
                if (error) return res.status(500).json({ error: WSWW })
                if (!result.rowCount !== 1) return res.status(404).json({ error: SNRF })
                const uniqueCode = v4()
                const hashedCode = hashSync(uniqueCode, SALT)

            })
            // return await User.findOne({ email }, async (error, found) => {
            //     // if (error) return res.status(500).json({ error: WSWW })
            //     // if (!found) return res.status(404).json({ error: SNRF })
            //     // const uniqueCode = v4()
            //     // const hashedCode = hashSync(uniqueCode, salt)
            //     // const user = { username: found.username, email: found.email }
            //     const messenger = await passwordRecoveryMailTransit({ ...user, link: `${process.env.SAS_CLIENT_URL}reset-password?code=${uniqueCode}&user=${found._id}` })
            //     if (!messenger) return res.status(500).json({ error: WSWW })
            //     if (!messenger.status) return res.status(500).json({ error: WSWW })
            //     await PasswordReset.deleteMany({ user_id: found._id }).catch(err => console.warn(err))
            //     return PasswordReset.create({
            //         user_id: found._id, code: hashedCode, date: (new Date()).toISOString()
            //     }, (err, result) => {
            //         if (err) return res.status(500).json({ error: WSWW })
            //         return res.status(200).json({ message: PRLSS })
            //     })
            // }).clone().catch(err => console.warn(err))
        })
    }

    const fetchUsers = async (req, res) => {
        // return pool.query(SelectAllUsers, (err, result) => {
        //     if (err) return res.status(500).json({ error: 'Error' })
        //     return res.json({ result: result.rows, id: (new ObjectId()).toString() })
        // })
    }
    return {
        userRegistration, fetchUsers, resendVerificationLink, verifyUser, passwordRecovery
    }
}
export default UserControllers