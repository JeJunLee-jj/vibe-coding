const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./src/config');
const portfolioRoutes = require('./src/routes/portfolioRoutes');
const healthRoutes = require('./src/routes/healthRoutes');
const externalRoutes = require('./src/routes/externalRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();

// 미들웨어
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// 로깅 미들웨어
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API 라우트
app.use('/api/health', healthRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/admin', adminRoutes);

// 프론트엔드 정적 파일 서빙 (통합 구동 지원)
const frontendPath = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendPath));

// 관리자 바로가기
app.get('/admin', (req, res) => res.redirect('/admin/'));

// 루트 접근 시 안내 또는 프론트엔드 인덱스로 전달
app.get('/', (req, res, next) => {
  const indexPath = path.join(frontendPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.json({
        message: '포트폴리오 백엔드 API 서버가 동작 중입니다.',
        endpoints: {
          health: '/api/health',
          portfolio: '/api/portfolio',
          profile: '/api/portfolio/profile',
          projects: '/api/portfolio/projects',
          metrics: '/api/portfolio/metrics',
          stack: '/api/portfolio/stack',
          audit: '/api/portfolio/audit'
        }
      });
    }
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `요청하신 경로를 찾을 수 없습니다: ${req.originalUrl}`
  });
});

// 글로벌 에러 핸들러
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || '서버 내부 오류가 발생했습니다.'
  });
});

// 서버 시작
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`=========================================`);
    console.log(`🚀 포트폴리오 백엔드 서버가 시작되었습니다.`);
    console.log(`📡 포트: http://localhost:${config.port}`);
    console.log(`🩺 헬스체크: http://localhost:${config.port}/api/health`);
    console.log(`📊 포트폴리오 API: http://localhost:${config.port}/api/portfolio`);
    console.log(`=========================================`);
  });
}

module.exports = app;
