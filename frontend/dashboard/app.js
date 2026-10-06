/**
 * 포트폴리오 대시보드 애플리케이션
 * - 기획서: docs/DASHBOARD.md
 * - API 클라이언트: ../js/api.js
 */

document.addEventListener('DOMContentLoaded', async () => {
  const api = window.portfolioApi || new PortfolioApiClient();

  // 1. 백엔드 연결 상태 확인
  const isBackendOnline = await api.checkHealth();
  const apiStatusEl = document.getElementById('api-status');
  if (apiStatusEl) {
    apiStatusEl.innerHTML = isBackendOnline
      ? `<span class="dot online"></span> 백엔드 API 연결됨 (5000)`
      : `<span class="dot offline"></span> 로컬 정적 모드 (Fallback)`;
  }

  // 2. 포트폴리오 데이터 로드
  let data;
  try {
    data = await api.getPortfolio();
  } catch (err) {
    document.getElementById('content-area').innerHTML = `
      <div style="padding:40px;text-align:center;color:var(--status-danger)">
        데이터를 불러올 수 없습니다: ${err.message}
      </div>
    `;
    return;
  }

  // 3. 감사(Audit) 실행
  let auditResult = await api.audit();
  if (!auditResult) {
    auditResult = runLocalAudit(data);
  }

  // 4. 화면 렌더링
  renderTopTiles(data, auditResult);
  renderProjectBoard(data.projects || []);
  renderTimeline(data.projects || []);
  renderStackStatus(data.stack || [], data.projects || []);
  renderAuditResults(auditResult);
});

/* ── 3-1. 상단 상태 요약 ──────────────────────────────────── */
function renderTopTiles(data, auditResult) {
  const projects = data.projects || [];

  // 수치 지표: results[]의 총 개수
  let totalResults = 0;
  projects.forEach(p => {
    (p.sections || []).forEach(s => {
      if (s.results && Array.isArray(s.results)) {
        totalResults += s.results.length;
      }
    });
  });

  // 기술 중복 제거 개수
  const techSet = new Set();
  (data.stack || []).forEach(tier => {
    (tier.groups || []).forEach(g => {
      (g.tech || []).forEach(t => techSet.add(t));
    });
  });

  const warnCount = auditResult.totalWarnings || 0;

  document.getElementById('tile-projects').textContent = projects.length;
  document.getElementById('tile-metrics').textContent = totalResults;
  document.getElementById('tile-tech').textContent = techSet.size;

  const warnEl = document.getElementById('tile-warnings');
  warnEl.textContent = warnCount;
  warnEl.className = `tile-val mono ${warnCount === 0 ? 'tile-warn-zero' : 'tile-warn-alert'}`;
}

