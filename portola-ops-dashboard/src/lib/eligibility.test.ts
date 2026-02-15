import { describe, it, expect, beforeEach } from "vitest";
import { isHighValue, isLocked, canClear, canSelect, isTableStable } from "./eligibility";
import { buildTx, buildHighValueTx, resetIdCounter } from "../test/factories";

beforeEach(() => resetIdCounter());

describe("eligibility helpers", () => {
  describe("isHighValue", () => {
    it("returns true for amounts > 10,000", () => {
      expect(isHighValue(buildTx({ amount: 10_001 }))).toBe(true);
    });

    it("returns false for amounts <= 10,000", () => {
      expect(isHighValue(buildTx({ amount: 10_000 }))).toBe(false);
      expect(isHighValue(buildTx({ amount: 500 }))).toBe(false);
    });
  });

  describe("isLocked", () => {
    it("returns true for high-value when not super admin", () => {
      expect(isLocked(buildHighValueTx(), false)).toBe(true);
    });

    it("returns false for high-value when super admin", () => {
      expect(isLocked(buildHighValueTx(), true)).toBe(false);
    });

    it("returns false for low-value regardless of admin", () => {
      expect(isLocked(buildTx({ amount: 500 }), false)).toBe(false);
    });
  });

  describe("canClear", () => {
    it("returns true for Pending, idle, non-locked transaction", () => {
      expect(canClear(buildTx(), false)).toBe(true);
    });

    it("returns false when status is Cleared", () => {
      expect(canClear(buildTx({ status: "Cleared" }), false)).toBe(false);
    });

    it("returns false when op is processing", () => {
      expect(canClear(buildTx({ op: "processing" }), false)).toBe(false);
    });

    it("returns false for locked high-value without super admin", () => {
      expect(canClear(buildHighValueTx(), false)).toBe(false);
    });

    it("returns true for high-value with super admin", () => {
      expect(canClear(buildHighValueTx(), true)).toBe(true);
    });
  });

  describe("canSelect", () => {
    it("mirrors canClear logic", () => {
      expect(canSelect(buildTx(), false)).toBe(true);
      expect(canSelect(buildHighValueTx(), false)).toBe(false);
      expect(canSelect(buildHighValueTx(), true)).toBe(true);
      expect(canSelect(buildTx({ status: "Failed" }), false)).toBe(false);
    });
  });

  describe("isTableStable", () => {
    it("returns true when no transactions are processing", () => {
      expect(isTableStable([buildTx(), buildTx()])).toBe(true);
    });

    it("returns false when any transaction is processing", () => {
      expect(
        isTableStable([buildTx(), buildTx({ op: "processing" })])
      ).toBe(false);
    });
  });
});
