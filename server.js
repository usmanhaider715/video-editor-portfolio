require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();

// Cloud DB pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Session store with PostgreSQL
const pgSessionStore = new pgSession({
    pool: pool,
    tableName: 'sessions',
    createTableIfMissing: true
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    store: pgSessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 3600000,
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.mp4')) {
            res.setHeader('Content-Type', 'video/mp4');
        }
    }
}));

// Auth middleware
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/signin.html');
    }
};

// Routes
app.get('/', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2)',
            [email, hashedPassword]
        );
        res.redirect('/signin.html');
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const match = await bcrypt.compare(password, user.rows[0].password);
        if (!match) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        req.session.userId = user.rows[0].id;
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/signin.html');
});

app.get('/api/projects', requireAuth, (req, res) => {
    const projects = [
        { id: 1, title: 'Cinematic Short Film', description: 'A cinematic short film edited in Final Cut Pro.', videoUrl: '/videos/video1.mp4' },
        { id: 2, title: 'Commercial Ad', description: 'Commercial ad with dynamic transitions in Premiere Pro.', videoUrl: '/videos/video2.mp4' },
        { id: 3, title: 'Music Video', description: 'Color-graded music video in DaVinci Resolve.', videoUrl: '/videos/video3.mp4' }
    ];
    res.json(projects);
});

app.get('/signin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});

app.get('/signup.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Vercel serverless export
module.exports = app;