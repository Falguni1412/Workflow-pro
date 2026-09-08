const { Department, User, AuditLog } = require('../models');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      include: [
        { model: User, as: 'manager', attributes: ['id', 'name', 'email'] }
      ],
      order: [['name', 'ASC']]
    });
    res.json(departments);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private/Admin
const createDepartment = async (req, res, next) => {
  try {
    const { name, code, managerId, budgetLimit } = req.body;

    const deptExists = await Department.findOne({ where: { name } });
    if (deptExists) {
      res.status(400);
      throw new Error('Department name already exists');
    }

    const dept = await Department.create({
      name,
      code,
      managerId: managerId || null,
      budgetLimit: budgetLimit || 0.00
    });

    await AuditLog.create({
      userId: req.user.id,
      action: 'DEPARTMENT_CREATED',
      entityType: 'Department',
      entityId: dept.id,
      ipAddress: req.ip,
      details: { name, code }
    });

    res.status(201).json(dept);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private/Admin
const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, managerId, budgetLimit } = req.body;

    const dept = await Department.findByPk(id);
    if (!dept) {
      res.status(404);
      throw new Error('Department not found');
    }

    await dept.update({
      name,
      code,
      managerId: managerId || null,
      budgetLimit: budgetLimit || 0.00
    });

    await AuditLog.create({
      userId: req.user.id,
      action: 'DEPARTMENT_UPDATED',
      entityType: 'Department',
      entityId: dept.id,
      ipAddress: req.ip,
      details: { name, code, managerId, budgetLimit }
    });

    res.json(dept);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const dept = await Department.findByPk(id);
    if (!dept) {
      res.status(404);
      throw new Error('Department not found');
    }

    // Set user's department to null before deleting (or return validation error if department contains users)
    await User.update({ departmentId: null }, { where: { departmentId: id } });

    await dept.destroy();

    await AuditLog.create({
      userId: req.user.id,
      action: 'DEPARTMENT_DELETED',
      entityType: 'Department',
      entityId: id,
      ipAddress: req.ip,
      details: { name: dept.name, code: dept.code }
    });

    res.json({ message: 'Department removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
