import { addClassFormHander, createClassHandler } from "./dashboard.js";
import { addStudentFormHandler, editClassFormHandler, addStudentsHandler, deleteStudentHandler } from "./class.js";
import { addPerformanceFormHandler, addExamHander, addNoteHandler, removeExamBtnHander, removeNoteBtnHandler, addPerformanceHandler, generateReportHandler, saveReportHander, regenerateReportHandler,
    exportReportHandler
 } from "./student.js";

 import { flashMessageHandler } from "./header.js";

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
    exportReportHandler();
    deleteStudentHandler();
    flashMessageHandler()
}

init();