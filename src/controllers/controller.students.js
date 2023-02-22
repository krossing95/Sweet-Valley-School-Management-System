import TextFormatters from "../utils/algos/text.formatters.js"
import StudentDataValidator from "../utils/validators/validator.students.js"
import { ObjectId } from "bson"
import { MESSAGES, NUMERICAL_ENTITY, PARENT_INFO_DATAKEYS, REGEX } from "../utils/static/index.js"
import DatabaseConnection from '../configs/config.connection.js'
import StudentQueries from "../queries/query.students.js"
import UserQueryStmt from "../queries/query.users.js"
import url from 'url'
import moment from "moment"

export default function StudentController() {
    const { registerValidator, validateParentData } = StudentDataValidator()
    const { cleanText, capitalize } = TextFormatters()
    const { pool } = DatabaseConnection()
    const {
        REGISTERSTUDENT, GETSTUDENTS, SELECTSTUDENTBYID, SELECTSTUDENTSBYPARENT, UPDATESTUDENTDATA,
        SAVEPARENTDATA, DELETEPARENTDATA, GETPARENTINFOBYSID
    } = StudentQueries()
    const { GETUSERBYSLUG, SELECTUSERS, GETPARENTBYSTUDENTID } = UserQueryStmt()
    const { WSWW, ACNBE, BRS, NCFY } = MESSAGES.MESSAGES
    const { SRS, PDNF, CNASTUU, SNRF, NSRFFP, SUS, PISS, ONERR } = MESSAGES.STUDENTS
    const { AFAR, UECFIAL, NMBEA, NATL, PNINS, IDR } = MESSAGES.VALIDATOR
    const { MONGOOBJECT, CSVDOT_HYPHEN, ALPHA, NUMERICAL } = REGEX
    const { TWOINARRAY } = NUMERICAL_ENTITY
    const createNewStudent = (req, res) => {
        let {
            parent_id, firstname, lastname, othername, gender, dob, home_lang, telephone,
            address, commencement_date, last_sch_attended, current_class, parent_type
        } = req.body
        if (!address.match(CSVDOT_HYPHEN) || !last_sch_attended.match(CSVDOT_HYPHEN)) return res.status(412).json({ error: UECFIAL })
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
    const fetchStudentsByParent = (req, res) => {
        const params = new URLSearchParams(url.parse(req.url, true).query)
        if (!params.get('parent_id')) return res.status(400).json({ error: BRS })
        if (!params.get('parent_id').match(MONGOOBJECT)) return res.status(400).json({ error: BRS })
        const parent_id = params.get('parent_id')
        pool.query(SELECTSTUDENTSBYPARENT, [parent_id]).then(result => {
            if (result.rowCount === 0) return res.status(404).json({ error: NSRFFP })
            return res.status(200).json([...result.rows])
        }).catch(err => {
            return res.status(500).json({ error: WSWW })
        })
    }
    const updateStudentData = (req, res) => {
        let {
            student_id, parent_id, firstname, lastname, othername, gender, dob, home_lang, telephone,
            address, commencement_date, last_sch_attended, current_class, parent_type, is_new
        } = req.body
        if (!student_id || !is_new) return res.status(400).json({ error: BRS })
        if (!student_id.match(MONGOOBJECT)) return res.status(400).json({ error: BRS })
        if (!TWOINARRAY.includes(Number(is_new))) return res.status(400).json({ error: BRS })
        if (!address.match(CSVDOT_HYPHEN) || !last_sch_attended.match(CSVDOT_HYPHEN)) return res.status(412).json({ error: UECFIAL })
        const validate = registerValidator(req.body, () => {
            firstname = capitalize(firstname), lastname = capitalize(lastname), telephone = Number(telephone),
                home_lang = capitalize(home_lang), address = capitalize(cleanText(address)).length <= 3 ? '' : capitalize(cleanText(address)),
                last_sch_attended = capitalize(cleanText(last_sch_attended)).length <= 3 ? '' : capitalize(cleanText(last_sch_attended)),
                othername = othername.length >= 3 ? capitalize(othername) : '', is_new = is_new === 2 ? true : false
            const timestamp = (new Date()).toISOString()
            pool.query(SELECTSTUDENTBYID, [student_id]).then(studentData => {
                if (studentData.rowCount !== 1) return res.status(404).json({ error: SNRF })
                const studentInfo = studentData.rows[0]
                if (studentInfo.parent_id === parent_id && studentInfo.firstname === firstname && studentInfo.lastname === lastname && studentInfo.othername === othername && studentInfo.gender === Number(gender) &&
                    moment(studentInfo.dob).diff(moment((new Date(dob)).toISOString())) === 0 && studentInfo.home_lang === home_lang && studentInfo.telephone === Number(telephone.toString().slice(0)) && studentInfo.address === address &&
                    studentInfo.last_sch_attended === last_sch_attended && moment(studentInfo.commencement_date).diff(moment((new Date(commencement_date)).toISOString())) === 0 && studentInfo.current_class === Number(current_class) && studentInfo.parent_type === Number(parent_type) && studentInfo.is_new === is_new) return res.status(412).json({ error: NCFY })
                pool.query(GETUSERBYSLUG, [parent_id]).then(result => {
                    if (result.rowCount !== 1) return res.status(404).json({ error: PDNF })
                    if (result.rows[0].verified !== 2) return res.status(412).json({ error: CNASTUU })
                    pool.query(UPDATESTUDENTDATA, [parent_id, firstname, lastname, othername, gender, dob, home_lang, telephone, address, commencement_date, last_sch_attended, current_class, timestamp, parent_type, is_new, student_id]).then(response => {
                        if (response.rowCount > 0) return res.status(200).json({ message: SUS })
                        return res.status(500).json({ message: ACNBE })
                    }).catch(err => {
                        return res.status(500).json({ error: WSWW })
                    })
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
    const changeFreshStudentToContinuing = (req, res) => {
        // update all students's is_new prop to false if the diff btwn current date and the enrolment date is >= 8 months
    }
    const validateParentFields = (data, res, parent_type) => {
        const { f_firstname, f_lastname, f_othername, m_firstname, m_lastname, m_othername, f_telephone, m_telephone } = data
        if (parent_type === 3) { //guardian
            if (!f_firstname.match(ALPHA) || !f_lastname.match(ALPHA) || !m_firstname.match(ALPHA) || !m_lastname.match(ALPHA)) return res.status(412).json({ error: NMBEA })
            if (f_firstname.length < 3 || f_firstname.length > 30 || f_lastname.length < 3 || f_lastname.length > 30 || m_firstname.length < 3 || m_firstname.length > 30 || m_lastname.length < 3 || m_lastname.length > 30) return res.status(412).json({ error: NATL })
            if (!f_telephone.match(NUMERICAL) || !m_telephone.match(NUMERICAL) || f_telephone.length !== 10 || m_telephone.length !== 10) return res.status(412).json({ error: PNINS })
            const fOthername = f_othername.trim().length > 0, mOthername = m_othername.trim().length > 0
            if (!fOthername && !mOthername) return true
            if (fOthername && (!f_othername.match(ALPHA) || f_othername.length > 30)) return res.status(412).json({ error: ONERR })
            if (mOthername && (!m_othername.match(ALPHA) || m_othername.length > 30)) return res.status(412).json({ error: ONERR })
        } else if (parent_type === 2) { // father
            if (!m_firstname.match(ALPHA) || !m_lastname.match(ALPHA)) return res.status(412).json({ error: NMBEA })
            if (m_firstname.length < 3 || m_firstname.length > 30 || m_lastname.length < 3 || m_lastname.length > 30) return res.status(412).json({ error: NATL })
            if (!m_telephone.match(NUMERICAL) || m_telephone.length !== 10) return res.status(412).json({ error: PNINS })
            const mOthername = m_othername.trim().length > 3
            if (!mOthername) return true
            if (mOthername && (!m_othername.match(ALPHA) || m_othername.length > 30)) return res.status(412).json({ error: ONERR })
        } else if (parent_type === 1) { // mother
            if (!f_firstname.match(ALPHA) || !f_lastname.match(ALPHA)) return res.status(412).json({ error: NMBEA })
            if (f_firstname.length < 3 || f_firstname.length > 30 || f_lastname.length < 3 || f_lastname.length > 30) return res.status(412).json({ error: NATL })
            if (!f_telephone.match(NUMERICAL) || f_telephone.length !== 10) return res.status(412).json({ error: PNINS })
            const fOthername = f_othername.trim().length > 3
            if (!fOthername) return true
            if (fOthername && (!f_othername.match(ALPHA) || f_othername.length > 30)) return res.status(412).json({ error: ONERR })
        }
    }
    const createParentData = (req, res) => {
        let { father_info, mother_info, student_id } = req.body // mother => 1, father => 2, guardian => 3
        let data = { ...father_info, ...mother_info }, isIncluded = true
        PARENT_INFO_DATAKEYS.map(key => {
            if (!Object.keys(data).includes(key)) isIncluded = false
        })
        if (!isIncluded) return res.status(412).json({ error: AFAR })
        if (!student_id.match(MONGOOBJECT)) return res.status(400).json({ error: BRS })
        const validate = validateParentData(data, () => {
            pool.query(SELECTSTUDENTBYID, [student_id]).then(result => {
                if (result.rowCount !== 1) return res.status(404).json({ error: SNRF })
                const parent_type = result.rows[0].parent_type, parent_id = result.rows[0].parent_id, timestamp = (new Date()).toISOString()
                data = {
                    ...data, f_firstname: parent_type === 2 ? '' : data.f_firstname,
                    f_lastname: parent_type === 2 ? '' : data.f_lastname,
                    f_othername: parent_type === 2 ? '' : data.f_othername,
                    f_telephone: parent_type === 2 ? '' : data.f_telephone,
                    m_firstname: parent_type === 1 ? '' : data.m_firstname,
                    m_lastname: parent_type === 1 ? '' : data.m_lastname,
                    m_othername: parent_type === 1 ? '' : data.m_othername,
                    m_telephone: parent_type === 1 ? '' : data.m_telephone
                }
                const validity = validateParentFields(data, res, parent_type)
                if (validity !== true) return res.status(412).json({ error: IDR })
                father_info = { home_address: capitalize(data.f_home_address), postal_address: capitalize(data.f_postal_address), occupation: capitalize(data.f_occupation), employer: capitalize(data.f_employer), work_address: capitalize(data.f_work_address), firstname: capitalize(data.f_firstname), lastname: capitalize(data.f_lastname), othername: capitalize(data.f_othername), telephone: data.f_telephone, parent_id: parent_type === 2 ? parent_id : undefined }
                mother_info = { home_address: capitalize(data.m_home_address), postal_address: capitalize(data.m_postal_address), occupation: capitalize(data.m_occupation), employer: capitalize(data.m_employer), work_address: capitalize(data.m_work_address), firstname: capitalize(data.m_firstname), lastname: capitalize(data.m_lastname), othername: capitalize(data.m_othername), telephone: data.m_telephone, parent_id: parent_type === 1 ? parent_id : undefined }
                const createNewParentData = () => {
                    pool.query(DELETEPARENTDATA, [student_id]).catch(err => {
                        return res.status(500).json(WSWW)
                    })
                    const create = pool.query(SAVEPARENTDATA, [student_id, father_info, mother_info, timestamp]).then(saved => {
                        if (saved.rowCount > 0) return res.status(201).json({ message: PISS })
                        return res.status(500).json({ message: ACNBE })
                    }).catch(err => {
                        return res.status(500).json({ error: WSWW })
                    })
                    return create
                }
                return createNewParentData()
            }).catch(err => {
                return res.status(500).json({ error: WSWW })
            })
        })
        if (validate !== undefined) return res.status(412).json({ error: validate.error })
        return validate
    }
    const fetchParentInformation = (req, res) => {
        const params = new URLSearchParams(url.parse(req.url, true).query)
        if (!params.get('student_id')) return res.status(400).json({ error: BRS })
        if (!params.get('student_id').match(MONGOOBJECT)) return res.status(400).json({ error: BRS })
        const student_id = params.get('student_id')
        const retrieve = pool.query(GETPARENTINFOBYSID, [student_id]).then(result => {
            if (result.rowCount === 0) return res.status(404).json({ error: SNRF })
            return res.status(200).json(result.rows[0])
        }).catch(err => {
            return res.status(500).json({ error: WSWW })
        })
        return retrieve
    }
    return {
        createNewStudent, fetchStudents, fetchStudent, fetchStudentsByParent, updateStudentData,
        createParentData, changeFreshStudentToContinuing, fetchParentInformation
    }
}