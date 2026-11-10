import { userController } from "@/modules/user/user.controller";

export const GET = userController.list;
export const POST = userController.create;
