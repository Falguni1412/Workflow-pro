const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Workflow = sequelize.define('Workflow', {
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
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  triggerType: {
    type: DataTypes.ENUM('Leave', 'Expense', 'Travel', 'Purchase', 'Document', 'Asset'),
    allowNull: false,
    unique: true,
    field: 'trigger_type'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'workflows'
});

module.exports = Workflow;
