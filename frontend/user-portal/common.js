const backend = '/api/'

const fetchSettings = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
}

// requiresLoggedIn:
// 0 = MUST NOT be logged in
// 1 = MUST be logged in
// 2 = Does not matter if logged in or not
async function getAuthentication(requiresLoggedIn) {
    const settings = {
        method: 'GET',
    };

    let url = `/api/is_authenticated`;
    let response = await fetch(url, settings);
    response = await response.json();

    if(requiresLoggedIn === 1 && !response.authenticated)
    {
        logout();
    } else if(requiresLoggedIn === 0 && response.authenticated) {
        window.location.href = "homepage.html";
    }
    return response;
}

function logout() {
    document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    window.location.href = "index.html";
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

function createMenuButtons(isLoggedIn) {
    menuRight = document.getElementById("menuButtons");

    // Add back to lab button
    a = document.createElement("a");
    a.className = "btn btn-primary ml-2";
    a.href = "http://localhost/";
    a.innerText = "Back to Lab";
    menuRight.appendChild(a);

    // Add Reset Successful label
    div = document.createElement("div");
    div.id = "reset-success";
    div.className = "alert alert-success hidden";
    div.setAttribute("role", "alert");
    div.innerText = "Successful reset";
    menuRight.appendChild(div);

    // Add Reset Failure label
    div = document.createElement("div");
    div.id = "reset-failure";
    div.className = "alert alert-danger hidden";
    div.setAttribute("role", "alert");
    div.innerText = "Failed to reset";
    menuRight.appendChild(div);

    // Add Reset button
    button = document.createElement("button");
    button.className = "btn btn-primary ml-2";
    button.setAttribute("onclick", "reset();");
    button.innerText = "Reset";
    menuRight.appendChild(button);

    // Add logout button
    if(isLoggedIn.authenticated) {
        button = document.createElement("button");
        button.className = "btn btn-danger ml-2";
        button.setAttribute("onclick", "logout();");
        button.innerText = "Log Out";
        menuRight.appendChild(button);
    }
}

function createMenu() {
    getAuthentication(2).then(function(isLoggedIn) {
        menuLeft = document.getElementById("menuitems");

        // Create regular pages below
        if(!isLoggedIn.authenticated) {
            menuLeft.appendChild(getMenuItem("Login", "./index.html"));
        } else {
            menuLeft.appendChild(getMenuItem("Homepage", "./homepage.html"));
            menuLeft.appendChild(getMenuItem("Dashboard", "./dashboard.html"));
        }

        // Create control flow buttons below
        createMenuButtons(isLoggedIn);

    });
}

$( document ).ready(function() {
    createMenu();
});