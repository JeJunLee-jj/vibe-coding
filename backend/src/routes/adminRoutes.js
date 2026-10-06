const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/authMiddleware');

// 로그인 (공개 엔드포인트)
router.post('/login', adminController.login);

// 인증 확인
router.get('/me', authMiddleware, (req, res) => {
  res.status(200).json({ success: true, admin: req.admin });
});

// 프로젝트 CRUD (관리자 전용)
router.get('/projects', authMiddleware, adminController.getProjects);
router.post('/projects', authMiddleware, adminController.createProject);
router.put('/projects/:id', authMiddleware, adminController.updateProject);
router.delete('/projects/:id', authMiddleware, adminController.deleteProject);

module.exports = router;
