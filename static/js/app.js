let token;
let inactivityTimer;

document.addEventListener('DOMContentLoaded', function () {
    setupForms();
});

function setupForms() {
    const currentPath = window.location.pathname;
    if (currentPath === '/login') {
        setupLoginForm();
    } else if (currentPath === '/register') {
        setupRegisterForm();
    } else if (currentPath === '/transactions/create_transaction') {
        setupCreateTransactionForm();
    }
}

function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginFormSubmit);
    } else {
        console.error("Форма с id 'loginForm' не найдена.");
    }
}

function handleLoginFormSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = '';

    fetch('/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include', 
        body: new URLSearchParams({
            username: username,
            password: password,
        }),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw err;
            });
        }
        return response.json();
    })
    .then(data => {
        document.cookie = `access_token=${data.access_token}; path=/; max-age=${60 * 15}`;
        document.cookie = `refresh_token=${data.refresh_token}; path=/; max-age=${60 * 60 * 24 * 7}`; 
        window.location.href = '/dashboard';
    })
    .catch(error => {
        console.error('Login error:', error);
        if (error.detail && error.detail === "Incorrect username or password") {
            errorMessage.textContent = "Неверное имя пользователя или пароль.";
        } else {
            errorMessage.textContent = "Произошла ошибка. Попробуйте позже.";
        }
    });
}

    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginFormSubmit);
    } else {
        console.error("Форма с id 'loginForm' не найдена.");
    }


    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterFormSubmit);
    } else {
        console.log("Форма с id 'registerForm' не найдена.");
    }

    const createTransactionForm = document.getElementById('createTransactionForm');
    if (createTransactionForm) {
        createTransactionForm.addEventListener('submit', handleCreateTransactionFormSubmit);
    } else {
        console.error("Форма с id 'createTransactionForm' не найдена.");
    }

    setupForms();


    function refreshAccessToken() {
        fetch('/auth/refresh_token', {
            method: 'POST',
            credentials: 'include' 
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Не удалось обновить токен');
            }
            return response.json();
        })
        .then(data => {
            localStorage.setItem('access_token', data.access_token);
            console.log('Access token обновлен:', data.access_token);
        })
        .catch(error => {
            console.error('Ошибка при обновлении токена:', error);
            window.location.href = '/login';
        });
    }
    
    function addAuthHeader(config) {
        const token = getCookie('access_token');
        if (token) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    }

    function handleLoginFormSubmit(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = ''; 
        fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include', // Убедитесь, что это установлено
            body: new URLSearchParams({
                username: username,
                password: password,
            }),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw err;
                });
            }
            return response.json();
        })
        .then(data => {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token || '');
            localStorage.setItem('user_id', data.user_id); 
            console.log('Tokens and user_id saved:', data);
            window.location.href = '/dashboard';
        })
        .catch(error => {
            console.error('Login error:', error);
            if (error.detail && error.detail === "Incorrect username or password") {
                errorMessage.textContent = "Неверное имя пользователя или пароль.";
            } else {
                errorMessage.textContent = "Произошла ошибка. Попробуйте позже.";
            }
        });
    }
    
    function addAuthHeader(config) {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    }

function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginFormSubmit);
    } else {
        console.error("Форма с id 'loginForm' не найдена.");
    }
}
 
function setupForms() {
    const currentPath = window.location.pathname;
    if (currentPath === '/login') {
        setupLoginForm();
    } else if (currentPath === '/register') {
        setupRegisterForm();
    } else if (currentPath === '/transactions/create_transaction') {
        setupCreateTransactionForm();
        updateBalance();
    }
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function addAuthHeader(config) {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}

if (window.location.pathname === '/dashboard') {
    fetch('/dashboard', {
        method: 'GET',
        headers: addAuthHeader({
            'Content-Type': 'application/json',
        }),
    })
    .then(response => {
        if (!response.ok) {
            console.error('Failed to fetch dashboard. Status:', response.status);
            return response.text().then(text => {
                console.error('Ответ сервера:', text);
                throw new Error('Failed to fetch dashboard');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Dashboard data:', data);
    })
    .catch(error => {
        console.error('Error:', error);
        window.location.href = '/login';
    });
}

async function updateBalance() {
    try {
        const balanceResponse = await fetch('/transactions/check_balance', addAuthHeader({
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        }));
        console.log("Ответ на запрос баланса:", balanceResponse);
        if (balanceResponse.ok) {
            const balanceData = await balanceResponse.json();
            console.log("Данные баланса:", balanceData);
            const balanceElement = document.getElementById('balance');
            if (balanceElement) {
                balanceElement.textContent = `${balanceData.balance} ₽`;
            } else {
                console.error("Элемент с id 'balance' не найден.");
            }
        } else {
            console.error("Ошибка при проверке баланса. Статус:", balanceResponse.status);
        }
    } catch (error) {
        console.error("Ошибка при обновлении баланса:", error.message);
    }
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        console.log("Пользователь неактивен");
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
    }, 1000 * 60 * 15); 
}

document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
setInterval(refreshAccessToken, 1000 * 60 * 10);

function setupRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterFormSubmit);
    } else {
        console.error("Форма с id 'registerForm' не найдена.");
    }
}

function handleRegisterFormSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const fullName = document.getElementById('full_name').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = ''; 
    if (password !== confirmPassword) {
        errorMessage.textContent = 'Пароли не совпадают';
        return;
    }
    fetch('/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            email: email,
            full_name: fullName,
            password: password,
            confirm_password: confirmPassword,
        }),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw err;
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Register success data:', data);
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token || '');
        localStorage.setItem('user_id', data.user_id); 
        console.log('Tokens and user_id saved:', data);
        alert('Регистрация прошла успешно! Теперь вы можете войти.');
        window.location.href = '/login';
    })
    .catch(error => {
        console.error('Registration error:', error);
        if (error.detail) {
            errorMessage.textContent = "Ошибка регистрации: " + error.detail;
        } else {
            errorMessage.textContent = "Произошла ошибка. Попробуйте позже.";
        }
    });
}

function setupCreateTransactionForm() {
    const createTransactionForm = document.getElementById('createTransactionForm');
    if (createTransactionForm) {
        createTransactionForm.addEventListener('submit', handleCreateTransactionFormSubmit);
    } else {
        console.error("Форма с id 'createTransactionForm' не найдена.");
    }
}