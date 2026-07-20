import { addClassFormHander, createClassHandler } from "./dashboard.js";
import { addStudentFormHandler, editClassFormHandler, addStudentsHandler } from "./class.js";
import { addPerformanceFormHandler, addExamHander, addNoteHandler, removeExamBtnHander, removeNoteBtnHandler, addPerformanceHandler, generateReportHandler, saveReportHander, regenerateReportHandler,
    exportReportHandler
 } from "./student.js";

const init = async () => {
    addClassFormHander();
    addStudentFormHandler();
    editClassFormHandler();    
    createClassHandler();
    addStudentsHandler();
    addPerformanceFormHandler();
    addExamHander();
    addNoteHandler();
    removeExamBtnHander();
    removeNoteBtnHandler();
    addPerformanceHandler();
    generateReportHandler();
    saveReportHander();
    regenerateReportHandler();
    exportReportHandler()
}

init();