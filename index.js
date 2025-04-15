require('dotenv').config('.env');
const cors = require('cors');
const express = require('express');
const app = express();
const morgan = require('morgan');
const { PORT = 3000 } = process.env;
const { auth } = require('express-openid-connect');
// TODO - require express-openid-connect and destructure auth from it

const { User, Cupcake } = require('./db');

// middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

const {
  AUTH0_SECRET = 'a long, randomly-generated string stored in env', // generate one by using: `openssl rand -base64 32`
  AUTH0_AUDIENCE = 'http://localhost:3000',
  AUTH0_CLIENT_ID,
  AUTH0_BASE_URL,
  } = process.env;
  
  const config = {
  authRequired: true, // this is different from the documentation
  auth0Logout: true,
  secret: AUTH0_SECRET,
  baseURL: AUTH0_BASE_URL,
  clientID: AUTH0_CLIENT_ID,
  issuerBaseURL: AUTH0_AUDIENCE,
  };

  app.use(auth(config));

/* *********** YOUR CODE HERE *********** */
// follow the module instructions: destructure config environment variables from process.env
// follow the docs:
  // define the config object
  // attach Auth0 OIDC auth router
  // create a GET / route handler that sends back Logged in or Logged out

app.get('/cupcakes', async (req, res, next) => {
  try {
    const cupcakes = await Cupcake.findAll();
    res.send(cupcakes);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

app.get('/',async(req,res,next) => {
  const user = req.oidc.user;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Welcome, ${user.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 2rem; }
        .card {
          max-width: 400px;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          background: #fff;
        }
        img {
          width: 100px;
          border-radius: 50%;
          margin-bottom: 1rem;
        }
        h1 { margin: 0; }
        p { margin-top: 0.5rem; color: #555; }
      </style>
    </head>
    <body>
      <div class="card">
        <img src="${user.picture}" alt="Profile Picture">
        <h1>Welcome, ${user.name}!</h1>
        <p>Email: ${user.email}</p>
        <p>Nickname: ${user.nickname}</p>
      </div>
    </body>
    </html>
  `;

  res.send(html);


})

// error handling middleware
app.use((error, req, res, next) => {
  console.error('SERVER ERROR: ', error);
  if(res.statusCode < 400) res.status(500);
  res.send({error: error.message, name: error.name, message: error.message});
});

app.listen(PORT, () => {
  console.log(`Cupcakes are ready at http://localhost:${PORT}`);
});

