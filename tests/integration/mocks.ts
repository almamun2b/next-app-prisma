import { vi } from "vitest";

/** Shared module mocks for integration tests (import first in each test file). */
vi.mock("@/auth", async () => {
  const { authMock } = await import("./helpers");
  return { auth: authMock, signIn: vi.fn(), signOut: vi.fn(), handlers: {} };
});

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  connection: vi.fn(() => Promise.resolve()),
}));

vi.mock("next/cache", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
