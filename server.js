import express from 'express'
import session from 'express-session'
import path from 'path'
import { fileURLToPath } from 'url'
import router from './src/controllers/routes.js'
import { setupDatabase, testConnection } from './src/models/setup.js'
import { addLocalVariables } from './src/middlewares/global.js'
import connectPgSimple from "connect-pg-simple";
import db, {pool} from './src/models/db.js'
import { generateReport } from './src/utils/ai.js'

const app = express()
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize PostgreSQL session store
const pgSession = connectPgSimple(session);

// session
app.use(session({
    store: new pgSession({        // ← this is what's missing
        pool: pool,
        tableName: 'session',
        // schemaName: 'public'
    }),
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

app.use(addLocalVariables);

// routes
app.use('/', router);

// temporary test — remove after confirming it works
// const testPrompt = `Write a short 2-sentence greeting in Vietnamese for a teacher app.`
// const result = await generateReport(testPrompt)
// console.log('Gemini test:', result)

// error handling 
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err)
})

// app.use((err, req, res, next) => {
//     if (res.headerSent || res.finished) {
//         return next(err)
//     }

//     const status = err.status || 500;
//     const template = status === 404 ? '404' : '500';

//     const context = {
//         title: status===404 ? 'Page Not Found' : 'Server Error',
//         error: NODE_ENV === 'production' ? 'An error occured' : err.message,
//         stack: NODE_ENV === 'production' ? null : err.stack,
//         NODE_ENV
//     };

//     try {
//         res.status(status).render(`errors/${template}`, context);
//     } catch(renderErr) {
//         if(!res.headerSent) {
//             res.status(status).send(`<h1>Error ${status}</h1><p>An error occurred.</p>`);
//         }
//     }
// })

// if (NODE_ENV.includes('dev')) {
//     const ws = await import('ws');

//     try {
//         const wsPort = parseInt(PORT) + 1;
//         const wsServer = new ws.WebSocketServer({ port: wsPort });

//         wsServer.on('listening', () => {
//             console.log(`WebSocket server is running on port ${wsPort}`);
//         });

//         wsServer.on('error', (error) => {
//             console.error('WebSocket server error:', error);
//         });
//     } catch (error) {
//         console.error('Failed to start WebSocket server:', error);
//     }
// }

app.use((err, req, res, next) => {
    if (res.headersSent || res.finished) {
        return next(err)
    }

    // set locals that header.ejs needs
    res.locals.isLoggedIn = req.session?.user ? true : false
    res.locals.user = req.session?.user || null
    res.locals.currentYear = new Date().getFullYear()

    const NODE_ENV = process.env.NODE_ENV || 'production'  // ← define it here
    const status = err.status || 500
    const template = status === 404 ? '404' : '500'

    const context = {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: NODE_ENV === 'production' ? 'An error occurred' : err.message,
        stack: NODE_ENV === 'production' ? null : err.stack,
        NODE_ENV
    }

    try {
        res.status(status).render(`errors/${template}`, context)
    } catch (renderErr) {
        if (!res.headersSent) {
            res.status(status).send(`<h1>Error ${status}</h1><p>An error occurred.</p>`)
        }
    }
})



app.listen(PORT, async () => {
    await setupDatabase();
    await testConnection();
    console.log(`Server running on http://localhost:${PORT}`)
})




