import crypto from "crypto";

export function hash(value: string) {
  const secret = process.env.VOTE_SECRET || "development-secret";
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ");
}