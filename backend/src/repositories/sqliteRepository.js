/**
 * SQLite Database Repository Implementation (실전 예시)
 *
 * [SQLite 연결 방법]
 * 1. 패키지 설치:
 *    cd backend
 *    npm install sqlite3 sqlite
 *
 * 2. .env 파일에 DB 설정 추가:
 *    DB_TYPE=sqlite
 *    SQLITE_PATH=./data/portfolio.db
 *
 * 3. portfolioRepository.js에서 이 클래스를 불러와 교체하면 즉시 SQLite DB로 작동합니다.
 */

const path = require('path');
// const sqlite3 = require('sqlite3');
// const { open } = require('sqlite');

class SqlitePortfolioRepository {
  constructor(dbPath) {
    this.dbPath = dbPath || path.resolve(__dirname, '../../../data/portfolio.db');
    this.db = null;
  }

  async init() {
    /*
    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });

    // 테이블 초기화
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY,
        name TEXT,
        role TEXT,
        affiliation TEXT,
        lead TEXT
      );

      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        category TEXT,
        role TEXT,
        featured INTEGER,
        period TEXT,
        tech_stack TEXT,
        kpi TEXT,
        kpi_note TEXT
      );

      CREATE TABLE IF NOT EXISTS metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        value TEXT,
        label TEXT
      );
    `);
    */
  }

  async getPortfolio() {
    // const profile = await this.db.get('SELECT * FROM profile LIMIT 1');
    // const projects = await this.db.all('SELECT * FROM projects');
    // const metrics = await this.db.all('SELECT * FROM metrics');
    // return { ...profile, projects, metrics };
    return null;
  }

  async getProjects() {
    // return await this.db.all('SELECT * FROM projects');
    return [];
  }

  async getMetrics() {
    // return await this.db.all('SELECT * FROM metrics');
    return [];
  }
}

module.exports = SqlitePortfolioRepository;
