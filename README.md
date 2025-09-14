# Communication_LTD – Secure Web App (Node + MySQL)

This repo contains the **working web app** for the Communication_LTD project, including:
- Register / Login / Logout
- Change Password (logged-in)
- Forgot Password (email token via SHA‑1) + Reset Password
- System page: add customer (name/email/phone) + list customers
- Two modes: **secure** (default) and **vuln** (to demo XSS / SQLi)

The UI prevents “back‑stack” page piling (navigation lock) and uses EJS views.

---

## 1) Requirements

- Node.js 16+ (tested with Node 22)
- MySQL 8+
- Gmail account + **App Password** (for Forgot Password e‑mails)

> **Do not commit `.env`**. Use the template provided here: `.env.example`

---

## 2) Install

```bash
npm install
```

If you see `Cannot find module 'mysql2/promise'`, run `npm install mysql2`.

---

## 3) Database Setup (MySQL)

Open MySQL Workbench or the mysql CLI and run the schema:

**Workbench (recommended):**
1. Open a new SQL tab.
2. Paste & run the contents of `schema.sql`.
3. (Optional) run `seed.sql` to create demo admin & demo user.

**CLI:**

```bash
mysql -u root -p < schema.sql
mysql -u root -p < seed.sql   # optional
```

By default the DB name is `comunicationltd` (settable via `DB_NAME` in `.env`).

---

## 4) Environment Variables

Copy the template and fill in values:

```bash
cp .env.example .env
```

Edit `.env`:

```
SESSION_SECRET=change-me
PORT=3000

DATA_BACKEND=mysql
MODE=secure

DB_HOST=localhost
DB_USER=root
DB_PASS=YOUR_MYSQL_PASSWORD
DB_NAME=comunicationltd

EMAIL_USER=YOUR_GMAIL_ADDRESS@gmail.com
EMAIL_PASS=YOUR_GMAIL_APP_PASSWORD
```

> To create a Gmail **App Password**: Google Account → Security → 2‑Step Verification → App Passwords → pick “Mail” + “Other” → copy 16‑char password.

---

## 5) Run

```bash
node app.js
# Server running at http://localhost:3000
```

- **MODE=secure** (default): uses prepared statements and output encoding.
- **MODE=vuln**: set in `.env` and restart to demo XSS/SQLi.
  - Example: `MODE=vuln` then restart `node app.js`.

---

## 6) Features Map (matches project requirements)

- **Register**: username + email + password (HMAC‑SHA1 + per‑user salt), policy enforced.
- **Login**: 3 failed attempts → temporary lockout.
- **Change Password**: validates old password + policy + not in last 3 (password_history).
- **Forgot Password**: generates SHA‑1 token, sends **token text** via email.
- **Reset Password**: enter token + new password (token expires ~15 min).
- **System**: add customer (name/email/phone) and list; secure mode encodes output, vuln mode doesn’t (Stored‑XSS demo).

---

## 7) Troubleshooting

**DB: Access denied for user 'root'@'localhost' (using password: NO)**  
→ Fill `DB_PASS` in `.env` and restart.

**Cannot find module 'mysql2/promise'**  
→ `npm install mysql2`

**Token email not received**  
→ Verify `EMAIL_USER`/`EMAIL_PASS` (App Password), and check spam.

**Pages “stack” on back**  
→ Make sure you updated all EJS templates with the provided navigation‑lock scripts.

**Password change/reset fails**  
→ Ensure the password satisfies the policy (min length 10, upper/lower/digit/special) and not equal to one of the last 3.

---

## 8) Notes for Reviewers / TA

- Switch modes via `.env` → `MODE=secure|vuln` to show protections vs. attacks.
- `.env` should never be committed; `.env.example` is provided.
- The app uses EJS views in `/views` and Express routes in `/src/routes`.
- Data backend is MySQL (`DATA_BACKEND=mysql`). A memory repo is not used in the final submission.

---

## 9) Scripts (optional)

Add these to `package.json` if you want shortcuts:

```json
{
  "scripts": {
    "start": "node app.js",
    "start:secure": "cross-env MODE=secure DATA_BACKEND=mysql node app.js",
    "start:vuln": "cross-env MODE=vuln DATA_BACKEND=mysql node app.js"
  }
}
```

(Install `cross-env` if you use those scripts on Windows.)

---

**Good luck!** 🚀
