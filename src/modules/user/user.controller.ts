import "server-only";
import { apiNoContent, apiOk, parseJsonBody, parseSearchParams } from "@/lib/http/api-response";
import { withRouteHandler } from "@/lib/http/with-route-handler";
import { authenticate, authenticateAdmin } from "@/modules/auth/auth.guard";
import {
  createUserSchema,
  listUsersQuerySchema,
  updateProfileSchema,
  updateUserSchema,
  userIdSchema,
} from "./user.schema";
import { userService } from "./user.service";

type IdParams = { id: string };

/**
 * Controller layer for `/api/users/*`. Thin HTTP adapters: authenticate →
 * validate → call the service → serialize. Errors are handled globally by
 * `withRouteHandler`.
 */
export const userController = {
  /** GET /api/users?page&limit&q&role&status&sort&order */
  list: withRouteHandler(async (request) => {
    const actor = await authenticateAdmin();
    const query = parseSearchParams(request, listUsersQuerySchema);
    const { data, meta } = await userService.list(actor, query);
    return apiOk(data, { meta });
  }),

  /** POST /api/users */
  create: withRouteHandler(async (request) => {
    const actor = await authenticateAdmin();
    const input = await parseJsonBody(request, createUserSchema);
    return apiOk(await userService.create(actor, input), { status: 201 });
  }),

  /** GET /api/users/:id */
  getById: withRouteHandler<IdParams>(async (_request, { params }) => {
    const actor = await authenticate();
    const id = userIdSchema.parse((await params).id);
    return apiOk(await userService.getById(actor, id));
  }),

  /** PATCH /api/users/:id */
  update: withRouteHandler<IdParams>(async (request, { params }) => {
    const actor = await authenticateAdmin();
    const id = userIdSchema.parse((await params).id);
    const input = await parseJsonBody(request, updateUserSchema);
    return apiOk(await userService.update(actor, id, input));
  }),

  /** DELETE /api/users/:id */
  remove: withRouteHandler<IdParams>(async (_request, { params }) => {
    const actor = await authenticateAdmin();
    const id = userIdSchema.parse((await params).id);
    await userService.remove(actor, id);
    return apiNoContent();
  }),

  /** GET /api/users/me */
  me: withRouteHandler(async () => {
    const actor = await authenticate();
    return apiOk(await userService.getProfile(actor));
  }),

  /** PATCH /api/users/me */
  updateMe: withRouteHandler(async (request) => {
    const actor = await authenticate();
    const input = await parseJsonBody(request, updateProfileSchema);
    return apiOk(await userService.updateProfile(actor, input));
  }),
};
