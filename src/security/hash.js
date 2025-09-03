// Benny — Security: HMAC-SHA1 + salt helpers (CommonJS)
const crypto = require('crypto');

function generateSalt(bytes = 16) {
  return crypto.randomBytes(bytes).toString('hex'); // 32 hex chars
}

function hmacSha1(password, salt) {
  return crypto.createHmac('sha1', String(salt)).update(String(password)).digest('hex');
}

module.exports = { generateSalt, hmacSha1 };
