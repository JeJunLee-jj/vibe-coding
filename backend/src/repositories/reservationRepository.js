/**
 * ReservationRepository
 *
 * 방문 예약 목록을 data/reservations.json 파일에 저장합니다. (개인정보 포함 → .gitignore 처리됨)
 * 나중에 DB로 옮길 때는 이 파일의 메서드 내부만 바꾸면 됩니다.
 *
 * 예약 식별 규칙
 *  - no  : 예약 번호 (1부터 순차 부여, 화면에는 R-0001 형태로 표시)
 *  - key : 이름 + 이메일 + 방문 희망 날짜·시간. 같은 사람이 여러 번 신청해도
 *          희망 시간이 다르면 별개의 예약이고, 모두 같으면 같은 예약(중복)으로 본다.
 *
 * TODO(추후): 서로 다른 신청자의 방문 희망 시간이 겹치지 않도록 관리 (현재는 겹침 검사 안 함)
 */

const fs = require('fs').promises;
const config = require('../config');

const STATUSES = ['접수', '확정', '변경요청', '취소'];

function makeKey({ name, email, date, time }) {
  return [String(name).trim().toLowerCase(), String(email).trim().toLowerCase(), `${date} ${time}`].join('|');
}

class FileReservationRepository {
  constructor(filePath) {
    this.filePath = filePath;
    this._queue = Promise.resolve();   // 동시 쓰기 직렬화
  }

  async _read() {
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      const data = JSON.parse(raw);
      if (!Array.isArray(data.items)) data.items = [];
      if (!Number.isInteger(data.nextNo)) data.nextNo = data.items.reduce((m, r) => Math.max(m, r.no), 0) + 1;
      return data;
    } catch (err) {
      if (err.code === 'ENOENT') return { nextNo: 1, items: [] };
      throw new Error('예약 데이터를 불러오지 못했습니다.');
    }
  }

  async _write(data) {
    const tmp = this.filePath + '.tmp';
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tmp, this.filePath);
  }

  _locked(fn) {
    const run = this._queue.then(fn);
    this._queue = run.catch(() => {});
    return run;
  }

  async list() {
    const data = await this._read();
    return data.items;
  }

  /**
   * 여러 건 추가. 같은 key가 이미 있으면 건너뜁니다.
   * @returns {{added: object[], duplicates: number}}
   */
  addMany(records) {
    return this._locked(async () => {
      const data = await this._read();
      const keys = new Set(data.items.map((r) => r.key));
      const added = [];
      let duplicates = 0;
      for (const rec of records) {
        const key = makeKey(rec);
        if (keys.has(key)) { duplicates++; continue; }
        keys.add(key);
        const now = new Date().toISOString();
        const item = {
          no: data.nextNo++,
          key,
          name: rec.name,
          email: rec.email,
          date: rec.date,
          time: rec.time,
          purpose: rec.purpose,
          status: '접수',
          createdAt: rec.createdAt || now,
          updatedAt: now
        };
        data.items.push(item);
        added.push(item);
      }
      if (added.length) await this._write(data);
      return { added, duplicates };
    });
  }

  updateStatus(no, status) {
    return this._locked(async () => {
      const data = await this._read();
      const item = data.items.find((r) => r.no === no);
      if (!item) return null;
      item.status = status;
      item.updatedAt = new Date().toISOString();
      await this._write(data);
      return item;
    });
  }
}

module.exports = new FileReservationRepository(config.reservationsPath);
module.exports.STATUSES = STATUSES;
module.exports.makeKey = makeKey;
