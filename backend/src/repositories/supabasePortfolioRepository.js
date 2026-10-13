/**
 * SupabasePortfolioRepository (DB_TYPE=supabase)
 *
 * 파일 기반 저장소(portfolioRepository.js)와 같은 메서드·같은 JSON 모양을 돌려주므로
 * 서비스·컨트롤러·프론트엔드는 수정할 필요가 없다.
 *
 *  - 방문자용 읽기: anon 키 → RLS 가 공개(is_public) 행만 돌려준다 (프로젝트는 v_public_projects 뷰)
 *  - 관리자용 읽기·쓰기: service 키 → 초안·비공개 포함, 쓰기는 projects / project_sections 에 한다
 */
const { anonClient, serviceClient, must } = require('../db/supabase');

const CMS_SECTION_TITLE = '프로젝트 개요 및 설명';   // CMS 로 만든 프로젝트의 첫 섹션 제목

const asc = (a, b) => (a.sort_order || 0) - (b.sort_order || 0);
const cleanStr = (v) => (v === undefined || v === null ? '' : String(v));

// results 는 { value, label } 객체 배열(jsonb). 예전에 text[] 로 저장된 JSON 문자열도 객체로 되돌려 읽는다.
function parseResult(r) {
  if (typeof r === 'string' && r.trim().startsWith('{')) {
    try { return JSON.parse(r); } catch { return r; }
  }
  return r;
}

function mapSection(s) {
  return { title: s.title, ownWork: s.own_work, paragraphs: s.paragraphs, steps: s.steps, results: (s.results || []).map(parseResult) };
}

function mapProject(p, sections, images, admin) {
  images = images.filter((i) => i.project_id === p.id);   // 이 프로젝트의 이미지만
  const cover = images.find((i) => i.kind === 'cover');
  const thumb = images.find((i) => i.kind === 'thumbnail');
  const obj = {
    id: p.id,
    featured: p.featured,
    category: p.category,
    title: p.title,
    role: p.role || '',
    period: p.period || '',
    teamSize: p.team_size || '',
    description: p.description || '',
    card: {
      subtitle: p.subtitle,
      tagline: p.tagline,
      kpi: p.kpi,
      kpiNote: p.kpi_note,
      chips: p.chips,
      thumbnail: (thumb || cover) ? (thumb || cover).storage_path : null
    },
    image: cover ? cover.storage_path : null,
    meta: p.meta || {},
    sections: sections.filter((s) => s.project_id === p.id).sort(asc).map(mapSection),
    updatedAt: p.updated_at
  };
  if (admin) { obj.status = p.status; obj.notes = p.notes || ''; }   // 참고사항·초안 여부는 관리자에게만
  return obj;
}

class SupabasePortfolioRepository {
  /** 프로젝트 목록 (admin=true 이면 초안 포함 전체, 아니면 공개분만) */
  async _loadProjects(admin) {
    const db = admin ? serviceClient() : anonClient();
    const projects = must(await db.from(admin ? 'projects' : 'v_public_projects').select('*').order('sort_order'), '프로젝트 조회');
    if (!projects.length) return [];
    const ids = projects.map((p) => p.id);
    const [sections, images] = await Promise.all([
      db.from('project_sections').select('*').in('project_id', ids).order('sort_order'),
      db.from('project_images').select('*').in('project_id', ids).order('sort_order')
    ]);
    return projects.map((p) => mapProject(p, must(sections, '섹션 조회'), must(images, '이미지 조회'), admin));
  }

  async _loadStack() {
    const db = anonClient();
    const [tiers, groups, techs] = await Promise.all([
      db.from('tech_tiers').select('*').order('sort_order'),
      db.from('tech_groups').select('*').order('sort_order'),
      db.from('technologies').select('*').order('sort_order')
    ]);
    const T = must(tiers, '기술 단계'), G = must(groups, '기술 그룹'), X = must(techs, '기술');
    return T.map((t) => ({
      tier: t.tier,
      note: t.note,
      groups: G.filter((g) => g.tier_id === t.id).map((g) => ({
        name: g.name,
        tech: X.filter((x) => x.group_id === g.id).map((x) => x.name),
        points: g.points
      }))
    }));
  }

