import { Router } from "express";
import authRouter from '../routes/auth.js';
import { showDashboard, processCreateClass } from "./dashboard.js";
import { showClassDetailPage, processAddNewStudent } from "./class.js";
import { showStudentDetailPage, processAddNewPerformance, processGenerateReport, processSaveReport, processExportReport } from "./student.js";
import { requireLogin } from "../middlewares/auth.js";
import { addClassValidation } from "../middlewares/form.js";
const router = Router()


router.use('/', authRouter);
router.get('/dashboard', requireLogin, showDashboard);
router.post('/api/classes', requireLogin, addClassValidation, processCreateClass);
router.get('/classes/:classSlug', requireLogin, showClassDetailPage);
router.post('/api/classes/:classSlug/students', requireLogin, processAddNewStudent);

router.get('/classes/:classSlug/students/:studentSlug', requireLogin, showStudentDetailPage)

router.post('/api/students/:studentSlug/performance', requireLogin, processAddNewPerformance)
// router.post('/api/students/:studentSlug/performance/:performanceId/report', requireLogin)

router.post('/api/performance/:performanceId/report', requireLogin, processGenerateReport)
router.post('/api/performance/:performanceId/report/save', requireLogin, processSaveReport)
router.post('/api/performance/:performanceId/report/export', requireLogin, processExportReport)

export default router
