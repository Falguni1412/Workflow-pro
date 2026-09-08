const bcrypt = require('bcryptjs');
const { User, Role, Department, AuditLog } = require('../models');

// @desc    Get all users with filters
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res, next) => {
  try {
    const { departmentId, roleId, search } = req.query;
    const whereClause = {};

    if (departmentId) {
      whereClause.departmentId = departmentId;
    }
    if (roleId) {
      whereClause.roleId = roleId;
    }

    if (search) {
      const { Op } = require('sequelize');
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['passwordHash', 'rememberToken'] },
      include: [
        { model: Role, as: 'role', attributes: ['id', 'name', 'permissions'] },
        { model: Department, as: 'department', attributes: ['id', 'name', 'code'] },
        { model: User, as: 'manager', attributes: ['id', 'name', 'email'] }
      ],
      order: [['id', 'ASC']]
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new user by Admin
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, roleId, departmentId, managerId } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      res.status(400);
      throw new Error('Email is already registered in system');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'Password123!', salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      roleId,
      departmentId: departmentId || null,
      managerId: managerId || null,
      status: 'Active'
    });

    await AuditLog.create({
      userId: req.user.id,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: user.id,
      ipAddress: req.ip,
      details: { email: user.email, roleId }
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a user details
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, roleId, departmentId, managerId, status, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const updateData = { name, email, roleId, departmentId: departmentId || null, managerId: managerId || null, status };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(password, salt);
    }

    await user.update(updateData);

    await AuditLog.create({
      userId: req.user.id,
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: user.id,
      ipAddress: req.ip,
      details: { updateData: { ...updateData, passwordHash: password ? 'UPDATED' : 'UNCHANGED' } }
    });

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend or active a user
// @route   PATCH /api/users/:id/status
// @access  Private/Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Active' or 'Suspended'

    if (!['Active', 'Suspended'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status value');
    }

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    await user.update({ status });

    await AuditLog.create({
      userId: req.user.id,
      action: status === 'Active' ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
      entityType: 'User',
      entityId: user.id,
      ipAddress: req.ip,
      details: { status }
    });

    res.json({ message: `User status changed to ${status}`, user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus
};
