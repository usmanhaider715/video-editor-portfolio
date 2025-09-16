document.addEventListener('DOMContentLoaded', () => {
    // Signup form (on signup.html)
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            try {
                const response = await fetch('/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                if (response.ok) {
                    window.location.href = '/signin.html';
                } else {
                    const data = await response.json();
                    alert(data.error || 'Signup failed');
                }
            } catch (err) {
                alert('Error: ' + err);
            }
        });
    }

    // Login form (on signin.html)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                if (response.ok) {
                    window.location.href = '/';
                } else {
                    const data = await response.json();
                    alert(data.error || 'Login failed');
                }
            } catch (err) {
                alert('Error: ' + err);
            }
        });
    }
});