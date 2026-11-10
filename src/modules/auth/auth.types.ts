import type { Role } from "@/generated/prisma/enums";

/** The narrow user shape stored in the session and exposed to the client. */
export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  image: string | null;
};

declare module "next-auth" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- module augmentation requires interface
  interface User {
    role: Role;
    tokenVersion: number;
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- module augmentation requires interface
  interface Session {
    user: SessionUser;
  }
}

declare module "next-auth/jwt" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- module augmentation requires interface
  interface JWT {
    id: string;
    role: Role;
    tokenVersion: number;
    picture?: string | null;
  }
}
