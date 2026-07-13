import db from './db.js';
import bcrypt from 'bcrypt';

const emailExist = async (email) => {
    const query = `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) as exists`;
    const result = await db.query(query, [email]);
    return result.rows[0]?.exists;
}

const saveUser = async (name, email, password) => {
    const query = `INSERT INTO users (name, email, password, role_id)
                    VALUES ($1, $2, $3, 2) RETURNING id, name, email, role_id, created_at`;
    const result = await db.query(query, [name, email, password]);
}

// login features
const verifyPassword = async (plainPassword, hashedPassword) => {
    const isMatched = bcrypt.compare(plainPassword, hashedPassword);
    return isMatched;
}

const findUserbyEmail =  async (email) => {
    const query = `SELECT u.id, u.name, u.email, u.password, u.created_at AS "createdAt",
                        roles.role_name AS "roleName"
                    FROM users u
                    INNER JOIN roles ON u.role_id = roles.id
                    WHERE LOWER(u.email) = LOWER($1)
                    LIMIT 1`;
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
}

export {findUserbyEmail, verifyPassword, emailExist, saveUser};