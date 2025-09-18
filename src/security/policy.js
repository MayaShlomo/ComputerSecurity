const fs = require('fs');
const path = require('path');
const cfg = require('../../config/security.config.json');

let DICT = new Set();
(function loadDict() {
  try {
    const p = path.resolve(process.cwd(), cfg.dictionaryPath);
    const text = fs.readFileSync(p, 'utf8');
    DICT = new Set(text.split(/\r?\n/).map(s => s.trim().toLowerCase()).filter(Boolean));
  } catch (e) {
    console.warn('[policy] Dictionary not loaded:', e.message);
    DICT = new Set();
  }
})();

function validateComplexity(password, username = '') {
  const reasons = [];
  if (password.length < cfg.minLength) reasons.push('Too short');
  if (cfg.requireUpper && !/[A-Z]/.test(password)) reasons.push('Missing uppercase');
  if (cfg.requireLower && !/[a-z]/.test(password)) reasons.push('Missing lowercase');
  if (cfg.requireDigit && !/\d/.test(password)) reasons.push('Missing digit');
  if (cfg.requireSymbol && !/[^\w\s]/.test(password)) reasons.push('Missing symbol');
  if (username && password.toLowerCase().includes(String(username).toLowerCase()))
    reasons.push('Contains username');
  return { ok: reasons.length === 0, reasons };
}

function checkDictionary(password) {
  const normalized = String(password).toLowerCase();
  if (DICT.has(normalized)) return { ok: false, reason: 'Password found in dictionary' };
  return { ok: true };
}

function checkHistory(newHash, lastHashes = []) {
  const n = Number(cfg.historyCount) || 3;
  if (lastHashes.slice(0, n).includes(newHash)) {
    return { ok: false, reason: 'Matches one of the last passwords' };
  }
  return { ok: true };
}

module.exports = { validateComplexity, checkDictionary, checkHistory };
