import { logger } from "@/lib/logger";
import { AppError, isAppError } from "./app-error";
import { isPrismaError, normalizePrismaError } from "./normalize-prisma";
import { isZodError, normalizeZodError } from "./normalize-zod";

/**
 * Global error normalizer. Every controller and server action funnels unknown
 * errors through here so clients always receive the same error contract.
 * Non-operational errors are logged and their message replaced with a generic one.
 */
export function handleError(error: unknown, context?: Record<string, unknown>): AppError {
  const appError = toAppError(error);

  if (!appError.isOperational) {
    logger.error(appError.message, appError.cause ?? error, { code: appError.code, ...context });
    if (appError.statusCode >= 500 && process.env.NODE_ENV === "production") {
      return new AppError(appError.statusCode, appError.code, genericMessage(appError.statusCode));
    }
  }
  return appError;
}

export function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error;
  if (isZodError(error)) return normalizeZodError(error);
  if (isPrismaError(error)) return normalizePrismaError(error);
  if (error instanceof SyntaxError) return AppError.badRequest("Malformed request body");
  return AppError.internal("Something went wrong", error);
}

function genericMessage(status: number) {
  return status === 503 ? "Service temporarily unavailable" : "Something went wrong";
}
