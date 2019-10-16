const express = require('express');
const router = express.Router();

let users = [{
  id: 1,
  name: 'Antonio',
  tasks: [],
}];

router.get('/', (req, res) => {
  res.render('users.pug', { users: users });
});

router.post('/', (req, res) => {
  const { name } = req.body;
  users.push({
    id: Math.round(Math.random() * 10),
    name,
    tasks: [],
  });
  res.redirect('users');
});

router.post('/:id/delete', (req, res) => {
  res.send('Delete user');
});

router.post('/:id/tasks', (req, res) => {
  res.send('Create task');
});

router.post('/:id/tasks/:taskId/delete', (req, res) => {
  res.send('Delete task');
});

module.exports = router;
