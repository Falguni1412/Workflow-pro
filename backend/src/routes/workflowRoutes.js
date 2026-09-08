const express = require('express');
const router = express.Router();
const {
  getWorkflows,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow
} = require('../controllers/workflowController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

router.get('/', protect, getWorkflows);
router.post('/', protect, authorize(['system.config']), createWorkflow);
router.put('/:id', protect, authorize(['system.config']), updateWorkflow);
router.delete('/:id', protect, authorize(['system.config']), deleteWorkflow);

module.exports = router;
