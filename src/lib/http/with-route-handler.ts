import type { NextRequest } from "next/server";
import { handleError } from "@/lib/errors";
import { apiError } from "./api-response";

type Params = Record<string, string | string[] | undefined>;
type RouteContext<P extends Params> = { params: Promise<P> };
type Handler<P extends Params> = (
  request: NextRequest,
  context: RouteContext<P>,
) => Promise<Response>;

/**
 * Global error boundary for Route Handlers. Wraps a controller so any thrown
 * error (AppError, ZodError, Prisma error, unknown) becomes the uniform
 * `ApiFailure` JSON envelope with the correct HTTP status.
 */
export function withRouteHandler<P extends Params = Params>(handler: Handler<P>): Handler<P> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      const appError = handleError(error, {
        method: request.method,
        path: request.nextUrl.pathname,
      });
      return apiError(appError);
    }
  };
}
