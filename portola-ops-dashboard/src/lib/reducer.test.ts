import { describe, it, expect, beforeEach } from "vitest";
import { dashboardReducer as reducer } from "./reducer";
import {
  buildTx,
  buildHighValueTx,
  buildInitialState,
  resetIdCounter,
} from "../test/factories";

beforeEach(() => resetIdCounter());

// ─── Phase 1: Core State Transitions ────────────────────────────────────

describe("reducer — Phase 1", () => {
  it("INIT_TRANSACTIONS sets transactions with idle op and attempt 0", () => {
    const txs = [buildTx(), buildTx()];
    const state = reducer(buildInitialState(0), {
      type: "INIT_TRANSACTIONS",
      payload: txs,
    });
    expect(state.transactions).toHaveLength(2);
    state.transactions.forEach((tx) => {
      expect(tx.op).toBe("idle");
      expect(tx.attempt).toBe(0);
    });
  });

  it("START_CLEARING sets op to processing and sets attempt from payload", () => {
    const tx = buildTx();
    const initial = { ...buildInitialState(0), transactions: [tx] };
    const nextAttempt = tx.attempt + 1;
    const state = reducer(initial, {
      type: "START_CLEARING",
      payload: { id: tx.id, attempt: nextAttempt },
    });
    const updated = state.transactions[0];
    expect(updated.op).toBe("processing");
    expect(updated.attempt).toBe(1);
  });

  it("CLEAR_SUCCESS sets status to Cleared and op to idle when attempt matches", () => {
    const tx = buildTx({ op: "processing", attempt: 1 });
    const initial = { ...buildInitialState(0), transactions: [tx] };
    const state = reducer(initial, {
      type: "CLEAR_SUCCESS",
      payload: { id: tx.id, attempt: 1 },
    });
    expect(state.transactions[0].status).toBe("Cleared");
    expect(state.transactions[0].op).toBe("idle");
  });

  it("CLEAR_SUCCESS is a no-op when attempt is stale", () => {
    const tx = buildTx({ op: "processing", attempt: 2 });
    const initial = { ...buildInitialState(0), transactions: [tx] };
    const state = reducer(initial, {
      type: "CLEAR_SUCCESS",
      payload: { id: tx.id, attempt: 1 },
    });
    expect(state.transactions[0].status).toBe("Pending");
    expect(state.transactions[0].op).toBe("processing");
  });

  it("CLEAR_FAILURE sets status to Failed with error message", () => {
    const tx = buildTx({ op: "processing", attempt: 1 });
    const initial = { ...buildInitialState(0), transactions: [tx] };
    const state = reducer(initial, {
      type: "CLEAR_FAILURE",
      payload: { id: tx.id, attempt: 1, error: "Settlement timeout" },
    });
    expect(state.transactions[0].status).toBe("Failed");
    expect(state.transactions[0].error).toBe("Settlement timeout");
    expect(state.transactions[0].op).toBe("idle");
  });

  it("SET_SORT updates sortConfig", () => {
    const initial = buildInitialState(0);
    const state = reducer(initial, {
      type: "SET_SORT",
      payload: { key: "amount", direction: "asc" },
    });
    expect(state.sortConfig).toEqual({ key: "amount", direction: "asc" });
  });
});

// ─── Phase 2: Compliance ────────────────────────────────────────────────

describe("reducer — Phase 2", () => {
  it("TOGGLE_SUPER_ADMIN flips isSuperAdmin", () => {
    const initial = buildInitialState(0);
    expect(initial.isSuperAdmin).toBe(false);
    const state = reducer(initial, { type: "TOGGLE_SUPER_ADMIN" });
    expect(state.isSuperAdmin).toBe(true);
    const state2 = reducer(state, { type: "TOGGLE_SUPER_ADMIN" });
    expect(state2.isSuperAdmin).toBe(false);
  });
});

// ─── Phase 3: Live Feed / Buffer ────────────────────────────────────────

describe("reducer — live feed", () => {
  it("BUFFER_TRANSACTION appends to bufferedTransactions", () => {
    const initial = buildInitialState();
    const newTx = buildTx();
    const state = reducer(initial, {
      type: "BUFFER_TRANSACTION",
      payload: newTx,
    });
    expect(state.bufferedTransactions).toHaveLength(1);
    expect(state.bufferedTransactions[0].id).toBe(newTx.id);
  });

  it("BUFFER_TRANSACTION caps buffer at 100, dropping oldest", () => {
    const initial = {
      ...buildInitialState(0),
      bufferedTransactions: Array.from({ length: 100 }, () => buildTx()),
    };
    const oldestId = initial.bufferedTransactions[0].id;
    const newTx = buildTx();
    const state = reducer(initial, {
      type: "BUFFER_TRANSACTION",
      payload: newTx,
    });
    expect(state.bufferedTransactions).toHaveLength(100);
    expect(
      state.bufferedTransactions.find((t) => t.id === oldestId)
    ).toBeUndefined();
    expect(
      state.bufferedTransactions[state.bufferedTransactions.length - 1].id
    ).toBe(newTx.id);
  });

  it("MERGE_BUFFERED prepends buffer to transactions and clears buffer", () => {
    const existing = [buildTx(), buildTx()];
    const buffered = [buildTx(), buildTx(), buildTx()];
    const initial = {
      ...buildInitialState(0),
      transactions: existing,
      bufferedTransactions: buffered,
    };
    const state = reducer(initial, { type: "MERGE_BUFFERED" });
    expect(state.transactions).toHaveLength(5);
    expect(state.transactions[0].id).toBe(buffered[0].id);
    expect(state.bufferedTransactions).toHaveLength(0);
  });

  it("MERGE_BUFFERED is a no-op when buffer is empty", () => {
    const initial = { ...buildInitialState(0), bufferedTransactions: [] };
    const state = reducer(initial, { type: "MERGE_BUFFERED" });
    expect(state).toBe(initial);
  });
});

