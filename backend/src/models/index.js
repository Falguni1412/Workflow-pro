const sequelize = require('../config/database');

const Role = require('./Role');
const Department = require('./Department');
const User = require('./User');
const Workflow = require('./Workflow');
const WorkflowStep = require('./WorkflowStep');
const Request = require('./Request');
const Approval = require('./Approval');
const Comment = require('./Comment');
const Attachment = require('./Attachment');
const Notification = require('./Notification');
const AuditLog = require('./AuditLog');

// User & Role
User.belongsTo(Role, {
  foreignKey: 'roleId',
  as: 'role'
});

Role.hasMany(User, {
  foreignKey: 'roleId',
  as: 'users'
});

// User & Department
User.belongsTo(Department, {
  foreignKey: 'departmentId',
  as: 'department'
});

Department.hasMany(User, {
  foreignKey: 'departmentId',
  as: 'members'
});

// Department Manager
Department.belongsTo(User, {
  foreignKey: 'managerId',
  as: 'manager'
});

// User Manager
User.belongsTo(User, {
  foreignKey: 'managerId',
  as: 'manager'
});

User.hasMany(User, {
  foreignKey: 'managerId',
  as: 'subordinates'
});

// Workflow & WorkflowSteps
Workflow.hasMany(WorkflowStep, {
  foreignKey: 'workflowId',
  as: 'steps',
  onDelete: 'CASCADE'
});

WorkflowStep.belongsTo(Workflow, {
  foreignKey: 'workflowId',
  as: 'workflow'
});

WorkflowStep.belongsTo(Role, {
  foreignKey: 'approverRoleId',
  as: 'approverRole'
});

WorkflowStep.belongsTo(User, {
  foreignKey: 'approverUserId',
  as: 'approverUser'
});

// Request & User / Workflow
Request.belongsTo(User, {
  foreignKey: 'userId',
  as: 'employee'
});

User.hasMany(Request, {
  foreignKey: 'userId',
  as: 'requests'
});

Request.belongsTo(Workflow, {
  foreignKey: 'workflowId',
  as: 'workflow'
});

// Request & Approvals
Request.hasMany(Approval, {
  foreignKey: 'requestId',
  as: 'approvals',
  onDelete: 'CASCADE'
});

Approval.belongsTo(Request, {
  foreignKey: 'requestId',
  as: 'request'
});

Approval.belongsTo(User, {
  foreignKey: 'approverId',
  as: 'approver'
});

User.hasMany(Approval, {
  foreignKey: 'approverId',
  as: 'actions'
});

// Request & Comments
Request.hasMany(Comment, {
  foreignKey: 'requestId',
  as: 'comments',
  onDelete: 'CASCADE'
});

Comment.belongsTo(Request, {
  foreignKey: 'requestId',
  as: 'request'
});

Comment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author'
});

User.hasMany(Comment, {
  foreignKey: 'userId',
  as: 'comments'
});

// Request & Attachments
Request.hasMany(Attachment, {
  foreignKey: 'requestId',
  as: 'attachments'
});

Attachment.belongsTo(Request, {
  foreignKey: 'requestId',
  as: 'request'
});

Attachment.belongsTo(User, {
  foreignKey: 'uploadedBy',
  as: 'uploader'
});

// User & Notifications
Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(Notification, {
  foreignKey: 'userId',
  as: 'notifications'
});

// User & AuditLogs
AuditLog.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(AuditLog, {
  foreignKey: 'userId',
  as: 'auditLogs'
});

module.exports = {
  sequelize,
  Role,
  Department,
  User,
  Workflow,
  WorkflowStep,
  Request,
  Approval,
  Comment,
  Attachment,
  Notification,
  AuditLog
};
