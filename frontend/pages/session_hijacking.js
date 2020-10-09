stealCookieForm = document.getElementById('form-steal-cookie');
cookieNameInput = document.getElementById('cookie-name');
cookieValueInput = document.getElementById('cookie-value');

async function checkAuthentication() {
    const settings = {
        method: 'GET',
    };

    let url = `/api/is_authenticated`
    let response = await fetch(url, settings);
    response = await response.json();

    loginForm = document.getElementById('login-form');
    authBox = document.getElementById('auth-box');
    authText = document.getElementById('auth-text');
    requiresAuthentication = document.getElementById('requires-authentication');
    reqAuthWarning = document.getElementById('req-auth-warning');

    if (response.authenticated) {
        loginForm.style.display = "none";
        authBox.style.display = "inherit";
        authText.innerHTML = `You are currently authenticated as user with ID ${response.user_id}`;
        requiresAuthentication.style.display = "inherit";
        reqAuthWarning.style.display = "none";

        populateCookieTable("cookie-info");
    } else {
        loginForm.style.display = "inherit";
        authBox.style.display = "none";
        requiresAuthentication.style.display = "none";
        reqAuthWarning.style.display = "inherit";
    }
}

function getFormDataAsObject(form) {
    formdata = new FormData(form);
    var data = {};
    formdata.forEach((value, key) => { data[key] = value });
    return data;
}

const backend = 'http://localhost/api/'

const fetchSettings = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
}

function signout(e) {
    e.preventDefault();
    console.log("Invalidating token");
    document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    checkAuthentication();
}

function signin(e) {
    e.preventDefault();

    form = document.getElementById('form-signin');
    failureMessage = document.getElementById("signin-failure")

    data = getFormDataAsObject(form);
    if (!data.id || !data.password) {
        failureMessage.innerHTML = "Please fill in all fields."
        return;
    }

    url = backend + 'signin'
    request = fetchSettings
    console.log(data);
    request['body'] = JSON.stringify(data)
    fetch(url, request)
        .then(response => response.json())
        .then(body => {
            if (body['status']) {
                const date = new Date();
                date.setTime(`${date.getTime()}${30 * 24 * 60 * 60 * 1000}`);
                document.cookie = `token=${body['token']}; expiryDate=${date.toUTCString()}; path=/`;
                checkAuthentication();
                form.reset();
            } else {
                throw new Error(body['error']);
            }
        })
        .catch((reason) => {
            failureMessage.innerHTML = reason.toString();
        });
}

function populateCookieTable(tableId) {
    let rowsId = document.getElementById(tableId)
    while (rowsId.firstChild) {
        rowsId.removeChild(rowsId.firstChild);
    }

    cookies = getCookies();
    for (var cookieName in cookies) {
        if (cookies.hasOwnProperty(cookieName)) {
            let tr = document.createElement('tr')

            let td = document.createElement('td')
            td.innerHTML = cookieName;
            td.style = "word-wrap: break-word;max-width:160px;";
            tr.appendChild(td)

            td = document.createElement('td')
            td.innerHTML = cookies[cookieName];
            td.style = "word-wrap: break-word;max-width:160px;";
            tr.appendChild(td)

            rowsId.appendChild(tr);
        }
    }
}

var getCookies = function() {
    var pairs = document.cookie.split(";");
    var cookies = {};
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split("=");
        cookies[(pair[0] + '').trim()] = unescape(pair.slice(1).join('='));
    }
    return cookies;
}

stealCookieForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const cookieName = cookieNameInput.value;
    const cookieValue = cookieValueInput.value;
    console.log(`Cookie name: ${cookieName}, cookie value: ${cookieValue}`);

    // Set cookie and reload page
    document.cookie = `${cookieName}=${cookieValue}; path=/`; 
    location.reload();
});