const UserQueryStmt = () => {
    const USERS = 'users', VERIFICATIONS = 'verifications', PASSWORDRESET = 'password_reset',
        DOUBLEFA = 'doublefa_dataset', ACCESSORS = 'accessors'

    // Queries on users table

    const INSERTAUSER = `INSERT INTO ${USERS} 
        (firstname, lastname, email, phone, timestamp, 
            slug, othername, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
    const CHECKEMAILEXISTENCE = `SELECT * FROM ${USERS} WHERE email = $1`
    const DELETEUSERBYSLUG = `DELETE FROM ${USERS} WHERE slug=$1`
    const GETUSERBYSLUG = `SELECT * FROM ${USERS} WHERE slug = $1`
    const VERIFYUSER = `UPDATE ${USERS} SET verified = $1 WHERE slug = $2`
    const UPDATEUSERPASSWORD = `UPDATE ${USERS} SET password = $1 WHERE slug = $2`
    const SELECTUSERS = `SELECT slug, firstname, lastname, othername, email, phone, verified, timestamp, usertype FROM ${USERS} ORDER BY lastname ASC`
    const UPDATEUSERINFO = `UPDATE ${USERS} SET firstname = $1, lastname = $2, email = $3, phone = $4, othername = $5, usertype = $6 WHERE slug = $7`

    // Queries on verification table

    const INSERTVERIFICATIONDATA = `INSERT INTO ${VERIFICATIONS} (user_id, verification_code, timestamp) VALUES ($1, $2, $3)`
    const DELETEVERIFICATIONDATA = `DELETE FROM ${VERIFICATIONS} WHERE user_id=$1`
    const GETVERIFICATIONDATA = `SELECT * FROM ${VERIFICATIONS} WHERE user_id=$1`

    // Queries on password reset table

    const DELETEALLFORUSERBYSLUG = `DELETE FROM ${PASSWORDRESET} WHERE user_id = $1`
    const CREATENEWPASSWORDRESETDATA = `INSERT INTO ${PASSWORDRESET} (user_id, code, timestamp) VALUES ($1, $2, $3)`
    const GETPASSWORDRESETDATA = `SELECT * FROM ${PASSWORDRESET} WHERE user_id = $1`

    // Queries on 2fa_dataset table

    const DELETEMANYCODESFORUSER = `DELETE FROM ${DOUBLEFA} WHERE user_id = $1`
    const GETOTPBYUSER = `SELECT * FROM ${DOUBLEFA} WHERE user_id = $1`
    const CREATENEWOTPDATA = `INSERT INTO ${DOUBLEFA} (user_id, code, timestamp) VALUES ($1, $2, $3)`

    // Queries on accessors table

    const SAVETOKEN = `INSERT INTO ${ACCESSORS} (user_id, token, alive, timestamp) VALUES ($1, $2, $3, $4)`
    const CLEARALLSAVEDTOKENS = `DELETE FROM ${ACCESSORS} WHERE user_id = $1`

    return {
        INSERTAUSER, CHECKEMAILEXISTENCE, INSERTVERIFICATIONDATA, DELETEUSERBYSLUG, DELETEVERIFICATIONDATA, GETUSERBYSLUG,
        GETVERIFICATIONDATA, VERIFYUSER, DELETEALLFORUSERBYSLUG, CREATENEWPASSWORDRESETDATA, GETPASSWORDRESETDATA, UPDATEUSERPASSWORD,
        DELETEMANYCODESFORUSER, CREATENEWOTPDATA, GETOTPBYUSER, SAVETOKEN, CLEARALLSAVEDTOKENS, SELECTUSERS, UPDATEUSERINFO
    }
}
export default UserQueryStmt