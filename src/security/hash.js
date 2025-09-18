'use strict';
const crypto = require('crypto');

const SALT_BYTES = 16;
const RESET_TOKEN_RANDOM_BYTES = 32;

function generateSalt(bytes = SALT_BYTES) {
  return crypto.randomBytes(bytes).toString('hex');
}

function newSalt() {
  return generateSalt(SALT_BYTES);
}

function hmacSha1(password, salt) {
  return crypto
    .createHmac('sha1', String(salt))
    .update(String(password ?? ''))
    .digest('hex');
}

function newResetToken() {
  const rnd = crypto.randomBytes(RESET_TOKEN_RANDOM_BYTES);
  return crypto.createHash('sha1').update(rnd).digest('hex');
}

module.exports = {
  generateSalt,
  newSalt,
  newResetToken,
  hmacSha1,
};
