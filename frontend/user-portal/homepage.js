async function checkAuthentication(afterURL) {
    const settings = {
        method: 'GET',
    };

    let url = `/api/is_authenticated` + afterURL;
    let response = await fetch(url, settings);
    response = await response.json();

    if(!response.authenticated)
    {
        logout();
    }
    return response;
}

async function getAccountInformation(session, afterURL) {
    const settings = {
        method: 'GET',
    };

    session.then(async function(session) {
        let url = `/api/my/user` + afterURL;
        let response = await fetch(url, settings);
        response = await response.json();

        if(!response.users.length > 0) {
            console.error("Something went wrong while fetching user information!");
            console.error(response);
        }

        user = response.users[0];

        for (var key in user){
            if (user.hasOwnProperty(key)) {
                var li = document.createElement("li");
                li.innerHTML = "<b>" + key + "</b>: " + user[key];
                document.getElementById("account-info").appendChild(li);
            }
        }
    })
}

async function getTransactionInformation(session, afterURL) {
    const settings = {
        method: 'GET',
    };

    session.then(async function(session) {
        console.log(session);

        let url = `/api/my/transactions` + afterURL;
        let response = await fetch(url, settings);
        response = await response.json();

        console.log(response);
        populateTransactionTable("transaction-info", response.transactions)
    })
}

$( document ).ready(function() {
    // Simulate WCD on this page
    afterURL = document.URL.split("dashboard.html")[1];
    setBackground();
});

async function blue_button(){
    const settings = {
            method: 'GET',
            headers: {
                //'background-color': '"><img src="x" onerror=alert("xss")><!--'
                'background-color': '"><img src="x" onerror=window.location.reload()><!--'
            }
        };

        let url = `/api/background`;
        let response = await fetch(url, settings);
                response = await response.json();
        console.log(response);
    location.reload();
}

async function setBackground() {
    const settings = {
        method: 'GET',
    };

    let url = `/api/background`;
    let response = await fetch(url, settings);
            response = await response.json();
    console.log(response);
    if (response.hasOwnProperty('color')) {
        color = response['color'];
        body = document.getElementsByTagName("body")[0];
        body.outerHTML = body.outerHTML.replace('<body', '<body style="background: '+color+'; "');
        document.getElementById("easter_egg").innerHTML = "You special background has the color: " + color;
    }
}

function populateTransactionTable(tableId, transactions)
{
    const rows = transactions;

    let rowsId =  document.getElementById(tableId)
    while (rowsId.firstChild)
    {
        rowsId.removeChild(rowsId.firstChild);
    }

    rows.forEach(function(row) {
        let tr = document.createElement('tr')

        keys = Object.keys(row)

        keys.forEach(function(key) {
            let td = document.createElement('td')
            td.innerHTML = row[key]
            tr.appendChild(td)
        })

        rowsId.appendChild(tr)
    })
}

function populateCookieTable(tableId)
{
    let rowsId =  document.getElementById(tableId)
    while (rowsId.firstChild)
    {
        rowsId.removeChild(rowsId.firstChild);
    }

    cookies = getCookies();
    for (var cookieName in cookies){
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

var getCookies = function(){
    var pairs = document.cookie.split(";");
    var cookies = {};
    for (var i=0; i<pairs.length; i++){
        var pair = pairs[i].split("=");
        cookies[(pair[0]+'').trim()] = unescape(pair.slice(1).join('='));
    }
    return cookies;
}