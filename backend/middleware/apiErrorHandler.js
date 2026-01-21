import multer from "multer";

export function apiErrorHandler(err, req, res, next) {
  console.error("API error middleware caught:", err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: err?.message || "Internal Server Error" });
}