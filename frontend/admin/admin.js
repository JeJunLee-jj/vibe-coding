/**
 * 관리자 CMS 애플리케이션 로직
 */

const API_BASE = window.location.port === '5000' ? '' : 'http://localhost:5000';

let currentProjects = [];
let editingProjectId = null;

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initFormEvents();
});

/* ── 1. 인증 및 화면 전환 ──────────────────────────────────── */
function initAuth() {
  const token = sessionStorage.getItem('admin_token');
  if (token) {
    checkTokenValidity(token);
  } else {
    showLoginScreen();
  }

  // 로그인 폼 제출
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pwInput = document.getElementById('admin-password');
    const password = pwInput.value;

    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || '비밀번호가 일치하지 않습니다.');
      }

      sessionStorage.setItem('admin_token', data.token);
      pwInput.value = '';
      showToast('성공적으로 로그인되었습니다.');
      showAdminScreen();
      loadProjects();
    } catch (err) {
      pwInput.value = '';
      showToast(err.message, true);
    }
  });

  // 페이지를 떠나거나 뒤로가기로 복원될 때 비밀번호 입력칸에 값이 남지 않게 비움
  const clearPw = () => { document.getElementById('admin-password').value = ''; };
  window.addEventListener('pagehide', clearPw);
  window.addEventListener('pageshow', clearPw);

  // 로그아웃 버튼
  document.getElementById('btn-logout').addEventListener('click', () => {
    sessionStorage.removeItem('admin_token');
    showToast('로그아웃되었습니다.');
    showLoginScreen();
  });

  // 목록 새로고침
  document.getElementById('btn-refresh').addEventListener('click', loadProjects);
}

async function checkTokenValidity(token) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      showAdminScreen();
      loadProjects();
    } else {
      sessionStorage.removeItem('admin_token');
      showLoginScreen();
    }
  } catch {
    showLoginScreen();
  }
}

function showLoginScreen() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('admin-screen').style.display = 'none';
}

function showAdminScreen() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-screen').style.display = 'block';
}

