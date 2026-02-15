import { describe, it, expect } from "vitest";
import { generateTransactions } from "./generateTransactions";

describe("generateTransactions", () => {
  it("produces exactly 50 transactions", () => {
    const txs = generateTransactions();
    expect(txs).toHaveLength(50);
  });

  it("every transaction has all required fields", () => {
    const txs = generateTransactions();
    for (const tx of txs) {
      expect(tx).toMatchObject({
        id: expect.stringMatching(/^TXN-\d{5}$/),
        clientName: expect.any(String),
        amount: expect.any(Number),
        status: expect.stringMatching(/^(Pending|Cleared|Failed)$/),
        op: "idle",
        attempt: 0,
        timestampMs: expect.any(Number),
      });
    }
  });

  it("generates IDs that are unique", () => {
    const txs = generateTransactions();
    const ids = txs.map((t) => t.id);
    expect(new Set(ids).size).toBe(50);
  });

  it("includes a mix of small and institutional amounts", () => {
    const txs = generateTransactions();
    const small = txs.filter((t) => t.amount < 1_000);
    const large = txs.filter((t) => t.amount >= 10_000);
    expect(small.length).toBeGreaterThan(0);
    expect(large.length).toBeGreaterThan(0);
  });

  it("amounts are rounded to 2 decimal places", () => {
    const txs = generateTransactions();
    for (const tx of txs) {
      expect(tx.amount).toBe(parseFloat(tx.amount.toFixed(2)));
    }
  });

  it("timestamps are within the last 48 hours", () => {
    const now = Date.now();
    const txs = generateTransactions();
    for (const tx of txs) {
      expect(tx.timestampMs).toBeLessThanOrEqual(now + 1000);
      expect(tx.timestampMs).toBeGreaterThan(now - 48 * 60 * 60 * 1000);
    }
  });
});