/* ── 3-2. 프로젝트 보드 ────────────────────────────────────── */
function renderProjectBoard(projects) {
  const container = document.getElementById('projects-board');
  container.innerHTML = '';

  const criteriaKeys = ['역할', '기간', '사용 기술', '문제 서술', '해결 단계', '결과 수치', '이미지'];

  projects.forEach((proj, idx) => {
    const card = document.createElement('div');
    card.className = `project-card ${proj.featured ? 'featured' : ''}`;

    // 채움 상태 평가
    const missing = [];
    if (!proj.role) missing.push('역할');
    if (!proj.meta || !proj.meta['기간']) missing.push('기간');
    if (!proj.meta || !proj.meta['사용 기술']) missing.push('사용 기술');

    const sections = proj.sections || [];
    const hasProblem = sections.some(s => s.paragraphs && s.paragraphs.length > 0);
    const hasSteps = sections.some(s => s.steps && s.steps.length > 0);
    const hasResults = sections.some(s => s.results && s.results.length > 0);

    if (!hasProblem) missing.push('문제 서술');
    if (!hasSteps) missing.push('해결 단계');
    if (!hasResults) missing.push('결과 수치');
    if (!proj.image && !proj.featured) missing.push('이미지'); // 대표작은 패널 있음

    const filledCount = criteriaKeys.length - missing.length;
    const pct = Math.round((filledCount / criteriaKeys.length) * 100);

    card.innerHTML = `
      <div>
        <div class="proj-meta-line mono">
          <span>${esc(proj.category || 'PROJECT')} · ${esc((proj.meta && proj.meta['기간']) || '')}</span>
          ${proj.featured ? '<span class="featured-tag">대표작</span>' : ''}
        </div>
        <div class="proj-title">${esc(proj.title)}</div>
        ${proj.card ? `
          <div class="proj-kpi-box">
            <div class="proj-kpi-val mono">${esc(proj.card.kpi || '')}</div>
            <div class="proj-kpi-note">${esc(proj.card.kpiNote || '')}</div>
          </div>
        ` : ''}
      </div>

      <div class="completeness-wrap">
        <div class="bar-header mono">
          <span>완성도</span>
          <span>${filledCount}/${criteriaKeys.length} (${pct}%)</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width:${pct}%"></div>
        </div>
        ${missing.length > 0 ? `
          <div class="chips-list">
            ${missing.map(m => `<span class="missing-chip">누락: ${esc(m)}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;

    card.addEventListener('click', () => openProjectModal(proj));
    container.appendChild(card);
  });
}

function openProjectModal(proj) {
  const modal = document.getElementById('project-modal');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');

  titleEl.textContent = proj.title;

  let html = `
    <div style="margin-bottom:18px;font-size:13px;color:var(--muted)">
      <b>역할:</b> ${esc(proj.role || '-')} | <b>기간:</b> ${esc((proj.meta && proj.meta['기간']) || '-')} | <b>기술:</b> ${esc((proj.meta && proj.meta['사용 기술']) || '-')}
    </div>
  `;

  (proj.sections || []).forEach(sec => {
    html += `
      <div class="section-item">
        <h3 style="font-size:14.5px;font-weight:600;margin-bottom:8px">
          ${esc(sec.title)}
          ${sec.ownWork ? '<span class="section-badge-own">본인 담당</span>' : ''}
        </h3>
        ${(sec.paragraphs || []).map(p => `<p style="font-size:13.5px;color:var(--ink-2);margin-bottom:6px">${esc(p)}</p>`).join('')}
        ${sec.steps && sec.steps.length > 0 ? `
          <ol style="margin-left:20px;font-size:13px;color:var(--muted);margin-bottom:8px">
            ${sec.steps.map(st => `<li>${esc(st)}</li>`).join('')}
          </ol>
        ` : ''}
        ${sec.results && sec.results.length > 0 ? `
          <div style="background:var(--accent-bg);padding:8px 12px;border-radius:6px;font-size:12.5px;color:var(--accent);font-weight:500">
            ${sec.results.map(r => `<div>✓ ${esc(r)}</div>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  });

  bodyEl.innerHTML = html;
  modal.classList.add('active');
}

/* ── 3-3. 타임라인 ────────────────────────────────────────── */
function renderTimeline(projects) {
  const container = document.getElementById('timeline-rows');
  container.innerHTML = '';

  // 기준 구간: 2024.03 ~ 2025.12 (22개월)
  const startYear = 2024, startMonth = 3;
  const totalMonths = 22;

  function toMonthIndex(str) {
    const m = str.match(/(\d{4})\.(\d{2})/);
    if (!m) return null;
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    return (y - startYear) * 12 + (mo - startMonth);
  }

  projects.forEach(p => {
    const rawPeriod = (p.meta && p.meta['기간']) || p.category || '';
    const parts = rawPeriod.split('—').map(s => s.trim());

    let fromIdx = toMonthIndex(parts[0] || '');
    let toIdx = parts[1] ? toMonthIndex(parts[1]) : fromIdx;

    if (fromIdx === null) fromIdx = 0;
    if (toIdx === null) toIdx = fromIdx + 1;
    if (toIdx < fromIdx) toIdx = fromIdx + 1;

    const leftPct = Math.max(0, Math.min(100, (fromIdx / totalMonths) * 100));
    const widthPct = Math.max(4, Math.min(100 - leftPct, ((toIdx - fromIdx + 1) / totalMonths) * 100));

    const row = document.createElement('div');
    row.className = 'timeline-item';
    row.innerHTML = `
      <div class="timeline-item-title" title="${esc(p.title)}">${esc(p.title)}</div>
      <div class="timeline-track">
        <div class="timeline-span" style="left:${leftPct}%;width:${widthPct}%" title="${esc(rawPeriod)}"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

/* ── 3-4. 기술 스택 현황 ─────────────────────────────────── */
function renderStackStatus(stack, projects) {
  const container = document.getElementById('stack-tiers');
  container.innerHTML = '';

  const allProjectTechs = new Set();
  projects.forEach(p => {
    if (p.meta && p.meta['사용 기술']) {
      p.meta['사용 기술'].split(',').map(s => s.trim().toLowerCase()).forEach(t => allProjectTechs.add(t));
    }
  });

  const unusedTechs = [];

  stack.forEach(tier => {
    const box = document.createElement('div');
    box.className = 'tier-box';

    let chipsHtml = '';
    (tier.groups || []).forEach(g => {
      (g.tech || []).forEach(t => {
        const lower = t.toLowerCase();
        const isUsed = Array.from(allProjectTechs).some(pt => lower.includes(pt) || pt.includes(lower));
        if (!isUsed) unusedTechs.push(t);

        chipsHtml += `
          <span class="tech-badge ${isUsed ? '' : 'unused'}">
            ${esc(t)}
            <small style="color:var(--muted)">${isUsed ? '✓ 사용됨' : '⚠ 미언급'}</small>
          </span>
        `;
      });
    });

    box.innerHTML = `
      <div class="tier-name">${esc(tier.tier)}</div>
      <div class="tech-chips">${chipsHtml}</div>
    `;
    container.appendChild(box);
  });

  // 미사용 기술 별도 묶음
  const unusedContainer = document.getElementById('unused-stack-box');
  if (unusedContainer) {
    if (unusedTechs.length > 0) {
      unusedContainer.innerHTML = `
        <div style="font-size:13px;font-weight:600;color:var(--status-warn);margin-bottom:8px">
          ⚠ 스택에는 기재되었으나 프로젝트 메타데이터에 직접 언급되지 않은 기술 (${unusedTechs.length}개):
        </div>
        <div class="tech-chips">
          ${unusedTechs.map(t => `<span class="tech-badge unused">${esc(t)}</span>`).join('')}
        </div>
      `;
      unusedContainer.style.display = 'block';
    } else {
      unusedContainer.style.display = 'none';
    }
  }
}

/* ── 3-5. 점검 결과 ───────────────────────────────────────── */
function renderAuditResults(auditResult) {
  const container = document.getElementById('audit-list');
  container.innerHTML = '';

  const items = [...(auditResult.warnings || []), ...(auditResult.info || [])];
  if (items.length === 0) {
    container.innerHTML = `
      <div class="audit-item" style="border-color:var(--status-ok)">
        <span class="audit-badge" style="background:var(--status-ok-bg);color:var(--status-ok)">정상</span>
        <div class="audit-content">
          <div class="audit-msg">규칙 위반 사항이 없습니다. 포트폴리오가 완전합니다.</div>
        </div>
      </div>
    `;
    return;
  }

  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'audit-item';
    el.innerHTML = `
      <span class="audit-badge ${item.level}">${item.level === 'warning' ? '경고' : '안내'}</span>
      <div class="audit-content">
        <div class="audit-msg">${esc(item.message)}</div>
        <div class="audit-loc">위치: <code>${esc(item.location || '')}</code></div>
      </div>
    `;
    container.appendChild(el);
  });
}

function runLocalAudit(data) {
  const warnings = [];
  const info = [];
  const forbiddenWords = ['엔지니어', '개발자', '풀스택', '프론트엔드 엔지니어'];

  const targets = [
    { field: 'role', val: data.role || '' },
    { field: 'lead', val: data.lead || '' },
    ...(data.summary || []).map((s, i) => ({ field: `summary[${i}].title`, val: s.title }))
  ];

  targets.forEach(t => {
    forbiddenWords.forEach(w => {
      if (t.val.includes(w)) {
        warnings.push({ level: 'warning', message: `금지 표현 '${w}' 발견`, location: t.field });
      }
    });
  });

  if ((data.affiliation || '').includes('그린스마트시티')) {
    warnings.push({ level: 'warning', message: "학과명이 '그린스마트시티'로 오기되어 있습니다. '조경학과'여야 합니다.", location: 'affiliation' });
  }

  const ghContact = (data.contacts || []).find(c => (c.href || '').includes('github.com'));
  if (ghContact && ghContact.href.includes('jejun-lee') && !ghContact.href.includes('JeJunLee-jj')) {
    warnings.push({ level: 'warning', message: "존재하지 않는 GitHub 계정(jejun-lee)입니다. 'JeJunLee-jj'여야 합니다.", location: 'contacts' });
  }

  return {
    totalWarnings: warnings.length,
    totalInfo: info.length,
    warnings,
    info
  };
}

function esc(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
