
module.exports = {
    transfer_money: async function(pool, from_user_id, to_user_id, amount, reference) {
        const client = await pool.connect()
        try {
            await client.query(`BEGIN;`);
            await client.query(`UPDATE users SET balance = balance - ${amount} WHERE user_id = ${from_user_id};`);
            await client.query(`UPDATE users SET balance = balance + ${amount} WHERE user_id = ${to_user_id};`);
            await client.query(`INSERT INTO transactions (from_user_id, to_user_id, amount, reference) 
                VALUES ('${from_user_id}', '${to_user_id}', ${amount}, '${reference}');`);
            await client.query(`COMMIT;`);
        } catch (e) {
            await client.query('ROLLBACK')
            throw e
        } finally {
            client.release()
        }
    }
}