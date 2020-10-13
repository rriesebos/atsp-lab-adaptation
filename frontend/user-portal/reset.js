async function reset() {
    try 
    {
        await fetch('/api/reset', { method: 'GET' })
        await fetch('http://localhost:3001/clear', { method: 'GET' })
        document.getElementById("reset-success").classList.remove('hidden');
        setTimeout(() => { document.getElementById("reset-success").classList.add('hidden'); }, 1500);
    }
    catch (err)
    {
        document.getElementById("reset-failure").classList.remove('hidden');
        setTimeout(() => { document.getElementById("reset-failure").classList.add('hidden'); }, 1500);
    }
}