import db from "./db.js";
import dotenv from 'dotenv'
dotenv.config()

const getPerformanceById = async (performanceId) => {
    const query = `SELECT 
            p.id as "performanceId",
            p.period_label as "periodLabel",
            s.name as "studentName",
            c.name as "className",
            u.name as "teacherName",
            e.subject, e.score, e.note as "examNote",
            b.attendance, b.total_days as "totalDays", b.rule_following as "ruleFollowing",
            n.id as "noteId", n.text as "noteText"
            FROM performance p 
                INNER JOIN students s ON s.id = p.student_id
                INNER JOIN classes c ON c.id = s.class_id
                INNER JOIN users u ON u.id = c.user_id
                LEFT JOIN exams e ON p.id = e.performance_id
                LEFT JOIN behavior b ON p.id = b.performance_id
                LEFT JOIN notes n ON p.id = n.performance_id
            WHERE p.id = $1
                `;
    const result = await db.query(query, [performanceId]);

    if (result.rows.length === 0) return {};

    const performance = {
        performanceId: result.rows[0].performanceId,
        periodLabel: result.rows[0].periodLabel,
        studentName: result.rows[0].studentName,
        className: result.rows[0].className,
        teacherName: result.rows[0].teacherName,
        behavior: {
            attendance: result.rows[0].attendance,
            totalDays: result.rows[0].totalDays,
            ruleFollowing: result.rows[0].ruleFollowing
        },
        exams: [],
        notes: []
    }

    result.rows.forEach(row => {
        // exam
        if (row.subject) {
            const exists = performance.exams.some(e => e.subject == row.subject)
            if(!exists) {
                performance.exams.push({
                    subject: row.subject,
                    score: row.score,
                    note: row.examNote
                })
            }
        }

        // notes
        if(row.noteText) {
            const exists = performance.notes.some(n => row.noteText == n.noteText)

            if(!exists) {
                performance.notes.push({
                    id: row.noteId, 
                    text: row.noteText
                })
            }
        }
    })
    return performance;
}   


const saveReport = async (performanceId, content) => {
    const existing = await db.query(`SELECT id FROM reports WHERE performance_id = $1`, [performanceId]);
    // in case teacher update report
    if (existing.rows.length > 0) {
        const result = await db.query(`UPDATE reports SET content = $1 
                        WHERE performance_id = $2 RETURNING *`, [content, performanceId])
        return result.rows[0];
}
    // insert new report
    const query = `INSERT INTO reports(performance_id, content) VALUES ($1, $2) RETURNING *`;
    const result = await db.query(query, [performanceId, content])
    return result.rows[0];
}

export {getPerformanceById, saveReport}

// try {
//     const result = await getPerformanceById(11)
//     console.log(JSON.stringify(result, null, 2))  // ← pretty print
//     await db.close()  // ← close connection so process exits cleanly
// } catch (error) {
//     console.error('Error:', error.message)
//     await db.close()
// }