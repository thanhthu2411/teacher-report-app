import { body } from "express-validator";


const registrationValidation = [
    body('name')
        .trim()
        .isLength({min:2, max:100})
        .withMessage('Name must be at least 2 characters')
        .matches(/^[a-zA-Z0-9\s'-]+$/)    
        .withMessage('Name can only contain numbers, letters, spaces, hyphens, and apostrophes'),
    
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("Must be a valid email address")
        .isLength({ max: 255 })
        .withMessage("Email address is too long"),
    
    body('emailConfirm')
        .trim()
        .custom((value, {req}) => value === req.body.email)
        .withMessage('Email addresses must match'),
    
    body("password")
        .isLength({ min: 8, max: 128 })
        .withMessage("Password must be between 8 and 128 characters")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least lowercase letter")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least uppercase letter")
        .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
        .withMessage("Password must contain at least one special character"),

    body("passwordConfirm")
        .custom((value, { req }) => value === req.body.password)
        .withMessage("Passwords must match"),
]


const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("Must be a valid email address")
        .isLength({ max: 255 })
        .withMessage("Email address is too long"),
    
    body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage("Password must be between 8 and 128 characters")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least lowercase letter")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least uppercase letter")
        .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
        .withMessage("Password must contain at least one special character"),

]

const addClassValidation = [
    body('name')
        .trim()
]

export {registrationValidation, loginValidation, addClassValidation}