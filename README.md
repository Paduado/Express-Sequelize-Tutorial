# Express + Sequelize tutorial
On this tutorial we will learn to create a Node.js web server, we will use [Express](https://expressjs.com) for managing our routes and views, and [Sequelize](https://sequelize.org) for accessing our database.

We are going to create an app that manages user tasks, we will be able to create and delete users, and to create and delete tasks for each user as well.

Some files related to the view are already created, but we will create everything else from scratch.
## Prerequisites   
* [Node.js v12](https://nodejs.org) (you can use [nvm](https://github.com/nvm-sh/nvm/blob/master/README.md#installation-and-update) if you have another version). 
 
* [SQLite3](https://www.sqlite.org/download.html) (comes preinstalled with Mac OSX).

## Table of contents

* [Installation](#installation) 
* [Writing asynchronous code](#writing-asynchronous-code)
* [Middlewares](#middlewares)
    * [About middlewares](#about-middlewares)
    * [Creating logging middleware](#creating-logging-middleware)
    * [Error middleware](#error-middleware)
* [Rendering views](#rendering-views)
    * [Template engines](#template-engines)
    * [Integrating Pug](#integrating-pug)
* [Routers](#routers)
* [Sequelize](#sequelize)
    * [Sequelize Installation](#installation)
    * [Creating models](#creating-models)
    * [Using models](#using-models)


## Installation

Run npm init command, this will create a `package.json` file, we will be prompted with some options but you can leave all de default values:
```shell script
npm init
```

Install Express module:
```shell script
npm i express
```

Create an `index.js` on the root of the project file and add the following code:
```javascript
const express = require('express');
const app = express();
const port = 3000;

//Define "public" as an static assets folder
app.use(express.static('public'));
//Parse json request's body
app.use(express.json());
//Parse url encoded request's body
app.use(express.urlencoded({ extended: false }));

// Handler for GET method on "/" path
app.get('/', (req, res, next) => {
  res.send('Hello world!');
});

app.get('/users', (req, res, next) => {
  res.send('Users view');
});


// Start application
app.listen(port, () => console.log(`App listening on port ${port}!`));
```
To start our application we just have to run:
```shell script
node index
```
This will create our application and leave it listening for events, the problem is that every time we make a change we have to restart it, which will make development pretty painful.

To avoid that we will install `nodemod`:
```shell script
npm i nodemod
```

Now we can run our app using `nodemod`, it is recommended to add a "start" script in your `package.json` file, so other users can easily run our application:
```json
"start": "nodemod index"
```

Now we can start our application using:
```shell script
npm start
```
Now the application should be running, open your web browser and go to https://localhost:3000, you should see the "Hello world!".

Also any changes in the code will reload the application automatically.

## Writing asynchronous code
### Synchronous code
Contrary to other languages where each client request results in the instantiation of a new thread or even a process, Node.js requests are run on the same thread with even shared resources.

So any code you write in your node functions must be asynchronous, otherwise if 2 requests enter at the same time, one will wait for the other one to finish.

What does asynchronous means? Basically writing non-blocking code.

And what does blocking code means? Its when the execution of your JavaScript code must wait for a non-JavaScript operation to complete.

Lets see an example:

```javascript
try {
  const files = readFiles(['file1', 'file2']);
  deleteFiles(files);
  console.log('Files deleted');
} catch(err) {
  console.error(err);
}

// Dummy implementation
function readFiles(names) {
  // Non JS-operations that take too long ...

  if(somethingBadHappened) {
    throw new Error('Something went wrong');
  } else {
    return files;
  }
}
```

At first glance code will work just fine, but there's a problem, the `readFiles` and `deleteFiles` are doing some non-js operations (like interacting with the file system in this case) and the rest of the code is waiting then for them to finish.

If we were to call that function multiple times, all operations will be done in order, and every function would have to wait for the previous one to finish.

To avoid this there are some techniques that we can use.

### Continuous passing style (callbacks) 
Consists on passing down a callback parameter to an asynchronous function call, with the code we want to run when a certain process finishes.

Two conventions to follow here:
* Callback parameter will be the last parameter when calling the asynchronous function
* Callback receives an error parameter to validate the async operation was successful, if more are needed parameters the error should be the first one  

```javascript
readFiles(['file1', 'file2'], (err, files) => {
  if(err) {
    return console.error(err);
  }
  deleteFiles(files, (err) => {
    if(err) {
      return console.error(err);
    }
    console.log('Files deleted');
  });
});
// Any code here will run right after `readFiles` is called

  
// Dummy implementation
function readFiles(names, callback) {
  // Non JS-operations that take too long ...
  if(somethingBadHappened) {
    return callback(new Error('Something went wrong'));
  }
    
  return callback(null, files);
}
```

### Event emitter
Consists in creating an observable object using the `EventEmitter` class from the `events` module.

The observable object emits events, and handlers can be attached to listen to those events:
```javascript
readFiles(['file1', 'file2'])
  .on('COMPLETE', (files) => {
    deleteFiles(files)
      .on('COMPLETE', () => {
        console.log('Files deleted')
      })
      .on('ERROR', (err) => {
        console.error(err);
      });
  })
  .on('ERROR', (err) => {
    console.error(err);
  });
// Any code here will run right after `readFiles` is called


// Dummy implementation
function readFiles(names) {
  // Non JS-operations that take too long ...
  const emitter = new EventEmitter();
  if(somethingBadHappened) {
    emitter.emit('ERROR', new Error('Something went wrong'));
  } else {
    emitter.emit('COMPLETE', files);
  }
  return emitter;
}
```

### Promises
Consists on using JavaScript Promises, promises will be resolved when an operation was successful or rejected if an error happened:

```javascript
readFiles(['file1', 'file2'])
  .then((files) => {
    return deleteFiles(files)
  })
  .then(() => {
    console.log('Files deleted')
  })
  .catch((err) => {
    console.error(err);
  });
// Any code here will run right after `readFiles` is called


// Dummy implementation
function readFiles(names) {
  return new Promise((resolve, reject) => {
    // Non JS-operations that take too long ...
    if(somethingBadHappened) {
      reject(new Error('Something went wrong'));
    } else {
      resolve(files);
    }
  })
}
``` 

Using async-await syntax we can create asynchronous code that looks pretty similar to our synchronous example:
```javascript
async function doReadFiles() {
  try {
    const files = await readFiles(['file1', 'file2']);
    await deleteFiles(files);
    console.log('Files deleted');
  } catch(err) {
    console.error(err);
  }
}
doReadFiles();
// Any code here will run right after `doReadFiles` is called
```


## Middlewares
### About middlewares
Express defines middlewares as functions that have access to the request object (req), the response object (res), and the next function in the application’s request-response cycle. The next function is a function in the Express router which, when invoked, executes the middleware succeeding the current middleware.
                               
Basically you can use middleware functions to execute logic before any request, most common use cases include:
                              
* Logging
* Authentication
* Error handling
* Parsing request's body  
* Make changes to the request and the response objects

### Creating logging middleware
Lets create some basic middleware functions to log our requests info and to log the time when the requests were made.

Add these functions in your `index.js` file:
```javascript
function logRequestInfo(req, res, next) {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
}

function logRequestTime(req, res, next) {
  console.log(`Time: ${new Date().toLocaleTimeString()}`);
  next();
}
```

Now we can add our middlewares to our app:
```javascript
app.use(logRequestInfo);
app.use(logRequestTime);
```

Middleware functions can also be added to specific routes, instead of having them for the whole app:
```javascript
app.get('/users', logRequestInfo);
app.get('/users', logRequestTime);
```
Or:
```javascript
app.get('/users', logRequestInfo, logRequestTime, (req, res, next) => {
  res.send('Users view');
});
```

### Error middleware
Error middlewares are defined the same way but with an additional `err` parameter.

They are commonly defined at the end of the middleware chain, and are called when an error is thrown synchronously, or when the `next` function is called with an error anywhere in the middleware chain:

```javascript
function onError(err, req, res, next){
  console.error(err);
  res.status(500).send(`Something went wrong: ${err.message}`);
}
```
Include the error middleware after your route definitions:
```javascript
app.use(onError);
``` 
We can verify its working by throwing an error inside any route handler, or calling `next` with an error.

## Rendering views
### Template engines
A template engine enables you to use static template files in your application. At runtime, the template engine replaces variables in a template file with actual values, and transforms the template into an HTML file sent to the client. This approach makes it easier to design an HTML page.

### Integrating Pug
Express is compatible with most popular javascript template engines, for this tutorial we are going to use [Pug](https://pugjs.org/api/getting-started.html).

First we have to install the pug engine:
```shell script
npm i pug
```

Now we will modify our `/users` handler to render a pug view, we are going to use the [users.pug](views/users.pug) file.

By inspecting the file, we can see it expects to receive an users array as input with the following format:
```javascript
const users = [
  {
    id: 1,
    name: 'First user name',
    tasks: [
      {
        title: 'Task 1',
      },
      {
        title: 'Task 2',
      },
    ],
  },
  {
    id: 2,
    name: 'Second user name',
    tasks: [
      {
        title: 'Task 3',
      },
    ],
  },
];
``` 
So lets add a dummy array in our file, and update our "/users" handler to render it inside our pug file.

We will use the `render` method inside the request object:
```javascript
const users = [
  {
    id: 1,
    name: 'First user name',
    tasks: [
      {
        title: 'Task 1',
      },
      {
        title: 'Task 2',
      },
    ],
  },
  {
    id: 2,
    name: 'Second user name',
    tasks: [
      {
        title: 'Task 3',
      },
    ],
  },
];
app.get('/users', (req, res, next) => {
  res.render('users.pug', { users });
});
```

Now when navigating to http://localhost:3000/users you should see a view with our dummy users data.

## Routers

By playing with the application you may noticed that there are some endpoints that we still need to implement for our application to fully work:
* **POST** `/users` for creating new users
* **POST** `/users/:id/delete` for deleting users
* **POST** `/users/:id/tasks` for creating new user tasks
* **POST** `/users/:id/tasks/:taskId/delete` for deleting user tasks

As you can see all endpoints start with the path `/users`, so we can group them in their on module.

The `Router` class from Express can be used to create modular, mountable route handlers. A Router instance is a complete middleware and routing system.

To do that we will create a "routes" folder, and inside of it, a `users.js` file.

Then we can then create a new router, and move our GET `/users` to be inside of it:
```javascript
const express = require('express');
const router = express.Router();

const users = [
  {
    id: 1,
    name: 'First user name',
    tasks: [
      {
        title: 'Task 1',
      },
      {
        title: 'Task 2',
      },
    ],
  },
  {
    id: 2,
    name: 'Second user name',
    tasks: [
      {
        title: 'Task 3',
      },
    ],
  },
];

router.get('/', (req, res, next) => {
  res.render('users.pug', { users });
});

module.exports = router;
```

We define the handler path as "/" because we can define our router base path when including it in our app.

We can define the rest of the handlers now:
```javascript
const express = require('express');
const router = express.Router();

const users = [
  {
    id: 1,
    name: 'First user name',
    tasks: [
      {
        title: 'Task 1',
      },
      {
        title: 'Task 2',
      },
    ],
  },
  {
    id: 2,
    name: 'Second user name',
    tasks: [
      {
        title: 'Task 3',
      },
    ],
  },
];

router.get('/', (req, res, next) => {
  res.render('users.pug', { users });
});

router.post('/', (req, res, next) => {
  res.send('Create user');
});

router.post('/:id/delete', (req, res, next) => {
  res.send('Delete user');
});

router.post('/:id/tasks', (req, res, next) => {
  res.send('Create task');
});

router.post('/:id/tasks/:taskId/delete', (req, res, next) => {
  res.send('Delete task');
});

module.exports = router;

```

Now we just need to include our router in our application, we will update our `index.js` file:
```javascript
const express = require('express');
const app = express();
const port = 3000;
// Import users router
const users = require('./routes/users');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logRequestInfo);
app.use(logRequestTime);

app.get('/', (req, res) => {
  res.redirect('users');
});

// Use it as middleware for the '/users' path
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
```

## Sequelize
### Sequelize installation
Before implementing our endpoints we will setup our database, so we don't continue working with our dummy array.

Sequelize is a promise-based ORM for Node.js that supports Postgres, MySQL, MariaDB, SQLite and Microsoft SQL Server.

We will use it to connect to SQLite.

First we need to install the sequelize library and the sqlite3 engine for node.
```shell script
npm i sequelize sqlite3
``` 

### Creating models

Now we will create a "models" folder, and a `index.js` file inside of it.

We will use sequelize to connect to our database and define our models:
```javascript
const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
});

const User = sequelize.define('user', {
  name: {
    type: Sequelize.STRING,
  },
});

const Task = sequelize.define('task', {
  title: {
    type: Sequelize.STRING,
  },
});

User.hasMany(Task);

async function dbInit() {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // Creates all tables
    console.log('Connection to database has been established successfully.');
  } catch(e) {
    console.error('Unable to connect to the database:', e);
  }
}

module.exports.User = User;
module.exports.Task = Task;
module.exports.dbInit = dbInit;
```

Import and run the init function in our index handler:
```javascript
const { dbInit } = require('./models');
dbInit();
```
Now when running the application, you should see the 'Connection to database has been established successfully.' message in the console.

### Using models
Now that we have our database configured, we can use it in out route handlers:
```javascript
const express = require('express');
const router = express.Router();
const { User, Task } = require('../models');

router.get('/', (req, res, next) => {
  User.findAll({
    include: [Task],
  })
    .then((users) => {
      res.render('users.pug', { users });
    })
    .catch(e => next(e))
});

router.post('/', async (req, res, next) => {
  // req.body contains the params sent by the client
  const { name } = req.body;
  try {
    await User.create({ name });
    res.redirect('/users');
  } catch(e) {
    next(e);
  }
});

router.post('/:id/delete', (req, res, next) => {
  res.send('Delete user');
});

router.post('/:id/tasks', (req, res, next) => {
  res.send('Create task');
});

router.post('/:id/tasks/:taskId/delete', (req, res, next) => {
  res.send('Delete task');
});

module.exports = router;

```

Try implementing the rest handlers using the models


