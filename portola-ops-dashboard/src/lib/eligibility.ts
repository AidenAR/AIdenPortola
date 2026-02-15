import { Transaction } from "./types";

export const isHighValue = (tx: Transaction): boolean =>
  tx.amount > 10_000;

export const isLocked = (tx: Transaction, isSuperAdmin: boolean): boolean =>
  isHighValue(tx) && !isSuperAdmin;

export const canClear = (tx: Transaction, isSuperAdmin: boolean): boolean =>
  tx.status === "Pending" && tx.op === "idle" && !isLocked(tx, isSuperAdmin);

export const canSelect = (tx: Transaction, isSuperAdmin: boolean): boolean =>
  tx.status === "Pending" && tx.op === "idle" && !isLocked(tx, isSuperAdmin);

export const isTableStable = (transactions: Transaction[]): boolean =>
  !transactions.some((tx) => tx.op === "processing");
