function spoiler1() {
    document.getElementById("answer1").innerHTML = "The 1-cdn-enabler.js file now returns false, indicating that the CDN is NOT active. " +
        "The opposite of false is true.";
}

function spoiler2() {
    document.getElementById("answer2").style.display = "inherit";
}

function spoiler3() {
    document.getElementById("answer3").innerHTML = "We consider the following static file extensions: " +
        ".css, .js, .jpg, .png, .html. These should all be added to the array in 2-cdn-urlfilter.js";
}

function spoiler4() {
    document.getElementById("answer4").style.display = "inherit";
}

function spoiler5() {
    document.getElementById("answer5").innerHTML = "Try adding ?key=val.css to the request on the dashboard page.";
}

function spoiler6() {
    document.getElementById("answer6").innerHTML = "(1) Log in <a href='http://localhost:3001/'>on the CDN</a>.<br>" +
        "(2) Open the URL <a href='http://localhost:3001/dashboard.html?key=val.css'>http://localhost:3001/dashboard.html?key=val.css</a>.<br>" +
        "(3) Open incognito browser.<br>" +
        "(4) Open the same URL and note you see private information: <a href='http://localhost:3001/dashboard.html?key=val.css'>http://localhost:3001/dashboard.html?key=val.css</a>.";
}

function spoiler7() {
    document.getElementById("answer7").innerHTML = "The 3-cdn-headerfilter.js file is used to specify content types. " +
        "We are considering the following content-types as static: text/css, application/javascript, image/jpeg, image/png, text/html.";
}

function spoiler8() {
    document.getElementById("answer8").style.display = "inherit";
}