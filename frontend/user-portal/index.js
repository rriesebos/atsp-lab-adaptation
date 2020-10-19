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
                getAuthentication(0);
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

$( document ).ready(function() {
    getAuthentication(0);
});