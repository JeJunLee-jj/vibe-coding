/**
 * Supabase 연결 (DB_TYPE=supabase 일 때만 사용)
 *
 *  - anonClient()    : 방문자용(publishable) 키. RLS 가 적용되어 공개 데이터만 읽힌다. 공개 API 읽기에 사용.
 *  - serviceClient() : 비밀(secret/service_role) 키. RLS 를 우회하므로 관리자 기능에서만 사용. 절대 외부에 노출 금지.
 */
const config = require('../config');

let anon = null;
let service = null;

function create(key, label) {
  if (!config.supabaseUrl || !key) {
    throw new Error(`Supabase 설정이 없습니다: backend/.env 의 SUPABASE_URL 과 ${label} 를 확인하세요.`);
  }
  const { createClient } = require('@supabase/supabase-js');
  return createClient(config.supabaseUrl, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

module.exports = {
  anonClient() {
    if (!anon) anon = create(config.supabaseAnonKey, 'SUPABASE_ANON_KEY');
    return anon;
  },
  serviceClient() {
    if (!service) service = create(config.supabaseServiceKey, 'SUPABASE_SERVICE_ROLE_KEY');
    return service;
  },
  /** 쿼리 결과에서 오류면 예외, 아니면 data 반환 */
  must(result, label) {
    if (result.error) throw new Error(`${label}: ${result.error.message}`);
    return result.data;
  }
};
