import { getSpecificStudent, getStudentBySlug, getPerformanceByStudent, addNewBehavior, addNewExam, addNewNotes, addNewPerformance } from "../models/student.js";
import { getClassBySlug } from "../models/class.js";
import db from "../models/db.js";
import { getPerformanceById, saveReport } from "../models/performance.js";
import { generateReport, buildReportPrompt } from "../utils/ai.js";
import {buildPdfHtml} from "../utils/pdf.js"

// import puppeteer from "puppeteer";
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

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

const processExportReport = async (req, res) => {
    const { performanceId } = req.params

    try {
        const performance = await getPerformanceById(performanceId)
        if (!performance || performance.length == 0) {
            return res.status(404).json({
                success: false,
                message: 'Performance not found'
            })
        }

        const reportResult = await db.query(`SELECT content FROM reports WHERE performance_id = $1`, [performanceId])
        const reportContent = reportResult.rows[0]?.content || 'No report generated yet.'
        // 3. build HTML document
        const html = buildPdfHtml(performance, reportContent)
        
        // 4. launch puppeteer and generate PDF
        
        // const browser = await puppeteer.launch({
        //     args: ['--no-sandbox', '--disable-setuid-sandbox']  // required for Linux/Render
        // })
        // const browser = await puppeteer.launch({
        //     args: chromium.args,
        //     executablePath: await chromium.executablePath(),
        //     headless: chromium.headless,
        // })

        // Check if you are running locally on Windows
        const isLocal = process.platform === 'win32' || process.env.NODE_ENV === 'development';

        const browser = await puppeteer.launch({
            // In production, use sparticuz args. Locally, standard sandboxing is fine.
            args: isLocal ? ['--no-sandbox', '--disable-setuid-sandbox'] : chromium.args,
            
            // Point to your local Chrome installation on Windows, or use sparticuz in production
            executablePath: isLocal 
                ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' // Default Windows Chrome path
                : await chromium.executablePath(),
                
            headless: isLocal ? true : chromium.headless,
        })
        const page = await browser.newPage()
        await page.setContent(html, {waitUntil: 'networkidle0' })
        // like ctr + P, return pdf as raw bytes
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' }
        })
        await browser.close()

        // 5. send PDF as download
        res.setHeader('Content-Type', 'application/pdf')
        // tells the browser "download this, don't display it"
        res.setHeader('Content-Disposition', `attachment; filename="report-${performance.studentName}-${performance.periodLabel}.pdf"`)
        res.send(pdf)
        
    } catch(error) {
        // console.error('Error exporting report:', error)
        // res.status(500).json({ success: false, message: 'Failed to export report' })
        console.error('Error exporting report:', error.message)  // ← already have this
        console.error('Full error:', error)  // ← add this to see full stack trace
        res.status(500).json({ success: false, message: 'Failed to export report' })
   
    }

}


export {showStudentDetailPage, processAddNewPerformance, processGenerateReport, processSaveReport, processExportReport}