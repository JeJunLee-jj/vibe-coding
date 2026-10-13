/**
 * SupabaseReservationRepository (DB_TYPE=supabase)
 *
 * reservationRepository.js 와 같은 메서드(list / addMany / updateStatus)를 제공하며
 * 컨트롤러가 기대하는 모양({ no, name, email, date, time, purpose, status, createdAt, updatedAt })으로 돌려준다.
 * 관리자 기능이므로 service 키로 접근한다. (예약 테이블은 방문자에게 읽기 권한이 없다)
 */
const { serviceClient, must } = require('../db/supabase');

const toItem = (r) => ({
  no: r.no,
  name: r.name,
  email: r.email,
  date: r.visit_date,
  time: String(r.visit_time).slice(0, 5),
  purpose: r.purpose,
  status: r.status,
  createdAt: r.created_at,
  updatedAt: r.updated_at
});

class SupabaseReservationRepository {
  async list() {
    const rows = must(await serviceClient().from('reservations').select('*').order('no'), '예약 조회');
    return rows.map(toItem);
  }

  /**
   * 여러 건 추가. 같은 신청자·같은 날짜·시간(unique 위반)은 중복으로 건너뛰고,
   * DB 규칙(주말, 시간 범위 등)에 어긋나면 rejected 에 사유와 함께 담는다.
   * @returns {{added: object[], duplicates: number, rejected: {name: string, reason: string}[]}}
   */
  async addMany(records) {
    const db = serviceClient();
    const added = [];
    const rejected = [];
    let duplicates = 0;
    for (const rec of records) {
      const row = { name: rec.name, email: rec.email, visit_date: rec.date, visit_time: rec.time, purpose: rec.purpose };
      if (rec.createdAt) { row.created_at = rec.createdAt; row.consented_at = rec.createdAt; }
      const { data, error } = await db.from('reservations').insert(row).select().single();
      if (!error) { added.push(toItem(data)); continue; }
      if (error.code === '23505') duplicates++;
      else rejected.push({ name: rec.name, reason: error.code === '23514' ? '예약 규칙에 맞지 않습니다(평일 13:00~18:00 30분 단위)' : error.message });
    }
    return { added, duplicates, rejected };
  }

  async updateStatus(no, status) {
    const { data, error } = await serviceClient().from('reservations').update({ status }).eq('no', no).select().maybeSingle();
    if (error) throw new Error(`예약 상태 변경: ${error.message}`);
    return data ? toItem(data) : null;
  }
}

module.exports = new SupabaseReservationRepository();
