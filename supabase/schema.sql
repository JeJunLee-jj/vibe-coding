-- ============================================================================
-- 이제준 포트폴리오 — Supabase 데이터베이스 설계 (테이블 17개)
--
-- 사용법: Supabase 대시보드 → SQL Editor → New query → 이 파일 전체를 붙여넣고 Run
--         (여러 번 실행해도 안전하도록 작성됨: if not exists / drop policy if exists)
--
-- 공개/비공개 원칙
--  1) 사이트에 나오는 모든 테이블에 is_public 열이 있고, 기본값은 false(비공개)다.
--  2) 방문자(anon)는 is_public = true 인 행만 읽을 수 있다.
--  3) 자식 테이블은 "자기 자신 + 부모"가 모두 공개일 때만 보인다.
--  4) projects.notes(참고사항)처럼 열 단위로 숨길 값은 공개용 뷰(v_public_projects)로만 노출한다.
--  5) reservations(예약)는 방문자가 '넣기(INSERT)'만 가능하고 읽기·수정·삭제는 관리자만 가능하다.
--  6) 관리자 = admin_users 에 등록된 Supabase Auth 사용자. 백엔드(service_role 키)는 RLS를 우회한다.
-- ============================================================================

-- ── 0. 공통 함수 ─────────────────────────────────────────────────────────────
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ── 1. 관리자 ────────────────────────────────────────────────────────────────
create table if not exists admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from admin_users where user_id = auth.uid()) $$;

-- ── 2. 사이트 콘텐츠 테이블 ──────────────────────────────────────────────────
-- 프로필 (1행 고정)
create table if not exists profile (
  id           smallint primary key default 1 check (id = 1),
  name         text not null,
  role         text,
  affiliation  text,
  lead         text,
  footer_lines text[] not null default '{}',
  is_public    boolean not null default false,
  updated_at   timestamptz not null default now()
);

