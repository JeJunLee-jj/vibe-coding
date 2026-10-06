const repo = require('../repositories/reservationRepository');

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function str(v) {
  return typeof v === 'string' ? v.trim() : '';
}

/** 한 건 검증·정리. 문제가 있으면 { error } 반환 */
function normalize(raw) {
  if (!raw || typeof raw !== 'object') return { error: '올바른 데이터 형식이 아닙니다.' };
  const rec = {
    name: str(raw.name),
    email: str(raw.email),
    date: str(raw.date),
    time: str(raw.time),
    purpose: str(raw.purpose)
  };
  if (!rec.name || rec.name.length > 40) return { error: '이름이 비어 있거나 40자를 넘습니다.' };
  if (!EMAIL_RE.test(rec.email) || rec.email.length > 120) return { error: '이메일 형식이 올바르지 않습니다.' };
  if (!DATE_RE.test(rec.date) || Number.isNaN(Date.parse(rec.date))) return { error: '날짜는 YYYY-MM-DD 형식이어야 합니다.' };
  if (!TIME_RE.test(rec.time)) return { error: '시간은 HH:MM 형식이어야 합니다.' };
  if (!rec.purpose || rec.purpose.length > 1000) return { error: '방문 목적이 비어 있거나 1000자를 넘습니다.' };
  const created = str(raw.createdAt);
  if (created && !Number.isNaN(Date.parse(created))) rec.createdAt = new Date(created).toISOString();
  return { rec };
}

class ReservationController {
  async list(req, res, next) {
    try {
      const items = await repo.list();
      res.status(200).json({ success: true, count: items.length, statuses: repo.STATUSES, data: items });
    } catch (err) {
      next(err);
    }
  }

  /** 예약 가져오기 (Formspree 내보내기 등). body: { records: [...] } */
  async importMany(req, res, next) {
    try {
      const records = req.body && req.body.records;
      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ success: false, message: '가져올 예약이 없습니다.' });
      }
      if (records.length > 500) {
        return res.status(400).json({ success: false, message: '한 번에 최대 500건까지 가져올 수 있습니다.' });
      }
      const valid = [];
      const invalid = [];
      records.forEach((raw, i) => {
        const r = normalize(raw);
        if (r.error) invalid.push({ index: i + 1, reason: r.error });
        else valid.push(r.rec);
      });
      const { added, duplicates } = valid.length ? await repo.addMany(valid) : { added: [], duplicates: 0 };
      res.status(200).json({ success: true, added: added.length, duplicates, invalid });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const no = Number(req.params.no);
      const status = req.body && req.body.status;
      if (!Number.isInteger(no) || no < 1) {
        return res.status(400).json({ success: false, message: '예약 번호가 올바르지 않습니다.' });
      }
      if (!repo.STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: `처리 상태는 ${repo.STATUSES.join(', ')} 중 하나여야 합니다.` });
      }
      const item = await repo.updateStatus(no, status);
      if (!item) return res.status(404).json({ success: false, message: '해당 예약을 찾을 수 없습니다.' });
      res.status(200).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReservationController();
