const backend = 'http://localhost/api/'

const fetchSettings = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
}

function logout() {
    document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    window.location.href = "index.html";
}

async function isLoggedIn() {
    const settings = {
        method: 'GET',
    };

    let url = `/api/is_authenticated`
    let response = await fetch(url, settings);
    response = await response.json();

    return response.authenticated;
}

function getMenuItem(pageName, pageUrl) {
    li = document.createElement("li");
    li.className = "nav-item";

    a = document.createElement("a");
    a.innerText = pageName;
    a.href = pageUrl;

    currentPageArr = window.location.href.split('/');
    currentPage = currentPageArr[currentPageArr.length - 1];
    pageUrlArr = pageUrl.split('/');
    pageUrl = pageUrlArr[pageUrlArr.length - 1];
    if(currentPage === pageUrl) {
        a.className = "nav-link active";
        span = document.createElement("span");
        span.className = "sr-only";
        span.innerText = "(current)";
        a.appendChild(span);
    } else {
        a.className = "nav-link";
    }
    li.appendChild(a);

    return li;
}

function createMenu() {
    isLoggedIn().then(function(isLoggedIn) {
        menuLeft = document.getElementById("menuitems");

        if(!isLoggedIn) {
            menuLeft.appendChild(getMenuItem("Login", "./index.html"));
        } else {
            menuLeft.appendChild(getMenuItem("Dashboard", "./dashboard.html"));
        }

    });
}

$( document ).ready(function() {
    createMenu();
});