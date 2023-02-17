import pg from 'pg'
import dotenv from 'dotenv'

export default function DatabaseConnection() {
    dotenv.config()
    const { Pool } = pg
    const pool = new Pool({
        user: process.env.SVCMSMS_DB_USER,
        host: process.env.SVCMSMS_DB_HOST,
        database: process.env.SVCMSMS_DB_NAME,
        password: process.env.SVCMSMS_DB_PASSWORD,
        port: Number(process.env.SVCMSMS_DB_PORT),
    })
    return { pool }
}