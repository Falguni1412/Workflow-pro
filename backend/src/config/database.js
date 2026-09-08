const { Sequelize } = require('sequelize');
require('dotenv').config();
const path = require('path');

// Use MySQL in production (Railway), SQLite for local development
let sequelize;
if (process.env.MYSQL_URL) {
  // Railway production: use MySQL
  sequelize = new Sequelize(process.env.MYSQL_URL, {
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // Local development: use SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../workflow.sqlite'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true
    }
  });
}

module.exports = sequelize;
