import fs from "fs";
import path from "path";

export function getBackendRoot(): string {
  return process.cwd();
}

export function getRepoRoot(): string {
  return path.resolve(getBackendRoot(), "..");
}

export function getDataDir(): string {
  const dataDir = path.join(getBackendRoot(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return dataDir;
}

export function getBooksDir(): string {
  const booksDir = path.join(getDataDir(), "books");
  if (!fs.existsSync(booksDir)) {
    fs.mkdirSync(booksDir, { recursive: true });
  }
  return booksDir;
}
