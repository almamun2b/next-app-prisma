import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./select";

const OPTIONS = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry", disabled: true },
  { value: "date", label: "Date" },
];

describe("Select (custom listbox)", () => {
  it("opens with the keyboard, skips disabled options and selects with Enter", async () => {
    const onChange = vi.fn();
    render(<Select aria-label="Fruit" options={OPTIONS} onValueChange={onChange} />);
    const combo = screen.getByRole("combobox", { name: "Fruit" });

    combo.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(combo).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenCalledWith("date");
    expect(combo).toHaveAttribute("aria-expanded", "false");
    expect(combo).toHaveTextContent("Date");
  });

  it("closes on Escape without changing the value", async () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="Fruit" options={OPTIONS} defaultValue="apple" onValueChange={onChange} />,
    );
    const combo = screen.getByRole("combobox");
    await userEvent.click(combo);
    expect(screen.getByRole("listbox")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    expect(combo).toHaveAttribute("aria-expanded", "false");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("supports typeahead and mouse selection", async () => {
    const onChange = vi.fn();
    render(<Select aria-label="Fruit" options={OPTIONS} onValueChange={onChange} />);
    const combo = screen.getByRole("combobox");
    combo.focus();
    await userEvent.keyboard("b");
    expect(onChange).toHaveBeenLastCalledWith("banana");
    await userEvent.click(combo);
    await userEvent.click(screen.getByRole("option", { name: "Apple" }));
    expect(onChange).toHaveBeenLastCalledWith("apple");
  });
});
