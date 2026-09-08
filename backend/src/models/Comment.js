const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comment = sequelize.define('Comment', {
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  commentText: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'comment_text'
  }
}, {
  tableName: 'comments'
});

module.exports = Comment;
