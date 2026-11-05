# Attendly - Full stack (frontend + backend)

Zero npm dependencies. Node.js 22.13+ (built-in SQLite). Ek hi server frontend aur API dono serve karta hai.

## Local run
    npm start            # http://localhost:3000
    npm test             # 19 checks, temporary DB use hota hai
Demo login (pehli baar auto-create hota hai): `prof@college.edu / teacher123` (teacher), `220101 / student123` (student).

## Environment variables
- PORT            - default 3000 (hosting platform khud set karta hai)
- JWT_SECRET      - lamba random string. Production me zaroor set karo
- DB_PATH         - default ./data/attendly.db (persistent disk par point karo)
- SEED_DEMO       - `false` karo to demo data nahi banega
- CORS_ORIGIN     - sirf tab, jab frontend alag domain par ho

## Real users banana
    node add-user.js teacher "Prof. Mehta" mehta@college.edu StrongPass123
    node add-user.js student "Riya Sharma" 230101 StrongPass123 CSE-3A
Production me pehle `SEED_DEMO=false` set karo aur demo hint hatao (public/js/app.js me "Demo:" wali line).

## Files
server.js (API + static) | db.js (schema + demo seed) | auth.js (JWT + password hash) | add-user.js | test.js | public/ (frontend)