// ─── Phase 4: Batch Selection ───────────────────────────────────────────

describe("reducer — batch selection", () => {
  it("TOGGLE_SELECT adds an id to selectedIds", () => {
    const tx = buildTx();
    const initial = { ...buildInitialState(0), transactions: [tx] };
    const state = reducer(initial, {
      type: "TOGGLE_SELECT",
      payload: tx.id,
    });
    expect(state.selectedIds.has(tx.id)).toBe(true);
  });

  it("TOGGLE_SELECT removes an already-selected id", () => {
    const tx = buildTx();
    const initial = {
      ...buildInitialState(0),
      transactions: [tx],
      selectedIds: new Set([tx.id]),
    };
    const state = reducer(initial, {
      type: "TOGGLE_SELECT",
      payload: tx.id,
    });
    expect(state.selectedIds.has(tx.id)).toBe(false);
  });

  it("SELECT_ALL_PENDING selects only eligible Pending transactions", () => {
    const pendingLow = buildTx({ status: "Pending", amount: 500 });
    const pendingHigh = buildHighValueTx({ status: "Pending" });
    const cleared = buildTx({ status: "Cleared" });
    const processing = buildTx({ status: "Pending", op: "processing" });
    const initial = {
      ...buildInitialState(0),
      transactions: [pendingLow, pendingHigh, cleared, processing],
      isSuperAdmin: false,
    };
    const state = reducer(initial, { type: "SELECT_ALL_PENDING" });
    expect(state.selectedIds.has(pendingLow.id)).toBe(true);
    expect(state.selectedIds.has(pendingHigh.id)).toBe(false);
    expect(state.selectedIds.has(cleared.id)).toBe(false);
    expect(state.selectedIds.has(processing.id)).toBe(false);
  });

  it("SELECT_ALL_PENDING includes high-value when super admin is ON", () => {
    const pendingHigh = buildHighValueTx({ status: "Pending" });
    const initial = {
      ...buildInitialState(0),
      transactions: [pendingHigh],
      isSuperAdmin: true,
    };
    const state = reducer(initial, { type: "SELECT_ALL_PENDING" });
    expect(state.selectedIds.has(pendingHigh.id)).toBe(true);
  });

  it("SELECT_ALL_PENDING toggles off when all eligible are already selected", () => {
    const tx = buildTx();
    const initial = {
      ...buildInitialState(0),
      transactions: [tx],
      selectedIds: new Set([tx.id]),
      isSuperAdmin: false,
    };
    const state = reducer(initial, { type: "SELECT_ALL_PENDING" });
    expect(state.selectedIds.size).toBe(0);
  });

  it("DESELECT_ALL clears selectedIds", () => {
    const initial = {
      ...buildInitialState(0),
      selectedIds: new Set(["TXN-00001", "TXN-00002"]),
    };
    const state = reducer(initial, { type: "DESELECT_ALL" });
    expect(state.selectedIds.size).toBe(0);
  });

  it("CLEAR_SUCCESS removes the id from selectedIds", () => {
    const tx = buildTx({ op: "processing", attempt: 1 });
    const initial = {
      ...buildInitialState(0),
      transactions: [tx],
      selectedIds: new Set([tx.id]),
    };
    const state = reducer(initial, {
      type: "CLEAR_SUCCESS",
      payload: { id: tx.id, attempt: 1 },
    });
    expect(state.selectedIds.has(tx.id)).toBe(false);
  });
});

// ─── Cross-cutting: Stale Attempt Guard ─────────────────────────────────

describe("reducer — stale attempt guard", () => {
  it("drops CLEAR_SUCCESS when attempt does not match (stale response)", () => {
    const tx = buildTx({ op: "processing", attempt: 3 });
    const initial = { ...buildInitialState(0), transactions: [tx] };
    const state = reducer(initial, {
      type: "CLEAR_SUCCESS",
      payload: { id: tx.id, attempt: 2 },
    });
    expect(state.transactions[0].status).toBe("Pending");
    expect(state.transactions[0].op).toBe("processing");
  });

  it("drops CLEAR_FAILURE when attempt does not match", () => {
    const tx = buildTx({ op: "processing", attempt: 3 });
    const initial = { ...buildInitialState(0), transactions: [tx] };
    const state = reducer(initial, {
      type: "CLEAR_FAILURE",
      payload: { id: tx.id, attempt: 1, error: "stale" },
    });
    expect(state.transactions[0].status).toBe("Pending");
    expect(state.transactions[0].error).toBeUndefined();
  });
});

// ─── Cross-cutting: Row Key Stability ───────────────────────────────────

describe("row key stability", () => {
  it("preserves processing state when new rows are merged at the top", () => {
    const processingTx = buildTx({ op: "processing", attempt: 1 });
    const initial = {
      ...buildInitialState(0),
      transactions: [processingTx],
      bufferedTransactions: [buildTx(), buildTx()],
    };

    const state = reducer(initial, { type: "MERGE_BUFFERED" });
    const still = state.transactions.find(
      (t) => t.id === processingTx.id
    )!;
    expect(still.op).toBe("processing");
    expect(still.attempt).toBe(1);
  });
});
