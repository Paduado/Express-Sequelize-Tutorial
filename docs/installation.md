# Installation
```shell script
npm init
```
Follow the instructions, you can leave all the values a default.

```shell script
npm i express
```

Create an `index.js` file and add the following code
```javascript
const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('Hello world!')
});

app.listen(port, () => console.log(`App listening on port ${port}!`));
```

Add a start script to your package.json file
```json
"start": "node index.js"
```

Run the start script
```shell script
npm start
```
