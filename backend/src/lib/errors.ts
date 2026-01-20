export type AppError = Error & {
  statusCode: number;
  code: string;
};

export function httpError(statusCode: number, code: string, message: string): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

export function badRequest(message: string, code = "BAD_REQUEST"): AppError {
  return httpError(400, code, message);
}

export function notFound(message: string, code = "NOT_FOUND"): AppError {
  return httpError(404, code, message);
}
