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

// 1. User & Role
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

// 2. User & Department
User.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Department.hasMany(User, { foreignKey: 'departmentId', as: 'members' });

// Department Manager relationship
Department.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });

// User Manager relationship
User.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });
User.hasMany(User, { foreignKey: 'managerId', as: 'subordinates' });

// 3. Workflow & WorkflowSteps
Workflow.hasMany(WorkflowStep, { foreignKey: 'workflowId', as: 'steps', onDelete: 'CASCADE' });
WorkflowStep.belongsTo(Workflow, { foreignKey: 'workflowId', as: 'workflow' });

WorkflowStep.belongsTo(Role, { foreignKey: 'approverRoleId', as: 'approverRole' });
WorkflowStep.belongsTo(User, { foreignKey: 'approverUserId', as: 'approverUser' });

// 4. Request & User / Workflow
Request.belongsTo(User, { foreignKey: 'userId', as: 'employee' });
User.hasMany(Request, { foreignKey: 'userId', as: 'requests' });

Request.belongsTo(Workflow, { foreignKey: 'workflowId', as: 'workflow' });

// 5. Request & Approvals
Request.hasMany(Approval, { foreignKey: 'requestId', as: 'approvals', onDelete: 'CASCADE' });
Approval.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });

Approval.belongsTo(User, { foreignKey: 'approverId', as: 'approver' });
User.hasMany(Approval, { foreignKey: 'approverId', as: 'actions' });

// 6. Request & Comments
Request.hasMany(Comment, { foreignKey: 'requestId', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });

Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });

// 7. Request & Attachments
Request.hasMany(Attachment, { foreignKey: 'requestId', as: 'attachments', onDelete: 'CASCADE' });
Attachment.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });

Attachment.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

// 8. User & Notifications
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

// 9. User & AuditLogs
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });

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
