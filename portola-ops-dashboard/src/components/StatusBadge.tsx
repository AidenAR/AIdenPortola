import { TxStatus } from "../lib/types";

const statusStyles: Record<TxStatus, string> = {
  Pending:
    "bg-amber-100 text-amber-800 border border-amber-200",
  Cleared:
    "bg-emerald-100 text-emerald-800 border border-emerald-200",
  Failed:
    "bg-red-100 text-red-800 border border-red-200",
};

export function StatusBadge({ status }: { status: TxStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
