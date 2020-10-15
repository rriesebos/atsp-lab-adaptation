$(document).ready(function() {
    session = checkAuthentication();
    initial_background();
});

async function blue_button() {
    const settings = {
        method: 'GET',
        headers: {
            'background-color': 'blue'
        }
    };

    let url = `/api/background.html`;
    let response = await fetch(url, settings);
    response = await response.text();
    setBackgroundColor(response);
}

async function red_button() {
    const settings = {
        method: 'GET',
        headers: {
            'background-color': 'red'
        }
    };

    let url = `/api/background.html`;
    let response = await fetch(url, settings);
    response = await response.text();
    setBackgroundColor(response);
}

async function xss_button() {
    input = document.getElementById('header-input').value;
    const settings = {
        method: 'GET',
        headers: {
            'background-color': input
        }
    };

    let url = `/api/background.html`;
    let response = await fetch(url, settings);
    response = await response.text();
    setBackgroundColor(response);
}

async function initial_background() {
    const settings = {
        method: 'GET',
    };

    let url = `/api/background.html`;
    let response = await fetch(url, settings);
    response = await response.text();
    setBackgroundColor(response);
}

function setBackgroundColor(color) {
    body = document.getElementsByTagName("body")[0];
    body.style.background = color;
    document.getElementById("easter_egg").innerHTML = "You special background has the color: " + color;
}