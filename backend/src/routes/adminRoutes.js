const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const reservationController = require('../controllers/reservationController');
const { authMiddleware } = require('../middleware/authMiddleware');

// 관리자 응답은 브라우저·프록시에 캐시되지 않게 한다
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

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

// 방문 예약 관리 (관리자 전용)
router.get('/reservations', authMiddleware, reservationController.list);
router.post('/reservations/import', authMiddleware, reservationController.importMany);
router.patch('/reservations/:no/status', authMiddleware, reservationController.updateStatus);

module.exports = router;
