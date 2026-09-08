const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus
} = require('../controllers/userController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

router.get('/', protect, getUsers);
router.post('/', protect, authorize(['user.manage', 'employee.manage']), createUser);
router.put('/:id', protect, authorize(['user.manage', 'employee.manage']), updateUser);
router.patch('/:id/status', protect, authorize('user.manage'), toggleUserStatus);

module.exports = router;
