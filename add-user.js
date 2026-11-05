'use strict';
/* Use: node add-user.js teacher "Name" email password
        node add-user.js student "Name" rollNo password SECTION
   Section automatically ban jata hai (jaise CSE-3A). */
const { db, sectionId } = require('./db');
const { hashPassword } = require('./auth');
const [role, name, login, password, section] = process.argv.slice(2);
if (!['teacher', 'student'].includes(role) || !name || !login || !password || (role === 'student' && !section) || password.length < 6) {
  console.log('Usage:\n  node add-user.js teacher "Name" email password\n  node add-user.js student "Name" rollNo password SECTION\n(password kam se kam 6 characters)'); process.exit(1);
}
try {
  db.prepare(`INSERT INTO users(name,email,roll_no,password_hash,role,section_id) VALUES(?,?,?,?,?,?)`)
    .run(name, role === 'teacher' ? login.toLowerCase() : null, role === 'student' ? login : null, hashPassword(password), role, role === 'student' ? sectionId(section) : null);
  console.log(`Created ${role}: ${name}`);
} catch (e) { console.log('Could not create user:', /UNIQUE/.test(e.message) ? 'that email or roll number already exists.' : e.message); process.exit(1); }
