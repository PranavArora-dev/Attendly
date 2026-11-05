'use strict';
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const { db, tx, seedDemo } = require('./db');
const { verifyPassword, signToken, verifyToken } = require('./auth');
const PORT = +process.env.PORT || 3000, PUBLIC = path.join(__dirname, 'public');
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const bad = (m) => new HttpError(400, m);

/* ---------- helpers ---------- */
const iso = (d) => d.toISOString().slice(0, 10);
const pct = (p, n) => (n ? Math.round((100 * p) / n) : 0);
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const niceDate = (s) => { const [y, m, d] = s.split('-'); return `${+d} ${MON[m - 1]} ${y}`; };
function ago(ts) {
  const m = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (m < 60) return `${m} minute${m > 1 ? 's' : ''} ago`;
  const h = Math.round(m / 60); if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  const d = Math.round(h / 24); return `${d} day${d > 1 ? 's' : ''} ago`;
}
const CLASS_SQL = `SELECT c.id, s.name AS name, sub.name AS subject, c.time_label AS time, c.section_id, c.days,
  (SELECT COUNT(*) FROM users u WHERE u.section_id=c.section_id AND u.role='student') AS count
  FROM classes c JOIN sections s ON s.id=c.section_id JOIN subjects sub ON sub.id=c.subject_id`;
const classesFor = (u) => u.role === 'teacher'
  ? db.prepare(CLASS_SQL + ' WHERE c.teacher_id=? ORDER BY c.id').all(u.id)
  : db.prepare(CLASS_SQL + ' WHERE c.section_id=? ORDER BY c.id').all(u.section_id ?? -1);
const publicClass = ({ id, name, subject, time, count }) => ({ id, name, subject, time, count });
function ownClass(u, id) {
  const c = db.prepare(CLASS_SQL + ' WHERE c.id=? AND c.teacher_id=?').get(+id, u.id);
  if (!c) throw new HttpError(404, 'Class not found.');
  return c;
}
function validDate(d) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d || '') || iso(new Date(d)) !== d) throw bad('Enter a valid date (YYYY-MM-DD).');
  if (new Date(d) > new Date(Date.now() + 86400e3)) throw bad('You cannot mark attendance for a future date.');
  return d;
}

/* ---------- routes ---------- */
const routes = [];
const route = (method, p, roles, handler) =>
  routes.push({ method, roles, handler, re: new RegExp('^' + p.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$') });
const T = ['teacher'], S = ['student'], ANY = ['teacher', 'student'];

const attempts = new Map();
route('POST', '/api/auth/login', null, ({ body, ip }) => {
  const a = attempts.get(ip) || { n: 0, t: Date.now() };
  if (Date.now() - a.t > 15 * 60e3) { a.n = 0; a.t = Date.now(); }
  if (a.n >= 10) throw new HttpError(429, 'Too many attempts. Please wait a few minutes and try again.');
  const id = String(body.identifier || '').trim(), pw = String(body.password || '');
  if (!id || !pw) throw bad('Enter your email or roll number and password.');
  const u = db.prepare('SELECT u.*, s.name AS section FROM users u LEFT JOIN sections s ON s.id=u.section_id WHERE lower(u.email)=lower(?) OR u.roll_no=?').get(id, id);
  if (!u || !verifyPassword(pw, u.password_hash)) { a.n++; attempts.set(ip, a); throw new HttpError(401, 'Incorrect email/roll number or password.'); }
  attempts.delete(ip);
  const user = { id: u.id, name: u.name, role: u.role };
  if (u.role === 'student') { user.rollNo = u.roll_no; user.className = u.section; }
  return { token: signToken({ uid: u.id }), user };
});

route('GET', '/api/teacher/dashboard', T, ({ user, query }) => {
  const cls = classesFor(user), today = iso(new Date());
  const students = db.prepare(`SELECT COUNT(DISTINCT u.id) n FROM users u JOIN classes c ON c.section_id=u.section_id WHERE c.teacher_id=? AND u.role='student'`).get(user.id).n;
  const since = iso(new Date(Date.now() - 30 * 86400e3));
  const day = db.prepare(`SELECT COUNT(*) n, COALESCE(SUM(a.status='P'),0) p FROM attendance a JOIN classes c ON c.id=a.class_id WHERE c.teacher_id=? AND a.date>=?`).get(user.id, since);
  const pending = db.prepare(`SELECT COUNT(*) n FROM classes c WHERE c.teacher_id=? AND NOT EXISTS(SELECT 1 FROM attendance a WHERE a.class_id=c.id AND a.date=?)`).get(user.id, today).n;
  const now = new Date(), mon = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - ((now.getUTCDay() + 6) % 7) - (query.get('range') === 'last' ? 7 : 0)));
  const q = db.prepare(`SELECT COUNT(*) n, COALESCE(SUM(a.status='P'),0) p FROM attendance a JOIN classes c ON c.id=a.class_id WHERE c.teacher_id=? AND a.date=?`);
  const week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => { const r = q.get(user.id, iso(new Date(mon.getTime() + i * 86400e3))); return { day: d, pct: pct(r.p, r.n) }; });
  const activity = db.prepare('SELECT type, text, created_at FROM activity WHERE user_id=? ORDER BY created_at DESC LIMIT 5').all(user.id).map(a => ({ type: a.type, text: a.text, time: ago(a.created_at) }));
  return { stats: { classes: cls.length, students, avg: pct(day.p, day.n), pending }, today: cls.map(publicClass), week, activity };
});

