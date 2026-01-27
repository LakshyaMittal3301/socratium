import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { getBooksDir } from "./paths";

export function getPdfPath(bookId: string): string {
  return path.join(getBooksDir(), `${bookId}.pdf`);
}

export function getTextPath(bookId: string): string {
  return path.join(getBooksDir(), `${bookId}.txt`);
}

export async function savePdfStream(
  bookId: string,
  stream: NodeJS.ReadableStream
): Promise<string> {
  const pdfPath = getPdfPath(bookId);
  await pipeline(stream, fs.createWriteStream(pdfPath));
  return pdfPath;
}

export function writeBookText(bookId: string, text: string): string {
  const textPath = getTextPath(bookId);
  fs.writeFileSync(textPath, text, "utf8");
  return textPath;
}

export function readBookText(textPath: string): string {
  return fs.readFileSync(textPath, "utf8");
}

export function createPdfReadStream(pdfPath: string): fs.ReadStream {
  return fs.createReadStream(pdfPath);
}

export function removeBookFiles(pdfPath: string, textPath: string | null): void {
  removeFileIfExists(pdfPath);
  if (textPath) {
    removeFileIfExists(textPath);
  }
}

function removeFileIfExists(filePath: string): void {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn(`Failed to remove file at ${filePath}`);
    }
  }
}
