/**
 * 예약하기 관리 페이지
 * 로그인 토큰은 프로젝트 관리 화면(admin.js)과 같은 sessionStorage('admin_token')를 사용합니다.
 */

const API_BASE = window.location.port === '5000' ? '' : 'http://localhost:5000';
const STATUSES = ['접수', '확정', '변경요청', '취소'];
const STATUS_CLASS = { '접수': 'st-new', '확정': 'st-ok', '변경요청': 'st-change', '취소': 'st-cancel' };
const STATUS_HELP = {
  '접수': '접수 — 신청 그대로의 상태',
  '확정': '확정 — 해당 날짜·시간에 방문을 승인',
  '변경요청': '변경요청 — 다른 시간에 방문을 요청',
  '취소': '취소 — 방문을 원치 않음'
};

let reservations = [];

document.addEventListener('DOMContentLoaded', init);

function token() { return sessionStorage.getItem('admin_token'); }

function authFetch(path, options = {}) {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...(options.headers || {}), 'Authorization': `Bearer ${token()}` }
  });
}

function backToLogin() {
  sessionStorage.removeItem('admin_token');
  window.location.replace('index.html');
}

async function init() {
  if (!token()) return backToLogin();
  try {
    const res = await authFetch('/api/admin/me');
    if (!res.ok) return backToLogin();
  } catch {
    document.getElementById('auth-check').textContent =
      '백엔드 서버에 연결할 수 없습니다. 서버를 실행한 뒤(npm run backend) 새로고침해 주세요.';
    return;
  }
  document.getElementById('auth-check').style.display = 'none';
  document.getElementById('admin-screen').style.display = 'block';

  document.getElementById('btn-logout').addEventListener('click', backToLogin);
  document.getElementById('rv-body').addEventListener('click', onStatusClick);
  document.getElementById('rv-file').addEventListener('change', onFilePicked);
  document.getElementById('rv-import-btn').addEventListener('click', onImport);
  loadReservations();
}

async function loadReservations() {
  try {
    const res = await authFetch('/api/admin/reservations');
    if (res.status === 401) return backToLogin();
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || '불러오지 못했습니다.');
    reservations = data.data;
    render();
  } catch (e) {
    document.getElementById('rv-body').innerHTML =
      `<tr><td colspan="6" class="rv-empty">예약을 불러오지 못했습니다. ${esc(e.message)}</td></tr>`;
  }
}

/* ── 렌더링 ─────────────────────────────────────────────── */
function fmtNo(no) { return 'R-' + String(no).padStart(4, '0'); }

function fmtWhen(r) {
  const [y, m, d] = r.date.split('-').map(Number);
  const dow = ['일', '월', '화', '수', '목', '금', '토'][new Date(y, m - 1, d).getDay()];
  return `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')} (${dow}) ${r.time}`;
}

function render() {
  // 방문 희망 시간이 빠른 순
  const rows = [...reservations].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time) || a.no - b.no);

  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  reservations.forEach((r) => { if (counts[r.status] !== undefined) counts[r.status]++; });
  document.getElementById('rv-summary').innerHTML =
    `<span class="rv-total">전체 <b class="mono">${reservations.length}</b>건</span>` +
    STATUSES.map((s) => `<span class="rv-badge ${STATUS_CLASS[s]}">${s} <b class="mono">${counts[s]}</b></span>`).join('');

  const body = document.getElementById('rv-body');
  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="6" class="rv-empty">아직 접수된 예약이 없습니다. 아래 "예약 가져오기"로 Formspree 내보내기 파일을 불러올 수 있습니다.</td></tr>';
    return;
  }
  body.innerHTML = rows.map((r) => `
    <tr data-no="${r.no}">
      <td data-label="예약 번호"><span class="mono rv-no">${fmtNo(r.no)}</span></td>
      <td data-label="신청자/이메일">
        <div class="rv-name">${esc(r.name)}</div>
        <a class="rv-mail mono" href="mailto:${encodeURIComponent(r.email)}">${esc(r.email)}</a>
      </td>
      <td data-label="방문 희망 시간"><span class="mono">${esc(fmtWhen(r))}</span></td>
      <td data-label="방문 목적"><div class="rv-purpose">${esc(r.purpose)}</div></td>
      <td data-label="처리 상태"><span class="rv-badge ${STATUS_CLASS[r.status] || ''}">${esc(r.status)}</span></td>
      <td data-label="관리">
        <div class="rv-actions" role="group" aria-label="${fmtNo(r.no)} 처리 상태 변경">
          ${STATUSES.map((s) => `
            <button type="button" class="rv-act ${STATUS_CLASS[s]}${r.status === s ? ' on' : ''}"
              data-status="${s}" title="${esc(STATUS_HELP[s])}" aria-pressed="${r.status === s}"
              ${r.status === s ? 'disabled' : ''}>${s}</button>`).join('')}
        </div>
      </td>
    </tr>`).join('');
}

