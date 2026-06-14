import express from 'express'
import session from 'express-session'
import path from 'path'
import { fileURLToPath } from 'url'
import router from './src/controllers/routes.js'

const app = express()
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


// session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,   // change to true in production
        maxAge: 1000 * 60 * 60 * 24  // 1 day
    }
}))


// configure Express 
app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'src/views'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

// routes
app.use('/', router);



// error handling 
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err)
})

app.use((err, req, res, next) => {
    if (res.headerSent || res.finished) {
        return next(err)
    }

    const status = err.status || 500;
    const template = status === 404 ? '404' : '500';

    const context = {
        title: status===404 ? 'Page Not Found' : 'Server Error',
        error: NODE_ENV === 'production' ? 'An error occured' : err.message,
        stack: NODE_ENV === 'production' ? null : err.stack,
        NODE_ENV
    };

    try {
        res.status(status).render(`errors/${template}`, context);
    } catch(renderErr) {
        if(!res.headerSent) {
            res.status(status).send(`<h1>Error ${status}</h1><p>An error occurred.</p>`);
        }
    }
})


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})