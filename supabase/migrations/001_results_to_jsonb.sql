-- project_sections.results 를 text[] → jsonb 로 바꾼다 (성과 수치 {value, label} 구조를 그대로 보존)
-- 사용법: Supabase → SQL Editor → New query → 이 파일 전체를 붙여넣고 Run (한 번만 실행)
-- 이미 jsonb 이면 아무 일도 하지 않으므로 다시 실행해도 안전하다.
do $$
begin
  if (select data_type from information_schema.columns
       where table_schema = 'public' and table_name = 'project_sections' and column_name = 'results') = 'ARRAY' then

    alter table project_sections add column results_new jsonb not null default '[]';

    -- 기존 값: JSON 문자열('{"value":...}')은 객체로, 일반 문장은 문자열 그대로 옮긴다 (순서 유지)
    update project_sections s
       set results_new = coalesce((
             select jsonb_agg(case when t.e ~ '^\s*\{' then t.e::jsonb else to_jsonb(t.e) end order by t.ord)
               from unnest(s.results) with ordinality as t(e, ord)
           ), '[]'::jsonb);

    alter table project_sections drop column results;
    alter table project_sections rename column results_new to results;
  end if;
end $$;
