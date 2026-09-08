const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  createRequest,
  getRequests,
  getRequestById,
  actionRequest,
  addComment,
  uploadAttachment,
  getDashboardStats,
  exportFinanceReport
} = require('../controllers/requestController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

// Configure Multer Storage for Uploads
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Limit 10MB
});

router.get('/dashboard/stats', protect, getDashboardStats);
router.get('/reports/export', protect, authorize(['expense.verify', 'report.generate']), exportFinanceReport);

router.get('/', protect, getRequests);
router.post('/', protect, createRequest);
router.get('/:id', protect, getRequestById);
router.post('/:id/action', protect, actionRequest);
router.post('/:id/comments', protect, addComment);
router.post('/:id/attachments', protect, upload.single('attachment'), uploadAttachment);

module.exports = router;
