import TextFormatters from "../utils/algos/text.formatters.js"
import StudentDataValidator from "../utils/validators/validator.students.js"
import { ObjectId } from "bson"
import { MESSAGES } from "../utils/static/index.js"
import DatabaseConnection from '../configs/config.connection.js'
import StudentQueries from "../queries/query.students.js"

export default function StudentController() {
    const { registerValidator } = StudentDataValidator()
    const { cleanText, capitalize } = TextFormatters()
    const { pool } = DatabaseConnection()
    const {
        REGISTERSTUDENT,
    } = StudentQueries()
    const { WSWW } = MESSAGES.MESSAGES
    const { SRS } = MESSAGES.STUDENTS
    const createNewStudent = (req, res) => {
        let {
            parent_id, firstname, lastname, othername, gender, dob, home_lang, telephone,
            address, commencement_date, last_sch_attended, current_class, parent_type
        } = req.body
        const validate = registerValidator(req.body, () => {
            firstname = capitalize(firstname), lastname = capitalize(lastname), telephone = Number(telephone),
                home_lang = capitalize(home_lang), address = capitalize(cleanText(address)).length <= 3 ? '' : capitalize(cleanText(address)),
                last_sch_attended = capitalize(cleanText(last_sch_attended)).length <= 3 ? '' : capitalize(cleanText(last_sch_attended)),
                othername = othername.length >= 3 ? capitalize(othername) : ''
            const d_id = (new ObjectId()).toString(), timestamp = (new Date()).toISOString()
            pool.query(REGISTERSTUDENT, [d_id, parent_id, firstname, lastname, othername, gender, dob, home_lang, telephone, address, commencement_date, last_sch_attended, current_class, timestamp, parent_type]).then(response => {
                return res.status(200).json({ message: SRS })
            }).catch(err => {
                return res.status(500).json({ error: WSWW })
            })
        })
        if (validate !== undefined) return res.status(412).json({ error: validate.error })
        return validate
    }
    return {
        createNewStudent
    }
}