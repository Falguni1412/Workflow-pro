const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkflowStep = sequelize.define('WorkflowStep', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  workflowId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'workflow_id'
  },
  stepNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'step_number'
  },
  approverRoleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'approver_role_id'
  },
  approverUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'approver_user_id'
  },
  slaHours: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 24,
    field: 'sla_hours'
  }
}, {
  tableName: 'workflow_steps',
  indexes: [
    {
      unique: true,
      fields: ['workflow_id', 'step_number']
    }
  ]
});

module.exports = WorkflowStep;
