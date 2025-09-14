const express = require("express");
const authService = require("../services/authService.js");

const router = express.Router();

function noCache(req, res, next) {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private, max-age=0");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
}
function requireLogin(req, res, next) {
  if (!req.session?.username) return res.redirect(303, "/login");
  next();
}

function replaceTo(res, url) {
  res.send(
    `<!doctype html><meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate, private">
     <script>location.replace(${JSON.stringify(url)});</script>`
  );
}

router.get("/register", noCache, (req, res) => {
  if (req.session?.username) return replaceTo(res, "/system");
  res.render("register", { error: req.query.error || null, success: req.query.success || null });
});
router.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return replaceTo(res, "/register?error=" + encodeURIComponent("Passwords do not match"));
  }
  try {
    const result = await authService.register({ username, email, password });
    if (result.ok) return replaceTo(res, "/login?success=" + encodeURIComponent("User registered successfully!"));
    return replaceTo(res, "/register?error=" + encodeURIComponent(result.error));
  } catch {
    return replaceTo(res, "/register?error=" + encodeURIComponent("Registration failed"));
  }
});

router.get("/login", noCache, (req, res) => {
  if (req.session?.username) return replaceTo(res, "/system");
  res.render("login", {
    error: req.query.error || null,
    success: req.query.success || null,
    isAuthed: !!req.session?.username
  });
});
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await authService.login({ username, password });
    if (result.ok) {
      req.session.username = username;
      return replaceTo(res, "/system"); // לא מוסיף היסטוריה
    }
    return replaceTo(res, "/login?error=" + encodeURIComponent(result.error));
  } catch {
    return replaceTo(res, "/login?error=" + encodeURIComponent("Login failed"));
  }
});

router.get("/forgot-password", noCache, (req, res) => {
  res.render("forgot", { error: req.query.error || null, success: req.query.success || null });
});
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const result = await authService.forgotPassword(email);
    if (result.ok) {
      return replaceTo(
        res,
        "/forgot-password?success=" + encodeURIComponent("Reset token sent. Open Reset page and paste it.")
      );
    }
    return replaceTo(res, "/forgot-password?error=" + encodeURIComponent(result.error));
  } catch {
    return replaceTo(res, "/forgot-password?error=" + encodeURIComponent("Failed to send reset token"));
  }
});

router.get("/reset", noCache, (req, res) => {
  res.render("reset", { error: req.query.error || null, success: req.query.success || null });
});
router.post("/reset", async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;
  if (!token) return replaceTo(res, "/reset?error=" + encodeURIComponent("Reset token is required"));
  if (newPassword !== confirmPassword) {
    return replaceTo(res, "/reset?error=" + encodeURIComponent("Passwords do not match"));
  }
  try {
    const result = await authService.resetPassword({ token, newPassword });
    if (result.ok) return replaceTo(res, "/login?success=" + encodeURIComponent("Password reset successfully!"));
    return replaceTo(res, "/reset?error=" + encodeURIComponent(result.error));
  } catch {
    return replaceTo(res, "/reset?error=" + encodeURIComponent("Failed to reset password"));
  }
});

router.get("/change-password", noCache, requireLogin, (req, res) => {
  res.render("changePassword", {
    error: req.query.error || null,
    success: req.query.success || null
  });
});
router.post("/change-password", requireLogin, async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (newPassword !== confirmPassword) {
    return replaceTo(res, "/change-password?error=" + encodeURIComponent("Passwords do not match"));
  }
  try {
    const result = await authService.changePassword({
      username: req.session.username,
      oldPassword,
      newPassword
    });
    if (result.ok) return replaceTo(res, "/change-password?success=" + encodeURIComponent("Password changed successfully!"));
    return replaceTo(res, "/change-password?error=" + encodeURIComponent(result.error));
  } catch {
    return replaceTo(res, "/change-password?error=" + encodeURIComponent("Password change failed"));
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    return replaceTo(res, "/login?success=" + encodeURIComponent("Logged out successfully"));
  });
});

module.exports = router;

