import DatabaseConnection from '../configs/config.connection.js'
import UserQueryStmt from '../queries/query.users.js'
import { ObjectId } from 'bson'
import UserValidators from '../utils/validators/validator.users.js'
import { MESSAGES, SUCCESSFULREGISTRATIONCOOKIE } from '../utils/static/index.js'
import TextFormatters from '../utils/algos/text.formatters.js'
import { genSaltSync, hashSync, compareSync } from 'bcrypt'
import { v4 } from 'uuid'
import Mailer from '../utils/mail/mail.js'

const UserControllers = () => {
    const { BRS, WSWW } = MESSAGES.MESSAGES
    const { EHBT, SRMESS } = MESSAGES.USERS
    const SALT = genSaltSync(10)
    const { pool } = DatabaseConnection()
    const { INSERTAUSER, CHECKEMAILEXISTENCE, INSERTVERIFICATIONDATA, DELETEUSERBYSLUG, DELETEVERIFICATIONDATA } = UserQueryStmt()
    const { userRegistrationValidator } = UserValidators()
    const { capitalize } = TextFormatters()
    const { TransitVerificationLink } = Mailer()

    const userRegistration = (req, res) => {
        let { firstname, lastname, othername, phone, email, password, password_confirmation, captchacode } = req.body
        // if (!captchacode) return res.status(412).json({ error: BRS })
        const trashAccountWithReason = (id) => {
            pool.query(DELETEUSERBYSLUG, [id], (err, found) => res.status(500).json({ error: WSWW }))
        }
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
                        if (vError) return trashAccountWithReason(slug)
                        const mail = await TransitVerificationLink({ email, link: `${process.env.SVCMSMS_CLIENT_URL}verify?code=${verificationCode}&user=${slug}`, name: lastname })
                        if (!mail) return trashAccountWithReason(slug)
                        if (!mail.status) return trashAccountWithReason(slug)
                        res.cookie('__successfullyRegistered', { registered_email: email, status: true, message: SRMESS }, { ...SUCCESSFULREGISTRATIONCOOKIE })
                        console.log('dgdgfsdfd');
                        return res.status(201).json({ message: SRMESS, newlyCreatedUser: { firstname, lastname, othername, email, phone, slug, timestamp } })
                    })
                })
            })
        })
        if (register.error !== undefined) return res.status(412).json({ error: register.error })
        return register
    }

    const fetchUsers = async (req, res) => {
        // return pool.query(SelectAllUsers, (err, result) => {
        //     if (err) return res.status(500).json({ error: 'Error' })
        //     return res.json({ result: result.rows, id: (new ObjectId()).toString() })
        // })
    }
    return {
        userRegistration, fetchUsers
    }
}
export default UserControllers