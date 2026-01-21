// index.js
console.log("NODE IS RUNNING");

import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import session from "express-session";
import crypto from "crypto";
import { fileURLToPath } from "url";

// ---------------- ESM __dirname ----------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------- Middleware ----------------
import { sessionMiddleware } from "./backend/middleware/sessionMiddleware.js";
import { jsonParser } from "./backend/middleware/bodyParsers.js";

// ---------------- Routes ----------------
import getHmacRouter from "./backend/routes/get-hmac.js";
import uploadRouter from "./backend/internal_routes/upload.js";
import textSaveRouter from "./backend/internal_routes/textsave.js";

const app = express();
const PORT = 3001;

// ---------------- Core Middleware ----------------
app.use(cookieParser());

app.use(
  session({
    name: "sessionId",
    secret: "super-secret-playground-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax"
    }
  })
);

app.use(sessionMiddleware);
app.use(jsonParser);

// ---------------- Session-bound HMAC ----------------
app.use((req, res, next) => {
  if (req.session && !req.session.sessionHmac) {
    req.session.sessionHmac = crypto
      .createHmac("sha256", "super-secret-playground-key")
      .update(req.session.id)
      .digest("hex");
  }
  next();
});

// ---------------- API / INTERNAL Routes ----------------
app.use(getHmacRouter);      // /api/get-hmac
app.use(uploadRouter);       // /internal/upload
app.use(textSaveRouter);     // /internal/save-txt

// ---------------- Serve Frontend ----------------
const distDir = path.join(__dirname, "assets");
app.use(express.static(distDir));

// SPA fallback (no API leakage)
// ---------------- Serve Frontend ----------------
// SPA fallback (Express 5 compatible)
app.get(/^(?!\/(api|internal)).*/, (req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  console.log(`🌐 Backend running at http://localhost:${PORT}`);
});