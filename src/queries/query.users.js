const UserQueryStmt = () => {
    const USERS = 'users', VERIFICATIONS = 'verifications', PASSWORDRESET = 'password_reset',
        DOUBLEFA = '2fa_dataset'

    // Queries on users table

    const INSERTAUSER = `INSERT INTO ${USERS} 
        (firstname, lastname, email, phone, timestamp, 
            slug, othername, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
    const CHECKEMAILEXISTENCE = `SELECT * FROM ${USERS} WHERE email = $1`
    const DELETEUSERBYSLUG = `DELETE FROM ${USERS} WHERE slug=$1`
    const GETUSERBYSLUG = `SELECT * FROM ${USERS} WHERE slug = $1`
    const VERIFYUSER = `UPDATE ${USERS} SET status = $1 WHERE slug = $2`
    const UPDATEUSERPASSWORD = `UPDATE ${USERS} SET password = $1 WHERE slug = $2`

    // Queries on verification table

    const INSERTVERIFICATIONDATA = `INSERT INTO ${VERIFICATIONS} (user_id, verification_code, timestamp) VALUES ($1, $2, $3)`
    const DELETEVERIFICATIONDATA = `DELETE FROM ${VERIFICATIONS} WHERE user_id=$1`
    const GETVERIFICATIONDATA = `SELECT * FROM ${VERIFICATIONS} WHERE user_id=$1`

    // Queries on password reset table

    const DELETEALLFORUSERBYSLUG = `DELETE FROM ${PASSWORDRESET} FROM WHERE user_id = $1`
    const CREATENEWPASSWORDRESETDATA = `INSERT INTO ${PASSWORDRESET} (user_id, code, timestamp) VALUES ($1, $2, $3)`
    const GETPASSWORDRESETDATA = `SELECT * FROM ${PASSWORDRESET} WHERE user_id = $1`

    // Queries on 2fa_dataset table

    const DELETEMANYCODESFORUSER = `DELETE FROM ${DOUBLEFA} WHERE user_id = $1`
    const GETOTPBYUSER = `SELECT * FROM ${DOUBLEFA} WHERE user_id = $1`
    const CREATENEWOTPDATA = `INSERT INTO ${DOUBLEFA} (user_id, code, timestamp) VALUES ($1, $2, $3)`

    return {
        INSERTAUSER, CHECKEMAILEXISTENCE, INSERTVERIFICATIONDATA, DELETEUSERBYSLUG, DELETEVERIFICATIONDATA, GETUSERBYSLUG,
        GETVERIFICATIONDATA, VERIFYUSER, DELETEALLFORUSERBYSLUG, CREATENEWPASSWORDRESETDATA, GETPASSWORDRESETDATA, UPDATEUSERPASSWORD,
        DELETEMANYCODESFORUSER, CREATENEWOTPDATA, GETOTPBYUSER
    }
}
export default UserQueryStmt