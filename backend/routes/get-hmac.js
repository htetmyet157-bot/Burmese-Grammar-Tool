import express from "express";
import { generateHmac } from "../helpers/hmac.js";
import { apiErrorHandler } from "../middleware/apiErrorHandler.js";

const router = express.Router();

router.post("/api/get-hmac", (req, res) => {
  const payload = req.body;
  const hmac = generateHmac(payload);
  res.send(hmac);
});

router.use(apiErrorHandler);
export default router;