import db from "./db.js";

const getStudentByClass = async (classId) => {
    const query = `SELECT s.id as "studentId", s.name as "studentName", s.slug as "studentSlug",
                        s.dob as "birthday", s.gender
                    FROM students s 
                    WHERE s.class_id = $1
                    ORDER BY s.name, s.created_at`;
    
    const result = await db.query(query, [classId]);
    return result.rows;
}

const addNewStudent = async (name, dob, gender, classId) => {
    const baseSlug = name.trim().toLowerCase().replace(/\s+/g, '-')
    const dobStr = dob ? `-${dob.replace(/-/g, '')}` : ''  // e.g. -20100515
    const slug = `${baseSlug}${dobStr}`;
        
    const query = `INSERT INTO students(name, slug, dob, gender, class_id)
                        VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const result = await db.query(query, [name, slug, dob, gender, classId ]);
    return result.rows[0];
}

const getSpecificStudent = async (classId, studentSlug) => {
    const query = `SELECT s.id as "studentId", s.name as "studentName", s.slug as "studentSlug",
                        TO_CHAR(s.dob, 'DD/MM/YYYY') as "birthday", s.gender
                    FROM students s
                    WHERE s.class_id = $1 AND s.slug = $2`;
    
    const result = await db.query(query, [classId, studentSlug]);
    return result.rows[0];
}

const getPerformanceByStudent = async (studentSlug) => {
    const query = `SELECT p.id as "performanceId", period_label as "periodLabel", p.created_at as "createdAt",
            e.subject, e.score, e.note as "examNote",
            b.attendance, b.total_days as "totalDays", b.rule_following as "ruleFollowing",
            n.text as "noteText", n.id as "noteId",
            r.content as "report"
            FROM performance p LEFT JOIN exams e
                ON p.id = e.performance_id
                LEFT JOIN behavior b
                ON p.id = b.performance_id
                LEFT JOIN notes n
                ON p.id = n.performance_id
                LEFT JOIN reports r ON r.performance_id = p.id
                INNER JOIN students s
                ON s.id = p.student_id
            WHERE s.slug = $1
            `
    const result = await db.query(query, [studentSlug])
    if (result.rows.length === 0) return [];

    const performances = {};

    result.rows.forEach(row => {
        if(!performances[row.performanceId]) {
            performances[row.performanceId] = {
                performanceId: row.performanceId,
                periodLabel: row.periodLabel,
                createdAt: row.createdAt,
                behavior: {
                    attendance: row.attendance,
                    totalDays: row.totalDays,
                    ruleFollowing: row.ruleFollowing
                },
                exams: [],
                notes: [],
                report: row.report || null
            }
        }

        if(row.subject) {
            const examExists = performances[row.performanceId].exams
                .some(e => e.subject === row.subject)
            if (!examExists) {
                performances[row.performanceId].exams.push({
                    subject: row.subject,
                    score: row.score,
                    note: row.examNote
                })
            }
        }

        if (row.noteText) {
            const noteExists = performances[row.performanceId].notes
                .some(n => n.id === row.noteId)
            if (!noteExists) {
                performances[row.performanceId].notes.push({
                    id: row.noteId,
                    text: row.noteText
                })
            }
        }
    })

    return Object.values(performances)
}

const getStudentBySlug = async (studentSlug) => {
    const query = `SELECT * FROM students 
                    WHERE slug = $1`;
    const result = await db.query(query, [studentSlug]);
    return result.rows[0];
}

const addNewPerformance = async (studentId, period) => {
    const query = `INSERT INTO performance(student_id, period_label) 
                    VALUES ($1, $2) RETURNING *`
    const result = await db.query(query, [studentId, period])
    return result.rows[0];
}

const addNewExam = async (performanceId, subject, score, note) => {
    const cleanNote = note ? note.trim() : null
    const query = `INSERT INTO exams(performance_id, subject, score, note) 
                    VALUES ($1, $2, $3, $4) RETURNING *`
    const result = await db.query(query, [performanceId, subject, score, cleanNote])
    return result.rows[0];
}

const addNewBehavior = async (performanceId, attendance, totalDays, ruleFollowing) => {
    const query = `INSERT INTO behavior(performance_id, attendance, total_days, rule_following) 
                    VALUES ($1, $2, $3, $4) RETURNING *`
    const result = await db.query(query, [performanceId, attendance, totalDays, ruleFollowing])
    return result.rows[0];
}

const addNewNotes = async (performanceId, text) => {
    const query = `INSERT INTO notes(performance_id, text) 
                    VALUES ($1, $2) RETURNING *`
    const result = await db.query(query, [performanceId, text])
    return result.rows[0];

}

export {getStudentByClass, addNewStudent, getSpecificStudent, getPerformanceByStudent, addNewBehavior, addNewExam, addNewNotes, addNewPerformance, getStudentBySlug}