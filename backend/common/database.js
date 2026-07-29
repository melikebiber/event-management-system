const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'event_management_system',
  'postgres',
  '358',
  {
    host: '::1',
    dialect: 'postgres',
    port: 5432,
    logging: false
  }
);
console.log('database.js kontrol:', {
  sequelizeType: typeof sequelize,
  defineType: typeof sequelize.define
});

module.exports = sequelize;