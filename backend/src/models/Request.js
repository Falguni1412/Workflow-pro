const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Request = sequelize.define('Request', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  workflowId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'workflow_id'
  },
  type: {
    type: DataTypes.ENUM('Leave', 'Expense', 'Travel', 'Purchase', 'Document', 'Asset'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  details: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Sent_Back'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  currentStepNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    field: 'current_step_number'
  }
}, {
  tableName: 'requests'
});

module.exports = Request;
