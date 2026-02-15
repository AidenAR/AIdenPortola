"use client";

import { useReducer, useEffect, useCallback } from "react";
import { dashboardReducer, initialState, DashboardAction } from "../lib/reducer";
import { generateTransactions } from "../lib/generateTransactions";
import { mockClearFunds } from "../lib/mockApi";
import { isTableStable } from "../lib/eligibility";
import { SortKey } from "../lib/types";
import { useLiveFeed } from "../hooks/useLiveFeed";
import { NavBar } from "../components/NavBar";
import { NewTransactionsBanner } from "../components/NewTransactionsBanner";
import { TransactionTable } from "../components/TransactionTable";
import { BatchToolbar } from "../components/BatchToolbar";
import { ToastContainer, showToast } from "../components/Toast";

const FAILURE_RATE = 0.1;

export default function DashboardPage() {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  useEffect(() => {
    const txs = generateTransactions(50);
    dispatch({ type: "INIT_TRANSACTIONS", payload: txs });
  }, []);

  useLiveFeed(dispatch);

  const tableStable = isTableStable(state.transactions);
  const hasProcessing = !tableStable;

  const handleClear = useCallback(
    (id: string) => {
      const tx = state.transactions.find((t) => t.id === id);
      if (!tx) return;

      const nextAttempt = tx.attempt + 1;
      dispatch({
        type: "START_CLEARING",
        payload: { id, attempt: nextAttempt },
      });

      mockClearFunds(id, { failureRate: FAILURE_RATE }).then(
        () => {
          dispatch({
            type: "CLEAR_SUCCESS",
            payload: { id, attempt: nextAttempt },
          });
        },
        (error: Error) => {
          dispatch({
            type: "CLEAR_FAILURE",
            payload: { id, attempt: nextAttempt, error: error.message },
          });
        }
      );
    },
    [state.transactions]
  );

  const handleBatchClear = useCallback(() => {
    const selectedIds = Array.from(state.selectedIds);
    if (selectedIds.length === 0) return;

    const attemptByTx = new Map<string, number>();
    selectedIds.forEach((id) => {
      const tx = state.transactions.find((t) => t.id === id);
      if (!tx) return;
      const next = tx.attempt + 1;
      attemptByTx.set(id, next);
      dispatch({ type: "START_CLEARING", payload: { id, attempt: next } });
    });

    const promises = selectedIds.map((id) =>
      mockClearFunds(id, { failureRate: FAILURE_RATE })
        .then(() => ({ id, ok: true as const }))
        .catch((e: Error) => ({ id, ok: false as const, error: e.message }))
    );

    Promise.all(promises).then((outcomes) => {
      let succeeded = 0;
      let failed = 0;
      const failedIds: string[] = [];

      outcomes.forEach(({ id, ok, ...rest }) => {
        const attempt = attemptByTx.get(id)!;
        if (ok) {
          succeeded++;
          dispatch({ type: "CLEAR_SUCCESS", payload: { id, attempt } });
        } else {
          failed++;
          failedIds.push(id);
          dispatch({
            type: "CLEAR_FAILURE",
            payload: {
              id,
              attempt,
              error: (rest as { error: string }).error,
            },
          });
        }
      });

      if (failed > 0) {
        showToast(`${succeeded} cleared, ${failed} failed`, {
          type: "error",
          action: {
            label: "Retry Failed",
            onClick: () => {
              failedIds.forEach((id) => {
                handleClear(id);
              });
            },
          },
        });
      } else {
        showToast(`${succeeded} cleared successfully`, "success");
      }
    });
  }, [state.selectedIds, state.transactions, handleClear]);

  const handleSort = useCallback(
    (key: SortKey) => {
      const direction =
        state.sortConfig?.key === key && state.sortConfig.direction === "asc"
          ? "desc"
          : "asc";
      dispatch({ type: "SET_SORT", payload: { key, direction } });
    },
    [state.sortConfig]
  );

  const handleMerge = useCallback(() => {
    dispatch({ type: "MERGE_BUFFERED" });
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_SELECT", payload: id });
  }, []);

  const handleSelectAll = useCallback(() => {
    dispatch({ type: "SELECT_ALL_PENDING" });
  }, []);

  const handleDeselectAll = useCallback(() => {
    dispatch({ type: "DESELECT_ALL" });
  }, []);

  const handleToggleSuperAdmin = useCallback(() => {
    dispatch({ type: "TOGGLE_SUPER_ADMIN" });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <NavBar
        isSuperAdmin={state.isSuperAdmin}
        onToggleSuperAdmin={handleToggleSuperAdmin}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats bar */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Total"
            value={state.transactions.length}
          />
          <StatCard
            label="Pending"
            value={
              state.transactions.filter((t) => t.status === "Pending").length
            }
            accent="amber"
          />
          <StatCard
            label="Cleared"
            value={
              state.transactions.filter((t) => t.status === "Cleared").length
            }
            accent="emerald"
          />
          <StatCard
            label="Failed"
            value={
              state.transactions.filter((t) => t.status === "Failed").length
            }
            accent="red"
          />
        </div>

        {/* New transactions banner */}
        <div className="mb-4">
          <NewTransactionsBanner
            count={state.bufferedTransactions.length}
            canMerge={tableStable}
            onMerge={handleMerge}
          />
        </div>

        {/* Transaction table */}
        <TransactionTable
          transactions={state.transactions}
          selectedIds={state.selectedIds}
          isSuperAdmin={state.isSuperAdmin}
          sortConfig={state.sortConfig}
          onSort={handleSort}
          onClear={handleClear}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
        />

        {/* Batch toolbar */}
        <BatchToolbar
          selectedCount={state.selectedIds.size}
          onClearSelected={handleBatchClear}
          onDeselectAll={handleDeselectAll}
          isProcessing={hasProcessing}
        />
      </main>

      <ToastContainer />
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "amber" | "emerald" | "red";
}) {
  const accentColors = {
    amber: "text-amber-600",
    emerald: "text-emerald-600",
    red: "text-red-600",
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-semibold tabular-nums ${
          accent ? accentColors[accent] : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
