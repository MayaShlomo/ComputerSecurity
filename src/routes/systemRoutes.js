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

router.get("/system", noCache, requireLogin, async (req, res) => {
  let customers = [];
  try {
    customers = await authService.getCustomers();
  } catch {
    customers = [];
  }
  res.render("system", {
    username: req.session.username,
    customers,
    error: req.query.error || null,
    success: req.query.success || null,
    mode: process.env.MODE || "secure"
  });
});

router.post("/system-page", requireLogin, async (req, res) => {
  const { newcustomer, email, phone } = req.body;
  if (!newcustomer || !newcustomer.trim()) {
    return res.redirect(303, "/system?error=" + encodeURIComponent("Customer name is required"));
  }
  try {
    const result = await authService.addCustomer(newcustomer.trim(), email?.trim() || null, phone?.trim() || null);
    if (result.ok) {
      return res.redirect(303, "/system?success=" + encodeURIComponent("Customer added successfully!"));
    }
    return res.redirect(303, "/system?error=" + encodeURIComponent(result.error || "Failed to add"));
  } catch {
    return res.redirect(303, "/system?error=" + encodeURIComponent("Failed to add customer"));
  }
});

module.exports = router;
