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
