// app.js
const express = require("express");
const path = require("path");
const session = require("express-session");
const helmet = require("helmet");
require("dotenv").config();

const authRoutes = require("./src/routes/authRoutes.js");
const systemRoutes = require("./src/routes/systemRoutes.js");
const repo = require("./src/repos");

const app = express();

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// אבטחה בסיסית
app.use(helmet({ contentSecurityPolicy: false }));

// לכבות ETag/Last-Modified כדי למנוע החזרות מה־cache
app.disable("etag");

// פרמטרי POST
app.use(express.urlencoded({ extended: true }));

// קבצים סטטיים – ללא Cache
app.use(
  express.static(path.join(__dirname, "public"), {
    etag: false,
    lastModified: false,
    cacheControl: true,
    maxAge: 0,
    setHeaders: (res) => {
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private, max-age=0");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
    },
  })
);

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // ב-HTTPS לשנות ל-true
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// כותרות no-store לכל הבקשות (כולל GET אחרי redirect)
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private, max-age=0");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// דף בית
app.get("/", (req, res) => {
  if (req.session?.username) return res.redirect(303, "/system");
  return res.redirect(303, "/login");
});

// ניתובים
app.use("/", authRoutes);
app.use("/", systemRoutes);

// אתחול MySQL ואז האזנה
(async () => {
  try {
    if (repo.init) await repo.init();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error("❌ Failed to init repository:", e.message);
    process.exit(1);
  }
})();

