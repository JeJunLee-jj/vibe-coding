const portfolioRepository = require('../repositories/portfolioRepository');
const { verifyPassword, generateToken } = require('../middleware/authMiddleware');

// 로그인 시도 제한: 같은 IP에서 5번 틀리면 5분간 잠금 (무차별 대입 방지, 서버 메모리에만 보관)
const MAX_FAILS = 5;
const LOCK_MS = 5 * 60 * 1000;
const TOKEN_HOURS = 2;   // 로그인 유지 시간 (짧게 유지)
const failures = new Map();   // ip -> { count, lockedUntil }

class AdminController {
  /**
   * 관리자 로그인
   */
  async login(req, res, next) {
    try {
      const ip = req.ip;
      const rec = failures.get(ip) || { count: 0, lockedUntil: 0 };
      if (rec.lockedUntil > Date.now()) {
        const min = Math.ceil((rec.lockedUntil - Date.now()) / 60000);
        return res.status(429).json({
          success: false,
          message: `비밀번호를 여러 번 틀려 잠겼습니다. ${min}분 뒤에 다시 시도해 주세요.`
        });
      }

      const { password } = req.body;
      if (!password) {
        return res.status(400).json({
          success: false,
          message: '비밀번호를 입력해 주세요.'
        });
      }

      if (!verifyPassword(password)) {
        rec.count += 1;
        if (rec.count >= MAX_FAILS) { rec.lockedUntil = Date.now() + LOCK_MS; rec.count = 0; }
        failures.set(ip, rec);
        return res.status(401).json({
          success: false,
          message: '관리자 비밀번호가 일치하지 않습니다.'
        });
      }

      failures.delete(ip);
      const token = generateToken({ role: 'admin' }, TOKEN_HOURS);
      res.status(200).json({
        success: true,
        message: '관리자로 로그인되었습니다.',
        token
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * 관리자용 전체 프로젝트 목록 (초안 포함)
   */
  async getProjects(req, res, next) {
    try {
      const projects = await portfolioRepository.getProjects({ includeDrafts: true });
      res.status(200).json({
        success: true,
        count: projects.length,
        data: projects
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * 프로젝트 신규 등록
   */
  async createProject(req, res, next) {
    try {
      const { title, role, description, period, teamSize, notes, status, featured } = req.body;
      const isPublished = status === 'published';

      // [규칙 검사] 공개일 경우 참고사항(notes) 외 모든 항목 필수
      if (isPublished) {
        const missingFields = [];
        if (!title || !title.trim()) missingFields.push('제목');
        if (!role || !role.trim()) missingFields.push('내가 한 역할');
        if (!description || !description.trim()) missingFields.push('설명');
        if (!period || !period.trim()) missingFields.push('날짜(기간)');
        if (!teamSize || !String(teamSize).trim()) missingFields.push('참여인원 수');

        if (missingFields.length > 0) {
          return res.status(400).json({
            success: false,
            message: `공개 등록 시 다음 항목을 반드시 입력해야 합니다: ${missingFields.join(', ')}`
          });
        }
      }

      const newProject = await portfolioRepository.createProject({
        title: title ? title.trim() : (isPublished ? '' : '제목 없는 초안 프로젝트'),
        role: role ? role.trim() : '',
        description: description ? description.trim() : '',
        period: period ? period.trim() : '',
        teamSize: teamSize ? String(teamSize).trim() : '',
        notes: notes ? notes.trim() : '',
        status: isPublished ? 'published' : 'draft',
        featured: Boolean(featured)
      });

      res.status(201).json({
        success: true,
        message: isPublished ? '프로젝트가 공개되었습니다.' : '초안으로 저장되었습니다.',
        data: newProject
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * 프로젝트 수정
   */
  async updateProject(req, res, next) {
    try {
      const { id } = req.params;
      const { title, role, description, period, teamSize, notes, status, featured } = req.body;
      const isPublished = status === 'published';

      // [규칙 검사] 공개 전환 또는 공개 상태 수정 시 필수값 체크
      if (isPublished) {
        const missingFields = [];
        if (!title || !title.trim()) missingFields.push('제목');
        if (!role || !role.trim()) missingFields.push('내가 한 역할');
        if (!description || !description.trim()) missingFields.push('설명');
        if (!period || !period.trim()) missingFields.push('날짜(기간)');
        if (!teamSize || !String(teamSize).trim()) missingFields.push('참여인원 수');

        if (missingFields.length > 0) {
          return res.status(400).json({
            success: false,
            message: `공개 저장 시 다음 항목을 반드시 입력해야 합니다: ${missingFields.join(', ')}`
          });
        }
      }

      const updated = await portfolioRepository.updateProject(id, {
        title: title ? title.trim() : '',
        role: role ? role.trim() : '',
        description: description ? description.trim() : '',
        period: period ? period.trim() : '',
        teamSize: teamSize ? String(teamSize).trim() : '',
        notes: notes ? notes.trim() : '',
        status: isPublished ? 'published' : 'draft',
        featured: Boolean(featured)
      });

      res.status(200).json({
        success: true,
        message: isPublished ? '프로젝트가 수정 및 공개되었습니다.' : '초안으로 수정 저장되었습니다.',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * 프로젝트 삭제
   */
  async deleteProject(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await portfolioRepository.deleteProject(id);
      res.status(200).json({
        success: true,
        message: `프로젝트 '${deleted.title}'이(가) 삭제되었습니다.`,
        data: deleted
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
