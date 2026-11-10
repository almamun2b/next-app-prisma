import { userController } from "@/modules/user/user.controller";

export const GET = userController.getById;
export const PATCH = userController.update;
export const DELETE = userController.remove;