  async _list(table, map) {
    const rows = must(await anonClient().from(table).select('*').order('sort_order'), table);
    return rows.map(map);
  }

  async getPortfolio(options = { includeDrafts: false }) {
    const db = anonClient();
    const [profileRows, contacts, summary, metrics, stack, projects, principles, faq, badges, quests] = await Promise.all([
      db.from('profile').select('*').limit(1),
      this._list('contacts', (c) => ({ label: c.label, href: c.href })),
      this._list('summary_items', (s) => ({ title: s.title, body: s.body })),
      this._list('metrics', (m) => ({ value: m.value, label: m.label })),
      this._loadStack(),
      this._loadProjects(Boolean(options.includeDrafts)),
      this._list('principles', (p) => ({ label: p.label, title: p.title, body: p.body })),
      this._list('faqs', (f) => ({ question: f.question, answer: f.answer })),
      this._list('badges', (b) => ({ id: b.code, name: b.name, tech: b.tech, color: b.color, icon: b.icon, desc: b.description })),
      this._list('quests', (q) => ({ title: q.title, routeTag: q.route_tag, period: q.period, description: q.description, icon: q.icon }))
    ]);
    const p = must(profileRows, '프로필')[0] || {};
    return {
      role: p.role, name: p.name, affiliation: p.affiliation, lead: p.lead,
      contacts, summary, metrics, stack, projects, principles, faq,
      footer: p.footer_lines || [], badges, quests
    };
  }

  async getProfile() {
    const full = await this.getPortfolio();
    return { name: full.name, role: full.role, affiliation: full.affiliation, lead: full.lead, contacts: full.contacts, summary: full.summary };
  }

  async getMetrics() {
    return this._list('metrics', (m) => ({ value: m.value, label: m.label }));
  }

  async getStack() {
    return this._loadStack();
  }

  async getExtra() {
    const full = await this.getPortfolio();
    return { principles: full.principles, faq: full.faq, footer: full.footer };
  }

  async getProjects(options = { includeDrafts: false }) {
    return this._loadProjects(Boolean(options.includeDrafts));
  }

  async getProjectById(identifier, options = { includeDrafts: false }) {
    const projects = await this._loadProjects(Boolean(options.includeDrafts));
    const key = String(identifier);
    let found = projects.find((p) => p.id === key);
    if (found) return found;
    const num = parseInt(key, 10);
    if (!isNaN(num) && String(num) === key && projects[num]) return projects[num];
    found = projects.find((p) => p.title === key || p.title.replace(/\s+/g, '-').toLowerCase() === key.toLowerCase());
    return found || null;
  }

  /** id → (숫자 인덱스) → 제목 순서로 프로젝트 id 찾기 (관리자용) */
  async _resolveId(identifier) {
    const db = serviceClient();
    const key = String(identifier);
    const all = must(await db.from('projects').select('id,title').order('sort_order'), '프로젝트 조회');
    let hit = all.find((p) => p.id === key);
    if (!hit) {
      const num = parseInt(key, 10);
      hit = (!isNaN(num) && String(num) === key && all[num]) || all.find((p) => p.title === key);
    }
    return hit ? hit.id : null;
  }

  async _getAdminProject(id) {
    const list = await this._loadProjects(true);
    return list.find((p) => p.id === id) || null;
  }

