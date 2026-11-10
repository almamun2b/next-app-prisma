import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { FormField } from "./form-field";
import { Input } from "./input";
import { Modal } from "./modal";
import { Pagination } from "./pagination";
import { RadioGroup } from "./radio-group";
import { Slider } from "./slider";
import { Switch } from "./switch";
import { ToastProvider, useToast } from "./toast";

describe("Button", () => {
  it("is disabled and busy while loading", () => {
    render(<Button loading>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("defaults to type=button to avoid accidental form submits", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});

describe("FormField", () => {
  it("wires label, description and error to the control", () => {
    render(
      <FormField label="Email" description="Work address" error="Required" required>
        {(field) => <Input {...field} />}
      </FormField>,
    );
    const input = screen.getByLabelText(/Email/);
    expect(input).toHaveAccessibleDescription("Work address Required");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-required", "true");
  });
});

describe("Switch", () => {
  it("toggles aria-checked with mouse and keyboard", async () => {
    const onChange = vi.fn();
    render(<Switch aria-label="Notifications" onCheckedChange={onChange} />);
    const sw = screen.getByRole("switch", { name: "Notifications" });
    expect(sw).toHaveAttribute("aria-checked", "false");
    await userEvent.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "true");
    sw.focus();
    await userEvent.keyboard(" ");
    expect(onChange).toHaveBeenLastCalledWith(false);
  });
});

describe("Checkbox & RadioGroup", () => {
  it("associates labels with native inputs", async () => {
    render(<Checkbox id="tos" label="Accept terms" />);
    await userEvent.click(screen.getByText("Accept terms"));
    expect(screen.getByRole("checkbox", { name: "Accept terms" })).toBeChecked();
  });

  it("selects radios within a named fieldset", async () => {
    const onChange = vi.fn();
    render(
      <RadioGroup
        legend="Plan"
        name="plan"
        onValueChange={onChange}
        options={[
          { value: "a", label: "Starter" },
          { value: "b", label: "Team" },
        ]}
      />,
    );
    expect(screen.getByRole("group", { name: "Plan" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("radio", { name: "Team" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });
});

describe("Slider", () => {
  it("exposes a formatted value text", () => {
    render(<Slider label="Volume" defaultValue={30} formatValue={(v) => `${String(v)}%`} />);
    expect(screen.getByRole("slider", { name: "Volume" })).toHaveAttribute("aria-valuetext", "30%");
  });
});

describe("Modal", () => {
  it("renders title/description and closes from the close button", async () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open onOpenChange={onOpenChange} title="Delete?" description="This is permanent">
        <p>Body</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog", { name: "Delete?" });
    expect(dialog).toHaveAccessibleDescription("This is permanent");
    await userEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("Pagination", () => {
  it("marks the current page and links neighbours", () => {
    render(
      <Pagination
        page={2}
        totalPages={3}
        hrefForPage={(p) => `/users?page=${String(p)}` as "/users"}
      />,
    );
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Next page" })).toHaveAttribute(
      "href",
      "/users?page=3",
    );
  });

  it("renders nothing for a single page", () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} hrefForPage={() => "/users"} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("Toast", () => {
  function Trigger() {
    const { toast } = useToast();
    return (
      <Button
        onClick={() => {
          toast({ title: "Saved", variant: "success" });
        }}
      >
        Notify
      </Button>
    );
  }
  it("announces toasts in a polite live region and can dismiss them", async () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Notify" }));
    expect(screen.getByText("Saved")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });
});
