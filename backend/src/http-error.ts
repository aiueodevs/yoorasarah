export type HttpErrorStatus = 400 | 401 | 403 | 404 | 409 | 413 | 415 | 429 | 500 | 502 | 503;

export class HttpError extends Error {
  constructor(
    public readonly status: HttpErrorStatus,
    public readonly code: string,
    public readonly publicMessage: string
  ) {
    super(publicMessage);
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

export function errorPayload(error: HttpError) {
  return {
    code: error.code,
    message: error.publicMessage
  };
}
