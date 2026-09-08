const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role, Department } = require('../models');

// Helper to generate JWT
const generateToken = (userId, rememberMe) => {
  const secret = process.env.JWT_SECRET || 'secret_key_12345';
  const expiresIn = rememberMe ? '30d' : '24h';
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, departmentId } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please fill in all mandatory fields');
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    // Default to Employee Role (id: 1)
    const defaultRole = await Role.findByPk(1);
    if (!defaultRole) {
      res.status(500);
      throw new Error('Default Employee role not initialized in system');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Default manager logic: Find department manager if department is specified
    let managerId = null;
    if (departmentId) {
      const dept = await Department.findByPk(departmentId);
      if (dept && dept.managerId) {
        managerId = dept.managerId;
      }
    }

    const user = await User.create({
      name,
      email,
      passwordHash,
      roleId: defaultRole.id,
      departmentId: departmentId || null,
      managerId,
      status: 'Active'
    });

    const token = generateToken(user.id, false);

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: defaultRole.name,
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate User & Login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [
        { model: Role, as: 'role' },
        { model: Department, as: 'department' }
      ]
    });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      if (user.status === 'Suspended') {
        res.status(403);
        throw new Error('Your account is currently suspended');
      }

      const token = generateToken(user.id, rememberMe);

      // Handle "Remember Me" token storage if needed
      if (rememberMe) {
        const rememberToken = jwt.sign({ id: user.id }, 'refresh_secret_9999', { expiresIn: '90d' });
        await user.update({ rememberToken });
      }

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        permissions: user.role.permissions,
        department: user.department ? user.department.name : null,
        departmentId: user.departmentId,
        managerId: user.managerId,
        token
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash', 'rememberToken'] },
      include: [
        { model: Role, as: 'role' },
        { model: Department, as: 'department' },
        { model: User, as: 'manager', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email address' });
    }

    // Generate token valid for 1 hour
    const secret = process.env.JWT_SECRET || 'secret_key_12345';
    const resetToken = jwt.sign({ id: user.id, action: 'RESET_PASSWORD' }, secret, { expiresIn: '1h' });

    // In a real application, you send an email. We will log the reset link to console.
    console.log(`[MOCK EMAIL DISPATCH] Password Reset Link: http://localhost/reset-password?token=${resetToken}`);

    res.json({
      message: 'Password reset link generated and dispatched (Check server logs in development)',
      resetToken // Returned for testing purposes in mock API environments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password with Token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400);
      throw new Error('Token and new password are required');
    }

    const secret = process.env.JWT_SECRET || 'secret_key_12345';
    const decoded = jwt.verify(token, secret);

    if (decoded.action !== 'RESET_PASSWORD') {
      res.status(400);
      throw new Error('Invalid reset token action context');
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      res.status(404);
      throw new Error('User account not found');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await user.update({ passwordHash });

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword
};
