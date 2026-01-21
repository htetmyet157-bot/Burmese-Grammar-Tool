import fs from "fs-extra";
import path from "path";
import crypto from "crypto";
import { txtDir } from "../helpers/fileUtils.js";
import { generateHmac } from "../helpers/hmac.js";

// ----------------------
// Utilities
// ----------------------
export function hashText(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

// ----------------------
// Core functionality
// ----------------------
export async function saveText(content, session) {
  if (!session) throw new Error("No session found");
  if (!content || typeof content !== "string") throw new Error("Invalid content");

  const textHash = hashText(content);
  const fileName = `${textHash}.txt`;
  const filePath = path.join(txtDir, fileName);

  // Remove previous TXT if hash changed
  if (session.latestText?.filePath && session.latestText.hash !== textHash) {
    await fs.remove(session.latestText.filePath).catch(() => {});
  }

  // Write the new TXT file
  await fs.writeFile(filePath, content, "utf8");

  // Generate HMAC for metadata
  const payload = { fileName, hash: textHash, timestamp: Date.now() };
  const hmac = generateHmac(payload);

  // Store reference in session
  session.latestText = {
    content,
    filePath,
    hash: textHash,
    hmac,
    updatedAt: Date.now()
  };

  return { fileName, hmac };
}