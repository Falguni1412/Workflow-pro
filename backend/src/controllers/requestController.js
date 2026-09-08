const {
  Request,
  Workflow,
  WorkflowStep,
  Approval,
  User,
  Role,
  Department,
  Comment,
  Attachment,
  Notification,
  AuditLog
} = require('../models');
const { Op } = require('sequelize');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// Helper to trigger notifications via DB and call workflow service webhook
const createSystemNotification = async (userId, title, message, type = 'In-App') => {
  try {
    const notif = await Notification.create({
      userId,
      title,
      message,
      type,
      isRead: false
    });

    // In docker environment or local environment, we try to call the FastAPI webhook to notify websocket clients
    const axios = require('axios');
    const workflowServiceUrl = process.env.WORKFLOW_SERVICE_URL || 'http://localhost:8000';
    
    // Non-blocking fire-and-forget notification update call
    axios.post(`${workflowServiceUrl}/api/notify`, {
      userId,
      title,
      message,
      notificationId: notif.id
    }).catch(e => console.log('FastAPI WS update notification bypassed or service down.'));
    
    return notif;
  } catch (error) {
    console.error('Failed to create system notification:', error);
  }
};

// Helper to find the appropriate user ID for a role-based approval step
const resolveApproverId = async (submitter, roleId) => {
  if (roleId === 2) {
    // Role 2 is Manager. Check submitter's direct manager
    if (submitter.managerId) {
      return submitter.managerId;
    }
    // Submitter has no direct manager. Fallback to department manager
    if (submitter.departmentId) {
      const dept = await Department.findByPk(submitter.departmentId);
      if (dept && dept.managerId) {
        return dept.managerId;
      }
    }
    // Fallback: Find any manager in the department
    const deptManager = await User.findOne({
      where: { roleId: 2, departmentId: submitter.departmentId }
    });
    if (deptManager) return deptManager.id;
  }

  // For generic roles (HR, Finance), we do not hardcode a single user.
  // Instead, the request sits in the role queue and can be claimed by any user with that role.
  return null;
};

