import { getSpecificStudent, getStudentBySlug, getPerformanceByStudent, addNewBehavior, addNewExam, addNewNotes, addNewPerformance } from "../models/student.js";
import { getClassBySlug } from "../models/class.js";
import db from "../models/db.js";
import { getPerformanceById, saveReport } from "../models/performance.js";
import { generateReport, buildReportPrompt } from "../utils/ai.js";

const showStudentDetailPage = async (req, res, next) => {
    const classSlug = req.params.classSlug;
    const studentSlug = req.params.studentSlug;

    if (!classSlug || !studentSlug) {
        const err = new Error("Missing route parameter");
        err.status = 400;
        return next(err);
    }

    try {
        const cls = await getClassBySlug(classSlug);
        const student = await getSpecificStudent(cls.id, studentSlug);
        const performances = await getPerformanceByStudent(studentSlug);

        res.render("student", {
            title: `${student.studentName}`,
            student,
            performances,
            cls
        })

    } catch(error) {
        console.error("Error loading student:", error);
        return res.redirect(`/classes/${classSlug}`);
    }
}

const processAddNewPerformance = async (req, res, next) => {
    const studentSlug = req.params.studentSlug;
    if (!studentSlug) {
        const err = new Error("Missing route params")
        err.status = 400;
        return next(err);
    }


    const { periodLabel, exams, behavior, notes } = req.body;

    await db.query("BEGIN")
    try {
        const student = await getStudentBySlug(studentSlug);
        const performance = await addNewPerformance(student.id, periodLabel);

        for (const exam of exams) {
            await addNewExam(performance.id, exam.subject, exam.score, exam.note);
        }

        await addNewBehavior(performance.id, behavior.attendance, behavior.totalDays, behavior.ruleFollowing);

        for (const note of notes) {
            await addNewNotes(performance.id, note.text);
        }

        await db.query("COMMIT")

        const performances = await getPerformanceByStudent(studentSlug);
        res.status(200).json({
            success: true,
            performances,
            student
        })

    } catch(error) {
        await db.query('ROLLBACK')
        console.error("Error adding performance:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add new performance."
        })
    }
}


const processGenerateReport = async (req, res) => {
    const {performanceId} = req.params

    try {
        const performance = await getPerformanceById(performanceId)
        const reportPrompt = buildReportPrompt(performance)

        const reportContent = await generateReport(reportPrompt)
        // const savedReport = await saveReport(performanceId, reportContent)

        res.status(200).json({
            success: true,
            performance,
            report: reportContent,
            message: "Report generated successfully"
        })

    } catch(error) {
        console.error('Error generating report:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to generate report'
        })
    }
}

const processSaveReport = async (req, res) => {
    const performanceId = req.params.performanceId
    const content = req.body.content
    try {
        const savedReport = await saveReport(performanceId, content)
        res.status(200).json({
            success: true,
            savedReport,
            message: "Report saved successfully"
        })
    } catch(error) {
        res.status(500).json({
            success: false,
            message: "Failed to save report"
        })
    }
}


export {showStudentDetailPage, processAddNewPerformance, processGenerateReport, processSaveReport}