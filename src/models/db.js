import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }  // required for Supabase
})

let db = {
        query: pool.query.bind(pool),
        async close() { await pool.end() }  // ✅ add this
    }

export default db