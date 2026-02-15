import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SuperAdminToggle } from "./SuperAdminToggle";

describe("SuperAdminToggle", () => {
  it("renders in OFF state by default", () => {
    render(<SuperAdminToggle isOn={false} onToggle={vi.fn()} />);
    expect(screen.getByRole("switch")).toHaveAttribute(
      "aria-checked",
      "false"
    );
    expect(screen.getByText(/off/i)).toBeInTheDocument();
  });

  it("calls onToggle when clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<SuperAdminToggle isOn={false} onToggle={onToggle} />);
    await user.click(screen.getByRole("switch"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("shows ON state when isOn is true", () => {
    render(<SuperAdminToggle isOn={true} onToggle={vi.fn()} />);
    expect(screen.getByRole("switch")).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(screen.getByText(/\bon\b/i)).toBeInTheDocument();
  });
});
