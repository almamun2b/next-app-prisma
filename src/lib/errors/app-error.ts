/** Stable, machine-readable error codes exposed to clients. */
export const ErrorCode = {
  BAD_REQUEST: "BAD_REQUEST",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/** Field-level validation messages, keyed by field path. */
export type FieldErrors = Record<string, string[]>;

export type AppErrorDetails = {
  fieldErrors?: FieldErrors;
  [key: string]: unknown;
};

type AppErrorOptions = {
  details?: AppErrorDetails | undefined;
  cause?: unknown;
  /** Operational errors are expected (bad input, not found…) and safe to show. */
  isOperational?: boolean;
};

/**
 * The single error type that crosses layer boundaries. Services throw it,
 * `handleError()` normalizes everything else into it, and controllers /
 * actions serialize it.
 */
export class AppError extends Error {
  override readonly name = "AppError";
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details: AppErrorDetails | undefined;
  readonly isOperational: boolean;

  constructor(statusCode: number, code: ErrorCode, message: string, options: AppErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.statusCode = statusCode;
    this.code = code;
    this.details = options.details;
    this.isOperational = options.isOperational ?? statusCode < 500;
  }

  static badRequest(message = "Bad request", details?: AppErrorDetails) {
    return new AppError(400, ErrorCode.BAD_REQUEST, message, { details });
  }

  static validation(message = "Validation failed", fieldErrors: FieldErrors = {}) {
    return new AppError(422, ErrorCode.VALIDATION_ERROR, message, { details: { fieldErrors } });
  }

  static unauthorized(message = "Authentication required") {
    return new AppError(401, ErrorCode.UNAUTHORIZED, message);
  }

  static forbidden(message = "You do not have permission to perform this action") {
    return new AppError(403, ErrorCode.FORBIDDEN, message);
  }

  static notFound(message = "Resource not found") {
    return new AppError(404, ErrorCode.NOT_FOUND, message);
  }

  static conflict(message = "Resource already exists", details?: AppErrorDetails) {
    return new AppError(409, ErrorCode.CONFLICT, message, { details });
  }

  static tooManyRequests(message = "Too many requests, please try again later") {
    return new AppError(429, ErrorCode.TOO_MANY_REQUESTS, message);
  }

  static serviceUnavailable(message = "Service temporarily unavailable", cause?: unknown) {
    return new AppError(503, ErrorCode.SERVICE_UNAVAILABLE, message, {
      cause,
      isOperational: false,
    });
  }

  static internal(message = "Something went wrong", cause?: unknown) {
    return new AppError(500, ErrorCode.INTERNAL_ERROR, message, { cause, isOperational: false });
  }

  /** Client-safe representation. Never includes stack or cause. */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      ...(this.details ? { details: this.details } : {}),
    };
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
