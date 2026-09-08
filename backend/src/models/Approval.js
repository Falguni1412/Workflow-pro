const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Approval = sequelize.define('Approval', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  requestId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'request_id'
  },
  stepNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'step_number'
  },
  approverId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'approver_id'
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Sent_Back'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  actionedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'actioned_at'
  }
}, {
  tableName: 'approvals'
});

module.exports = Approval;
