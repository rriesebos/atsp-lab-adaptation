function spoiler1() {
    document.getElementById("answer1").innerHTML = "It has something to do with the 'img' tag.";
}

function spoiler2() {
    document.getElementById("answer2").innerHTML = '&lt;img src="x" onerror=alert("xss")&gt;';
}