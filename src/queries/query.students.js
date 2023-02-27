export default function StudentQueries() {
    const STUDENTS = 'students', PARENTINFO = 'parent_information', EMERGENCYCONTACT = 'emergency_contacts',
        DELEGATES = 'delegates'

    // Student's basic info queries

    const REGISTERSTUDENT = `INSERT INTO ${STUDENTS} (d_id, parent_id, firstname, lastname, othername, gender, dob, home_lang,
        telephone, address, commencement_date, last_sch_attended, current_class, created_at, updated_at, parent_type) VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $14, $15)`
    const GETSTUDENTS = `SELECT * FROM ${STUDENTS} ORDER BY lastname ASC`
    const SELECTSTUDENTBYID = `SELECT * FROM ${STUDENTS} WHERE d_id = $1`
    const SELECTSTUDENTSBYPARENT = `SELECT * FROM ${STUDENTS} WHERE parent_id = $1`
    const UPDATESTUDENTDATA = `UPDATE ${STUDENTS} SET parent_id = $1, firstname = $2, lastname = $3, othername = $4, 
    gender = $5, dob = $6, home_lang = $7, telephone = $8, address = $9, commencement_date = $10, last_sch_attended = $11, 
    current_class = $12, updated_at = $13, parent_type = $14, is_new = $15 WHERE d_id = $16`

    // Parent information queries

    const SAVEPARENTDATA = `INSERT INTO ${PARENTINFO} (student_id, father_info, mother_info, created_at, updated_at) 
    VALUES ($1, $2, $3, $4, $4)`
    const DELETEPARENTDATA = `DELETE FROM ${PARENTINFO} WHERE student_id = $1`
    const GETPARENTINFOBYSID = `SELECT * FROM ${PARENTINFO} WHERE student_id = $1`
    const SELECTALLINFO = `SELECT * FROM ${PARENTINFO} ORDER BY created_at ASC`

    // Emergency contacts queries

    const SAVECONTACT = `INSERT INTO ${EMERGENCYCONTACT} (student_id, parent_is_contact, created_at, updated_at, contacts) 
    VALUES ($1, $2, $3, $4, $5)`
    const RESAVECONTACT = `INSERT INTO ${EMERGENCYCONTACT} (student_id, parent_is_contact, created_at, updated_at, contacts) 
    VALUES ($1, $2, $3, $4, $5)`
    const GETCONTACTBYSID = `SELECT * FROM ${EMERGENCYCONTACT} WHERE student_id = $1`
    const DELETECONTACTBYSID = `DELETE FROM ${EMERGENCYCONTACT} WHERE student_id = $1`

    // Delegates queries

    const SAVEDELEGATES = `INSERT INTO ${DELEGATES} (student_id, parent_is_delegate, created_at, updated_at, delegates)
    VALUES ($1, $2, $3, $4, $5)`
    const GETDELEGATEBYSID = `SELECT * FROM ${DELEGATES} WHERE student_id = $1`
    const DELETEDELEGATEBYSID = `DELETE FROM ${DELEGATES} WHERE student_id = $1`
    const RESAVEDELEGATE = ``

    return {
        REGISTERSTUDENT, GETSTUDENTS, SELECTSTUDENTBYID, SELECTSTUDENTSBYPARENT, UPDATESTUDENTDATA,
        SAVEPARENTDATA, DELETEPARENTDATA, GETPARENTINFOBYSID, SELECTALLINFO, SAVECONTACT, GETCONTACTBYSID,
        DELETECONTACTBYSID, RESAVECONTACT, SAVEDELEGATES, GETDELEGATEBYSID, DELETEDELEGATEBYSID
    }
}