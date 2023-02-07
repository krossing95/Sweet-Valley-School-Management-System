const UserQueryStmt = () => {
    const USERS = 'users', VERIFICATIONS = 'verifications'

    // Queries on users table

    const INSERTAUSER = `INSERT INTO ${USERS} 
        (firstname, lastname, email, phone, timestamp, 
            slug, othername, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
    const CHECKEMAILEXISTENCE = `SELECT * FROM ${USERS} WHERE email = $1`
    const DELETEUSERBYSLUG = `DELETE FROM ${USERS} WHERE slug=$1`
    const GETUSERBYSLUG = `SELECT * FROM ${USERS} WHERE slug = $1`
    const VERIFYUSER = `UPDATE ${USERS} SET status = $1`

    // Queries on verification table

    const INSERTVERIFICATIONDATA = `INSERT INTO ${VERIFICATIONS} (user_id, verification_code, timestamp) VALUES ($1, $2, $3)`
    const DELETEVERIFICATIONDATA = `DELETE FROM ${VERIFICATIONS} WHERE user_id=$1`
    const GETVERIFICATIONDATA = `SELECT * FROM ${VERIFICATIONS} WHERE user_id=$1`

    return {
        INSERTAUSER, CHECKEMAILEXISTENCE, INSERTVERIFICATIONDATA, DELETEUSERBYSLUG, DELETEVERIFICATIONDATA, GETUSERBYSLUG,
        GETVERIFICATIONDATA, VERIFYUSER
    }
}
export default UserQueryStmt