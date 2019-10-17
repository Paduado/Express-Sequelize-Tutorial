const express = require('express');
const app = express();
const port = 3000;
const users = require('./routes/users');
const { dbInit } = require('./models');
dbInit();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logRequestInfo);
app.use(logRequestTime);

app.get('/', (req, res) => {
  res.redirect('users');
});

app.use('/users', users);
app.use(onError);

app.listen(port, () => console.log(`App listening on port ${port}!`));

function logRequestInfo(req, res, next) {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
}

function logRequestTime(req, res, next) {
  console.log(`Time: ${new Date().toLocaleTimeString()}`);
  next();
}

function onError(err, req, res, next) {
  console.error(err);
  res.status(500).send(`Something went wrong: ${err.message}`);
}

