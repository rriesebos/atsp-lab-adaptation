const backend = 'http://localhost/api/'

const fetchSettings = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
}

function logout() {
    document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    window.location.href = "login.html";
}