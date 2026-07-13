import { Router } from "express";

import { showRegistrationForm, processRegistrationForm, showLoginForm, processLoginForm, processLogout } from "../controllers/auth.js";
import { registrationValidation, loginValidation } from "../middlewares/form.js";

const router = Router();

router.get("/register", showRegistrationForm);
router.post("/register", registrationValidation, processRegistrationForm);
router.get("/login", showLoginForm);
router.post("/login", loginValidation, processLoginForm);
router.use("/logout", processLogout);



export default router;