const crypto = require('crypto');
const config = require('../config');

/**
 * 안전한 관리자 토큰 생성 (HMAC-SHA256)
 */
function generateToken(payload = { role: 'admin' }, expiresInHours = 24) {
  if (!config.adminTokenSecret) {
    throw new Error('ADMIN_TOKEN_SECRET 환경변수가 설정되지 않았습니다.');
  }

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + (expiresInHours * 3600);
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');

  const signature = crypto
    .createHmac('sha256', config.adminTokenSecret)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

/**
 * 토큰 검증
 */
function verifyToken(token) {
  if (!config.adminTokenSecret || !token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', config.adminTokenSecret)
    .update(`${header}.${body}`)
    .digest('base64url');

  // 서명 비교
  if (signature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    // 만료 시간 체크
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * 비밀번호 비교 (단방향 암호화 해시 및 타이밍 공격 방지 안전 비교)
 * 입력된 평문 비밀번호와 솔트(Salt)를 결합하여 SHA-256으로 해싱한 뒤 저장된 해시값과 비교합니다.
 * 평문 비밀번호는 코드, 파일, Git 어디에도 저장되지 않습니다.
 */
function verifyPassword(inputPassword) {
  if (!config.adminPasswordHash || !config.adminSalt || !inputPassword || typeof inputPassword !== 'string') return false;

  const calculatedHash = crypto
    .createHash('sha256')
    .update(inputPassword + config.adminSalt)
    .digest('hex');

  const bufCalculated = Buffer.from(calculatedHash);
  const bufExpected = Buffer.from(config.adminPasswordHash);

  if (bufCalculated.length !== bufExpected.length) {
    crypto.timingSafeEqual(bufCalculated, bufCalculated);
    return false;
  }
  return crypto.timingSafeEqual(bufCalculated, bufExpected);
}

/**
 * Express 인증 미들웨어
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '인증 토큰이 필요합니다. 관리자로 로그인해 주세요.'
    });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: '유효하지 않거나 만료된 인증 토큰입니다. 다시 로그인해 주세요.'
    });
  }

  req.admin = decoded;
  next();
}

module.exports = {
  generateToken,
  verifyToken,
  verifyPassword,
  authMiddleware
};
