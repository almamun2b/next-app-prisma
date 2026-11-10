import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "./login-form";

const loginFormAction = vi.fn();
vi.mock("../auth.actions", () => ({
  loginFormAction: (...args: unknown[]) => loginFormAction(...args) as unknown,
}));

describe("LoginForm", () => {
  it("uses native constraint validation (works without JS libraries)", () => {
    render(<LoginForm />);
    const email = screen.getByLabelText(/Email/);
    expect(email).toBeRequired();
    expect(email).toHaveAttribute("type", "email");
    expect(screen.getByLabelText(/Password/, { selector: "input" })).toBeRequired();
  });

  it("submits FormData to the server action and shows the error in an alert", async () => {
    loginFormAction.mockResolvedValue({
      ok: false,
      error: { code: "UNAUTHORIZED", message: "Invalid email or password." },
      email: "a@b.co",
    });
    render(<LoginForm callbackUrl="/users" />);
    await userEvent.type(screen.getByLabelText(/Email/), "a@b.co");
    await userEvent.type(screen.getByLabelText(/Password/, { selector: "input" }), "secret");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password.");
    const formData = loginFormAction.mock.calls[0]?.[1] as FormData;
    expect(Object.fromEntries(formData)).toEqual({
      email: "a@b.co",
      password: "secret",
      callbackUrl: "/users",
    });
    expect(screen.getByLabelText(/Email/)).toHaveValue("a@b.co");
  });

  it("maps server field errors onto the inputs", async () => {
    loginFormAction.mockResolvedValue({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "x",
        fieldErrors: { email: ["Enter a valid email address"] },
      },
      email: "bad",
    });
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/Email/), "a@b.co");
    await userEvent.type(screen.getByLabelText(/Password/, { selector: "input" }), "x");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toHaveAttribute("aria-invalid", "true");
  });

  it("toggles password visibility accessibly", async () => {
    render(<LoginForm />);
    await userEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