// @desc    Submit a new approval request
// @route   POST /api/requests
// @access  Private
const createRequest = async (req, res, next) => {
  const transaction = await Request.sequelize.transaction();
  try {
    const { type, title, description, details } = req.body;

    if (!type || !title) {
      res.status(400);
      throw new Error('Type and title are required fields');
    }

    // Find active workflow for this request type
    const workflow = await Workflow.findOne({
      where: { triggerType: type, isActive: true },
      include: [{ model: WorkflowStep, as: 'steps', order: [['stepNumber', 'ASC']] }],
      transaction
    });

    if (!workflow || !workflow.steps || workflow.steps.length === 0) {
      res.status(400);
      throw new Error(`No active approval workflow defined for request type: ${type}`);
    }

    // Submitter profile
    const submitter = await User.findByPk(req.user.id, { transaction });

    // Create the Request
    const request = await Request.create({
      userId: req.user.id,
      workflowId: workflow.id,
      type,
      title,
      description,
      details: details || {},
      status: 'Pending',
      currentStepNumber: 1
    }, { transaction });

    // Resolve approver for step 1
    const firstStep = workflow.steps[0];
    const initialApproverId = firstStep.approverUserId || 
      await resolveApproverId(submitter, firstStep.approverRoleId);

    // Create initial pending approval step record
    await Approval.create({
      requestId: request.id,
      stepNumber: 1,
      approverId: initialApproverId, // Can be null if it is a general pool (e.g. HR / Finance queue)
      status: 'Pending'
    }, { transaction });

    await transaction.commit();

    // Audit logs
    await AuditLog.create({
      userId: req.user.id,
      action: 'REQUEST_SUBMITTED',
      entityType: 'Request',
      entityId: request.id,
      ipAddress: req.ip,
      details: { title, type }
    });

    // Notify Approvers
    if (initialApproverId) {
      await createSystemNotification(
        initialApproverId,
        'New Approval Pending',
        `A new ${type} request "${title}" submitted by ${submitter.name} requires your approval.`
      );
    } else {
      // Find all users with this role to notify
      const groupApprovers = await User.findAll({ where: { roleId: firstStep.approverRoleId, status: 'Active' } });
      for (const approver of groupApprovers) {
        await createSystemNotification(
          approver.id,
          'New Pool Approval Request',
          `A new ${type} request "${title}" requires your department's approval.`
        );
      }
    }

    res.status(201).json(request);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// @desc    Get requests list based on user role and filters
// @route   GET /api/requests
// @access  Private
const getRequests = async (req, res, next) => {
  try {
    const { status, type, filter } = req.query;
    const userRole = req.user.role.name;
    const userId = req.user.id;
    const roleId = req.user.roleId;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (type) whereClause.type = type;

    let includeModels = [
      { model: User, as: 'employee', attributes: ['id', 'name', 'email', 'departmentId'] },
      { model: Approval, as: 'approvals', include: [{ model: User, as: 'approver', attributes: ['name'] }] }
    ];

    let requests = [];

    // Filter logic
    // 1. Employee: Can only view their own requests
    if (filter === 'submitted' || userRole === 'Employee') {
      whereClause.userId = userId;
      requests = await Request.findAll({
        where: whereClause,
        include: includeModels,
        order: [['createdAt', 'DESC']]
      });
    }
    // 2. Approver Queues (Manager, HR, Finance)
    else if (filter === 'pending') {
      // A request is pending approval for this user if:
      // - Submitter's workflow current step matches a pending approval record
      // - And: The approval record designates this specific user as approver, OR (approver is null AND the step matches user's Role)
      const approvalPendingConditions = {
        status: 'Pending'
      };

      if (userRole === 'Manager') {
        // Manager checks requests where they are explicit approver
        approvalPendingConditions.approverId = userId;
      } else {
        // HR or Finance or Admin check their explicit id OR general role matches where approverId is null
        approvalPendingConditions[Op.or] = [
          { approverId: userId },
          {
            approverId: null,
            '$request.workflow.steps.approver_role_id$': roleId
          }
        ];
      }

      requests = await Request.findAll({
        where: whereClause,
        include: [
          ...includeModels,
          {
            model: Workflow,
            as: 'workflow',
            required: true,
            include: [{
              model: WorkflowStep,
              as: 'steps',
              required: true
            }]
          },
          {
            model: Approval,
            as: 'approvals',
            where: approvalPendingConditions,
            required: true
          }
        ],
        order: [['createdAt', 'ASC']]
      });
    }
    // 3. Admin / Super Admin or fallback (get all)
    else {
      // HR/Finance can view requests related to their access roles
      if (userRole === 'HR' || userRole === 'Finance') {
        // HR & Finance can view all requests
        requests = await Request.findAll({
          where: whereClause,
          include: includeModels,
          order: [['createdAt', 'DESC']]
        });
      } else if (userRole === 'Super Admin' || userRole === 'Admin') {
        requests = await Request.findAll({
          where: whereClause,
          include: includeModels,
          order: [['createdAt', 'DESC']]
        });
      } else {
        // Default Manager can view requests submitted by their subordinates or assigned approvals history
        const subordinates = await User.findAll({ where: { managerId: userId }, attributes: ['id'] });
        const subIds = subordinates.map(s => s.id);
        
        requests = await Request.findAll({
          where: {
            [Op.or]: [
              { userId: userId },
              { userId: { [Op.in]: subIds } },
              { '$approvals.approver_id$': userId }
            ]
          },
          include: includeModels,
          order: [['createdAt', 'DESC']]
        });
      }
    }

    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// @desc    Get request details by ID
// @route   GET /api/requests/:id
// @access  Private
const getRequestById = async (req, res, next) => {
  try {
    const request = await Request.findByPk(req.params.id, {
      include: [
        { model: User, as: 'employee', attributes: ['id', 'name', 'email', 'departmentId'], include: [{ model: Department, as: 'department' }] },
        { model: Approval, as: 'approvals', include: [{ model: User, as: 'approver', attributes: ['id', 'name', 'email'] }] },
        { model: Comment, as: 'comments', include: [{ model: User, as: 'author', attributes: ['id', 'name'] }] },
        { model: Attachment, as: 'attachments' },
        {
          model: Workflow,
          as: 'workflow',
          include: [{ model: WorkflowStep, as: 'steps', include: [{ model: Role, as: 'approverRole', attributes: ['name'] }] }]
        }
      ]
    });

    if (!request) {
      res.status(404);
      throw new Error('Request not found');
    }

    // Verify view permission
    const userRole = req.user.role.name;
    if (userRole === 'Employee' && request.userId !== req.user.id) {
      res.status(403);
      throw new Error('Access to request details is forbidden');
    }

    res.json(request);
  } catch (error) {
    next(error);
  }
};

// @desc    Action (Approve, Reject, Send Back) a request
// @route   POST /api/requests/:id/action
// @access  Private
const actionRequest = async (req, res, next) => {
  const transaction = await Request.sequelize.transaction();
  try {
    const { action, comments } = req.body; // 'Approved', 'Rejected', 'Sent_Back'
    const requestId = req.params.id;

    if (!['Approved', 'Rejected', 'Sent_Back'].includes(action)) {
      res.status(400);
      throw new Error('Invalid action. Must be Approved, Rejected, or Sent_Back');
    }

    const request = await Request.findByPk(requestId, {
      include: [
        { model: User, as: 'employee' },
        { model: Workflow, as: 'workflow', include: [{ model: WorkflowStep, as: 'steps', order: [['stepNumber', 'ASC']] }] }
      ],
      transaction
    });

    if (!request) {
      res.status(404);
      throw new Error('Request not found');
    }

    if (request.status !== 'Pending') {
      res.status(400);
      throw new Error('Request has already been finalized or is not pending approval');
    }

    // Find the active pending approval record for this step
    const currentStep = request.currentStepNumber;
    const approvalStep = await Approval.findOne({
      where: {
        requestId,
        stepNumber: currentStep,
        status: 'Pending'
      },
      transaction
    });

    if (!approvalStep) {
      res.status(400);
      throw new Error('No pending approval step matches this request current state');
    }

    // Check authorization:
    // User can action if they are explicit approver OR if approverId is null and they carry the required step role
    const workflowStepDef = request.workflow.steps.find(s => s.stepNumber === currentStep);
    if (!workflowStepDef) {
      res.status(500);
      throw new Error('Corresponding workflow step definition is missing');
    }

    const isExplicitApprover = approvalStep.approverId === req.user.id;
    const isRoleApprover = approvalStep.approverId === null && req.user.roleId === workflowStepDef.approverRoleId;

    if (!isExplicitApprover && !isRoleApprover && req.user.role.name !== 'Super Admin') {
      res.status(403);
      throw new Error('You are not authorized to approve this request step');
    }

    // Update approval step record
    await approvalStep.update({
      approverId: req.user.id, // Assign user id if it was claimed from pool
      status: action,
      comments: comments || '',
      actionedAt: new Date()
    }, { transaction });

    // Audit logs entry
    await AuditLog.create({
      userId: req.user.id,
      action: `REQUEST_${action.toUpperCase()}`,
      entityType: 'Request',
      entityId: request.id,
      ipAddress: req.ip,
      details: { stepNumber: currentStep, comments }
    }, { transaction });

    // Handle Workflow State Transitions
    if (action === 'Rejected') {
      // Terminate immediately
      await request.update({ status: 'Rejected' }, { transaction });
      await transaction.commit();

      await createSystemNotification(
        request.userId,
        'Request Rejected',
        `Your request "${request.title}" has been rejected at Step ${currentStep} by ${req.user.name}.`
      );
    } 
    else if (action === 'Sent_Back') {
      // Sent Back to employee to edit and resubmit
      await request.update({ status: 'Sent_Back' }, { transaction });
      await transaction.commit();

      await createSystemNotification(
        request.userId,
        'Request Sent Back',
        `Your request "${request.title}" was sent back for review by ${req.user.name}. Comment: "${comments}"`
      );
    } 
    else if (action === 'Approved') {
      const nextStepNum = currentStep + 1;
      const nextStepDef = request.workflow.steps.find(s => s.stepNumber === nextStepNum);

      if (nextStepDef) {
        // Move to next step
        await request.update({ currentStepNumber: nextStepNum }, { transaction });

        // Resolve approver for next step
        const nextApproverId = nextStepDef.approverUserId || 
          await resolveApproverId(request.employee, nextStepDef.approverRoleId);

        await Approval.create({
          requestId: request.id,
          stepNumber: nextStepNum,
          approverId: nextApproverId,
          status: 'Pending'
        }, { transaction });

        await transaction.commit();

        // Notify next approver
        if (nextApproverId) {
          await createSystemNotification(
            nextApproverId,
            'New Approval Pending',
            `Request "${request.title}" requires your step ${nextStepNum} approval.`
          );
        } else {
          const groupApprovers = await User.findAll({ where: { roleId: nextStepDef.approverRoleId, status: 'Active' } });
          for (const approver of groupApprovers) {
            await createSystemNotification(
              approver.id,
              'New Pool Approval Request',
              `Request "${request.title}" requires your department step ${nextStepNum} approval.`
            );
          }
        }
      } else {
        // No more steps. Workflow completed & Request fully approved!
        await request.update({ status: 'Approved' }, { transaction });
        await transaction.commit();

        await createSystemNotification(
          request.userId,
          'Request Approved',
          `Congratulations! Your request "${request.title}" has been fully approved.`
        );
      }
    }

    res.json({ message: `Request successfully actioned: ${action}`, status: action });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// @desc    Add a comment to request
// @route   POST /api/requests/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { commentText } = req.body;
    const requestId = req.params.id;

    if (!commentText) {
      res.status(400);
      throw new Error('Comment text cannot be empty');
    }

    const request = await Request.findByPk(requestId);
    if (!request) {
      res.status(404);
      throw new Error('Request not found');
    }

    const comment = await Comment.create({
      requestId,
      userId: req.user.id,
      commentText
    });

    const fullComment = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['name'] }]
    });

    // Notify submitter if comment is from somebody else, or notify active approvers if from submitter
    if (req.user.id !== request.userId) {
      await createSystemNotification(
        request.userId,
        'New Comment Added',
        `A comment was added on your request "${request.title}" by ${req.user.name}: "${commentText.substring(0, 50)}..."`
      );
    }

    res.status(201).json(fullComment);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload attachments to request
// @route   POST /api/requests/:id/attachments
// @access  Private
const uploadAttachment = async (req, res, next) => {
  try {
    const requestId = req.params.id;
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }

    const request = await Request.findByPk(requestId);
    if (!request) {
      res.status(404);
      throw new Error('Request not found');
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const attachment = await Attachment.create({
      requestId,
      fileName: req.file.originalname,
      filePath: fileUrl,
      fileType: req.file.mimetype,
      uploadedBy: req.user.id
    });

    res.status(201).json(attachment);
  } catch (error) {
    next(error);
  }
};

// @desc    Retrieve statistics dashboard metrics
// @route   GET /api/requests/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role.name;
    const roleId = req.user.roleId;

    let stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      recentRequests: [],
      recentActivities: []
    };

    if (userRole === 'Employee') {
      stats.pending = await Request.count({ where: { userId, status: 'Pending' } });
      stats.approved = await Request.count({ where: { userId, status: 'Approved' } });
      stats.rejected = await Request.count({ where: { userId, status: 'Rejected' } });
      
      stats.recentRequests = await Request.findAll({
        where: { userId },
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [{ model: User, as: 'employee', attributes: ['name'] }]
      });
    } else {
      // Managers, HR, Finance, Admin see global stats or department specific stats
      stats.pending = await Request.count({ where: { status: 'Pending' } });
      stats.approved = await Request.count({ where: { status: 'Approved' } });
      stats.rejected = await Request.count({ where: { status: 'Rejected' } });

      stats.recentRequests = await Request.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [{ model: User, as: 'employee', attributes: ['name'] }]
      });
    }

    // Fetch recent activities from Audit logs
    stats.recentActivities = await AuditLog.findAll({
      limit: 6,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
    });

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

