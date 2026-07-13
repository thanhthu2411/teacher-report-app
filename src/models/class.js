import db from "./db.js"

const getClassesByTeacher = async (userId) => {
    const query = `
        SELECT c.id as "classId", c.name as "className", c.slug as "classSlug", c.academic_year as "classYear",
                COUNT(s.id) as "studentCount"
        FROM classes c LEFT JOIN students s
            ON s.class_id = c.id
        WHERE c.user_id = $1
        GROUP BY c.id, c.name, c.slug, c.academic_year
        ORDER BY c.academic_year DESC, c.name ASC
    `
    const result = await db.query(query, [userId]);

    return result.rows;
};


const createClass = async (name, year, user_id) => {
    const slug = `${name.trim()}-${year.trim()}`.toLowerCase().replace(/\s+/g, '-');

    const query = `INSERT INTO classes (name, slug, academic_year, user_id)
                    VALUES($1, $2, $3, $4) RETURNING name as "className", slug as "classSlug", 
                            academic_year as "classYear", user_id as "userId"`;
    const result = await db.query(query, [name, slug, year, user_id]);
    return result.rows[0];
};

const getClassBySlug = async (slug) => {
    const result = await db.query(
        `SELECT * FROM classes WHERE slug = $1`,
        [slug]
    )
    return result.rows[0]  // returns full class object including id
}


export {getClassesByTeacher, createClass, getClassBySlug};
// if query returns multiple rows:
// result.rows
// [
//   { id: 1, name: '4A', academic_year: '2024-2025', user_id: 1 },
//   { id: 2, name: '4B', academic_year: '2024-2025', user_id: 1 },
//   { id: 3, name: '5A', academic_year: '2023-2024', user_id: 1 }
// ]