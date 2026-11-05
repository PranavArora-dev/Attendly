'use strict';
const fs = require('node:fs'), path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { hashPassword } = require('./auth');

const file = process.env.DB_PATH || path.join(__dirname, 'data', 'attendly.db');
if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
const db = new DatabaseSync(file);
db.exec(`
PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS sections(id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS subjects(id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL, code TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE, roll_no TEXT UNIQUE,
  password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN('teacher','student')), section_id INTEGER REFERENCES sections(id));
CREATE TABLE IF NOT EXISTS classes(id INTEGER PRIMARY KEY, section_id INTEGER NOT NULL REFERENCES sections(id),
  subject_id INTEGER NOT NULL REFERENCES subjects(id), teacher_id INTEGER NOT NULL REFERENCES users(id),
  time_label TEXT NOT NULL, days TEXT NOT NULL DEFAULT 'Mon,Tue,Wed,Thu,Fri');
CREATE TABLE IF NOT EXISTS attendance(class_id INTEGER NOT NULL REFERENCES classes(id), student_id INTEGER NOT NULL REFERENCES users(id),
  date TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN('P','A')), PRIMARY KEY(class_id, student_id, date));
CREATE INDEX IF NOT EXISTS idx_att_student ON attendance(student_id, date);
CREATE TABLE IF NOT EXISTS announcements(id INTEGER PRIMARY KEY, title TEXT NOT NULL, text TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS activity(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, type TEXT NOT NULL, text TEXT NOT NULL, created_at INTEGER NOT NULL);
`);

function tx(fn) {
  db.exec('BEGIN');
  try { const r = fn(); db.exec('COMMIT'); return r; } catch (e) { db.exec('ROLLBACK'); throw e; }
}
function sectionId(name) {
  db.prepare('INSERT OR IGNORE INTO sections(name) VALUES(?)').run(name);
  return db.prepare('SELECT id FROM sections WHERE name=?').get(name).id;
}

/* Demo data: sirf tab jab database khaali ho aur SEED_DEMO=false na ho */
function seedDemo() {
  if (process.env.SEED_DEMO === 'false' || db.prepare('SELECT COUNT(*) n FROM users').get().n > 0) return;
  tx(() => {
    const sec = sectionId('CSE-3A'), now = Date.now(), H = 3600e3;
    const subs = [['Data Structures', 'CS301'], ['Web Development', 'CS302'], ['Database Management', 'CS303'], ['Operating Systems', 'CS304']];
    subs.forEach(s => db.prepare('INSERT INTO subjects(name,code) VALUES(?,?)').run(...s));
    const t = db.prepare('INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)').run('Prof. Sharma', 'prof@college.edu', hashPassword('teacher123'), 'teacher').lastInsertRowid;
    const pct = [92, 89, 79, 95, 85, 88, 76, 90];
    const stu = ['Pranav Arora', 'Riya Sharma', 'Aaditya Singh', 'Neha Gupta', 'Karan Verma', 'Muskan Jain', 'Arpit Soni', 'Tanya Mehta'].map((n, i) =>
      ({ id: +db.prepare('INSERT INTO users(name,roll_no,password_hash,role,section_id) VALUES(?,?,?,?,?)').run(n, String(220101 + i), hashPassword('student123'), 'student', sec).lastInsertRowid, p: pct[i] }));
    const times = ['9:00 AM - 10:00 AM', '11:00 AM - 12:00 PM', '1:00 PM - 2:00 PM', '3:00 PM - 4:00 PM'];
    const cls = times.map((tm, i) => +db.prepare('INSERT INTO classes(section_id,subject_id,teacher_id,time_label) VALUES(?,?,?,?)').run(sec, i + 1, t, tm).lastInsertRowid);
    const ins = db.prepare('INSERT INTO attendance(class_id,student_id,date,status) VALUES(?,?,?,?)');
    for (let d = 0; d < 35; d++) {
      const dt = new Date(now - d * 86400e3), dow = dt.getUTCDay(), date = dt.toISOString().slice(0, 10);
      cls.forEach((c, ci) => {
        const weekday = dow >= 1 && dow <= 5;
        if (d === 0 ? ci > 1 || false : !weekday) return; /* aaj sirf pehli 2 classes: 2 pending dikhein */
        stu.forEach(s => ins.run(c, s.id, date, ((s.id * 7919 + c * 104729 + d * 1299709) % 100) < s.p ? 'P' : 'A'));
      });
    }
    const an = db.prepare('INSERT INTO announcements(title,text,created_at) VALUES(?,?,?)');
    an.run('Internal Exam Schedule', 'Internal exams will be conducted from 15th Oct onwards.', now - 48 * H);
    an.run('Library Timings', 'Library stays open until 8 PM during exams.', now - 120 * H);
    const ac = db.prepare('INSERT INTO activity(user_id,type,text,created_at) VALUES(?,?,?,?)');
    ac.run(t, 'check', 'You marked attendance for Data Structures', now - 2 * H);
    ac.run(t, 'plus', 'New student Tanya Mehta added to CSE-3A', now - 4 * H);
    ac.run(t, 'doc', 'Attendance report generated for CSE-3A', now - 6 * H);
  });
  console.log('[seed] Demo data created: prof@college.edu / teacher123, roll 220101 / student123');
}
module.exports = { db, tx, sectionId, seedDemo };
