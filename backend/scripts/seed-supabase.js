/**
 * 기존 데이터를 Supabase 테이블로 옮기는 일회성 스크립트
 *
 *   node scripts/seed-supabase.js --dry      # 시험 실행: 무엇을 어디에 넣을지 출력만 (키·네트워크 불필요)
 *   node scripts/seed-supabase.js            # 실제 실행: 내용 테이블이 비어 있을 때만 넣는다
 *   node scripts/seed-supabase.js --reset    # 내용 테이블을 비운 뒤 다시 넣는다 (예약 데이터는 건드리지 않음)
 *
 * 필요: backend/.env 의 SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (비밀 키 — 서버에서만 사용)
 * 원본: data/portfolio.json, script.js(badgesData), index.html(quest-item), data/reservations.json(있으면)
 *
 * 원칙: 없는 내용을 만들지 않는다. 수치·문장은 원본 그대로 옮긴다.
 *       전화번호 연락처는 공개 전 본인 확인이 필요하므로 비공개(is_public=false)로 넣는다.
 */
const fs = require('fs');
const path = require('path');
const config = require('../src/config');

const ROOT = path.resolve(__dirname, '../..');
const DRY = process.argv.includes('--dry');
const RESET = process.argv.includes('--reset');

/* ── 원본 읽기 ─────────────────────────────────────────────── */
const portfolio = JSON.parse(fs.readFileSync(config.dataPath, 'utf8'));

function readBadges() {
  const src = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
  const start = src.indexOf('const badgesData = ');
  if (start < 0) return [];
  const arrStart = src.indexOf('[', start);
  const end = src.indexOf('\n  ];', arrStart);
  return new Function('return ' + src.slice(arrStart, end + 4))();
}

function readQuests() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const pick = (block, re) => { const m = re.exec(block); return m ? m[1].replace(/\s+/g, ' ').trim() : null; };
  return html.split('<div class="quest-item">').slice(1).map((block) => ({
    title: pick(block, /class="quest-title">([\s\S]*?)<\/h3>/),
    route_tag: pick(block, /class="quest-route-tag">([\s\S]*?)<\/span>/),
    period: pick(block, /class="quest-period">([\s\S]*?)<\/div>/),
    description: pick(block, /class="quest-desc">([\s\S]*?)<\/p>/),
    icon: pick(block, /<i class="fa-solid ([\w-]+)"/)
  }));
}

function readReservations() {
  try {
    const raw = JSON.parse(fs.readFileSync(config.reservationsPath, 'utf8'));
    return (raw.items || []).sort((a, b) => a.no - b.no).map((r) => ({
      name: r.name, email: r.email, visit_date: r.date, visit_time: r.time,
      purpose: r.purpose, status: r.status, created_at: r.createdAt
    }));
  } catch { return []; }
}

/* ── 변환 ─────────────────────────────────────────────────── */
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
function sameTech(a, b) {
  const x = norm(a), y = norm(b);
  if (!x || !y) return false;
  return x === y || (Math.min(x.length, y.length) >= 4 && (x.startsWith(y) || y.startsWith(x)));
}

function contactKind(href) {
  if (href.startsWith('mailto:')) return 'email';
  if (href.startsWith('tel:')) return 'phone';
  if (href.includes('github.com')) return 'github';
  return 'other';
}

function projectRow(p, i) {
  const meta = p.meta || {};
  const card = p.card || {};
  const dateInCategory = /(\d{4}\.\d{2}(?:\s*—\s*\d{4}\.\d{2})?)\s*$/.exec(p.category || '');
  return {
    id: p.id, featured: !!p.featured, category: p.category || null, title: p.title,
    role: meta['역할'] || meta['담당'] || null,
    period: meta['기간'] || (dateInCategory ? dateInCategory[1] : null),
    team_size: null,
    description: card.tagline || null,       // 기존 데이터에 별도 '설명'이 없어 카드 한 줄 소개를 그대로 사용
    notes: null,
    subtitle: card.subtitle || meta['부제'] || null, tagline: card.tagline || null,
    kpi: card.kpi || null, kpi_note: card.kpiNote || null,
    chips: card.chips || [], meta, sort_order: i,
    status: 'published'                      // 기존 5건은 모두 공개 중
  };
}

