const { Workflow, WorkflowStep, Role, User, AuditLog } = require('../models');

// @desc    Get all workflows
// @route   GET /api/workflows
// @access  Private
const getWorkflows = async (req, res, next) => {
  try {
    const workflows = await Workflow.findAll({
      include: [
        {
          model: WorkflowStep,
          as: 'steps',
          include: [
            { model: Role, as: 'approverRole', attributes: ['id', 'name'] },
            { model: User, as: 'approverUser', attributes: ['id', 'name', 'email'] }
          ]
        }
      ],
      order: [['id', 'ASC'], [{ model: WorkflowStep, as: 'steps' }, 'stepNumber', 'ASC']]
    });
    res.json(workflows);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new workflow template with steps
// @route   POST /api/workflows
// @access  Private/Admin
const createWorkflow = async (req, res, next) => {
  const transaction = await Workflow.sequelize.transaction();
  try {
    const { name, description, triggerType, isActive, steps } = req.body;

    const existingWorkflow = await Workflow.findOne({ where: { triggerType } });
    if (existingWorkflow) {
      res.status(400);
      throw new Error(`A workflow already exists for request type: ${triggerType}`);
    }

    const workflow = await Workflow.create({
      name,
      description,
      triggerType,
      isActive: isActive !== undefined ? isActive : true
    }, { transaction });

    if (steps && steps.length > 0) {
      const stepsToCreate = steps.map((step, index) => ({
        workflowId: workflow.id,
        stepNumber: index + 1,
        approverRoleId: step.approverRoleId,
        approverUserId: step.approverUserId || null,
        slaHours: step.slaHours || 24
      }));

      await WorkflowStep.bulkCreate(stepsToCreate, { transaction });
    }

    await transaction.commit();

    await AuditLog.create({
      userId: req.user.id,
      action: 'WORKFLOW_CREATED',
      entityType: 'Workflow',
      entityId: workflow.id,
      ipAddress: req.ip,
      details: { name, triggerType, stepsCount: steps ? steps.length : 0 }
    });

    const fullWorkflow = await Workflow.findByPk(workflow.id, {
      include: [{ model: WorkflowStep, as: 'steps' }]
    });

    res.status(201).json(fullWorkflow);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// @desc    Update workflow steps and attributes
// @route   PUT /api/workflows/:id
// @access  Private/Admin
const updateWorkflow = async (req, res, next) => {
  const transaction = await Workflow.sequelize.transaction();
  try {
    const { id } = req.params;
    const { name, description, isActive, steps } = req.body;

    const workflow = await Workflow.findByPk(id, { transaction });
    if (!workflow) {
      res.status(404);
      throw new Error('Workflow template not found');
    }

    await workflow.update({
      name,
      description,
      isActive: isActive !== undefined ? isActive : workflow.isActive
    }, { transaction });

    if (steps) {
      // Reconstruct steps: delete old, create new
      await WorkflowStep.destroy({ where: { workflowId: id }, transaction });

      const stepsToCreate = steps.map((step, index) => ({
        workflowId: id,
        stepNumber: index + 1,
        approverRoleId: step.approverRoleId,
        approverUserId: step.approverUserId || null,
        slaHours: step.slaHours || 24
      }));

      await WorkflowStep.bulkCreate(stepsToCreate, { transaction });
    }

    await transaction.commit();

    await AuditLog.create({
      userId: req.user.id,
      action: 'WORKFLOW_UPDATED',
      entityType: 'Workflow',
      entityId: id,
      ipAddress: req.ip,
      details: { name, isActive, stepsCount: steps ? steps.length : 0 }
    });

    const fullWorkflow = await Workflow.findByPk(id, {
      include: [
        {
          model: WorkflowStep,
          as: 'steps',
          include: [
            { model: Role, as: 'approverRole', attributes: ['id', 'name'] },
            { model: User, as: 'approverUser', attributes: ['id', 'name', 'email'] }
          ]
        }
      ],
      order: [[{ model: WorkflowStep, as: 'steps' }, 'stepNumber', 'ASC']]
    });

    res.json(fullWorkflow);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// @desc    Delete a workflow
// @route   DELETE /api/workflows/:id
// @access  Private/Admin
const deleteWorkflow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workflow = await Workflow.findByPk(id);

    if (!workflow) {
      res.status(404);
      throw new Error('Workflow not found');
    }

    await workflow.destroy();

    await AuditLog.create({
      userId: req.user.id,
      action: 'WORKFLOW_DELETED',
      entityType: 'Workflow',
      entityId: id,
      ipAddress: req.ip,
      details: { name: workflow.name, triggerType: workflow.triggerType }
    });

    res.json({ message: 'Workflow removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkflows,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow
};
