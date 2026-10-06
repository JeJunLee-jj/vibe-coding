const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

function resolveDataPath() {
  const custom = process.env.DATA_FILE_PATH;
  const candidates = [
    custom ? path.resolve(__dirname, '../../', custom) : null,
    path.resolve(__dirname, '../../../data/portfolio.json'),
    path.resolve(process.cwd(), 'data/portfolio.json'),
    path.resolve(process.cwd(), '../data/portfolio.json')
  ].filter(Boolean);

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return c;
    }
  }
  return path.resolve(__dirname, '../../../data/portfolio.json');
}

module.exports = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  dataPath: resolveDataPath(),
  reservationsPath: process.env.RESERVATIONS_FILE_PATH
    ? path.resolve(__dirname, '../../', process.env.RESERVATIONS_FILE_PATH)
    : path.resolve(__dirname, '../../../data/reservations.json'),
  dbType: process.env.DB_TYPE || 'file',
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || '',
  adminSalt: process.env.ADMIN_SALT || '',
  adminTokenSecret: process.env.ADMIN_TOKEN_SECRET || ''
};
