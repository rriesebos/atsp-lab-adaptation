const express = require('express');

const morgan = require('morgan');
const clientSession = require('client-sessions');
const helmet = require('helmet');
const cors = require('cors');

const {SESSION_SECRET} = require('./config');

const app = express();

const transactions = require('./transactions');
let jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
var cookies = require("cookie-parser");
const fs = require('fs');
const util = require('util');
const readFile = (fileName) => util.promisify(fs.readFile)(fileName, 'utf8');
const db = require('./src/persistence/db');
const session = require('express-session')
const {v4: uuidv4} = require('uuid');

//app.use(cors({ origin: '*' }))
app.use(cors());

app.use(bodyParser.json());
app.use(cookies());

app.get('/', (request, response) => response.sendStatus(200));
app.get('/health', (request, response) => response.sendStatus(200));



const resetDBState = async () => {
  try
  {
      console.log('reseting db');
      query = await readFile('init.sql');
      await db.query(query);
      console.log('Resetted database')
  }
  catch (err)
  {
      console.log(`Error resetting database: ${err.message}`)
  }
}

app.get('/api/reset', async (req, res) => {
  try
  {
      await resetDBState()
      res.json({ result: "success" });
  }
  catch (err)
  {
      res.json({ error: err.message });
  }
})

app.get('/api/users', async (req, res) => {
  try
  {
      const result = await db.query(`SELECT * FROM users`);
      res.json({ users: result.rows });
  }
  catch (err)
  {
      return res.json({ error: err.message })
  }
})

app.post('/api/signin', async (req, res) => {
    try
  {
      console.log("signing - in")
      console.log('Got body:', req.body);
      let id = req.body.id
      let password = req.body.password
      const result = await db.query(`SELECT * FROM users WHERE user_id = ${id} AND password = '${password}' LIMIT 1`);
      if (result.rows.length == 0) throw Error('Invalid credentials.');
      let token = jwt.sign({id: id}, 'banana', {expiresIn: '1h'});
      console.log("Received token: " + token);
      res.json({
          status: true,
          user: result.rows[0],
          token: token
      });
  }
  catch (err)
  {
    console.log("failed: " + err);
      res.json({
          status: false,
          error: err.message
      });
  }
})

async function authenticated(token) {
  let response = { authenticated: false };

  let decodedJWT = jwt.decode(token);
  if(decodedJWT)
  {
      let id = decodedJWT.id;
      const result = await db.query(`SELECT * FROM users WHERE user_id = '${id}' LIMIT 1`);
      if (result.rows.length != 0)
      {
          response = { authenticated: true, user_id: id };
      }
  }
  return response;
}

app.get('/api/is_authenticated', async (req, res) => {
  try
  {
      console.log(req.cookies['token']);
      response = await authenticated(req.cookies['token']);
      res.json(response);
  }
  catch (err)
  {
      res.json({ error: err.message });
  }
})

app.post('/api/signup', async (req, res) => {
  try
  {
      let name = req.body.name
      let surname = req.body.surname
      let password = req.body.password
      let insertQuery = `
          INSERT INTO users
          (surname, name, password, is_admin, balance)
          VALUES
          ('${surname}', '${name}', '${password}', FALSE, 0)`
      const queryInsertion = await db.query(insertQuery);
      if (queryInsertion.rowCount != 1) throw Error('Failed to add new user');
      const result = await db.query(`
      SELECT * FROM users WHERE
      name = '${name}' AND
      surname = '${surname}' AND
      password = '${password}' AND
      balance = 0 AND
      is_admin = FALSE
      LIMIT 1`
      );
      if (result.rows.length != 1) throw Error('Failed to signup');
      res.json({
          status: true,
          user_id: result.rows[0].user_id
      });
  }
  catch (err)
  {
      res.json({
          status: false,
          error: err.message
      });
  }
})

app.get('/api/users/:id', async (req, res) => {
  try
  {
      const result = await db.query(`SELECT * FROM users WHERE user_id = ${req.params.id}`);
      return res.json({ users: result.rows });
  }
  catch (err)
  {
      res.json({ error: err.message });
  }
})

app.get('/api/my/user', async (req, res) => {
    try
    {
        authentication = await authenticated(req.cookies['token']);
        if(!authentication.authenticated)
            res.json({error: 'Not authenticated'});

        const result = await db.query(`SELECT * FROM users WHERE user_id = ${authentication.user_id}`);
        return res.json({ users: result.rows });
    }
    catch (err)
    {
        res.json({ error: err.message });
    }
})

app.get('/api/my/transactions', async (req, res) => {
    try
    {
        authentication = await authenticated(req.cookies['token']);
        if(!authentication.authenticated)
            res.json({error: 'Not authenticated'});

        const result = await db.query(`SELECT * FROM transactions WHERE from_user_id = ${authentication.user_id} OR to_user_id = ${authentication.user_id};`)
        return res.json({ transactions: result.rows });
    }
    catch (err)
    {
        res.json({ error: err.message });
    }
})

// Transfer money from user_id X to user_id Y. Usage:
// http://localhost:3000/transfer_money?to=1&amount=100&reference=<REFERENCE>
app.get('/api/transfer_money/', async (req, res) => {
  try
  {
      let from_user_id;
      let auth = await authenticated(req.cookies['token']);
      if(auth.authenticated) {
          from_user_id = auth.user_id;
      }
      else
      {
          console.log("Someone attempts to transfer money without being authenticated.");
          console.log("Using from field");
          from_user_id = req.query.from;
      }
      let to_user_id = req.query.to;
      let amount = req.query.amount;
      let reference = req.query.reference;

      let message = `Transfering ${amount} money from ${from_user_id} to ${to_user_id}. Reference: ${reference}`;
      console.log(message);
      await transactions.transfer_money(db, from_user_id, to_user_id, amount, reference)
          .catch(e => console.error(e.stack));

      return res.json({ message: message });
  }
  catch (err)
  {
      res.json({ error: err.message })
  }
})

// Returns all ingoing and outgoing transactions for a user_id
app.get('/api/transactions/:id', async (req, res) => {
  try
  {
      const result = await db.query(`SELECT * FROM transactions WHERE from_user_id = ${req.params.id} OR to_user_id = ${req.params.id};`)
      return res.json({ transactions: result.rows });
  }
  catch (err)
  {
      res.json({ error: err.message });
  }
})

app.get('/api/transactions/from/:from/to/:to', async (req, res) => {
  try
  {
      const result = await db.query(`SELECT * FROM transactions WHERE from_user_id = ${req.params.from} AND to_user_id = ${req.params.to}`);
      return res.json({ transactions: result.rows });
  }
  catch (err)
  {
      res.json({ error: err.message });
  }
})



app.use(morgan('short'));
app.use(express.json());
app.use(session({
  genid: (req) => {
      const id = uuidv4();// use UUIDs for session IDs
      console.log(`Generated session: ${id}`)
      return id;
  },
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}))
app.use(helmet());

let server;
module.exports = {
  start(port) {
    server = app.listen(port, () => {
      resetDBState();
      console.log(`App started on port ${port}`);
    });
    return app;
  },
  stop() {
    server.close();
  }
};