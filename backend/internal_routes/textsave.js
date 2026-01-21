import express from "express";
import { saveText } from "../helpers/textarea.js";
import { apiErrorHandler } from "../middleware/apiErrorHandler.js";

const router = express.Router();

// ---------s-------------
// POST: Save textarea as TXT with HMAC
// ----------------------
router.post("/internal/save-txt", async (req, res) => {
  try {
    const { content } = req.body;
    const result = await saveText(content, req.session);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("Save TXT failed:", err);
    res.status(500).json({ error: err.message || "Failed to save TXT" });
  }
});

router.use(apiErrorHandler);
export default router;