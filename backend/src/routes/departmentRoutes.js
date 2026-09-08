const express = require('express');
const router = express.Router();
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

router.get('/', protect, getDepartments);
router.post('/', protect, authorize(['department.manage']), createDepartment);
router.put('/:id', protect, authorize(['department.manage']), updateDepartment);
router.delete('/:id', protect, authorize(['department.manage']), deleteDepartment);

module.exports = router;
