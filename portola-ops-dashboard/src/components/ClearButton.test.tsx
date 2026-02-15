import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClearButton } from "./ClearButton";
import { buildTx, resetIdCounter } from "../test/factories";

beforeEach(() => resetIdCounter());

describe("ClearButton", () => {
  it("renders 'Clear Funds' for a Pending transaction", () => {
    render(
      <ClearButton tx={buildTx()} isSuperAdmin={false} onClear={vi.fn()} />
    );
    expect(
      screen.getByRole("button", { name: /clear funds/i })
    ).toBeEnabled();
  });

  it("shows 'Processing…' and is disabled when tx.op is processing", () => {
    render(
      <ClearButton
        tx={buildTx({ op: "processing" })}
        isSuperAdmin={false}
        onClear={vi.fn()}
      />
    );
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent(/processing/i);
  });

  it("is not rendered for Cleared transactions", () => {
    render(
      <ClearButton
        tx={buildTx({ status: "Cleared" })}
        isSuperAdmin={false}
        onClear={vi.fn()}
      />
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders Retry for Failed transactions", () => {
    render(
      <ClearButton
        tx={buildTx({ status: "Failed", error: "timeout" })}
        isSuperAdmin={false}
        onClear={vi.fn()}
      />
    );
    expect(
      screen.getByRole("button", { name: /retry/i })
    ).toBeInTheDocument();
  });

  it("calls onClear with the transaction id on click", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    const tx = buildTx();
    render(<ClearButton tx={tx} isSuperAdmin={false} onClear={onClear} />);
    await user.click(screen.getByRole("button"));
    expect(onClear).toHaveBeenCalledWith(tx.id);
  });

  it("is disabled for high-value transactions without super admin", () => {
    render(
      <ClearButton
        tx={buildTx({ amount: 50_000 })}
        isSuperAdmin={false}
        onClear={vi.fn()}
      />
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is enabled for high-value transactions with super admin", () => {
    render(
      <ClearButton
        tx={buildTx({ amount: 50_000 })}
        isSuperAdmin={true}
        onClear={vi.fn()}
      />
    );
    expect(screen.getByRole("button")).toBeEnabled();
  });
});
