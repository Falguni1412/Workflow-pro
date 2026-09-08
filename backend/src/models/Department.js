const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  managerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'manager_id'
  },
  budgetLimit: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'budget_limit'
  }
}, {
  tableName: 'departments'
});

module.exports = Department;