/* ── 2. 프로젝트 목록 불러오기 및 렌더링 ───────────────────────── */
async function loadProjects() {
  const token = sessionStorage.getItem('admin_token');
  if (!token) return;

  const container = document.getElementById('projects-container');
  const summaryEl = document.getElementById('proj-summary-text');
  container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--muted)">불러오는 중...</div>';

  try {
    const res = await fetch(`${API_BASE}/api/admin/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.message || '프로젝트 목록을 불러오지 못했습니다.');
    }

    currentProjects = result.data || [];
    renderProjectsList(currentProjects);
    renderDuplicates();

    const pubCount = currentProjects.filter(p => p.status !== 'draft').length;
    const draftCount = currentProjects.filter(p => p.status === 'draft').length;
    summaryEl.textContent = `총 ${currentProjects.length}건 (공개 ${pubCount}건 · 초안 ${draftCount}건)`;
  } catch (err) {
    container.innerHTML = `<div style="padding:20px;text-align:center;color:var(--danger)">${esc(err.message)}</div>`;
  }
}

function renderProjectsList(projects) {
  const container = document.getElementById('projects-container');
  if (projects.length === 0) {
    container.innerHTML = `
      <div style="padding:32px;text-align:center;color:var(--muted)">
        등록된 프로젝트가 없습니다. 좌측에서 새 프로젝트를 등록해 보세요.
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  projects.forEach((p, idx) => {
    const isDraft = p.status === 'draft';
    const card = document.createElement('div');
    card.className = 'proj-item';
    if (isDraft) {
      card.style.borderLeft = '4px solid var(--badge-draft-text)';
    }

    const pRole = p.role || (p.meta && p.meta['역할']) || '-';
    const pPeriod = p.period || (p.meta && p.meta['기간']) || '-';
    const pTeam = p.teamSize || (p.meta && p.meta['참여인원']) || '-';
    const pDesc = p.description || (p.sections && p.sections[0]?.paragraphs?.[0]) || '';
    const pNotes = p.notes || (p.sections && p.sections[0]?.results?.[0]) || '';

    card.innerHTML = `
      <div class="proj-item-head">
        <div class="proj-item-title">${esc(p.title || '(제목 없는 초안)')}</div>
        <span class="badge ${isDraft ? 'badge-draft' : 'badge-pub'}">
          ${isDraft ? '📝 초안 (비공개)' : '🚀 공개'}
        </span>
      </div>

      <div class="proj-item-meta mono">
        <b>역할:</b> ${esc(pRole)} &nbsp;|&nbsp;
        <b>기간:</b> ${esc(pPeriod)} &nbsp;|&nbsp;
        <b>인원:</b> ${esc(pTeam)}
      </div>

      ${pDesc ? `<div class="proj-item-desc">${esc(pDesc)}</div>` : '<div style="font-size:12px;color:var(--muted);margin-bottom:8px"><i>(설명 미입력 상태)</i></div>'}

      ${pNotes ? `
        <div style="font-size:12px;color:var(--muted);margin-bottom:10px;background:var(--surface);padding:6px 10px;border-radius:4px">
          <b>참고사항:</b> ${esc(pNotes)}
        </div>
      ` : ''}

      <div class="proj-item-foot">
        <span class="mono" style="font-size:11px;color:var(--muted)">
          ${p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : ''}
        </span>
        <div class="proj-item-actions">
          <button type="button" class="btn btn-outline btn-sm btn-edit" data-id="${esc(p.id || idx)}">
            ${isDraft ? '✏ 이어서 작성' : '수정'}
          </button>
          <button type="button" class="btn btn-danger btn-sm btn-delete" data-id="${esc(p.id || idx)}" data-title="${esc(p.title || '')}">
            삭제
          </button>
        </div>
      </div>
    `;

    // 이벤트 바인딩
    card.querySelector('.btn-edit').addEventListener('click', () => startEditProject(p.id || idx));
    card.querySelector('.btn-delete').addEventListener('click', () => deleteProject(p.id || idx, p.title));

    container.appendChild(card);
  });
}

/* ── 3. 폼 상태 및 인터랙션 ─────────────────────────────────── */
function initFormEvents() {
  const chipPub = document.getElementById('chip-published');
  const chipDraft = document.getElementById('chip-draft');
  const guideText = document.getElementById('status-guide-text');
  const btnReset = document.getElementById('btn-reset-form');
  const btnCancel = document.getElementById('btn-cancel');
  const btnCloseBanner = document.getElementById('btn-banner-close');

  // 상태 라디오 선택 변경
  chipPub.querySelector('input').addEventListener('change', () => {
    chipPub.className = 'radio-chip selected-pub';
    chipDraft.className = 'radio-chip';
    guideText.innerHTML = '💡 <b>공개 상태:</b> 참고사항 외 모든 칸(제목, 역할, 설명, 날짜, 참여인원)을 채워야 메인 사이트에 게시됩니다.';
  });

  chipDraft.querySelector('input').addEventListener('change', () => {
    chipDraft.className = 'radio-chip selected-draft';
    chipPub.className = 'radio-chip';
    guideText.innerHTML = '📝 <b>초안 상태:</b> 모든 칸이 입력되지 않아도 임시저장되며, 방문자 화면에는 보이지 않습니다.';
  });

  // 배너 닫기
  if (btnCloseBanner) {
    btnCloseBanner.addEventListener('click', () => {
      document.getElementById('edit-banner').style.display = 'none';
    });
  }

  // 폼 리셋 / 취소
  btnReset.addEventListener('click', resetForm);
  btnCancel.addEventListener('click', resetForm);

  // 듀얼 액션 버튼 리스너
  // 1) 초안으로 임시저장 버튼
  document.getElementById('btn-save-draft').addEventListener('click', () => {
    saveProjectWithStatus('draft');
  });

  // 2) 사이트에 공개 저장 버튼
  document.getElementById('btn-save-publish').addEventListener('click', () => {
    saveProjectWithStatus('published');
  });
}

function startEditProject(identifier) {
  const project = currentProjects.find(p => (p.id === identifier) || (String(currentProjects.indexOf(p)) === String(identifier)));
  if (!project) return;

  editingProjectId = project.id || identifier;

  document.getElementById('edit-project-id').value = editingProjectId;
  document.getElementById('form-title').textContent = `프로젝트 수정: ${project.title || '초안'}`;
  document.getElementById('btn-reset-form').style.display = 'inline-flex';
  document.getElementById('btn-cancel').style.display = 'inline-flex';

  // 필드 채우기 (임시저장했던 내용 복원)
  document.getElementById('p-title').value = project.title || '';
  document.getElementById('p-role').value = project.role || (project.meta && project.meta['역할']) || '';
  document.getElementById('p-description').value = project.description || (project.sections && project.sections[0]?.paragraphs?.[0]) || '';
  document.getElementById('p-period').value = project.period || (project.meta && project.meta['기간']) || '';

  let team = project.teamSize || (project.meta && project.meta['참여인원']) || '';
  team = String(team).replace(/명/g, '').trim();
  document.getElementById('p-teamsize').value = team;

  document.getElementById('p-notes').value = project.notes || (project.sections && project.sections[0]?.results?.[0]) || '';

  // 상태 설정 및 배너 표시
  const isDraft = project.status === 'draft';
  const chipPub = document.getElementById('chip-published');
  const chipDraft = document.getElementById('chip-draft');
  const guideText = document.getElementById('status-guide-text');
  const banner = document.getElementById('edit-banner');
  const bannerText = document.getElementById('edit-banner-text');

  banner.style.display = 'flex';
  if (isDraft) {
    chipDraft.querySelector('input').checked = true;
    chipDraft.className = 'radio-chip selected-draft';
    chipPub.className = 'radio-chip';
    guideText.innerHTML = '📝 <b>초안 상태:</b> 모든 칸이 입력되지 않아도 임시저장되며, 방문자 화면에는 보이지 않습니다.';
    bannerText.innerHTML = `📝 <b>임시저장 초안</b>을 불러왔습니다. 내용을 이어서 작성한 뒤 [임시저장] 또는 [공개 저장]하세요.`;
  } else {
    chipPub.querySelector('input').checked = true;
    chipPub.className = 'radio-chip selected-pub';
    chipDraft.className = 'radio-chip';
    guideText.innerHTML = '💡 <b>공개 상태:</b> 참고사항 외 모든 칸(제목, 역할, 설명, 날짜, 참여인원)을 채워야 메인 사이트에 게시됩니다.';
    bannerText.innerHTML = `🚀 <b>공개 프로젝트</b>를 불러왔습니다. 수정 후 저장하면 사이트에 즉시 반영됩니다.`;
  }

  // 폼으로 부드럽게 스크롤
  document.querySelector('.editor-card').scrollIntoView({ behavior: 'smooth' });
}

function resetForm() {
  editingProjectId = null;
  document.getElementById('project-form').reset();
  document.getElementById('edit-project-id').value = '';
  document.getElementById('form-title').textContent = '새 프로젝트 등록';
  document.getElementById('btn-reset-form').style.display = 'none';
  document.getElementById('btn-cancel').style.display = 'none';
  document.getElementById('edit-banner').style.display = 'none';

  // 기본 상태를 공개로 초기화
  const chipPub = document.getElementById('chip-published');
  const chipDraft = document.getElementById('chip-draft');
  chipPub.className = 'radio-chip selected-pub';
  chipDraft.className = 'radio-chip';
  chipPub.querySelector('input').checked = true;
  document.getElementById('status-guide-text').innerHTML = '💡 <b>공개 상태:</b> 참고사항 외 모든 칸(제목, 역할, 설명, 날짜, 참여인원)을 채워야 메인 사이트에 게시됩니다.';
}

/* ── 4. 폼 제출 처리 (초안 임시저장 vs 공개 저장) ─────────────────── */
async function saveProjectWithStatus(targetStatus) {
  const token = sessionStorage.getItem('admin_token');
  if (!token) {
    showToast('로그인이 필요합니다.', true);
    showLoginScreen();
    return;
  }

  const title = document.getElementById('p-title').value.trim();
  const role = document.getElementById('p-role').value.trim();
  const description = document.getElementById('p-description').value.trim();
  const period = document.getElementById('p-period').value.trim();
  const teamSize = document.getElementById('p-teamsize').value.trim();
  const notes = document.getElementById('p-notes').value.trim();

  const isPublished = targetStatus === 'published';

  // [규칙 검사]
  if (isPublished) {
    // 공개 저장 시: 참고사항 외 모든 칸 필수!
    if (!title) {
      showToast('공개 저장 시 [프로젝트 제목]은 필수입니다.', true);
      document.getElementById('p-title').focus();
      return;
    }
    if (!role) {
      showToast('공개 저장 시 [내가 한 역할]은 필수입니다.', true);
      document.getElementById('p-role').focus();
      return;
    }
    if (!description) {
      showToast('공개 저장 시 [프로젝트 설명]은 필수입니다.', true);
      document.getElementById('p-description').focus();
      return;
    }
    if (!period) {
      showToast('공개 저장 시 [날짜 (기간)]은 필수입니다.', true);
      document.getElementById('p-period').focus();
      return;
    }
    if (!teamSize) {
      showToast('공개 저장 시 [참여인원 수]는 필수입니다.', true);
      document.getElementById('p-teamsize').focus();
      return;
    }
  } else {
    // 초안 임시저장 시: 모든 칸이 비어 있어도 됨! (제목이 없으면 자동 부여)
    if (!title && !role && !description) {
      showToast('최소한 한 글자 이상 입력 후 임시저장해 주세요.', true);
      document.getElementById('p-title').focus();
      return;
    }
  }

  const payload = {
    title: title || (isPublished ? '' : '임시저장 초안 (' + new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) + ')'),
    role,
    description,
    period,
    teamSize,
    notes,
    status: isPublished ? 'published' : 'draft'
  };

  const isEditing = Boolean(editingProjectId);

  // 같은 제목의 프로젝트가 이미 있으면 한 번 더 확인
  const sameTitle = currentProjects.find(p => p.id !== editingProjectId && isRealTitle(p.title) && isRealTitle(title) && normTitle(p.title) === normTitle(title));
  if (sameTitle && !confirm(`"${sameTitle.title}"와(과) 제목이 같은 프로젝트가 이미 있습니다.\n그래도 저장할까요? (저장 후 목록 위쪽에서 삭제·통합할 수 있습니다)`)) {
    return;
  }

  const url = isEditing
    ? `${API_BASE}/api/admin/projects/${encodeURIComponent(editingProjectId)}`
    : `${API_BASE}/api/admin/projects`;
  const method = isEditing ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || '저장에 실패했습니다.');
    }

    const successMsg = isPublished
      ? '🚀 프로젝트가 사이트에 성공적으로 공개되었습니다!'
      : '📝 초안이 안전하게 임시저장되었습니다.';

    showToast(successMsg);
    resetForm();
    loadProjects();
  } catch (err) {
    showToast(err.message, true);
  }
}

