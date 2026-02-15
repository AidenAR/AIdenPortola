import { DashboardState, Transaction, SortConfig } from "./types";
import { canSelect } from "./eligibility";

const BUFFER_CAP = 100;

export type DashboardAction =
  | { type: "INIT_TRANSACTIONS"; payload: Transaction[] }
  | { type: "BUFFER_TRANSACTION"; payload: Transaction }
  | { type: "MERGE_BUFFERED" }
  | { type: "START_CLEARING"; payload: { id: string; attempt: number } }
  | { type: "CLEAR_SUCCESS"; payload: { id: string; attempt: number } }
  | {
      type: "CLEAR_FAILURE";
      payload: { id: string; attempt: number; error: string };
    }
  | { type: "TOGGLE_SELECT"; payload: string }
  | { type: "SELECT_ALL_PENDING" }
  | { type: "DESELECT_ALL" }
  | { type: "SET_SORT"; payload: SortConfig }
  | { type: "TOGGLE_SUPER_ADMIN" };

export const initialState: DashboardState = {
  transactions: [],
  bufferedTransactions: [],
  selectedIds: new Set(),
  isSuperAdmin: false,
  sortConfig: null,
};

export function dashboardReducer(
  state: DashboardState,
  action: DashboardAction
): DashboardState {
  switch (action.type) {
    case "INIT_TRANSACTIONS":
      return {
        ...state,
        transactions: action.payload,
      };

    case "BUFFER_TRANSACTION": {
      const newBuffer = [...state.bufferedTransactions, action.payload];
      if (newBuffer.length > BUFFER_CAP) {
        newBuffer.shift();
      }
      return {
        ...state,
        bufferedTransactions: newBuffer,
      };
    }

    case "MERGE_BUFFERED":
      if (state.bufferedTransactions.length === 0) return state;
      return {
        ...state,
        transactions: [
          ...state.bufferedTransactions,
          ...state.transactions,
        ],
        bufferedTransactions: [],
      };

    case "START_CLEARING":
      return {
        ...state,
        transactions: state.transactions.map((tx) =>
          tx.id === action.payload.id
            ? { ...tx, op: "processing" as const, attempt: action.payload.attempt }
            : tx
        ),
      };

    case "CLEAR_SUCCESS": {
      const target = state.transactions.find(
        (t) => t.id === action.payload.id
      );
      if (!target || target.attempt !== action.payload.attempt) return state;

      const newSelected = new Set(state.selectedIds);
      newSelected.delete(action.payload.id);

      return {
        ...state,
        transactions: state.transactions.map((tx) =>
          tx.id === action.payload.id
            ? { ...tx, status: "Cleared" as const, op: "idle" as const, error: undefined }
            : tx
        ),
        selectedIds: newSelected,
      };
    }

    case "CLEAR_FAILURE": {
      const target = state.transactions.find(
        (t) => t.id === action.payload.id
      );
      if (!target || target.attempt !== action.payload.attempt) return state;

      return {
        ...state,
        transactions: state.transactions.map((tx) =>
          tx.id === action.payload.id
            ? {
                ...tx,
                status: "Failed" as const,
                op: "idle" as const,
                error: action.payload.error,
              }
            : tx
        ),
      };
    }

    case "TOGGLE_SELECT": {
      const newSelected = new Set(state.selectedIds);
      if (newSelected.has(action.payload)) {
        newSelected.delete(action.payload);
      } else {
        newSelected.add(action.payload);
      }
      return { ...state, selectedIds: newSelected };
    }

    case "SELECT_ALL_PENDING": {
      const eligible = state.transactions.filter((tx) =>
        canSelect(tx, state.isSuperAdmin)
      );
      const allSelected = eligible.every((tx) =>
        state.selectedIds.has(tx.id)
      );

      if (allSelected) {
        return { ...state, selectedIds: new Set() };
      }

      const newSelected = new Set(state.selectedIds);
      eligible.forEach((tx) => newSelected.add(tx.id));
      return { ...state, selectedIds: newSelected };
    }

    case "DESELECT_ALL":
      return { ...state, selectedIds: new Set() };

    case "SET_SORT":
      return { ...state, sortConfig: action.payload };

    case "TOGGLE_SUPER_ADMIN":
      return { ...state, isSuperAdmin: !state.isSuperAdmin };

    default:
      return state;
  }
}
