const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the 'public' folder with correct MIME types
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.mp4')) {
            res.setHeader('Content-Type', 'video/mp4');
        }
    }
}));

// API endpoint for portfolio projects
app.get('/api/projects', (req, res) => {
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

// Contact form email handler
const nodemailer = require('nodemailer');
app.use(express.json());
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    // Configure transporter (use your real credentials)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'usmanhaiderkhokhar715@gmail.com', // your Gmail address
            pass: 'hnzeetgnbhfwbaso' // use Gmail App Password, not your real password
        }
    });
    const mailOptions = {
        from: email,
        to: 'usmanhaiderkhokhar715@gmail.com',
        subject: `Portfolio Contact Form: ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    };
    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Thank you for your message! I will get back to you soon.' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email. Please try again later.' });
    }
});

// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Portfolio server running at http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api/projects`);
});