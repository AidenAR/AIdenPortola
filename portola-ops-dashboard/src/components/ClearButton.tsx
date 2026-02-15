import { Transaction } from "../lib/types";
import { canClear } from "../lib/eligibility";

interface ClearButtonProps {
  tx: Transaction;
  isSuperAdmin: boolean;
  onClear: (id: string) => void;
}

export function ClearButton({ tx, isSuperAdmin, onClear }: ClearButtonProps) {
  if (tx.status === "Cleared") return null;

  const clearable = canClear(tx, isSuperAdmin);
  const isProcessing = tx.op === "processing";

  if (tx.status === "Failed" && tx.op === "idle") {
    return (
      <button
        onClick={() => onClear(tx.id)}
        disabled={!clearable}
        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Retry
      </button>
    );
  }

  return (
    <button
      onClick={() => onClear(tx.id)}
      disabled={!clearable || isProcessing}
      title={
        !clearable && !isProcessing
          ? "Requires Super Admin to clear high-value transactions"
          : undefined
      }
      className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isProcessing ? (
        <span className="flex items-center gap-1.5">
          <svg
            className="h-3 w-3 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Processing…
        </span>
      ) : (
        "Clear Funds"
      )}
    </button>
  );
}
