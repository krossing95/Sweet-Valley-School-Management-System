export default function StudentQueries() {
    const STUDENTS = 'students'

    // Student's basic info queries

    const REGISTERSTUDENT = `INSERT INTO ${STUDENTS} (d_id, parent_id, firstname, lastname, othername, gender, dob, home_lang,
        telephone, address, commencement_date, last_sch_attended, current_class, created_at, updated_at, parent_type) VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $14, $15)`
    const GETSTUDENTS = `SELECT * FROM ${STUDENTS} ORDER BY lastname ASC`
    const SELECTSTUDENTBYID = `SELECT * FROM ${STUDENTS} WHERE d_id = $1`
    return {
        REGISTERSTUDENT, GETSTUDENTS, SELECTSTUDENTBYID
    }
}