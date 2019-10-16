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

module.exports = sequelize;
module.exports.User = User;
module.exports.dbInit = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch(e) {
    console.error('Unable to dbInit to the database:', e);
  }
  await sequelize.sync();
};
