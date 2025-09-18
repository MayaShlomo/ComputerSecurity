const express = require("express");
const path = require("path");
const session = require("express-session");
const helmet = require("helmet");
require("dotenv").config();

const authRoutes = require("./src/routes/authRoutes.js");
const systemRoutes = require("./src/routes/systemRoutes.js");
const repo = require("./src/repos");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(helmet({ contentSecurityPolicy: false }));

app.disable("etag");

app.use(express.urlencoded({ extended: true }));

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

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, 
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private, max-age=0");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

app.get("/", (req, res) => {
  if (req.session?.username) return res.redirect(303, "/system");
  return res.redirect(303, "/login");
});

app.use("/", authRoutes);
app.use("/", systemRoutes);

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

