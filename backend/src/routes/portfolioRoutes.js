const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

// 포트폴리오 전체 데이터
router.get('/', portfolioController.getPortfolio);

// 프로필 정보
router.get('/profile', portfolioController.getProfile);

// 프로젝트 목록 및 상세
router.get('/projects', portfolioController.getProjects);
router.get('/projects/:id', portfolioController.getProjectById);

// 핵심 지표
router.get('/metrics', portfolioController.getMetrics);

// 기술 스택
router.get('/stack', portfolioController.getStack);

// 대시보드 점검
router.get('/audit', portfolioController.auditPortfolio);

module.exports = router;
