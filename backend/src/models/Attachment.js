const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attachment = sequelize.define('Attachment', {
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
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'file_name'
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'file_path'
  },
  fileType: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'file_type'
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'uploaded_by'
  }
}, {
  tableName: 'attachments'
});

module.exports = Attachment;