route('GET', '/api/classes', ANY, ({ user }) => classesFor(user).map(publicClass));
route('GET', '/api/students', T, ({ user }) => db.prepare(`SELECT DISTINCT u.id, u.roll_no AS rollNo, u.name, s.name AS className FROM users u JOIN sections s ON s.id=u.section_id
  JOIN classes c ON c.section_id=u.section_id WHERE c.teacher_id=? AND u.role='student' ORDER BY s.name, u.roll_no`).all(user.id));
route('GET', '/api/subjects', ANY, () => db.prepare('SELECT id, name, code FROM subjects ORDER BY id').all());
route('GET', '/api/announcements', ANY, () =>
  db.prepare('SELECT id, title, text, created_at FROM announcements ORDER BY created_at DESC LIMIT 30').all().map(a => ({ id: a.id, title: a.title, text: a.text, ago: ago(a.created_at) })));

route('GET', '/api/classes/:id/attendance', T, ({ user, params, query }) => {
  const c = ownClass(user, params.id), date = validDate(query.get('date'));
  const saved = new Map(db.prepare('SELECT student_id, status FROM attendance WHERE class_id=? AND date=?').all(c.id, date).map(r => [r.student_id, r.status]));
  return db.prepare(`SELECT id, roll_no, name FROM users WHERE role='student' AND section_id=? ORDER BY roll_no`).all(c.section_id)
    .map(s => ({ studentId: s.id, rollNo: s.roll_no, name: s.name, status: saved.get(s.id) || 'P' }));
});

route('POST', '/api/classes/:id/attendance', T, ({ user, params, body }) => {
  const c = ownClass(user, params.id), date = validDate(body.date), recs = body.records;
  if (!Array.isArray(recs) || !recs.length || recs.length > 500) throw bad('Send the attendance records to save.');
  const ok = new Set(db.prepare(`SELECT id FROM users WHERE role='student' AND section_id=?`).all(c.section_id).map(r => r.id));
  for (const r of recs) {
    if (!ok.has(+r.studentId)) throw bad('One of the students does not belong to this class.');
    if (r.status !== 'P' && r.status !== 'A') throw bad('Status must be P (present) or A (absent).');
  }
  tx(() => {
    const up = db.prepare(`INSERT INTO attendance(class_id,student_id,date,status) VALUES(?,?,?,?) ON CONFLICT(class_id,student_id,date) DO UPDATE SET status=excluded.status`);
    recs.forEach(r => up.run(c.id, +r.studentId, date, r.status));
    db.prepare('INSERT INTO activity(user_id,type,text,created_at) VALUES(?,?,?,?)').run(user.id, 'check', `You marked attendance for ${c.subject}`, Date.now());
  });
  return { ok: true, saved: recs.length };
});

route('GET', '/api/reports', T, ({ user, query }) => {
  const cls = String(query.get('class') || ''), sub = String(query.get('subject') || '');
  const days = Math.min(365, Math.max(1, parseInt(query.get('days'), 10) || 30)), since = iso(new Date(Date.now() - days * 86400e3));
  const rows = db.prepare(`SELECT u.roll_no AS rollNo, u.name, COUNT(a.status) AS total, COALESCE(SUM(a.status='P'),0) AS present
    FROM users u JOIN sections s ON s.id=u.section_id AND s.name=?
    LEFT JOIN attendance a ON a.student_id=u.id AND a.date>=? AND a.class_id IN
      (SELECT c.id FROM classes c JOIN subjects sb ON sb.id=c.subject_id WHERE c.teacher_id=? AND (?='' OR sb.name=?))
    WHERE u.role='student' GROUP BY u.id ORDER BY u.roll_no`).all(cls, since, user.id, sub, sub)
    .map(r => ({ rollNo: r.rollNo, name: r.name, total: r.total, present: r.present, pct: pct(r.present, r.total) }));
  const tot = rows.reduce((a, r) => a + r.total, 0), pres = rows.reduce((a, r) => a + r.present, 0);
  return { avg: pct(pres, tot), count: rows.length, low: rows.filter(r => r.total > 0 && r.pct < 75).length, rows };
});

