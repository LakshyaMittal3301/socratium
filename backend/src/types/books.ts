import type { UploadBookResponse } from "@shared/types/api";

export type UploadInput = {
  filename: string;
  stream: NodeJS.ReadableStream;
};

export type UploadResult = UploadBookResponse;
