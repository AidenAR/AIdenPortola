import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewTransactionsBanner } from "./NewTransactionsBanner";

describe("NewTransactionsBanner", () => {
  it("is hidden when buffer is empty", () => {
    render(
      <NewTransactionsBanner count={0} canMerge={true} onMerge={vi.fn()} />
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows count and is clickable when buffer has items", () => {
    render(
      <NewTransactionsBanner count={5} canMerge={true} onMerge={vi.fn()} />
    );
    const btn = screen.getByRole("button");
    expect(btn).toBeEnabled();
    expect(btn).toHaveTextContent(/5 new transactions/i);
  });

  it("shows '99+ new transactions' when count >= 100", () => {
    render(
      <NewTransactionsBanner count={100} canMerge={true} onMerge={vi.fn()} />
    );
    expect(screen.getByText(/99\+ new transactions/i)).toBeInTheDocument();
  });

  it("disables merge button when canMerge is false (processing in flight)", () => {
    render(
      <NewTransactionsBanner count={3} canMerge={false} onMerge={vi.fn()} />
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("calls onMerge when clicked", async () => {
    const user = userEvent.setup();
    const onMerge = vi.fn();
    render(
      <NewTransactionsBanner count={3} canMerge={true} onMerge={onMerge} />
    );
    await user.click(screen.getByRole("button"));
    expect(onMerge).toHaveBeenCalledTimes(1);
  });
});
