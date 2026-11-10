type LogLevel = "debug" | "info" | "warn" | "error";
type LogContext = Record<string, unknown>;

const LEVEL_WEIGHT: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const minLevel: LogLevel = process.env.NODE_ENV === "production" ? "info" : "debug";

function serializeError(error: unknown): LogContext {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return { value: String(error) };
}

function write(level: LogLevel, message: string, context?: LogContext) {
  if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[minLevel] || process.env.NODE_ENV === "test") return;
  const entry = { level, time: new Date().toISOString(), message, ...context };
  const line = process.env.NODE_ENV === "production" ? JSON.stringify(entry) : entry;
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

/** Minimal structured logger (JSON lines in production). */
export const logger = {
  debug: (message: string, context?: LogContext) => {
    write("debug", message, context);
  },
  info: (message: string, context?: LogContext) => {
    write("info", message, context);
  },
  warn: (message: string, context?: LogContext) => {
    write("warn", message, context);
  },
  error: (message: string, error?: unknown, context?: LogContext) => {
    write("error", message, { ...context, ...(error ? { error: serializeError(error) } : {}) });
  },
};