/* ── 중복 확인: 제목이 같으면(공백·기호·대소문자 무시) 중복 의심 ───────── */
function normTitle(t) {
  return String(t || '').toLowerCase().replace(/[\s\-_.,:;·ㆍ—–()\[\]"'`]+/g, '');
}
// 제목 없는 초안의 자동 제목은 중복 검사에서 제외
function isRealTitle(t) {
  return Boolean(t) && !String(t).startsWith('임시저장 초안') && !String(t).startsWith('제목 없는 초안');
}

function findDuplicateGroups(projects) {
  const groups = {};
  projects.forEach(p => {
    if (!isRealTitle(p.title)) return;
    (groups[normTitle(p.title)] = groups[normTitle(p.title)] || []).push(p);
  });
  return Object.values(groups).filter(g => g.length > 1);
}

function fieldsOf(p) {
  return {
    title: p.title || '',
    role: p.role || (p.meta && p.meta['역할']) || '',
    description: p.description || (p.sections && p.sections[0]?.paragraphs?.[0]) || '',
    period: p.period || (p.meta && p.meta['기간']) || '',
    teamSize: String(p.teamSize || (p.meta && p.meta['참여인원']) || '').replace(/명/g, '').trim(),
    notes: p.notes || ''
  };
}

function renderDuplicates() {
  const box = document.getElementById('dup-banner');
  const groups = findDuplicateGroups(currentProjects);
  if (!groups.length) { box.hidden = true; box.innerHTML = ''; return; }

  box.hidden = false;
  box.innerHTML = `<b>⚠ 중복 의심 ${groups.length}건</b>
    <span class="dup-sub">제목이 같은 프로젝트입니다. 하나로 통합하거나 불필요한 항목을 삭제하세요.</span>` +
    groups.map((g, gi) => `
      <div class="dup-group">
        <div class="dup-title">"${esc(g[0].title)}" · ${g.length}개</div>
        <ul>${g.map(p => `
          <li>
            <span class="badge ${p.status === 'draft' ? 'badge-draft' : 'badge-pub'}">${p.status === 'draft' ? '초안' : '공개'}</span>
            <span class="mono dup-date">${p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '-'}</span>
            <button type="button" class="btn btn-danger btn-sm" data-del="${esc(p.id)}" data-title="${esc(p.title)}">삭제</button>
          </li>`).join('')}
        </ul>
        <button type="button" class="btn btn-primary btn-sm" data-merge="${gi}">통합하기 (가장 내용이 많은 항목에 합치기)</button>
      </div>`).join('');

  box.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => deleteProject(b.dataset.del, b.dataset.title)));
  box.querySelectorAll('[data-merge]').forEach(b => b.addEventListener('click', () => mergeGroup(groups[Number(b.dataset.merge)])));
}

