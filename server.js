const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();

// Database connection
const pool = new Pool({
    user: 'portfolio_user',
    host: 'localhost',
    database: 'portfolio_db',
    password: 'Best@123',
    port: 5432,
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
}));

// Serve static files from 'public' with video MIME types
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

// Redirect root to signin if not logged in
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.redirect('/signin.html');
    }
});

// Signup route
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

// Login route
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

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/signin.html');
});

// API for projects
app.get('/api/projects', requireAuth, (req, res) => {
    const projects = [
        {
            id: 1,
            title: 'Cinematic Short Film',
            description: 'A cinematic short film edited in Final Cut Pro.',
            videoUrl: '/videos/video1.mp4'
        },
        {
            id: 2,
            title: 'Commercial Ad',
            description: 'Commercial ad with dynamic transitions in Premiere Pro.',
            videoUrl: '/videos/video2.mp4'
        },
        {
            id: 3,
            title: 'Music Video',
            description: 'Color-graded music video in DaVinci Resolve.',
            videoUrl: '/videos/video3.mp4'
        }
    ];
    res.json(projects);
});

// Serve signin and signup pages
app.get('/signin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});
app.get('/signup.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});