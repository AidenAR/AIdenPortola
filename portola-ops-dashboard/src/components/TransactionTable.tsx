import { Transaction, SortConfig, SortKey } from "../lib/types";
import { isHighValue, canSelect } from "../lib/eligibility";
import { StatusBadge } from "./StatusBadge";
import { ClearButton } from "./ClearButton";

interface TransactionTableProps {
  transactions: Transaction[];
  selectedIds: Set<string>;
  isSuperAdmin: boolean;
  sortConfig: SortConfig | null;
  onSort: (key: SortKey) => void;
  onClear: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
}

const formatCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatTimestamp(ms: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(ms));
}

function SortIcon({
  columnKey,
  sortConfig,
}: {
  columnKey: SortKey;
  sortConfig: SortConfig | null;
}) {
  if (!sortConfig || sortConfig.key !== columnKey) {
    return (
      <svg className="ml-1 inline h-3 w-3 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 10l5-5 5 5H7zM7 14l5 5 5-5H7z" />
      </svg>
    );
  }

  return (
    <svg className="ml-1 inline h-3 w-3 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
      {sortConfig.direction === "asc" ? (
        <path d="M7 14l5-5 5 5H7z" />
      ) : (
        <path d="M7 10l5 5 5-5H7z" />
      )}
    </svg>
  );
}

function sortTransactions(
  transactions: Transaction[],
  config: SortConfig | null
): Transaction[] {
  if (!config) return transactions;

  return [...transactions].sort((a, b) => {
    const { key, direction } = config;
    let comparison = 0;

    if (key === "amount" || key === "timestampMs") {
      comparison = a[key] - b[key];
    } else {
      comparison = String(a[key]).localeCompare(String(b[key]));
    }

    return direction === "asc" ? comparison : -comparison;
  });
}

export function TransactionTable({
  transactions,
  selectedIds,
  isSuperAdmin,
  sortConfig,
  onSort,
  onClear,
  onToggleSelect,
  onSelectAll,
}: TransactionTableProps) {
  const sorted = sortTransactions(transactions, sortConfig);

  const eligibleCount = transactions.filter((tx) =>
    canSelect(tx, isSuperAdmin)
  ).length;
  const selectedEligibleCount = transactions.filter(
    (tx) => canSelect(tx, isSuperAdmin) && selectedIds.has(tx.id)
  ).length;
  const allSelected =
    eligibleCount > 0 && selectedEligibleCount === eligibleCount;

  const headerClass =
    "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer select-none hover:text-gray-700 transition-colors";

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50/80">
          <tr>
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                disabled={eligibleCount === 0}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                aria-label="Select all eligible transactions"
              />
            </th>
            <th className={headerClass} onClick={() => onSort("id")}>
              ID
              <SortIcon columnKey="id" sortConfig={sortConfig} />
            </th>
            <th className={headerClass} onClick={() => onSort("clientName")}>
              Client
              <SortIcon columnKey="clientName" sortConfig={sortConfig} />
            </th>
            <th
              className={`${headerClass} text-right`}
              onClick={() => onSort("amount")}
            >
              Amount
              <SortIcon columnKey="amount" sortConfig={sortConfig} />
            </th>
            <th className={headerClass} onClick={() => onSort("status")}>
              Status
              <SortIcon columnKey="status" sortConfig={sortConfig} />
            </th>
            <th
              className={headerClass}
              onClick={() => onSort("timestampMs")}
            >
              Timestamp
              <SortIcon columnKey="timestampMs" sortConfig={sortConfig} />
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.map((tx) => {
            const highValue = isHighValue(tx);
            const selectable = canSelect(tx, isSuperAdmin);
            const selected = selectedIds.has(tx.id);

            return (
              <tr
                key={tx.id}
                aria-label={highValue ? "High-value transaction" : undefined}
                className={`transition-colors ${
                  highValue
                    ? "border-l-4 border-l-red-400 bg-red-50/60"
                    : selected
                      ? "bg-blue-50/60"
                      : "hover:bg-gray-50/60"
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggleSelect(tx.id)}
                    disabled={!selectable}
                    data-testid={`checkbox-${tx.id}`}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-30"
                    aria-label={`Select transaction ${tx.id}`}
                  />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">
                  {tx.id}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {tx.clientName}
                </td>
                <td
                  className="px-4 py-3 text-right font-mono tabular-nums"
                  data-testid="amount-cell"
                >
                  <span className={highValue ? "font-semibold text-red-700" : "text-gray-900"}>
                    {formatCurrency.format(tx.amount)}
                  </span>
                  {highValue && (
                    <span className="ml-1.5 text-red-500" title="High-value transaction">
                      ⚠
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <StatusBadge status={tx.status} />
                    {tx.error && (
                      <span className="text-[11px] leading-tight text-red-500">
                        {tx.error}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {formatTimestamp(tx.timestampMs)}
                </td>
                <td className="px-4 py-3 text-right">
                  <ClearButton
                    tx={tx}
                    isSuperAdmin={isSuperAdmin}
                    onClear={onClear}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-400">
          No transactions to display.
        </div>
      )}
    </div>
  );
}
