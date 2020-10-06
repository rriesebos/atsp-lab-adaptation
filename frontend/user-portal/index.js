function signin() {
    url = backend + 'signin'
    request = fetchSettings
    request['body'] = JSON.stringify({
        "id": document.getElementById("id").value,
        "password": document.getElementById("password").value
    });

    fetch(url, request)
        .then(response => response.json())
        .then(body => {
            if (body['status']) {
                const date = new Date();
                date.setTime(`${date.getTime()}${30 * 24 * 60 * 60 * 1000}`);
                document.cookie = `token=${body['token']}; expiryDate=${date.toUTCString()}; path=/`;
                checkAuthentication();
            } else {
                throw new Error(body['error']);
            }
        })
        .catch((reason) => {
            failureMessage = document.getElementById("signin-failure")
            failureMessage.style.visibility = "visible";
            failureMessage.innerText = 'Failed to log in. The following message was returned by the server: ' + reason.toString();
        });
}

async function checkAuthentication() {
    const settings = {
        method: 'GET',
    };

    let url = `/api/is_authenticated`
    let response = await fetch(url, settings);
    response = await response.json();

    if(response.authenticated)
    {
        window.location.href = "dashboard.html";
    }
}

$( document ).ready(function() {
    checkAuthentication();
});