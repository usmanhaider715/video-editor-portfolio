// Fetch and display portfolio videos
fetch('/api/projects')
    .then(response => response.json())
    .then(projects => {
        const grid = document.getElementById('portfolio-grid');
        grid.innerHTML = '';
        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'portfolio-card';
            card.innerHTML = `
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <video controls width="320" height="180">
                    <source src="${project.videoUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            `;
            grid.appendChild(card);
        });
    })
    .catch(err => {
        console.error('Failed to load projects:', err);
    });

// Contact form AJAX submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };
        // Show loading message
        let statusMsg = document.getElementById('contact-status');
        if (!statusMsg) {
            statusMsg = document.createElement('div');
            statusMsg.id = 'contact-status';
            statusMsg.style.marginTop = '10px';
            contactForm.appendChild(statusMsg);
        }
        statusMsg.textContent = 'Sending...';
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (response.ok) {
                statusMsg.textContent = result.message;
                contactForm.reset();
            } else {
                statusMsg.textContent = result.message || 'Failed to send message.';
            }
        } catch (err) {
            statusMsg.textContent = 'Error sending message. Please try again later.';
        }
    });
}