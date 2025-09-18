const cfg = require('../../config/security.config.json');

function isLocked(user) {
  if (!user) return false;
  if ((user.failed_attempts || 0) < cfg.lockoutThreshold) return false;
  const last = user.last_failed_at || user.locked_until || null;
  if (!last) return false;
  const lastMs = new Date(last).getTime();
  const now = Date.now();
  const windowMs = (cfg.lockoutWindowMinutes || 15) * 60 * 1000;
  return (now - lastMs) < windowMs;
}

module.exports = { isLocked };