  async createProject(d) {
    const db = serviceClient();
    const id = d.id || `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const existing = must(await db.from('projects').select('sort_order').order('sort_order', { ascending: false }).limit(1), '정렬 조회');
    const nextOrder = existing.length ? (existing[0].sort_order || 0) + 1 : 0;
    const description = cleanStr(d.description);

    must(await db.from('projects').insert({
      id,
      title: cleanStr(d.title),
      category: d.category || 'PROJECT',
      role: cleanStr(d.role), period: cleanStr(d.period), team_size: cleanStr(d.teamSize),
      description, notes: cleanStr(d.notes),
      kpi: d.teamSize ? `참여 ${d.teamSize}명` : '프로젝트',
      kpi_note: description ? description.substring(0, 30) + '...' : null,
      featured: Boolean(d.featured),
      status: d.status === 'draft' ? 'draft' : 'published',
      sort_order: nextOrder,
      meta: {
        '기간': cleanStr(d.period), '역할': cleanStr(d.role),
        '참여인원': d.teamSize ? `${d.teamSize}명` : '',
        '사용 기술': d.techStack || (d.meta && d.meta['사용 기술']) || ''
      }
    }), '프로젝트 등록');

    // 참고사항(notes)은 공개 섹션에 복사하지 않는다 (관리자 전용)
    must(await db.from('project_sections').insert({
      project_id: id, title: CMS_SECTION_TITLE, paragraphs: description ? [description] : [], is_public: true, sort_order: 0
    }), '섹션 등록');

    return this._getAdminProject(id);
  }

  async updateProject(identifier, d) {
    const db = serviceClient();
    const id = await this._resolveId(identifier);
    if (!id) throw new Error(`수정할 프로젝트를 찾을 수 없습니다: ${identifier}`);
    const cur = must(await db.from('projects').select('*').eq('id', id).single(), '프로젝트 조회');

    const patch = {};
    if (d.title !== undefined) patch.title = d.title;
    if (d.role !== undefined) patch.role = d.role;
    if (d.description !== undefined) patch.description = d.description;
    if (d.period !== undefined) patch.period = d.period;
    if (d.teamSize !== undefined) patch.team_size = d.teamSize;
    if (d.notes !== undefined) patch.notes = d.notes;
    if (d.status !== undefined) patch.status = d.status === 'draft' ? 'draft' : 'published';
    if (d.featured !== undefined) patch.featured = Boolean(d.featured);

    const meta = { ...(cur.meta || {}) };
    const period = patch.period !== undefined ? patch.period : cur.period;
    const role = patch.role !== undefined ? patch.role : cur.role;
    const team = patch.team_size !== undefined ? patch.team_size : cur.team_size;
    if (period) meta['기간'] = period;
    if (role) meta['역할'] = role;
    if (team) meta['참여인원'] = `${team}명`;
    patch.meta = meta;

    must(await db.from('projects').update(patch).eq('id', id), '프로젝트 수정');

    // CMS 로 만든 프로젝트만 첫 섹션(개요)의 설명 문단을 같이 갱신한다. (기존 포트폴리오 섹션은 건드리지 않음)
    if (d.description) {
      const secs = must(await db.from('project_sections').select('*').eq('project_id', id).order('sort_order').limit(1), '섹션 조회');
      if (secs.length && secs[0].title === CMS_SECTION_TITLE) {
        const paragraphs = [...secs[0].paragraphs];
        paragraphs[0] = d.description;
        must(await db.from('project_sections').update({ paragraphs }).eq('id', secs[0].id), '섹션 수정');
      }
    }
    return this._getAdminProject(id);
  }

  async deleteProject(identifier) {
    const db = serviceClient();
    const id = await this._resolveId(identifier);
    if (!id) throw new Error(`삭제할 프로젝트를 찾을 수 없습니다: ${identifier}`);
    const before = await this._getAdminProject(id);
    must(await db.from('projects').delete().eq('id', id), '프로젝트 삭제');   // 섹션·이미지·기술 연결은 함께 삭제됨
    return before;
  }

  async updatePortfolio() {
    throw new Error('Supabase 모드에서는 포트폴리오 전체 덮어쓰기를 지원하지 않습니다. 테이블별로 수정하세요.');
  }
}

module.exports = new SupabasePortfolioRepository();
