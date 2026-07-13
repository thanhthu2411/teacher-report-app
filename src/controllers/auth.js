import {findUserbyEmail, verifyPassword, emailExist, saveUser} from '../models/user.js';
import bcrypt from 'bcrypt';
import {validationResult} from 'express-validator';

// registration

const showRegistrationForm = (req, res) => {
  res.render("forms/registration", {
    title: "Register",
  });
};

const processRegistrationForm = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
            return res.status(422).json({
                success: false,
                message: errors.array()[0].msg
            })
        });
    }

    const {name, email, password} = req.body;

    try {
        const emailExists = await emailExist(email);
        if (emailExists) {
            // req.flash('warning', 'Email already registered!');
            return res.redirect("/register");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await saveUser(name, email, hashedPassword);
        res.redirect("/login");
    } catch(error) {
        console.error("Error saving user:", error);
        res.redirect("/register");
    }


}

// login
const showLoginForm = (req, res) => {
    res.render('forms/login', {
        title: "Login",
    })
}

const processLoginForm = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
            return res.status(422).json({
                success: false,
                message: errors.array()[0].msg
            })
        });
    }

    const {email, password} = req.body;

    try {
        const user = await findUserbyEmail(email);
        if(!user) {
            // req.flash('error', 'Invalid email or password')            
            return res.redirect('/login');
        }

        const isMatched =  await verifyPassword(password, user.password);

        if (!isMatched) {
            // res.flash 
            return res.redirect("/login");
        }

        delete user.password;
        req.session.user = user;
        // req.flash('success', `Welcome back, ${user.name}`);
        res.redirect('/dashboard');

    } catch(error) {
        console.error("Error saving user:", error);
        // req.flash()
        res.redirect("/login");

    }
}

//logout
const processLogout = (req, res) => {
    if(!req.session) {
        return res.redirect('/login');
    }

    req.session.destroy((err) => {
        if(err) {
            console.error("Error destroying session:", err);
            res.clearCookie("connect.sid");
            return res.redirect("/login");
        }

        res.clearCookie("connect.sid");
        res.redirect("/login");
    });
};

export {showRegistrationForm, processRegistrationForm, showLoginForm, processLoginForm, processLogout}

