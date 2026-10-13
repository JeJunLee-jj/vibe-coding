const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./src/config');
const portfolioRoutes = require('./src/routes/portfolioRoutes');
const healthRoutes = require('./src/routes/healthRoutes');
const externalRoutes = require('./src/routes/externalRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// Supabase 모드(기본)인데 접속 정보가 없으면 시작 단계에서 분명하게 알려 준다.
if (process.env.NODE_ENV !== 'test' && config.dbType === 'supabase') {
  const missing = [
    ['SUPABASE_URL', config.supabaseUrl],
    ['SUPABASE_ANON_KEY', config.supabaseAnonKey],
    ['SUPABASE_SERVICE_ROLE_KEY', config.supabaseServiceKey]
  ].filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    console.error(`\n[설정 오류] DB_TYPE=supabase 인데 다음 값이 비어 있습니다: ${missing.join(', ')}`);
    console.error('backend/.env (Render 는 Environment 탭)에 값을 넣어 주세요. 파일 데이터로 임시 실행하려면 DB_TYPE=file 로 설정하세요.\n');
    process.exit(1);
  }
}

const app = express();

// Render 같은 호스팅은 앞단에 프록시가 있어 모든 요청이 같은 주소로 보인다.
// TRUST_PROXY=1 이면 프록시가 알려 준 실제 방문자 IP를 사용한다. (로컬에서는 꺼 둠: 헤더 위조 방지)
if (process.env.TRUST_PROXY) app.set('trust proxy', parseInt(process.env.TRUST_PROXY, 10) || 1);

// 미들웨어
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(express.json({ limit: '1mb' }));

// 기본 보안 헤더
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'no-referrer');
  next();
});

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

// 관리자 화면이 메인 포트폴리오와 같은 디자인을 쓰도록 공용 CSS 한 개만 제공한다.
// (저장소 루트 폴더 전체를 공개하지 않는다: .env, data 등이 노출되면 안 됨)
app.get('/style.css', (req, res) => res.sendFile(path.resolve(__dirname, '../style.css')));

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
