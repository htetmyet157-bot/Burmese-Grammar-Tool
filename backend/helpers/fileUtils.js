import multer from "multer";
import fs from "fs-extra";
import path from "path";

const __dirname = path.resolve();

export const unprocessedDir = path.join(__dirname, "backend", "unprocessed");
export const txtDir = path.join(__dirname, "backend", "txt-files");

// Ensure directories exist
fs.ensureDirSync(unprocessedDir);
fs.ensureDirSync(txtDir);

// Multer upload setup
export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, unprocessedDir),
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const safeName = file.originalname.replace(/[^a-zA-Z0-9]/g, "_");
      const ext = path.extname(file.originalname);
      cb(null, `${timestamp}_${safeName}${ext}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ["txt", "docx", "pdf"];
    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    if (!allowed.includes(ext)) return cb(new Error("Invalid file type"));
    cb(null, true);
  }
});