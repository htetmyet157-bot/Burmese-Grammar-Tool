// backend/internal/upload-with-hmac.js
import express from "express";
import { upload } from "../helpers/fileUtils.js";
import { generateHmac } from "../helpers/hmac.js";
import { apiErrorHandler } from "../middleware/apiErrorHandler.js";
import fs from "fs-extra";
import crypto from "crypto";

const router = express.Router();

function hashFileContent(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

// =======================
// SILENT UPLOAD WITH HMAC + STRICT RULES
// =======================
router.post("/internal/upload-with-hmac", upload.single("fileUpload"), (req, res, next) => {
  try {
    // 1️⃣ Session must exist
    if (!req.session) {
      if (req.file) fs.removeSync(req.file.path); // cleanup if file arrived
      return res.status(401).json({ error: "No session found" });
    }

    // 2️⃣ CSRF token check
    const token = req.headers["x-csrf-token"];
    if (!token || token !== req.session.csrfToken) {
      if (req.file) fs.removeSync(req.file.path);
      return res.status(403).json({ error: "Invalid CSRF token" });
    }

    // 3️⃣ File required
    if (!req.file) return next(); // silently ignore if no file

    // 4️⃣ Compute SHA-256 hash
    const fileHash = hashFileContent(req.file.path);

    // 5️⃣ Duplicate check
    const prevUpload = req.session?.latestUpload;
    if (prevUpload && prevUpload.fileHash === fileHash) {
      console.log("Duplicate file detected. Skipping save.");
      fs.removeSync(req.file.path);
      return next(); // silent skip
    }

    // 6️⃣ Generate HMAC for this upload
    const payload = {
      fileName: req.file.originalname,
      size: req.file.size,
      formId: req.body.formId || `form_${Date.now()}`
    };

    const hmac = generateHmac(payload);

    // 7️⃣ Store metadata in session
    req.session.latestUpload = { ...payload, hmac, path: req.file.path, fileHash };

    console.log(`✅ File accepted and saved silently: ${req.file.originalname}`);
    next(); // continue silently

  } catch (err) {
    console.error("Silent upload failed:", err);
    if (req.file) fs.removeSync(req.file.path); // cleanup
    res.status(500).json({ error: "Upload failed" });
  }
});

router.use(apiErrorHandler);
export default router;