route('GET', '/api/student/overview', S, ({ user }) => {
  const sections = db.prepare(`SELECT sb.name, COUNT(a.status) n, COALESCE(SUM(a.status='P'),0) p FROM classes c JOIN subjects sb ON sb.id=c.subject_id
    LEFT JOIN attendance a ON a.class_id=c.id AND a.student_id=? WHERE c.section_id=? GROUP BY c.id ORDER BY c.id`).all(user.id, user.section_id ?? -1);
  const total = sections.reduce((a, s) => a + s.n, 0), attended = sections.reduce((a, s) => a + s.p, 0);
  const history = db.prepare(`SELECT a.date, sb.name AS subject, a.status FROM attendance a JOIN classes c ON c.id=a.class_id JOIN subjects sb ON sb.id=c.subject_id
    WHERE a.student_id=? ORDER BY a.date DESC, c.id LIMIT 20`).all(user.id).map(h => ({ date: niceDate(h.date), subject: h.subject, status: h.status }));
  const cls = classesFor(user);
  const timetable = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({ day, slots: cls.filter(c => c.days.split(',').includes(day)).map(c => ({ time: c.time.split(' - ')[0], subject: c.subject })) })).filter(d => d.slots.length);
  const announcements = db.prepare('SELECT id, title, text, created_at FROM announcements ORDER BY created_at DESC LIMIT 10').all().map(a => ({ id: a.id, title: a.title, text: a.text, ago: ago(a.created_at) }));
  return { pct: pct(attended, total), attended, total, missed: total - attended, subjects: sections.map(s => ({ name: s.name, pct: pct(s.p, s.n) })), announcements, history, timetable };
});

route('GET', '/api/health', null, () => ({ ok: true }));

/* ---------- http plumbing ---------- */
const send = (res, status, data) => { const b = JSON.stringify(data); res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(b); };
function readBody(req) {
  return new Promise((resolve, reject) => {
    let s = '';
    req.on('data', c => { s += c; if (s.length > 200e3) { reject(new HttpError(413, 'Request is too large.')); req.destroy(); } });
    req.on('end', () => { if (!s) return resolve({}); try { const j = JSON.parse(s); resolve(j && typeof j === 'object' ? j : {}); } catch { reject(bad('Invalid JSON body.')); } });
    req.on('error', reject);
  });
}
async function handleApi(req, res, url) {
  const r = routes.find(x => x.method === req.method && x.re.test(url.pathname));
  if (!r) throw new HttpError(404, 'Not found.');
  let user = null;
  if (r.roles) {
    const p = verifyToken((req.headers.authorization || '').replace(/^Bearer\s+/i, ''));
    user = p && db.prepare('SELECT * FROM users WHERE id=?').get(p.uid);
    if (!user) throw new HttpError(401, 'Please sign in again.');
    if (!r.roles.includes(user.role)) throw new HttpError(403, 'You do not have access to this.');
  }
  const body = req.method === 'POST' ? await readBody(req) : {};
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  send(res, 200, await r.handler({ user, params: url.pathname.match(r.re).groups || {}, query: url.searchParams, body, ip }));
}
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon' };
function serveStatic(req, res, url) {
  if (req.method !== 'GET' && req.method !== 'HEAD') throw new HttpError(405, 'Method not allowed.');
  let p = decodeURIComponent(url.pathname); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(PUBLIC, path.normalize(p));
  if (!f.startsWith(PUBLIC + path.sep) || !fs.existsSync(f) || !fs.statSync(f).isFile()) throw new HttpError(404, 'Page not found.');
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  fs.createReadStream(f).pipe(res);
}
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'same-origin');
    if (process.env.CORS_ORIGIN) {
      res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN);
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    }
    if (url.pathname.startsWith('/api/')) await handleApi(req, res, url); else serveStatic(req, res, url);
  } catch (e) {
    if (!e.status) console.error(e);
    if (!res.headersSent) { if (req.url.startsWith('/api/')) send(res, e.status || 500, { message: e.status ? e.message : 'Something went wrong. Please try again.' }); else { res.writeHead(e.status || 500, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end(e.status ? e.message : 'Server error'); } }
  }
});
seedDemo();
if (require.main === module) server.listen(PORT, () => console.log(`Attendly running on http://localhost:${PORT}`));
module.exports = server;
