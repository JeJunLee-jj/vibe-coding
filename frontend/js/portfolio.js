/**
 * Frontend Dynamic Portfolio Hydration & Binding
 *
 * 백엔드 REST API 또는 로컬 JSON에서 최신 데이터를 가져와
 * HTML DOM 요소를 동적으로 동기화합니다.
 * 관리자 페이지에서 프로젝트를 등록/수정/공개하면
 * 웹사이트 새로고침 시 화면에 즉시 반영됩니다.
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof PortfolioApiClient === 'undefined') return;

  const api = window.portfolioApi || new PortfolioApiClient();

  try {
    const isOnline = await api.checkHealth();
    renderApiBadge(isOnline);

    const data = await api.getPortfolio();
    if (data) {
      hydratePortfolio(data);
    }
  } catch (err) {
    console.warn('[Portfolio Frontend] 데이터 동적 동기화 실패:', err);
  }
});

/**
 * 하단 상태 인디케이터 및 대시보드/관리자 링크 뱃지
 */
function renderApiBadge(isOnline) {
  const badge = document.createElement('div');
  badge.id = 'backend-status-indicator';
  badge.style.cssText = `
    position: fixed;
    bottom: 18px;
    right: 18px;
    z-index: 99;
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--surface, #ffffff);
    border: 1px solid var(--line, #E2E5DF);
    padding: 6px 14px;
    border-radius: 9999px;
    font-size: 11.5px;
    font-family: "IBM Plex Mono", monospace;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  `;

  badge.innerHTML = `
    <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${isOnline ? '#38A169' : '#E53E3E'}"></span>
    <span style="color:var(--muted, #6D746C)">${isOnline ? 'API 연동' : '정적 모드'}</span>
    <span style="color:var(--line, #E2E5DF)">|</span>
    <a href="dashboard/index.html" style="color:var(--accent, #2E7D53);text-decoration:none;font-weight:600">점검 ↗</a>
    <span style="color:var(--line, #E2E5DF)">|</span>
    <a href="admin/index.html" style="color:var(--accent, #2E7D53);text-decoration:none;font-weight:600">관리자 CMS ⚙</a>
  `;
  document.body.appendChild(badge);
}

/**
 * 백엔드 데이터로 DOM 갱신
 */
function hydratePortfolio(data) {
  // 1. 프로필 & 헤더
  const whoEl = document.querySelector('header .who');
  if (whoEl && data.affiliation) whoEl.textContent = data.affiliation;

  const h1El = document.querySelector('header h1');
  if (h1El && data.name) {
    const spanEl = h1El.querySelector('span');
    h1El.childNodes[0].textContent = data.name + '\n      ';
    if (spanEl && data.role) spanEl.textContent = data.role;
  }

  // 2. 핵심 지표 (Metrics)
  if (data.metrics && Array.isArray(data.metrics)) {
    const metricBoxes = document.querySelectorAll('.metrics > div');
    data.metrics.forEach((m, idx) => {
      if (metricBoxes[idx]) {
        const vEl = metricBoxes[idx].querySelector('.v');
        const lEl = metricBoxes[idx].querySelector('.l');
        if (vEl && m.value) vEl.textContent = m.value;
        if (lEl && m.label) lEl.textContent = m.label;
      }
    });
  }

  // 3. 연락처 (Links)
  if (data.contacts && Array.isArray(data.contacts)) {
    const linksContainer = document.querySelector('header .links');
    if (linksContainer) {
      linksContainer.innerHTML = data.contacts.map(c => {
        const isExternal = c.href.startsWith('http');
        return `<a href="${c.href}" ${isExternal ? 'target="_blank" rel="noopener"' : ''}>${c.label}</a>`;
      }).join('\n      ');
    }
  }

  // 4. 프로젝트 목록 동기화 (초안 제외한 공개 프로젝트만 렌더링)
  if (data.projects && Array.isArray(data.projects)) {
    hydrateProjects(data.projects);
  }

  console.log('[Portfolio Frontend] 백엔드 데이터가 성공적으로 뷰에 바인딩되었습니다.');
}

/**
 * 관리자가 등록/수정한 최신 프로젝트들을 .cards 컨테이너에 자동 반영
 */
function hydrateProjects(projects) {
  const cardsContainer = document.querySelector('.cards');
  if (!cardsContainer) return;

  // 기본 5개 프로젝트 id 목록
  const builtInIds = ['hwadap', 'devsync', 'nexus', 'green', 'flow'];

  // 새로 추가된 프로젝트들 필터링
  const customProjects = projects.filter(p => !builtInIds.includes(p.id) && !p.featured);

  // 이미 동적으로 추가된 카드가 있다면 제거 후 재렌더링
  const existingCustomCards = cardsContainer.querySelectorAll('.card-custom');
  existingCustomCards.forEach(c => c.remove());

  // 커스텀 프로젝트 카드 추가
  customProjects.forEach(p => {
    const card = document.createElement('button');
    card.className = 'card card-custom';
    card.type = 'button';
    card.style.cursor = 'pointer';

    const pCat = p.category || (p.period ? `프로젝트 · ${p.period}` : '새 프로젝트');
    const pRole = p.role || (p.meta && p.meta['역할']) || '';
    const pDesc = p.description || (p.sections && p.sections[0]?.paragraphs?.[0]) || '';
    const pTeam = p.teamSize ? `${p.teamSize}명` : (p.meta && p.meta['참여인원']) || '';
    const pNotes = p.notes || '';

    card.innerHTML = `
      <p class="cat mono">${esc(pCat)}</p>
      <h3>${esc(p.title)}</h3>
      <p class="one">${esc(pDesc)}</p>
      <div class="chips">
        ${pRole ? `<span>${esc(pRole)}</span>` : ''}
        ${pTeam ? `<span>참여 ${esc(pTeam)}</span>` : ''}
      </div>
      <div class="foot">
        <span class="kpi">${esc(pTeam || '공개 프로젝트')}<small>${esc(p.period || '')}</small></span>
        <span class="more">자세히 보기</span>
      </div>
    `;

    // 클릭 시 프로젝트 상세 알림 모달
    card.addEventListener('click', () => {
      showProjectDetailAlert(p);
    });

    cardsContainer.appendChild(card);
  });
}

function showProjectDetailAlert(proj) {
  const desc = proj.description || (proj.sections && proj.sections[0]?.paragraphs?.[0]) || '';
  const notes = proj.notes || '';
  const period = proj.period || (proj.meta && proj.meta['기간']) || '';
  const role = proj.role || (proj.meta && proj.meta['역할']) || '';
  const team = proj.teamSize ? `${proj.teamSize}명` : (proj.meta && proj.meta['참여인원']) || '';

  alert(`[${proj.title}]\n\n• 역할: ${role}\n• 기간: ${period}\n• 인원: ${team}\n\n• 설명:\n${desc}${notes ? `\n\n• 참고사항:\n${notes}` : ''}`);
}

function esc(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
