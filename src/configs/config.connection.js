import pg from 'pg'

export default function DatabaseConnection() {
    const { Pool } = pg
    const pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'school_management_system',
        password: 'Krossing@1995',
        port: 5432,
    })
    return { pool }
}