-- 연락처 (전화번호는 공개 전 본인 확인이 필요하므로 시드 시 비공개)
create table if not exists contacts (
  id         bigint generated always as identity primary key,
  kind       text not null check (kind in ('email', 'github', 'phone', 'other')),
  label      text not null,
  href       text not null,
  sort_order int  not null default 0,
  is_public  boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists summary_items (
  id bigint generated always as identity primary key,
  title text not null, body text not null,
  sort_order int not null default 0,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists metrics (
  id bigint generated always as identity primary key,
  value text not null, label text not null,
  sort_order int not null default 0,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists principles (
  id bigint generated always as identity primary key,
  label text not null, title text not null, body text not null,
  sort_order int not null default 0,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists faqs (
  id bigint generated always as identity primary key,
  question text not null,
  answer   text[] not null default '{}',          -- 문단 단위 배열
  sort_order int not null default 0,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);

-- 기술 배지 (script.js 의 badgesData)
create table if not exists badges (
  id bigint generated always as identity primary key,
  code text not null unique,                       -- 예: BADGE_01
  name text not null, tech text not null,
  color text, icon text, description text,
  sort_order int not null default 0,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);

-- 모험 일지 타임라인 (index.html 의 quest-item)
create table if not exists quests (
  id bigint generated always as identity primary key,
  title text not null, route_tag text, period text, description text,
  icon text,
  sort_order int not null default 0,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);

-- 기술 스택: 단계(Tier) → 그룹 → 기술
create table if not exists tech_tiers (
  id bigint generated always as identity primary key,
  tier text not null unique, note text,
  sort_order int not null default 0,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists tech_groups (
  id bigint generated always as identity primary key,
  tier_id bigint not null references tech_tiers(id) on delete cascade,
  name text not null,
  points text[] not null default '{}',
  sort_order int not null default 0,
  is_public boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (tier_id, name)
);

create table if not exists technologies (
  id bigint generated always as identity primary key,
  group_id bigint not null references tech_groups(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  is_public boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (group_id, name)
);

-- 프로젝트: status 로 초안/공개를 관리하고 is_public 은 자동 계산
create table if not exists projects (
  id         text primary key,                     -- 예: hwadap, devsync
  featured   boolean not null default false,
  category   text,
  title      text not null default '',
  role       text,
  period     text,
  team_size  text,
  description text,
  notes      text,                                 -- 참고사항(관리자 전용, 공개 뷰에서 제외)
  subtitle   text, tagline text, kpi text, kpi_note text,
  chips      text[] not null default '{}',
  meta       jsonb  not null default '{}',         -- 담당/산출물/도구/사용 기술 등 원본 보존
  sort_order int not null default 0,
  status     text not null default 'draft' check (status in ('draft', 'published')),
  is_public  boolean generated always as (status = 'published') stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists project_sections (
  id bigint generated always as identity primary key,
  project_id text not null references projects(id) on delete cascade,
  title text not null,
  own_work boolean not null default false,         -- true = 팀 프로젝트 중 본인 담당 파트
  paragraphs text[] not null default '{}',
  steps      text[] not null default '{}',
  results    jsonb  not null default '[]',        -- 성과 수치: [{ "value": "24ms", "label": "..." }, ...]
  sort_order int not null default 0,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);

-- 프로젝트 ↔ 기술 연결 (어느 프로젝트에 어떤 기술이 쓰였는지)
create table if not exists project_technologies (
  project_id    text   not null references projects(id)     on delete cascade,
  technology_id bigint not null references technologies(id) on delete cascade,
  primary key (project_id, technology_id)
);

-- 프로젝트 이미지 (파일 자체는 Supabase Storage, 여기에는 경로만)
create table if not exists project_images (
  id bigint generated always as identity primary key,
  project_id text not null references projects(id) on delete cascade,
  storage_path text not null,
  kind text not null default 'cover' check (kind in ('cover', 'thumbnail', 'gallery')),
  alt text,
  sort_order int not null default 0,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ── 3. 운영 데이터 (전부 비공개) ─────────────────────────────────────────────
create table if not exists reservations (
  no          bigint generated always as identity primary key,   -- 예약 번호 (화면에는 R-0001)
  name        text not null check (char_length(btrim(name)) between 1 and 40),
  email       text not null check (email ~* '^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$' and char_length(email) <= 120),
  visit_date  date not null check (extract(isodow from visit_date) < 6),          -- 평일만
  visit_time  time not null check (visit_time between time '13:00' and time '18:00'
                                   and extract(minute from visit_time) in (0, 30)), -- 13:00~18:00, 30분 단위
  purpose     text not null check (char_length(btrim(purpose)) between 1 and 1000),
  status      text not null default '접수' check (status in ('접수', '확정', '변경요청', '취소')),
  consented_at timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
-- 같은 신청자(이름+이메일)가 같은 날짜·시간에 중복 신청하는 것을 막는다 (다른 시간은 허용)
create unique index if not exists reservations_unique_slot
  on reservations (lower(btrim(name)), lower(btrim(email)), visit_date, visit_time);
-- TODO(추후): 서로 다른 신청자의 방문 희망 시간이 겹치지 않도록 관리

-- ── 4. 공개 여부 판별 함수 (RLS 안에서 부모 테이블 권한 문제를 피하려고 security definer) ──
create or replace function project_is_public(pid text) returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce((select is_public from projects where id = pid), false) $$;

create or replace function tech_group_is_public(gid bigint) returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce((select g.is_public and t.is_public
                      from tech_groups g join tech_tiers t on t.id = g.tier_id
                     where g.id = gid), false) $$;

create or replace function technology_is_public(tid bigint) returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce((select x.is_public and tech_group_is_public(x.group_id)
                      from technologies x where x.id = tid), false) $$;

-- ── 5. 보안: RLS 켜기 + 정책 ─────────────────────────────────────────────────
-- 5-1. 단순 공개 테이블: 공개 행만 누구나 읽기 / 관리자는 전부
do $$
declare t text;
begin
  foreach t in array array['profile','contacts','summary_items','metrics','principles',
                           'faqs','badges','quests','tech_tiers']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "공개 행만 읽기" on %I', t);
    execute format('create policy "공개 행만 읽기" on %I for select to anon, authenticated using (is_public)', t);
    execute format('drop policy if exists "관리자 전체" on %I', t);
    execute format('create policy "관리자 전체" on %I for all to authenticated using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;

-- 5-2. 부모가 있는 테이블: 자기 자신 + 부모가 모두 공개일 때만
alter table tech_groups enable row level security;
drop policy if exists "공개 행만 읽기" on tech_groups;
create policy "공개 행만 읽기" on tech_groups for select to anon, authenticated
  using (is_public and tech_group_is_public(id));
drop policy if exists "관리자 전체" on tech_groups;
create policy "관리자 전체" on tech_groups for all to authenticated using (is_admin()) with check (is_admin());

alter table technologies enable row level security;
drop policy if exists "공개 행만 읽기" on technologies;
create policy "공개 행만 읽기" on technologies for select to anon, authenticated
  using (is_public and tech_group_is_public(group_id));
drop policy if exists "관리자 전체" on technologies;
create policy "관리자 전체" on technologies for all to authenticated using (is_admin()) with check (is_admin());

alter table project_sections enable row level security;
drop policy if exists "공개 행만 읽기" on project_sections;
create policy "공개 행만 읽기" on project_sections for select to anon, authenticated
  using (is_public and project_is_public(project_id));
drop policy if exists "관리자 전체" on project_sections;
create policy "관리자 전체" on project_sections for all to authenticated using (is_admin()) with check (is_admin());

alter table project_images enable row level security;
drop policy if exists "공개 행만 읽기" on project_images;
create policy "공개 행만 읽기" on project_images for select to anon, authenticated
  using (is_public and project_is_public(project_id));
drop policy if exists "관리자 전체" on project_images;
create policy "관리자 전체" on project_images for all to authenticated using (is_admin()) with check (is_admin());

alter table project_technologies enable row level security;
drop policy if exists "공개 행만 읽기" on project_technologies;
create policy "공개 행만 읽기" on project_technologies for select to anon, authenticated
  using (project_is_public(project_id) and technology_is_public(technology_id));
drop policy if exists "관리자 전체" on project_technologies;
create policy "관리자 전체" on project_technologies for all to authenticated using (is_admin()) with check (is_admin());

-- 5-3. projects: 방문자는 원본 테이블을 못 읽고(참고사항 보호), 공개용 뷰로만 읽는다
alter table projects enable row level security;
drop policy if exists "관리자 전체" on projects;
create policy "관리자 전체" on projects for all to authenticated using (is_admin()) with check (is_admin());
revoke all on projects from anon;

create or replace view v_public_projects as
  select id, featured, category, title, role, period, team_size, description,
         subtitle, tagline, kpi, kpi_note, chips, meta, sort_order, updated_at
    from projects
   where is_public;                                   -- notes(참고사항)·status 제외
grant select on v_public_projects to anon, authenticated;

-- 5-4. reservations: 방문자는 INSERT 만, 나머지는 관리자만
alter table reservations enable row level security;
drop policy if exists "방문자 신청(접수 상태만)" on reservations;
create policy "방문자 신청(접수 상태만)" on reservations for insert to anon
  with check (status = '접수');
drop policy if exists "관리자 전체" on reservations;
create policy "관리자 전체" on reservations for all to authenticated using (is_admin()) with check (is_admin());
revoke all on reservations from anon;
grant insert on reservations to anon;
grant usage on all sequences in schema public to anon;   -- 예약 번호(identity) 발급용

-- 5-5. admin_users: 본인 행만 확인 가능
alter table admin_users enable row level security;
drop policy if exists "본인 확인" on admin_users;
create policy "본인 확인" on admin_users for select to authenticated using (user_id = auth.uid());
revoke all on admin_users from anon;

-- ── 6. updated_at 자동 갱신 ──────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['profile','contacts','summary_items','metrics','principles','faqs','badges',
                           'quests','tech_tiers','tech_groups','technologies','projects',
                           'project_sections','project_images','reservations']
  loop
    execute format('drop trigger if exists trg_updated_at on %I', t);
    execute format('create trigger trg_updated_at before update on %I for each row execute function set_updated_at()', t);
  end loop;
end $$;
