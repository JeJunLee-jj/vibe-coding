const portfolioService = require('../services/portfolioService');

class PortfolioController {
  /**
   * 포트폴리오 전체 데이터 반환
   */
  async getPortfolio(req, res, next) {
    try {
      const data = await portfolioService.getFullPortfolio();
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * 인물 프로필 반환
   */
  async getProfile(req, res, next) {
    try {
      const data = await portfolioService.getProfile();
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * 프로젝트 목록 반환
   */
  async getProjects(req, res, next) {
    try {
      const data = await portfolioService.getProjects();
      res.status(200).json({
        success: true,
        count: data.length,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * 단일 프로젝트 상세 조회
   */
  async getProjectById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await portfolioService.getProject(id);
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * 핵심 지표 반환
   */
  async getMetrics(req, res, next) {
    try {
      const data = await portfolioService.getMetrics();
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * 기술 스택 반환
   */
  async getStack(req, res, next) {
    try {
      const data = await portfolioService.getStack();
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * 대시보드 무결성 점검 결과
   */
  async auditPortfolio(req, res, next) {
    try {
      const auditResult = await portfolioService.auditPortfolio();
      res.status(200).json({
        success: true,
        data: auditResult
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PortfolioController();
