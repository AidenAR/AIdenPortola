import { Transaction, DashboardState } from "../lib/types";

let idCounter = 0;

export function resetIdCounter() {
  idCounter = 0;
}

export function buildTx(overrides: Partial<Transaction> = {}): Transaction {
  idCounter++;
  return {
    id: `TXN-${String(idCounter).padStart(5, "0")}`,
    clientName: "Test Client",
    amount: 500,
    status: "Pending",
    op: "idle",
    attempt: 0,
    timestampMs: Date.now() - idCounter * 60_000,
    ...overrides,
  };
}

export function buildHighValueTx(
  overrides: Partial<Transaction> = {}
): Transaction {
  return buildTx({ amount: 50_000, ...overrides });
}

export function buildInitialState(txCount = 5): DashboardState {
  return {
    transactions: Array.from({ length: txCount }, () => buildTx()),
    bufferedTransactions: [],
    selectedIds: new Set<string>(),
    isSuperAdmin: false,
    sortConfig: null,
  };
}