function buildPlan() {
  const tiers = portfolio.stack.map((t, i) => ({ tier: t.tier, note: t.note || null, sort_order: i, is_public: true }));
  const groups = [], techs = [];
  portfolio.stack.forEach((t, ti) => t.groups.forEach((g, gi) => {
    groups.push({ _tier: t.tier, name: g.name, points: g.points || [], sort_order: gi, is_public: true });
    (g.tech || []).forEach((name, k) => techs.push({ _tier: t.tier, _group: g.name, name, sort_order: k, is_public: true }));
  }));

  const projects = portfolio.projects.map(projectRow);
  const sections = [];
  portfolio.projects.forEach((p) => (p.sections || []).forEach((s, i) => sections.push({
    _project: p.id, title: s.title, own_work: !!s.ownWork,
    paragraphs: s.paragraphs || [], steps: s.steps || [], results: s.results || [],
    sort_order: i, is_public: true
  })));

  // 프로젝트 ↔ 기술 연결: meta['사용 기술'] 을 기술 스택 이름과 대조 (없는 기술은 만들지 않고 보고만 한다)
  const links = [], unmatched = [];
  portfolio.projects.forEach((p) => {
    String((p.meta || {})['사용 기술'] || '').split(',').map((s) => s.trim()).filter(Boolean).forEach((name) => {
      const hit = techs.find((t) => sameTech(t.name, name));
      if (hit) links.push({ _project: p.id, _tech: hit });
      else unmatched.push(`${p.id}: ${name}`);
    });
  });

  const images = [];
  portfolio.projects.forEach((p) => {
    const card = p.card || {};
    if (p.image) images.push({ _project: p.id, storage_path: p.image, kind: 'cover', alt: `${p.title} 설계 패널`, sort_order: 0, is_public: true });
    if (card.thumbnail && card.thumbnail !== p.image) images.push({ _project: p.id, storage_path: card.thumbnail, kind: 'thumbnail', alt: p.title, sort_order: 1, is_public: true });
  });

  return {
    profile: [{ id: 1, name: portfolio.name, role: portfolio.role, affiliation: portfolio.affiliation, lead: portfolio.lead, footer_lines: portfolio.footer || [], is_public: true }],
    contacts: portfolio.contacts.map((c, i) => {
      const kind = contactKind(c.href);
      return { kind, label: c.label, href: c.href, sort_order: i, is_public: kind !== 'phone' };
    }),
    summary_items: portfolio.summary.map((s, i) => ({ ...s, sort_order: i, is_public: true })),
    metrics: portfolio.metrics.map((m, i) => ({ ...m, sort_order: i, is_public: true })),
    principles: portfolio.principles.map((p, i) => ({ ...p, sort_order: i, is_public: true })),
    faqs: portfolio.faq.map((f, i) => ({ question: f.question, answer: Array.isArray(f.answer) ? f.answer : [f.answer], sort_order: i, is_public: true })),
    badges: readBadges().map((b, i) => ({ code: b.id, name: b.name, tech: b.tech, color: b.color, icon: b.icon, description: b.desc, sort_order: i, is_public: true })),
    quests: readQuests().map((q, i) => ({ ...q, sort_order: i, is_public: true })),
    tiers, groups, techs, projects, sections, links, images, unmatched,
    reservations: readReservations()
  };
}

/* ── 실행 ─────────────────────────────────────────────────── */
const clean = (rows) => rows.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => !k.startsWith('_'))));

