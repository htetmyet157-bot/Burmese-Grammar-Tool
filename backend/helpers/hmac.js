import crypto from "crypto";

const SECRET = "super-secret-playground-key";

export function generateHmac(payload, secret = SECRET) {
  return crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex");
}

export function verifyHmac(payload, signature, secret = SECRET) {
  if (!signature) return false;
  const expected = generateHmac(payload, secret);
  return signature === expected;
}