// 통합: 공개 > 채워진 칸이 많은 순으로 남길 항목을 고르고, 빈 칸만 다른 항목 값으로 채운 뒤 나머지는 삭제
async function mergeGroup(group) {
  const token = sessionStorage.getItem('admin_token');
  if (!token) return;
  const score = p => Object.values(fieldsOf(p)).filter(Boolean).length + (p.status === 'draft' ? 0 : 10);
  const sorted = [...group].sort((a, b) => score(b) - score(a));
  const keep = sorted[0];
  const others = sorted.slice(1);

  const merged = fieldsOf(keep);
  others.forEach(o => {
    const f = fieldsOf(o);
    ['title', 'role', 'description', 'period', 'teamSize'].forEach(k => { if (!merged[k]) merged[k] = f[k]; });
    if (f.notes && !merged.notes.includes(f.notes)) merged.notes = merged.notes ? `${merged.notes}\n${f.notes}` : f.notes;
  });

  if (!confirm(`"${keep.title}" ${group.length}개를 1개로 통합합니다.\n남는 항목: ${keep.status === 'draft' ? '초안' : '공개'} (빈 칸은 다른 항목 내용으로 채움)\n나머지 ${others.length}개는 삭제됩니다. 계속할까요?`)) return;

  try {
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    let res = await fetch(`${API_BASE}/api/admin/projects/${encodeURIComponent(keep.id)}`, {
      method: 'PUT', headers, body: JSON.stringify({ ...merged, status: keep.status })
    });
    let data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || '통합에 실패했습니다.');
    for (const o of others) {
      res = await fetch(`${API_BASE}/api/admin/projects/${encodeURIComponent(o.id)}`, { method: 'DELETE', headers });
      data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || '중복 항목 삭제에 실패했습니다.');
    }
    showToast('중복 프로젝트를 하나로 통합했습니다.');
  } catch (err) {
    showToast(err.message, true);
  }
  loadProjects();
}

/* ── 5. 프로젝트 삭제 ───────────────────────────────────────── */
async function deleteProject(identifier, title) {
  const token = sessionStorage.getItem('admin_token');
  if (!token) return;

  const confirmMsg = `정말 프로젝트 '${title || '이 프로젝트'}'을(를) 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`;
  if (!confirm(confirmMsg)) return;

  try {
    const res = await fetch(`${API_BASE}/api/admin/projects/${encodeURIComponent(identifier)}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || '삭제에 실패했습니다.');
    }

    showToast(data.message || '삭제되었습니다.');
    if (editingProjectId === identifier) {
      resetForm();
    }
    loadProjects();
  } catch (err) {
    showToast(err.message, true);
  }
}

/* ── 유틸리티 ─────────────────────────────────────────────── */
function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast-box show ${isError ? 'err' : ''}`;
  setTimeout(() => {
    toast.className = 'toast-box';
  }, 3500);
}

function esc(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
