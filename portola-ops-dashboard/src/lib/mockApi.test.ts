import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mockClearFunds } from "./mockApi";

describe("mockClearFunds", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("resolves after ~1.5s with default (zero) failure rate", async () => {
    const promise = mockClearFunds("TXN-00001");
    vi.advanceTimersByTime(1500);
    await expect(promise).resolves.toBeUndefined();
  });

  it("never rejects when failureRate is 0", async () => {
    const promises = Array.from({ length: 20 }, (_, i) => {
      const p = mockClearFunds(`TXN-${i}`, { failureRate: 0 });
      vi.advanceTimersByTime(1500);
      return p;
    });
    const results = await Promise.allSettled(promises);
    expect(results.every((r) => r.status === "fulfilled")).toBe(true);
  });

  it("rejects when Math.random < failureRate", async () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0.05);

    const p1 = mockClearFunds("TXN-1", { failureRate: 0.1 });
    vi.advanceTimersByTime(1500);
    await expect(p1).rejects.toThrow("Settlement failed for TXN-1");
  });

  it("resolves when Math.random >= failureRate", async () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0.5);

    const p2 = mockClearFunds("TXN-2", { failureRate: 0.1 });
    vi.advanceTimersByTime(1500);
    await expect(p2).resolves.toBeUndefined();
  });
});
