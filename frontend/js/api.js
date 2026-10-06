1/**
 * Portfolio API Client Module
 *
 * 프론트엔드와 백엔드를 연결하는 전용 API 통신 클라이언트입니다.
 * - 백엔드 API 서버가 켜져 있을 때: REST API (http://localhost:5000/api/...)와 통신
 * - 백엔드 API 서버가 꺼져 있거나 정적 배포일 때: 로컬 ../data/portfolio.json 파일로 자동 Fallback
 */

class PortfolioApiClient {
  constructor(baseUrl = '') {
    // baseUrl이 지정되지 않았으면 현재 호스트 기반 또는 백엔드 기본 포트 5000 시도
    if (baseUrl) {
      this.baseUrl = baseUrl;
    } else if (window.location.port === '5000') {
      this.baseUrl = '';
    } else {
      // 로컬 개발 시 백엔드가 5000번 포트에 떠 있는 경우
      this.baseUrl = 'http://localhost:5000';
    }
  }

  /**
   * 포트폴리오 전체 데이터 로드 (백엔드 API -> 실패 시 로컬 Fallback)
   */
  async getPortfolio() {
    try {
      const res = await fetch(`${this.baseUrl}/api/portfolio`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('[API Client] 백엔드 연결 실패, 로컬 JSON 데이터로 폴백합니다:', err.message);
      return await this._loadLocalFallback();
    }
  }

  /**
   * 프로젝트 목록 조회
   */
  async getProjects() {
    try {
      const res = await fetch(`${this.baseUrl}/api/portfolio/projects`, {
        signal: AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      const local = await this._loadLocalFallback();
      return local.projects || [];
    }
  }

  /**
   * 특정 프로젝트 상세 조회
   */
  async getProjectById(id) {
    try {
      const res = await fetch(`${this.baseUrl}/api/portfolio/projects/${encodeURIComponent(id)}`, {
        signal: AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      const local = await this._loadLocalFallback();
      return (local.projects || []).find(p => p.title === id) || null;
    }
  }

  /**
   * 핵심 지표 조회
   */
  async getMetrics() {
    try {
      const res = await fetch(`${this.baseUrl}/api/portfolio/metrics`, {
        signal: AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      const local = await this._loadLocalFallback();
      return local.metrics || [];
    }
  }

  /**
   * 기술 스택 조회
   */
  async getStack() {
    try {
      const res = await fetch(`${this.baseUrl}/api/portfolio/stack`, {
        signal: AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      const local = await this._loadLocalFallback();
      return local.stack || [];
    }
  }

  /**
   * 대시보드 점검 결과 조회
   */
  async audit() {
    try {
      const res = await fetch(`${this.baseUrl}/api/portfolio/audit`, {
        signal: AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('[API Client] 백엔드 점검 API 연결 실패, 로컬 점검을 진행해야 합니다.');
      return null;
    }
  }

  /**
   * 백엔드 헬스체크
   */
  async checkHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`, {
        signal: AbortSignal.timeout ? AbortSignal.timeout(1500) : undefined
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * 로컬 JSON 데이터 폴백 로더
   */
  async _loadLocalFallback() {
    const paths = [
      '../data/portfolio.json',
      '../../data/portfolio.json',
      '/data/portfolio.json',
      'data/portfolio.json'
    ];
    for (const p of paths) {
      try {
        const res = await fetch(p);
        if (res.ok) return await res.json();
      } catch { }
    }
    throw new Error('로컬 data/portfolio.json 파일을 찾을 수 없습니다.');
  }
}

// 전역 객체로 등록 (바닐라 JS 및 모듈 환경 모두 호환)
if (typeof window !== 'undefined') {
  window.portfolioApi = new PortfolioApiClient();
  window.PortfolioApiClient = PortfolioApiClient;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PortfolioApiClient;
}
