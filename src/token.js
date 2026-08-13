const crypto = require("crypto");

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function verifyActorToken(token, secret, now = Date.now) {
  const [encoded, signature] = String(token || "").split(".");
  const supplied = Buffer.from(signature || "");
  const expected = Buffer.from(sign(encoded || "", secret || ""));
  if (!secret || !encoded || !signature || supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) throw new Error("AGENT_TOKEN_INVALID");
  let payload;
  try { payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")); } catch (_) { throw new Error("AGENT_TOKEN_INVALID"); }
  if (!payload.openid || !Number.isFinite(payload.exp) || payload.exp <= now()) throw new Error("AGENT_TOKEN_EXPIRED");
  return payload;
}

module.exports = { verifyActorToken };
