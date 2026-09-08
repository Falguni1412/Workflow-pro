const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'password_hash'
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'role_id'
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'department_id'
  },
  managerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'manager_id'
  },
  status: {
    type: DataTypes.ENUM('Active', 'Suspended'),
    allowNull: false,
    defaultValue: 'Active'
  },
  rememberToken: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'remember_token'
  }
}, {
  tableName: 'users'
});

module.exports = User;
