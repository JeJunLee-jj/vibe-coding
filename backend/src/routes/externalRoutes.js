/**
 * External Integration Routes
 *
 * [다른 프로젝트 / 외부 서비스 연동 가이드]
 * 조경 데이터 API(기상청, 공공데이터포털 GIS), GitHub 활동 내역, 또는 본인의 다른 웹 애플리케이션 데이터를
 * 프론트엔드로 전달할 때 이 라우트를 활용할 수 있습니다.
 */

const express = require('express');
const router = express.Router();

// 예시 1: 외부 GitHub 리포지토리 통계 조회 엔드포인트
router.get('/github-stats', async (req, res) => {
  try {
    // const response = await fetch('https://api.github.com/users/JeJunLee-jj/repos');
    // const repos = await response.json();
    res.status(200).json({
      success: true,
      message: '다른 프로젝트 연동 예시: GitHub 연동',
      githubUsername: 'JeJunLee-jj',
      note: '외부 프로젝트/서비스 데이터를 백엔드에서 집계하여 프론트엔드로 전달할 수 있습니다.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 예시 2: 다른 공간 분석 / 센서 프로젝트 데이터 연동 엔드포인트
router.get('/spatial-project', async (req, res) => {
  res.status(200).json({
    success: true,
    message: '공간 데이터 / IoT 센서 프로젝트 연동 엔드포인트 템플릿',
    status: 'ready'
  });
});

module.exports = router;
