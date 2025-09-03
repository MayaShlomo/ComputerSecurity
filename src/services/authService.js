// Benny — Security: Auth service connecting repos + policy + hashing
const repo = require('../repos'); // Person 1
const { generateSalt, hmacSha1 } = require('../security/hash');
const { validateComplexity, checkDictionary, checkHistory } = require('../security/policy');
const { isLocked } = require('../security/lockout');

async function register({ username, email, password }) {
  const cx = validateComplexity(password, username);
  if (!cx.ok) return { ok: false, status: 400, error: 'Weak password', details: cx.reasons };

  const dict = checkDictionary(password);
  if (!dict.ok) return { ok: false, status: 400, error: dict.reason };

  const salt = generateSalt(16);
  const hash = hmacSha1(password, salt);

  const user = await repo.createUser({
    username, email, passwordHash: hash, salt
  });
  await repo.addPasswordHistory(user.id, hash);
  return { ok: true, status: 201, user: { id: user.id, username, email } };
}

async function login({ username, password }) {
  const user = await repo.findByUsername(username);
  if (!user) return { ok: false, status: 401, error: 'Invalid credentials' };

  if (isLocked(user)) return { ok: false, status: 423, error: 'Account temporarily locked' };

  const hash = hmacSha1(password, user.salt || user.password_salt);
  if (hash !== (user.password_hash || user.hash)) {
    await repo.incFailed(user.id);
    return { ok: false, status: 401, error: 'Invalid credentials' };
  }
  await repo.resetFailed(user.id);
  return { ok: true, status: 200 };
}

async function changePassword({ username, oldPassword, newPassword }) {
  const user = await repo.findByUsername(username);
  if (!user) return { ok: false, status: 401, error: 'Invalid user' };

  const oldHash = hmacSha1(oldPassword, user.salt || user.password_salt);
  if (oldHash !== (user.password_hash || user.hash)) {
    return { ok: false, status: 401, error: 'Wrong password' };
  }

  const cx = validateComplexity(newPassword, username);
  if (!cx.ok) return { ok: false, status: 400, error: 'Weak password', details: cx.reasons };

  const dict = checkDictionary(newPassword);
  if (!dict.ok) return { ok: false, status: 400, error: dict.reason };

  const lastHashes = await repo.getLastPasswordHashes(user.id, 3);
  const newSalt = generateSalt(16);
  const newHash = hmacSha1(newPassword, newSalt);
  const hst = checkHistory(newHash, lastHashes);
  if (!hst.ok) return { ok: false, status: 400, error: hst.reason };

  await repo.updatePassword(user.id, { passwordHash: newHash, salt: newSalt });
  await repo.addPasswordHistory(user.id, newHash);
  await repo.resetFailed(user.id);
  return { ok: true, status: 200 };
}

module.exports = { register, login, changePassword };
