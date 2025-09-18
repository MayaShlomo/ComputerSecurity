'use strict';

const nodemailer = require('nodemailer');
const repo = require('../repos');

const { hmacSha1, newSalt, newResetToken } = require('../security/hash');
const { validateComplexity, checkDictionary, checkHistory } = require('../security/policy');
const { isLocked } = require('../security/lockout');

const MODE = process.env.MODE || 'secure'; 
const PASSWORD_HISTORY_COUNT = 3;

async function register({ username, email, password }) {
  const u = await repo.findByUsername(username);
  if (u) return { ok: false, error: 'Username already exists' };

  const e = await repo.findByEmail(email);
  if (e) return { ok: false, error: 'Email already in use' };

  const cx = validateComplexity(password, username);
  if (!cx.ok) return { ok: false, error: 'Password policy: ' + cx.reasons.join(', ') };

  const dict = checkDictionary(password);
  if (!dict.ok) return { ok: false, error: dict.reason };

  const salt = newSalt();                         // 16 bytes -> 32 hex
  const hash = hmacSha1(password, salt);         // 40 hex (SHA-1 HMAC)

  const user = await repo.createUser(username, email, hash, salt);
  await repo.addPasswordHistory(user.id, hash);

  return { ok: true };
}

async function login({ username, password }) {
  if (MODE === 'vuln') {
    const fakeHash = hmacSha1(password, 'dummy'); 
    const user = await repo.authByUserAndHash(username, fakeHash);

    if (user) {
      await repo.resetFailed(user.username);
      return { ok: true };
    }
    await repo.incFailed(username);
    return { ok: false, error: 'Invalid username or password' };
  }

  const user = await repo.findByUsername(username);
  if (!user) return { ok: false, error: 'Invalid username or password' };

  if (isLocked(user)) {
    return { ok: false, error: 'Account temporarily locked' };
  }

  const hash = hmacSha1(password, user.salt);
  if (hash !== user.password_hash) {
    await repo.incFailed(username);
    return { ok: false, error: 'Invalid username or password' };
  }

  await repo.resetFailed(username);
  return { ok: true };
}

async function changePassword({ username, oldPassword, newPassword }) {
  const user = await repo.findByUsername(username);
  if (!user) return { ok: false, error: 'User not found' };

  const oldHash = hmacSha1(oldPassword, user.salt);
  if (oldHash !== user.password_hash) return { ok: false, error: 'Old password is incorrect' };

  const cx = validateComplexity(newPassword, username);
  if (!cx.ok) return { ok: false, error: 'Password policy: ' + cx.reasons.join(', ') };

  const dict = checkDictionary(newPassword);
  if (!dict.ok) return { ok: false, error: dict.reason };

  const newHash = hmacSha1(newPassword, user.salt);

  const history = await repo.getPasswordHistory(user.id, PASSWORD_HISTORY_COUNT);
  const lastHashes = (history || []).map(h => h.password_hash);
  const hist = checkHistory(newHash, lastHashes);
  if (!hist.ok) return { ok: false, error: hist.reason };

  await repo.updatePassword(user.id, newHash);
  await repo.addPasswordHistory(user.id, newHash);

  return { ok: true };
}

async function forgotPassword(email) {
  const user = await repo.findByEmail(email);
  if (!user) return { ok: false, error: 'User not found' };

  const token = newResetToken(); 
  await repo.createPasswordReset(user.id, token);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"Comunication_LTD" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Token',
    text: `Your reset token:\n\n${token}\n\nOpen http://localhost:3000/reset and paste this token to set a new password.`,
  });

  return { ok: true };
}

async function resetPassword({ token, newPassword }) {
  const reset = await repo.findPasswordReset(token);
  if (!reset || reset.used) return { ok: false, error: 'Invalid token' };
  if (new Date(reset.expires_at) < new Date()) return { ok: false, error: 'Token expired' };

  const user = await repo.findById(reset.user_id);
  if (!user) return { ok: false, error: 'User not found' };

  const cx = validateComplexity(newPassword, user.username);
  if (!cx.ok) return { ok: false, error: 'Password policy: ' + cx.reasons.join(', ') };

  const dict = checkDictionary(newPassword);
  if (!dict.ok) return { ok: false, error: dict.reason };

  const newHash = hmacSha1(newPassword, user.salt);

  const history = await repo.getPasswordHistory(user.id, PASSWORD_HISTORY_COUNT);
  const lastHashes = (history || []).map(h => h.password_hash);
  const hist = checkHistory(newHash, lastHashes);
  if (!hist.ok) return { ok: false, error: hist.reason };

  await repo.updatePassword(user.id, newHash);
  await repo.addPasswordHistory(user.id, newHash);
  await repo.markResetAsUsed(token);

  return { ok: true };
}

async function addCustomer(name, email, phone) {
  const c = await repo.addCustomer(name, email || null, phone || null);
  return c ? { ok: true } : { ok: false, error: 'Failed to add customer' };
}
async function getCustomers() {
  return await repo.listCustomers();
}

module.exports = {
  register,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  addCustomer,
  getCustomers,
};

