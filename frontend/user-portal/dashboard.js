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
        let url = `/api/my/transactions` + afterURL;
        let response = await fetch(url, settings);
        response = await response.json();

        populateTransactionTable("transaction-info", response.transactions)
    })
}


getAuthentication = async function(requiresLoggedIn, afterURL) {
    const settings = {
        method: 'GET',
    };

    let url = `/api/is_authenticated`;
    if(typeof afterURL !== "undefined")
        url = `/api/is_authenticated` + afterURL;

    let response = await fetch(url, settings);
    response = await response.json();

    if(requiresLoggedIn === 1 && !response.authenticated)
    {
        logout();
    }
    return response;
}

$( document ).ready(function() {
    // Simulate WCD on this page
    afterURL = document.URL.split("dashboard.html")[1];

    session = getAuthentication(0, afterURL);
    getAccountInformation(session, afterURL);
    getTransactionInformation(session, afterURL);
    populateCookieTable("cookie-info");
});

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