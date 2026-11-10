import { userController } from "@/modules/user/user.controller";

export const GET = userController.me;
export const PATCH = userController.updateMe;
