const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id'
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'entity_type'
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'entity_id'
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'ip_address'
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'audit_logs',
  updatedAt: false // Audit logs are insert-only
});

module.exports = AuditLog;
