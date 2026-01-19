import crypto from "crypto";
import fs from "fs";
import path from "path";
import { getDataDir } from "./paths";

const SECRET_FILE = path.join(getDataDir(), "provider.key");

function getSecret(): Buffer {
  if (fs.existsSync(SECRET_FILE)) {
    return fs.readFileSync(SECRET_FILE);
  }
  const secret = crypto.randomBytes(32);
  fs.writeFileSync(SECRET_FILE, secret);
  return secret;
}

export function encrypt(text: string): string {
  if (!text) return "";
  const iv = crypto.randomBytes(12);
  const key = getSecret();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(":");
}

export function decrypt(payload: string): string {
  if (!payload) return "";
  const parts = payload.split(":");
  if (parts.length !== 3) return "";
  const [ivB64, tagB64, dataB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const key = getSecret();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
}
