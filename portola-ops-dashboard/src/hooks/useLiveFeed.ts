"use client";

import { useEffect } from "react";
import { generateSingleTransaction } from "../lib/generateTransactions";
import { DashboardAction } from "../lib/reducer";

export function useLiveFeed(
  dispatch: React.Dispatch<DashboardAction>,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    function tick() {
      const newTx = generateSingleTransaction();
      dispatch({ type: "BUFFER_TRANSACTION", payload: newTx });
      timeoutId = setTimeout(tick, 2000);
    }

    timeoutId = setTimeout(tick, 2000);
    return () => clearTimeout(timeoutId);
  }, [dispatch, enabled]);
}
