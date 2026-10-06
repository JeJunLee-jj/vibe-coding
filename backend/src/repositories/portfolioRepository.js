/**
 * PortfolioRepository
 *
 * [확장 가이드]
 * 현재는 파일 기반(data/portfolio.json)으로 동작합니다.
 * 나중에 SQLite, PostgreSQL, MongoDB, Prisma 등의 데이터베이스를 연결하려면:
 * 1. 아래 메서드들의 내부 로직을 DB 쿼리(INSERT, UPDATE, DELETE, SELECT)로 변경하기만 하면 됩니다.
 * 2. 서비스나 컨트롤러, 프론트엔드 코드는 일절 수정할 필요가 없습니다.
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('../config');

class FilePortfolioRepository {
  constructor(filePath) {
    this.filePath = filePath;
    this._cachedData = null;
    this._lastMtime = 0;
  }

  /**
   * 원본 JSON 파일을 안전하게 읽어옵니다. (파일 수정 시 자동 갱신)
   */
  async _loadData() {
    try {
      const stats = await fs.stat(this.filePath);
      if (!this._cachedData || stats.mtimeMs > this._lastMtime) {
        const raw = await fs.readFile(this.filePath, 'utf-8');
        this._cachedData = JSON.parse(raw);
        this._lastMtime = stats.mtimeMs;
      }
      return this._cachedData;
    } catch (err) {
      console.error(`[Repository Error] Failed to read portfolio data from ${this.filePath}:`, err.message);
      throw new Error('포트폴리오 데이터를 불러오지 못했습니다.');
    }
  }

  /**
   * 데이터 저장
   */
  async _saveData(data) {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    this._cachedData = data;
    try {
      const stats = await fs.stat(this.filePath);
      this._lastMtime = stats.mtimeMs;
    } catch {}
    return this._cachedData;
  }

  /**
   * 포트폴리오 전체 데이터 반환 (기본값: 공개 프로젝트만)
   */
  async getPortfolio(options = { includeDrafts: false }) {
    const data = await this._loadData();
    const projects = this._filterProjects(data.projects || [], options.includeDrafts);
    return {
      ...data,
      projects
    };
  }

  /**
   * 기본 인물 정보 반환
   */
  async getProfile() {
    const data = await this._loadData();
    return {
      name: data.name,
      role: data.role,
      affiliation: data.affiliation,
      lead: data.lead,
      contacts: data.contacts,
      summary: data.summary
    };
  }

  /**
   * 핵심 지표 4개 반환
   */
  async getMetrics() {
    const data = await this._loadData();
    return data.metrics || [];
  }

  /**
   * 기술 스택 정보 반환
   */
  async getStack() {
    const data = await this._loadData();
    return data.stack || [];
  }

  /**
   * 프로젝트 목록 반환
   * @param {Object} options - { includeDrafts: boolean }
   */
  async getProjects(options = { includeDrafts: false }) {
    const data = await this._loadData();
    return this._filterProjects(data.projects || [], options.includeDrafts);
  }

  /**
   * 초안 필터링 헬퍼
   */
  _filterProjects(projects, includeDrafts) {
    if (includeDrafts) return projects;
    // status가 'draft'인 것은 일반 공개에서 제외
    return projects.filter(p => p.status !== 'draft');
  }

  /**
   * 특정 프로젝트 상세 조회 (id, index 또는 제목 기반)
   */
  async getProjectById(identifier, options = { includeDrafts: false }) {
    const data = await this._loadData();
    const projects = this._filterProjects(data.projects || [], options.includeDrafts);

    // 1. 고유 id로 검색
    let found = projects.find(p => p.id === identifier);
    if (found) return found;

    // 2. 숫자 인덱스로 검색
    const num = parseInt(identifier, 10);
    if (!isNaN(num) && projects[num]) {
      return projects[num];
    }

    // 3. 프로젝트 제목(title) 일치 검색
    found = projects.find(p =>
      p.title === identifier ||
      p.title.replace(/\s+/g, '-').toLowerCase() === identifier.toLowerCase()
    );
    return found || null;
  }

  /**
   * 프로젝트 신규 등록 (CMS용)
   */
  async createProject(projectData) {
    const data = await this._loadData();
    if (!data.projects) data.projects = [];

    const newProject = {
      id: projectData.id || `proj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: projectData.title || '',
      category: projectData.category || 'PROJECT',
      role: projectData.role || '',
      description: projectData.description || '',
      period: projectData.period || '',
      teamSize: projectData.teamSize || '',
      notes: projectData.notes || '',
      status: projectData.status === 'draft' ? 'draft' : 'published',
      featured: Boolean(projectData.featured),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      meta: {
        '기간': projectData.period || '',
        '역할': projectData.role || '',
        '참여인원': projectData.teamSize ? `${projectData.teamSize}명` : '',
        '사용 기술': projectData.techStack || projectData.meta?.['사용 기술'] || ''
      },
      sections: projectData.sections || [
        {
          title: '프로젝트 개요 및 설명',
          paragraphs: projectData.description ? [projectData.description] : [],
          results: projectData.notes ? [projectData.notes] : []
        }
      ]
    };

    // 만약 card 객체가 없다면 자동 생성
    if (!newProject.card && projectData.description) {
      newProject.card = {
        kpi: projectData.teamSize ? `참여 ${projectData.teamSize}명` : '프로젝트',
        kpiNote: projectData.description.substring(0, 30) + '...'
      };
    }

    data.projects.push(newProject);
    await this._saveData(data);
    return newProject;
  }

  /**
   * 프로젝트 수정 (CMS용)
   */
  async updateProject(identifier, updateData) {
    const data = await this._loadData();
    const projects = data.projects || [];

    // id 또는 제목으로 인덱스 찾기
    let targetIndex = projects.findIndex(p => p.id === identifier);
    if (targetIndex === -1) {
      const num = parseInt(identifier, 10);
      if (!isNaN(num) && projects[num]) targetIndex = num;
      else targetIndex = projects.findIndex(p => p.title === identifier);
    }

    if (targetIndex === -1) {
      throw new Error(`수정할 프로젝트를 찾을 수 없습니다: ${identifier}`);
    }

    const current = projects[targetIndex];
    const updated = {
      ...current,
      title: updateData.title !== undefined ? updateData.title : current.title,
      role: updateData.role !== undefined ? updateData.role : current.role,
      description: updateData.description !== undefined ? updateData.description : current.description,
      period: updateData.period !== undefined ? updateData.period : (current.period || current.meta?.['기간'] || ''),
      teamSize: updateData.teamSize !== undefined ? updateData.teamSize : current.teamSize,
      notes: updateData.notes !== undefined ? updateData.notes : current.notes,
      status: updateData.status !== undefined ? (updateData.status === 'draft' ? 'draft' : 'published') : (current.status || 'published'),
      featured: updateData.featured !== undefined ? Boolean(updateData.featured) : current.featured,
      updatedAt: new Date().toISOString()
    };

    // meta 동기화
    if (!updated.meta) updated.meta = {};
    if (updated.period) updated.meta['기간'] = updated.period;
    if (updated.role) updated.meta['역할'] = updated.role;
    if (updated.teamSize) updated.meta['참여인원'] = `${updated.teamSize}명`;

    // sections 설명 업데이트
    if (updateData.description && updated.sections && updated.sections.length > 0) {
      if (updated.sections[0].paragraphs) {
        updated.sections[0].paragraphs[0] = updateData.description;
      }
    }

    projects[targetIndex] = updated;
    data.projects = projects;
    await this._saveData(data);
    return updated;
  }

  /**
   * 프로젝트 삭제 (CMS용)
   */
  async deleteProject(identifier) {
    const data = await this._loadData();
    const projects = data.projects || [];

    let targetIndex = projects.findIndex(p => p.id === identifier);
    if (targetIndex === -1) {
      const num = parseInt(identifier, 10);
      if (!isNaN(num) && projects[num]) targetIndex = num;
      else targetIndex = projects.findIndex(p => p.title === identifier);
    }

    if (targetIndex === -1) {
      throw new Error(`삭제할 프로젝트를 찾을 수 없습니다: ${identifier}`);
    }

    const deleted = projects.splice(targetIndex, 1)[0];
    data.projects = projects;
    await this._saveData(data);
    return deleted;
  }

  /**
   * 원칙, FAQ, 푸터 정보 반환
   */
  async getExtra() {
    const data = await this._loadData();
    return {
      principles: data.principles || [],
      faq: data.faq || [],
      footer: data.footer || []
    };
  }

  /**
   * 포트폴리오 전체 수정
   */
  async updatePortfolio(newData) {
    return await this._saveData(newData);
  }
}

// 기본 Repository 인스턴스 생성 및 내보내기
const repository = new FilePortfolioRepository(config.dataPath);

module.exports = repository;
