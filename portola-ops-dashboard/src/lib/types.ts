export type TxStatus = "Pending" | "Cleared" | "Failed";
export type TxOpState = "idle" | "processing";

export interface Transaction {
  id: string;
  clientName: string;
  amount: number;
  status: TxStatus;
  op: TxOpState;
  attempt: number;
  error?: string;
  timestampMs: number;
}

export type SortKey = "id" | "clientName" | "amount" | "status" | "timestampMs";
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export interface DashboardState {
  transactions: Transaction[];
  bufferedTransactions: Transaction[];
  selectedIds: Set<string>;
  isSuperAdmin: boolean;
  sortConfig: SortConfig | null;
}
