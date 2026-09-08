const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_12345');

      // Get user from token and attach to request
      req.user = await User.findByPk(decoded.id, {
        include: [
          { model: Role, as: 'role' }
        ]
      });

      if (!req.user) {
        return res.status(401).json({ message: 'User not found in system' });
      }

      if (req.user.status === 'Suspended') {
        return res.status(403).json({ message: 'Your account is suspended' });
      }

      next();
    } catch (error) {
      console.error('Token authentication failure:', error);
      res.status(401).json({ message: 'Not authorized, token validation failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, token is missing' });
  }
};

module.exports = { protect };
