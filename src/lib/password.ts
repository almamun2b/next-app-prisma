import bcrypt from "bcryptjs";

/** Lower cost in tests keeps the suite fast; 12 rounds in every other env. */
const SALT_ROUNDS = process.env.NODE_ENV === "test" ? 4 : 12;

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

let dummyHash: Promise<string> | undefined;

/**
 * Compares against a throwaway hash when the user does not exist, so login
 * response time doesn't reveal which emails are registered.
 */
export async function verifyAgainstDummy(plain: string) {
  dummyHash ??= bcrypt.hash("timing-safe-dummy-value", SALT_ROUNDS);
  await bcrypt.compare(plain, await dummyHash);
  return false;
}