// @desc    Export financial audit reports as Excel worksheet binary
// @route   GET /api/requests/reports/export
// @access  Private/Finance
const exportFinanceReport = async (req, res, next) => {
  try {
    const requests = await Request.findAll({
      include: [
        { model: User, as: 'employee', attributes: ['name', 'email'] },
        { model: Approval, as: 'approvals', include: [{ model: User, as: 'approver', attributes: ['name'] }] }
      ]
    });

    const data = requests.map(r => ({
      ID: r.id,
      Employee: r.employee ? r.employee.name : 'Unknown',
      Email: r.employee ? r.employee.email : 'N/A',
      Title: r.title,
      Type: r.type,
      Status: r.status,
      'Current Step': r.currentStepNumber,
      'Submission Date': r.createdAt.toISOString().split('T')[0]
    }));

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Requests Export');

    // Create temp path
    const tempDir = path.join(__dirname, '../../scratch');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempPath = path.join(tempDir, `finance_report_${Date.now()}.xlsx`);
    xlsx.writeFile(workbook, tempPath);

    res.download(tempPath, 'finance_report.xlsx', (err) => {
      // Clean up local temp file after transfer completes
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  actionRequest,
  addComment,
  uploadAttachment,
  getDashboardStats,
  exportFinanceReport
};
