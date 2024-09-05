function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            message.style.color = 'green';
            message.innerText = 'Login successful!';
            setTimeout(() => {
                window.location.href ='views/home.html';
            }, 3000);
        } else {
            message.style.color = 'red';
            message.innerText = 'Invalid username or password.';
        }
    })
    .catch(error => {
        message.style.color = 'red';
        message.innerText = 'Error during login.';
    });
}

//eto mag reregister 
function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            message.style.color = 'green';
            message.innerText = 'Account created successfully! Redirecting to Login page.';
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 3000);
        } else {
            message.style.color = 'red';
            message.innerText = 'Username already exists.';
        }
    })
    .catch(error => {
        message.style.color = 'red';
        message.innerText = 'Error during registration.';
    });
}