/* ── 상태 변경 ─────────────────────────────────────────── */
async function onStatusClick(e) {
  const btn = e.target.closest('button.rv-act');
  if (!btn || btn.disabled) return;
  const tr = btn.closest('tr');
  const no = Number(tr.dataset.no);
  const status = btn.dataset.status;
  if (status === '취소' && !confirm(`${fmtNo(no)} 예약을 "취소" 상태로 변경할까요?`)) return;

  tr.querySelectorAll('button').forEach((b) => { b.disabled = true; });
  try {
    const res = await authFetch(`/api/admin/reservations/${no}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.status === 401) return backToLogin();
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || '변경에 실패했습니다.');
    const idx = reservations.findIndex((r) => r.no === no);
    if (idx >= 0) reservations[idx] = data.data;
    toast(`${fmtNo(no)} → ${status}`);
  } catch (err) {
    toast(err.message, true);
  }
  render();
}

/* ── 가져오기 (CSV / JSON) ──────────────────────────────── */
function onFilePicked(e) {
  const f = e.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = () => { document.getElementById('rv-text').value = String(reader.result || ''); };
  reader.readAsText(f, 'utf-8');
}

function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((v) => v !== '')) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((v) => v !== '')) rows.push(row);
  return rows;
}

const ALIASES = {
  name: ['name', '이름', '신청자'],
  email: ['email', '이메일', '_replyto'],
  date: ['date_iso', 'date', '날짜'],
  time: ['time', '희망시간', '시간'],
  purpose: ['purpose', '방문목적', '목적'],
  createdAt: ['submitted_at', '_date', 'createdat', 'submitted']
};

function pick(obj, field) {
  const lower = {};
  Object.keys(obj).forEach((k) => { lower[k.replace(/\s+/g, '').toLowerCase()] = obj[k]; });
  for (const a of ALIASES[field]) if (lower[a] !== undefined && String(lower[a]).trim() !== '') return String(lower[a]).trim();
  return '';
}

/** '2026-10-07' 또는 '2026년 10월 7일 (수)' → '2026-10-07' */
function toIsoDate(s) {
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = /(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/.exec(s);
  if (m) return `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}`;
  return s;
}

function toRecords(text) {
  const t = text.replace(/^﻿/, '').trim();
  if (!t) return [];
  let objs;
  if (t[0] === '[' || t[0] === '{') {
    const j = JSON.parse(t);
    objs = Array.isArray(j) ? j : (j.submissions || j.records || [j]);
  } else {
    const rows = parseCsv(t);
    const head = rows.shift() || [];
    objs = rows.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] || ''])));
  }
  return objs.map((o) => ({
    name: pick(o, 'name'),
    email: pick(o, 'email'),
    date: toIsoDate(pick(o, 'date')),
    time: pick(o, 'time').slice(0, 5),
    purpose: pick(o, 'purpose'),
    createdAt: pick(o, 'createdAt')
  }));
}

async function onImport() {
  const out = document.getElementById('rv-import-result');
  let records;
  try {
    records = toRecords(document.getElementById('rv-text').value);
  } catch {
    out.textContent = '내용을 읽을 수 없습니다. CSV 또는 JSON 형식인지 확인해 주세요.';
    return;
  }
  if (!records.length) { out.textContent = '가져올 내용이 없습니다.'; return; }

  out.textContent = '가져오는 중…';
  try {
    const res = await authFetch('/api/admin/reservations/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records })
    });
    if (res.status === 401) return backToLogin();
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || '가져오기에 실패했습니다.');
    let msg = `새 예약 ${data.added}건 추가, 중복 ${data.duplicates}건 건너뜀`;
    if (data.invalid.length) {
      msg += `, 형식 오류 ${data.invalid.length}건 (` +
        data.invalid.slice(0, 3).map((x) => `${x.index}번째: ${x.reason}`).join(' / ') + ')';
    }
    out.textContent = msg;
    if (data.added) { document.getElementById('rv-text').value = ''; document.getElementById('rv-file').value = ''; }
    await loadReservations();
  } catch (err) {
    out.textContent = err.message;
  }
}

/* ── 공용 ──────────────────────────────────────────────── */
function toast(msg, isError = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.toggle('err', isError);
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2600);
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
