document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display projects
    fetch('/api/projects')
        .then(response => response.json())
        .then(projects => {
            const projectList = document.getElementById('project-list');
            projects.forEach(project => {
                const div = document.createElement('div');
                div.className = 'project-item';
                div.innerHTML = `
                    <h2>${project.title}</h2>
                    <p>${project.description}</p>
                    <video controls>
                        <source src="${project.videoUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `;
                projectList.appendChild(div);
            });
        })
        .catch(error => console.error('Error fetching projects:', error));

    // Handle contact form submission (basic demo)
    document.getElementById('contact-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const message = document.getElementById('contact-message').value;
        console.log('Contact Form Submitted:', { name, email, message });
        alert('Message sent! (Demo only)');
        e.target.reset();
    });
});