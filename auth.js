'use strict';
const crypto = require('node:crypto');
const SECRET = process.env.JWT_SECRET || (() => {
  console.warn('[warn] JWT_SECRET is not set. Using a temporary secret; everyone is signed out on restart.');
  return crypto.randomBytes(32).toString('hex');
})();
const b64 = (s) => Buffer.from(s).toString('base64url');
const sign = (data) => crypto.createHmac('sha256', SECRET).update(data).digest('base64url');

function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  return salt.toString('hex') + ':' + crypto.scryptSync(pw, salt, 64).toString('hex');
}
function verifyPassword(pw, stored) {
  const [s, h] = String(stored).split(':');
  if (!s || !h) return false;
  const got = crypto.scryptSync(pw, Buffer.from(s, 'hex'), 64), want = Buffer.from(h, 'hex');
  return got.length === want.length && crypto.timingSafeEqual(got, want);
}
function signToken(payload, ttl = 7 * 86400) {
  const data = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + b64(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttl }));
  return data + '.' + sign(data);
}
function verifyToken(t) {
  try {
    const [h, p, s] = String(t).split('.');
    if (!h || !p || !s) return null;
    const a = Buffer.from(s), b = Buffer.from(sign(h + '.' + p));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const body = JSON.parse(Buffer.from(p, 'base64url'));
    return body.exp > Date.now() / 1000 ? body : null;
  } catch { return null; }
}
module.exports = { hashPassword, verifyPassword, signToken, verifyToken };
