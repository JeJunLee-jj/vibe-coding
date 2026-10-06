const portfolioRepository = require('../repositories/portfolioRepository');

class PortfolioService {
  constructor(repository = portfolioRepository) {
    this.repository = repository;
  }

  /**
   * 포트폴리오 전체 데이터
   */
  async getFullPortfolio() {
    return await this.repository.getPortfolio();
  }

  /**
   * 프로필 정보
   */
  async getProfile() {
    return await this.repository.getProfile();
  }

  /**
   * 프로젝트 목록
   */
  async getProjects() {
    return await this.repository.getProjects();
  }

  /**
   * 프로젝트 상세
   */
  async getProject(id) {
    const project = await this.repository.getProjectById(id);
    if (!project) {
      const error = new Error(`프로젝트를 찾을 수 없습니다: ${id}`);
      error.statusCode = 404;
      throw error;
    }
    return project;
  }

  /**
   * 핵심 지표 4개
   */
  async getMetrics() {
    return await this.repository.getMetrics();
  }

  /**
   * 기술 스택
   */
  async getStack() {
    return await this.repository.getStack();
  }

  /**
   * docs/DASHBOARD.md 4절 기준의 데이터 점검 규칙 자동 검증
   */
  async auditPortfolio() {
    const data = await this.repository.getPortfolio();
    const warnings = [];
    const info = [];

    // 1. 금지 표현 검사
    const forbiddenWords = ['엔지니어', '개발자', '풀스택', '프론트엔드 엔지니어'];
    const targets = [
      { field: 'role', val: data.role || '' },
      { field: 'lead', val: data.lead || '' },
      ...(data.summary || []).map((s, i) => ({ field: `summary[${i}].title`, val: s.title }))
    ];

    for (const t of targets) {
      for (const word of forbiddenWords) {
        if (t.val.includes(word)) {
          warnings.push({
            rule: 1,
            level: 'warning',
            message: `금지 표현 '${word}' 발견`,
            location: t.field
          });
        }
      }
    }

    // 2. 학과 명칭 검사
    if ((data.affiliation || '').includes('그린스마트시티')) {
      warnings.push({
        rule: 2,
        level: 'warning',
        message: "학과명이 '그린스마트시티'로 오기되어 있습니다. '조경학과'로 정정해야 합니다.",
        location: 'affiliation'
      });
    }

    // 3. GitHub 계정 검사
    const ghContact = (data.contacts || []).find(c => (c.href || '').includes('github.com'));
    if (ghContact && ghContact.href.includes('jejun-lee') && !ghContact.href.includes('JeJunLee-jj')) {
      warnings.push({
        rule: 3,
        level: 'warning',
        message: "존재하지 않는 GitHub 계정(jejun-lee)이 연결되어 있습니다. 'JeJunLee-jj'여야 합니다.",
        location: 'contacts'
      });
    }

    // 4. 프로젝트 빈 항목 검사
    const projects = data.projects || [];
    projects.forEach((proj, idx) => {
      const pTitle = proj.title || `프로젝트 #${idx + 1}`;
      if (!proj.role) warnings.push({ rule: 4, level: 'warning', message: `역할이 비어 있습니다.`, location: pTitle });
      if (!proj.meta || !proj.meta['사용 기술']) warnings.push({ rule: 4, level: 'warning', message: `사용 기술 메타데이터가 비어 있습니다.`, location: pTitle });

      const hasResults = (proj.sections || []).some(s => s.results && s.results.length > 0);
      if (!hasResults) {
        warnings.push({ rule: 4, level: 'warning', message: `결과 수치(results)가 비어 있습니다.`, location: pTitle });
      }
    });

    // 5. 근거 없는 기술 검사
    const allProjectTechs = new Set();
    projects.forEach(p => {
      if (p.meta && p.meta['사용 기술']) {
        p.meta['사용 기술'].split(',').map(s => s.trim().toLowerCase()).forEach(t => allProjectTechs.add(t));
      }
    });

    (data.stack || []).forEach(tier => {
      (tier.groups || []).forEach(g => {
        (g.tech || []).forEach(t => {
          const lower = t.toLowerCase();
          const matched = Array.from(allProjectTechs).some(pt => lower.includes(pt) || pt.includes(lower));
          if (!matched) {
            info.push({
              rule: 5,
              level: 'info',
              message: `스택에 기재되었으나 프로젝트 메타데이터에 직접 언급되지 않은 기술: ${t}`,
              location: `stack -> ${g.name}`
            });
          }
        });
      });
    });

    // 6. 전화번호 노출 안내
    const telContact = (data.contacts || []).find(c => (c.href || '').startsWith('tel:'));
    if (telContact) {
      info.push({
        rule: 6,
        level: 'info',
        message: `채용 담당자용 전화번호가 포함되어 있습니다 (${telContact.label}). 공개 배포 시 주의하세요.`,
        location: 'contacts'
      });
    }

    return {
      totalWarnings: warnings.length,
      totalInfo: info.length,
      warnings,
      info,
      checkedAt: new Date().toISOString()
    };
  }
}

module.exports = new PortfolioService();
