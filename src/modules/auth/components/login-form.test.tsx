import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "./login-form";

const loginAction = vi.fn();
vi.mock("../auth.actions", () => ({
  loginAction: (...args: unknown[]) => loginAction(...args) as unknown,
}));

describe("LoginForm", () => {
  it("validates on the client before calling the server action", async () => {
    render(<LoginForm />);
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
    expect(screen.getByText("Enter your password")).toBeInTheDocument();
    expect(loginAction).not.toHaveBeenCalled();
  });

  it("shows the server error in an alert", async () => {
    loginAction.mockResolvedValue({
      ok: false,
      error: { code: "UNAUTHORIZED", message: "Invalid email or password." },
    });
    render(<LoginForm callbackUrl="/users" />);
    await userEvent.type(screen.getByLabelText(/Email/), "a@b.co");
    await userEvent.type(screen.getByLabelText(/Password/, { selector: "input" }), "secret");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password.");
    expect(loginAction).toHaveBeenCalledWith({ email: "a@b.co", password: "secret" }, "/users");
  });

  it("toggles password visibility accessibly", async () => {
    render(<LoginForm />);
    const toggle = screen.getByRole("button", { name: "Show password" });
    await userEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
