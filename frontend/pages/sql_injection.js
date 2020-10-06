
function generateSampleRequest() {
    userid = document.getElementById('sampleRequestId').value;
    request = "// The generated request\nwww.insecurebanking.com/users/" + userid
    document.getElementById('requestfield').innerHTML = PR.prettyPrintOne(request);
}

function exampleOne() {
    const settings = {
      method: 'GET',
    };

    request = document.getElementById('exampleOneRequest').value;
    fetch(request, settings)
        .then(response => response.json())
        .then(body => {
            document.getElementById('exampleOneResult').innerHTML = 
                PR.prettyPrintOne(JSON.stringify(body, null, 4))
        })
        .catch(err => console.error(err));
}

function resetExampleOne() {
    document.getElementById('exampleOneResult').innerHTML = "";
    reset();
}

function exampleTwo() {
    const settings = {
        method: 'GET',
      };
  
    getUser = document.getElementById('getUserRequest').value;
    fetch(getUser, settings)
        .then(response => response.json())
        .then(body => {
            document.getElementById('getUserResultBefore').innerHTML = 
                PR.prettyPrintOne(JSON.stringify(body, null, 4))})
        .then(() => {
            updateRequest = document.getElementById('exampleTwoRequest').value;
            fetch(updateRequest, settings)
                .then(() => {
                    fetch(getUser, settings)
                    .then(response => response.json())
                    .then(body => {
                        document.getElementById('getUserResultAfter').innerHTML = 
                            PR.prettyPrintOne(JSON.stringify(body, null, 4))
                    })
                })
        });                    
}

function resetExampleTwo() {
    document.getElementById('getUserResultAfter').innerHTML = "";
    document.getElementById('getUserResultBefore').innerHTML = "";
    reset();
}

function exampleThree() {
    const settings = {
      method: 'GET',
    };

    request = document.getElementById('exampleThreeRequest').value;
    fetch(request, settings)
        .then(() => {
            request = document.getElementById('getDroppedRequest').value;
            fetch(request, settings)
                .then(response => response.json())
                .then(body => {
                    document.getElementById('getDroppedResult').innerHTML = 
                        PR.prettyPrintOne(JSON.stringify(body, null, 4))
                });
        });
}

function resetExampleThree() {
    document.getElementById('exampleThreeResult').innerHTML = "";
    reset();
}