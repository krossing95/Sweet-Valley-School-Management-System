import TextFormatters from "../utils/algos/text.formatters.js"
import StudentDataValidator from "../utils/validators/validator.students.js"
import { ObjectId } from "bson"
import { MESSAGES, REGEX } from "../utils/static/index.js"
import DatabaseConnection from '../configs/config.connection.js'
import StudentQueries from "../queries/query.students.js"
import UserQueryStmt from "../queries/query.users.js"
import url from 'url'

export default function StudentController() {
    const { registerValidator } = StudentDataValidator()
    const { cleanText, capitalize } = TextFormatters()
    const { pool } = DatabaseConnection()
    const {
        REGISTERSTUDENT, GETSTUDENTS, SELECTSTUDENTBYID
    } = StudentQueries()
    const { GETUSERBYSLUG, SELECTUSERS, GETPARENTBYSTUDENTID } = UserQueryStmt()
    const { WSWW, ACNBE, BRS } = MESSAGES.MESSAGES
    const { SRS, PDNF, CNASTUU, SNRF } = MESSAGES.STUDENTS
    const { MONGOOBJECT } = REGEX
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
            pool.query(GETUSERBYSLUG, [parent_id]).then(result => {
                if (result.rowCount !== 1) return res.status(404).json({ error: PDNF })
                if (result.rows[0].verified !== 2) return res.status(412).json({ error: CNASTUU })
                pool.query(REGISTERSTUDENT, [d_id, parent_id, firstname, lastname, othername, gender, dob, home_lang, telephone, address, commencement_date, last_sch_attended, current_class, timestamp, parent_type]).then(response => {
                    if (response.rowCount > 0) return res.status(200).json({ message: SRS })
                    return res.status(500).json({ message: ACNBE })
                }).catch(err => {
                    return res.status(500).json({ error: WSWW })
                })
            }).catch(err => {
                return res.status(500).json({ error: WSWW })
            })
        })
        if (validate !== undefined) return res.status(412).json({ error: validate.error })
        return validate
    }
    const fetchStudents = (req, res) => {
        const params = new URLSearchParams(url.parse(req.url, true).query)
        const limit = !params.get('limit') ? 50 : Number(params.get('limit'))
        pool.query(GETSTUDENTS).then(result => {
            if (result.rowCount === 0) return res.status(404).json({ error: SNRF })
            pool.query(SELECTUSERS).then(response => {
                if (response.rowCount === 0) return res.status(500).json({ error: WSWW })
                const students = result.rows.slice(0, limit), parents = response.rows, hasmore = result.rowCount > limit ? true : false
                let studentlist = []
                students.map(student => {
                    parents.map(parent => {
                        if (parent.slug === student.parent_id) {
                            studentlist = [...studentlist, { ...student, parent_information: { ...parent, verified: undefined, timestamp: undefined, usertype: undefined } }]
                        }
                    })
                })
                return res.status(200).json({ students: [...studentlist], hasmore })
            }).catch(err => {
                return res.status(500).json({ error: WSWW })
            })
        }).catch(err => {
            return res.status(500).json({ error: WSWW })
        })
    }
    const fetchStudent = (req, res) => {
        const params = new URLSearchParams(url.parse(req.url, true).query)
        if (!params.get('student')) return res.status(400).json({ error: BRS })
        if (!params.get('student').match(MONGOOBJECT)) return res.status(400).json({ error: BRS })
        pool.query(SELECTSTUDENTBYID, [params.get('student')]).then(result => {
            if (result.rowCount === 0) return res.status(404).json({ error: SNRF })
            const student = result.rows[0]
            pool.query(GETPARENTBYSTUDENTID, [student.parent_id]).then(response => {
                if (response.rowCount === 0) return res.status(404).json({ error: SNRF })
                return res.status(200).json({ ...student, parent_information: { ...response.rows[0] } })
            }).catch(err => {
                return res.status(500).json({ error: WSWW })
            })
        }).catch(err => {
            return res.status(500).json({ error: WSWW })
        })
    }
    return {
        createNewStudent, fetchStudents, fetchStudent
    }
}