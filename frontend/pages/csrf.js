async function checkAuthentication() {
    const settings = {
      method: 'GET',
    };

    let url = `/api/is_authenticated` 
    let response = await fetch(url, settings);
    response = await response.json();

    loginForm = document.getElementById('loginForm');
    authBox = document.getElementById('authBox');
    authText = document.getElementById('authText');
    overviewText = document.getElementById('overviewText');
    requiresAuthentication = document.getElementById('requiresAuthentication');
    reqAuthWarning = document.getElementById('reqAuthWarning');

    if(response.authenticated)
    {
        loginForm.style.display = "none";
        authBox.style.display = "inherit";
        authText.innerHTML = `You are currently authenticated as user with ID ${response.user_id}`;
        overviewText.innerHTML = `Banking overview for user with ID ${response.user_id}`;
        getTransactionList('rowsId', response.user_id);
        getBalance('userBalance', response.user_id);
        requiresAuthentication.style.display = "inherit";
        reqAuthWarning.style.display = "none";
    }
    else 
    {
        loginForm.style.display = "inherit";
        authBox.style.display = "none";
        requiresAuthentication.style.display = "none";
        reqAuthWarning.style.display = "inherit";
    }
}

function getFormDataAsObject(form) {
    formdata = new FormData(form);
    var data = {};
    formdata.forEach((value, key) => {data[key] = value});
    return data;
}

const backend = 'http://localhost/api/' 

const fetchSettings = {
    method: 'POST',    
    headers: {
        'Content-Type': 'application/json'
    }
}

function signout(e) {
    e.preventDefault();
    console.log("Invalidating token");
    document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    checkAuthentication();
}

function signin(e) {
    e.preventDefault();
    form = document.getElementById('form-signin');
    data = getFormDataAsObject(form);
    url = backend + 'signin'
    request = fetchSettings
    console.log(data);
    request['body'] = JSON.stringify(data)
    fetch(url, request)
        .then(response => response.json())
        .then(body => {
            if (body['status']) {
                const date = new Date();
                date.setTime(`${date.getTime()}${30 * 24 * 60 * 60 * 1000}`);
                document.cookie = `token=${body['token']}; expiryDate=${date.toUTCString()}; path=/`;
                checkAuthentication();
                form.reset();
            } else {
                throw new Error(body['error']);
            }            
        })
        .catch((reason) => {
            failureMessage = document.getElementById("signin-failure")
            failureMessage.innerHTML = 'Failed to log in due to:\n' + reason.toString()
        });
}

async function makeTransaction()
{
    const to = document.getElementById('toId').value
    const amount = document.getElementById('amountId').value
    const reference = document.getElementById('referenceId').value

    try 
    {
        await fetch(`/api/transfer_money?to=${to}&amount=${amount}&reference=${reference}`)
        document.getElementById("transaction-success").classList.remove('hidden');
        setTimeout(() => { document.getElementById("transaction-success").classList.add('hidden'); }, 1500);
    }
    catch (err)
    {
        document.getElementById("transaction-failed").classList.remove('hidden');
        setTimeout(() => { document.getElementById("transaction-failed").classList.add('hidden'); }, 1500);
        console.error(err.message)
    }
}

async function getBalance(divId, user_id)
{
    let response = await fetch("/api/users/" + user_id.toString(), {method: "GET" });
    response = await response.json()
    textBox = document.getElementById(divId);
    textBox.innerHTML = `<b>Current balance:</b> ${response['users'][0].balance}`;

    return response;
}

async function getTransactionList(tableId, user_id)
{
    let response = await fetch("/api/transactions/" + user_id.toString(), {method: "GET" });
    response = await response.json()

    populateTransactionTable(tableId, response.transactions)
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