/**
 * Database Repository Template (DB 연동 참고 템플릿)
 *
 * [나중에 실제 DB를 연결하는 방법]
 * 1. 원하는 DB 패키지를 설치합니다:
 *    - SQLite 사용 시: npm install sqlite3 sqlite
 *    - PostgreSQL 사용 시: npm install pg
 *    - MongoDB / Mongoose 사용 시: npm install mongoose
 *    - Prisma ORM 사용 시: npm install @prisma/client, npx prisma init
 *
 * 2. 아래 클래스 구조에 맞추어 쿼리를 작성합니다.
 * 3. portfolioRepository.js에서 이 클래스를 인스턴스화하여 export 하거나 교체합니다.
 */

/*
// [예시: SQLite 또는 PostgreSQL 연동 시]
class SqlDatabaseRepository {
  constructor(dbConnection) {
    this.db = dbConnection;
  }

  async getPortfolio() {
    // DB 테이블에서 프로필, 프로젝트, 스택을 JOIN 또는 개별 조회하여 결합
    const profile = await this.getProfile();
    const projects = await this.getProjects();
    const stack = await this.getStack();
    const metrics = await this.getMetrics();
    return { ...profile, projects, stack, metrics };
  }

  async getProfile() {
    // SELECT * FROM profile WHERE user_id = 1;
    return {};
  }

  async getProjects() {
    // SELECT * FROM projects ORDER BY sort_order ASC;
    return [];
  }

  async getProjectById(id) {
    // SELECT * FROM projects WHERE id = $1;
    return null;
  }

  async getMetrics() {
    // SELECT * FROM metrics;
    return [];
  }

  async getStack() {
    // SELECT * FROM stack_tiers;
    return [];
  }

  async updatePortfolio(newData) {
    // UPDATE profile SET ...
    return newData;
  }
}
*/

module.exports = {
  // SqlDatabaseRepository
};