async function main() {
  const plan = buildPlan();
  const counts = {
    profile: plan.profile.length, contacts: plan.contacts.length, summary_items: plan.summary_items.length,
    metrics: plan.metrics.length, principles: plan.principles.length, faqs: plan.faqs.length,
    badges: plan.badges.length, quests: plan.quests.length, tech_tiers: plan.tiers.length,
    tech_groups: plan.groups.length, technologies: plan.techs.length, projects: plan.projects.length,
    project_sections: plan.sections.length, project_technologies: plan.links.length,
    project_images: plan.images.length, reservations: plan.reservations.length
  };
  console.log('옮길 데이터 (테이블: 건수)');
  Object.entries(counts).forEach(([k, v]) => console.log(`  ${k.padEnd(22)} ${v}`));
  console.log('비공개로 들어가는 연락처:', plan.contacts.filter((c) => !c.is_public).map((c) => c.kind).join(', ') || '없음');
  console.log('기술 스택과 연결되지 않은 프로젝트 기술(연결 생략):', plan.unmatched.length ? '\n  - ' + plan.unmatched.join('\n  - ') : '없음');

  if (DRY) { console.log('\n[시험 실행] 아무것도 전송하지 않았습니다.'); return; }

  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('\nbackend/.env 에 SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 가 없습니다.');
    process.exit(1);
  }
  const { createClient } = require('@supabase/supabase-js');
  const db = createClient(url, key, { auth: { persistSession: false } });
  const must = async (label, q) => { const { data, error } = await q; if (error) throw new Error(`${label}: ${error.message}`); return data; };

  const existing = await must('projects 확인', db.from('projects').select('id', { count: 'exact' }).limit(1));
  if (existing.length && !RESET) {
    console.error('\n이미 데이터가 있습니다. 덮어쓰려면 --reset 으로 다시 실행하세요. (예약 데이터는 유지됩니다)');
    process.exit(1);
  }
  if (RESET) {
    // 자식 → 부모 순서로 삭제 (예약은 제외)
    for (const t of ['project_technologies', 'project_images', 'project_sections', 'technologies', 'tech_groups', 'tech_tiers',
      'projects', 'profile', 'contacts', 'summary_items', 'metrics', 'principles', 'faqs', 'badges', 'quests']) {
      const col = t === 'projects' ? 'id' : t === 'profile' ? 'id' : t === 'project_technologies' ? 'project_id' : 'id';
      const q = col === 'id' && !['projects', 'profile'].includes(t) ? db.from(t).delete().gte('id', 0) : db.from(t).delete().not(col, 'is', null);
      await must(`${t} 비우기`, q);
    }
    console.log('내용 테이블을 비웠습니다.');
  }

  // 부모 → 자식 순서로 입력 (외래키 번호는 입력 결과로 받아서 연결)
  const tierRows = await must('tech_tiers', db.from('tech_tiers').insert(clean(plan.tiers)).select());
  const tierId = Object.fromEntries(tierRows.map((r) => [r.tier, r.id]));
  const groupRows = await must('tech_groups', db.from('tech_groups').insert(plan.groups.map((g) => ({ ...clean([g])[0], tier_id: tierId[g._tier] }))).select());
  const groupId = Object.fromEntries(groupRows.map((r) => [`${r.tier_id}|${r.name}`, r.id]));
  const techRows = await must('technologies', db.from('technologies').insert(plan.techs.map((t) => ({ ...clean([t])[0], group_id: groupId[`${tierId[t._tier]}|${t._group}`] }))).select());
  const techId = new Map(plan.techs.map((t, i) => [t, techRows[i].id]));

  await must('projects', db.from('projects').insert(plan.projects));
  await must('project_sections', db.from('project_sections').insert(plan.sections.map((s) => ({ ...clean([s])[0], project_id: s._project }))));
  if (plan.links.length) {
    const seen = new Set();
    const rows = plan.links.map((l) => ({ project_id: l._project, technology_id: techId.get(l._tech) }))
      .filter((r) => { const k = r.project_id + '|' + r.technology_id; if (seen.has(k)) return false; seen.add(k); return true; });
    await must('project_technologies', db.from('project_technologies').insert(rows));
  }
  if (plan.images.length) await must('project_images', db.from('project_images').insert(plan.images.map((s) => ({ ...clean([s])[0], project_id: s._project }))));

  await must('profile', db.from('profile').insert(plan.profile));
  for (const t of ['contacts', 'summary_items', 'metrics', 'principles', 'faqs', 'badges', 'quests']) {
    if (plan[t].length) await must(t, db.from(t).insert(plan[t]));
  }

  const rv = await must('reservations 확인', db.from('reservations').select('no').limit(1));
  if (plan.reservations.length && !rv.length) await must('reservations', db.from('reservations').insert(plan.reservations));
  else if (plan.reservations.length) console.log('reservations 에 이미 데이터가 있어 예약은 옮기지 않았습니다.');

  console.log('\n완료: 모든 테이블에 데이터를 넣었습니다.');
}

main().catch((e) => { console.error('\n실패:', e.message); process.exit(1); });
