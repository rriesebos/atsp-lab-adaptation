async function getTransactionList(tableId)
{
    const user_id = 1
    let response = await fetch("/api/transactions/" + user_id.toString(), {method: "GET" });
    response = await response.json()

    populateTransactionTable(tableId, response.transactions)
}

async function getTransactionsFromTo()
{
    const from_user_id = 1;
    const to_user_id = to;

    let response = await fetch(`/api/transactions/from/${from_user_id}/to/${to_user_id} `, {method: "GET" });
    response = await response.json()

    populateTransactionTable('toFromId', response.transactions)
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

async function makeTransaction()
{

    const from = document.getElementById('fromId').value
    const to = document.getElementById('toId').value
    const amount = document.getElementById('amountId').value
    const reference = document.getElementById('referenceId').value

    try 
    {
        await fetch(`/api/transfer_money?from=${from}&to=${to}&amount=${amount}&reference=${reference}`)
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