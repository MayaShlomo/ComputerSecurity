// src/security/hash.js
// Security helpers: HMAC-SHA1 + salt + reset token (CommonJS)

'use strict';
const crypto = require('crypto');

// 16 bytes => 32 hex chars for salt
const SALT_BYTES = 16;
// random source for reset token before hashing
const RESET_TOKEN_RANDOM_BYTES = 32;

/**
 * Generate a cryptographically-strong random salt.
 * @param {number} bytes - number of random bytes
 * @returns {string} hex-encoded salt (length = bytes*2)
 */
function generateSalt(bytes = SALT_BYTES) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Alias helper used elsewhere in the project.
 * @returns {string} hex-encoded salt (32 hex chars)
 */
function newSalt() {
  return generateSalt(SALT_BYTES);
}

/**
 * HMAC-SHA1(password, salt) -> hex digest.
 * @param {string} password
 * @param {string} salt
 * @returns {string} 40-char hex HMAC digest
 */
function hmacSha1(password, salt) {
  return crypto
    .createHmac('sha1', String(salt))
    .update(String(password ?? ''))
    .digest('hex');
}

/**
 * Create password reset token using SHA-1 over random bytes.
 * Requirement: 40 hexadecimal characters (SHA-1 digest).
 * @returns {string} 40-char hex token
 */
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
