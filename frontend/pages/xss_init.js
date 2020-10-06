var urlParams = new URLSearchParams(window.location.search);
const to = urlParams.get('to')
document.getElementById('reflectedToId').innerHTML = `<b>To</b>: ${to}`

const normalLink = document.getElementById('reflectiveToLink')
const normalQuery = window.location.href.split('?')[0] + "?to=2"
normalLink.innerHTML = normalQuery
normalLink.href = normalQuery


const injectedLink = document.getElementById('reflectiveToLinkInjection')
const injectedQuery = window.location.href.split('?')[0] + `?to=<img src="" onerror="(function() { alert('XSS') }).call(this)">`
injectedLink.value = injectedQuery

getTransactionsFromTo()
