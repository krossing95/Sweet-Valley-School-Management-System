import { MESSAGES, NUMERICAL_ENTITY, REGEX } from "../static/index.js"
import moment from "moment"

export default function StudentDataValidator() {
    const { MONGOOBJECT, ALPHA, ALPHANUMERIC, NUMERICAL } = REGEX
    const { BRS } = MESSAGES.MESSAGES
    const { AFAR, DEFERR, HLFE, CCCGR, PTII, ONERR, CCDNDOB } = MESSAGES.STUDENTS
    const { NMBEA, CGGR, PNINS } = MESSAGES.VALIDATOR
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
        if (!THREEINARRAY.includes(Number(gender))) return { error: CGGR }
        if (!home_lang.match(ALPHA)) return { error: HLFE }
        if (!checkDateValidity(dob.toString() || !checkDateValidity(commencement_date.toString()))) return { error: DEFERR }
        if (!CLASSES.includes(Number(current_class))) return { error: CCCGR }
        if (!TWOINARRAY.includes(Number(parent_type))) return { error: PTII }
        if (diffTime < 3) return { error: CCDNDOB }
        if (telephone.trim().length > 0) {
            if (!telephone.match(NUMERICAL) || telephone.length !== 10) return { error: PNINS }
        } if (othername.trim().length > 0) {
            if (!othername.match(ALPHA) || othername.length > 30) return { error: ONERR }
        }
        return next()
    }
    return {
        registerValidator
    }
}