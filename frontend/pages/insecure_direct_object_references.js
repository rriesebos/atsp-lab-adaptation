function populateTransactionTable(tableId, transactions)
{
    const rows = transactions;

    let rowsId =  document.getElementById(tableId)

    while (rowsId.firstChild) {
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

async function getTransactionList(tableId) {
    url = document.getElementById('exampleRequest').value;
    let response = await fetch(url, {method: "GET" });
    response = await response.json()

    populateTransactionTable(tableId, response.transactions)
}

function resetTable(tableId) {
    document.getElementById(tableId).innerHTML = "";
    reset();
}