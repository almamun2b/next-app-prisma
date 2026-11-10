import { AppError } from "./app-error";

/**
 * Prisma error shapes, matched structurally by `name` so this module never
 * imports the generated client (safe for every runtime and for unit tests).
 */
type PrismaKnownRequestError = Error & {
  name: "PrismaClientKnownRequestError";
  code: string;
  meta?: Record<string, unknown>;
};

const PRISMA_ERROR_NAMES = new Set([
  "PrismaClientKnownRequestError",
  "PrismaClientUnknownRequestError",
  "PrismaClientValidationError",
  "PrismaClientInitializationError",
  "PrismaClientRustPanicError",
]);

export function isPrismaError(error: unknown): error is Error {
  return error instanceof Error && PRISMA_ERROR_NAMES.has(error.name);
}

function isKnownRequestError(error: Error): error is PrismaKnownRequestError {
  return error.name === "PrismaClientKnownRequestError" && "code" in error;
}

/** Extracts the offending field names of a unique/foreign-key violation. */
function targetFields(meta: Record<string, unknown> | undefined): string[] {
  const target =
    meta?.target ??
    (meta?.driverAdapterError as { cause?: { constraint?: { fields?: unknown } } } | undefined)
      ?.cause?.constraint?.fields;
  if (Array.isArray(target)) return target.map(String);
  if (typeof target === "string") return [target];
  return [];
}

function fromKnownRequest(error: PrismaKnownRequestError): AppError {
  switch (error.code) {
    case "P2002": {
      const fields = targetFields(error.meta);
      const label = fields.length ? fields.join(", ") : "value";
      const fieldErrors = Object.fromEntries(
        fields.map((f) => [f, [`This ${f} is already in use`]]),
      );
      return AppError.conflict(`A record with this ${label} already exists`, { fieldErrors });
    }
    case "P2025":
    case "P2001":
    case "P2018":
      return AppError.notFound("The requested record was not found");
    case "P2003":
    case "P2014":
      return AppError.conflict("This operation violates a relation constraint");
    case "P2000":
      return AppError.badRequest("A provided value is too long for its field");
    case "P2006":
    case "P2007":
    case "P2011":
    case "P2012":
    case "P2013":
      return AppError.badRequest("Invalid or missing data for this operation");
    case "P2024":
    case "P1001":
    case "P1002":
    case "P1008":
      return AppError.serviceUnavailable("Database is temporarily unavailable", error);
    default:
      return AppError.internal("Unexpected database error", error);
  }
}

/** Maps any Prisma client error to a normalized AppError. */
export function normalizePrismaError(error: Error): AppError {
  if (isKnownRequestError(error)) return fromKnownRequest(error);
  switch (error.name) {
    case "PrismaClientValidationError":
      return AppError.badRequest("Invalid query arguments");
    case "PrismaClientInitializationError":
    case "PrismaClientRustPanicError":
      return AppError.serviceUnavailable("Database is temporarily unavailable", error);
    default:
      return AppError.internal("Unexpected database error", error);
  }
}
