import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BatchToolbar } from "./BatchToolbar";

describe("BatchToolbar", () => {
  it("is not rendered when nothing is selected", () => {
    render(
      <BatchToolbar
        selectedCount={0}
        onClearSelected={vi.fn()}
        onDeselectAll={vi.fn()}
        isProcessing={false}
      />
    );
    expect(screen.queryByText(/selected/i)).not.toBeInTheDocument();
  });

  it("shows selection count and both action buttons", () => {
    render(
      <BatchToolbar
        selectedCount={5}
        onClearSelected={vi.fn()}
        onDeselectAll={vi.fn()}
        isProcessing={false}
      />
    );
    expect(
      screen.getByText(/5 transactions selected/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /clear selected/i })
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: /deselect all/i })
    ).toBeInTheDocument();
  });

  it("calls onClearSelected when bulk clear is clicked", async () => {
    const user = userEvent.setup();
    const onClearSelected = vi.fn();
    render(
      <BatchToolbar
        selectedCount={3}
        onClearSelected={onClearSelected}
        onDeselectAll={vi.fn()}
        isProcessing={false}
      />
    );
    await user.click(
      screen.getByRole("button", { name: /clear selected/i })
    );
    expect(onClearSelected).toHaveBeenCalledTimes(1);
  });

  it("disables Clear Selected when processing", () => {
    render(
      <BatchToolbar
        selectedCount={3}
        onClearSelected={vi.fn()}
        onDeselectAll={vi.fn()}
        isProcessing={true}
      />
    );
    expect(
      screen.getByRole("button", { name: /processing/i })
    ).toBeDisabled();
  });

  it("calls onDeselectAll when deselect is clicked", async () => {
    const user = userEvent.setup();
    const onDeselectAll = vi.fn();
    render(
      <BatchToolbar
        selectedCount={2}
        onClearSelected={vi.fn()}
        onDeselectAll={onDeselectAll}
        isProcessing={false}
      />
    );
    await user.click(
      screen.getByRole("button", { name: /deselect all/i })
    );
    expect(onDeselectAll).toHaveBeenCalledTimes(1);
  });
});
