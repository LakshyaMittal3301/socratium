import crypto from "crypto";
import fs from "fs";
import path from "path";
import { getDataDir } from "./paths";

const KEY_FILE = "ai_key";

function loadKey(): Buffer {
  const keyPath = path.join(getDataDir(), KEY_FILE);
  if (!fs.existsSync(keyPath)) {
    const key = crypto.randomBytes(32);
    fs.writeFileSync(keyPath, key, { mode: 0o600 });
    return key;
  }
  return fs.readFileSync(keyPath);
}

function getKey(): Buffer {
  const key = loadKey();
  if (key.length !== 32) {
    throw new Error("Invalid AI key length");
  }
  return key;
}

export function encryptSecret(value: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

export function decryptSecret(payload: string): string {
  const key = getKey();
  const [ivPart, tagPart, dataPart] = payload.split(".");
  if (!ivPart || !tagPart || !dataPart) {
    throw new Error("Invalid secret payload");
  }
  const iv = Buffer.from(ivPart, "base64");
  const tag = Buffer.from(tagPart, "base64");
  const encrypted = Buffer.from(dataPart, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}
