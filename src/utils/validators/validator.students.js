import { MESSAGES, NUMERICAL_ENTITY, REGEX } from "../static/index.js"
import moment from "moment"

export default function StudentDataValidator() {
    const { MONGOOBJECT, ALPHA, ALPHANUMERIC, NUMERICAL, CSVDOT_HYPHEN } = REGEX
    const { BRS } = MESSAGES.MESSAGES
    const { AFAR, DEFERR, HLFE, CCCGR, PTII, ONERR, CCDNDOB } = MESSAGES.STUDENTS
    const { NMBEA, CGGR, PNINS, NATL, UECFIA, UECFIOE } = MESSAGES.VALIDATOR
    const { THREEINARRAY, CLASSES, TWOINARRAY } = NUMERICAL_ENTITY
    const checkDateValidity = (date) => moment(date, "MM/DD/YYYY", true).isValid()
    const registerValidator = (data, next) => {
        const {
            parent_id, firstname, lastname, othername, gender, dob, home_lang, telephone, commencement_date, current_class, parent_type
        } = data
        const isoDob = moment((new Date(dob)).toISOString()), isoCommence = moment((new Date(commencement_date)).toISOString()), diffTime = isoCommence.diff(isoDob, 'months')
        if (!parent_id.length || !parent_type.length || !firstname.length || !lastname.length || !dob.length || !home_lang.length || !commencement_date.length || !current_class.length) return { error: AFAR }
        if (!parent_id.match(MONGOOBJECT)) return { error: BRS }
        if (!firstname.match(ALPHA) || !lastname.match(ALPHA)) return { error: NMBEA }
        if (firstname.length < 3 || firstname.length > 30 || lastname.length < 3 || lastname.length > 30) return { error: NATL }
        if (!THREEINARRAY.includes(Number(gender))) return { error: CGGR }
        if (!home_lang.match(ALPHA)) return { error: HLFE }
        if (!checkDateValidity(dob.toString() || !checkDateValidity(commencement_date.toString()))) return { error: DEFERR }
        if (!CLASSES.includes(Number(current_class))) return { error: CCCGR }
        if (!THREEINARRAY.includes(Number(parent_type))) return { error: PTII }
        if (diffTime < 3) return { error: CCDNDOB }
        if (telephone.trim().length > 0) {
            if (!telephone.match(NUMERICAL) || telephone.length !== 10) return { error: PNINS }
        } if (othername.trim().length > 0) {
            if (!othername.match(ALPHA) || othername.length > 30) return { error: ONERR }
        }
        return next()
    }
    const validateParentData = (data, next) => {
        const { f_home_address, f_postal_address, f_occupation, f_employer, f_work_address, m_home_address, m_postal_address, m_occupation, m_employer, m_work_address } = data
        if (!f_home_address.match(CSVDOT_HYPHEN) || !f_postal_address.match(CSVDOT_HYPHEN) || !f_work_address.match(CSVDOT_HYPHEN) || !m_home_address.match(CSVDOT_HYPHEN) || !m_postal_address.match(CSVDOT_HYPHEN) || !m_work_address.match(CSVDOT_HYPHEN)) return { error: UECFIA }
        if (!f_occupation.match(ALPHA) || !m_occupation.match(ALPHA) || !f_employer.match(ALPHA) || !m_employer.match(ALPHA)) return { error: UECFIOE }
        const hasValue = true
        Object.values({ f_home_address, f_postal_address, f_occupation, f_employer, f_work_address, m_home_address, m_postal_address, m_occupation, m_employer, m_work_address }).map(value => {
            if (value.trim().length < 3) hasValue = false
        })
        if (hasValue === false) return res.status(412).json({ error: AFAR })
        return next()
    }
    return {
        registerValidator, validateParentData
    }
}