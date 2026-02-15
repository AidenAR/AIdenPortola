"use client";

import { useEffect, useState, useCallback } from "react";

interface ToastData {
  id: number;
  message: string;
  type: "success" | "error" | "info";
  action?: { label: string; onClick: () => void };
}

interface ToastOptions {
  type?: ToastData["type"];
  action?: { label: string; onClick: () => void };
  duration?: number;
}

let toastId = 0;
let addToastFn: ((message: string, options?: ToastOptions) => void) | null =
  null;

export function showToast(message: string, typeOrOptions?: ToastData["type"] | ToastOptions) {
  const options: ToastOptions =
    typeof typeOrOptions === "string"
      ? { type: typeOrOptions }
      : typeOrOptions ?? {};
  addToastFn?.(message, options);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    addToastFn = (message, options = {}) => {
      const id = ++toastId;
      const duration = options.action ? 8000 : (options.duration ?? 5000);
      setToasts((prev) => [
        ...prev,
        { id, message, type: options.type ?? "info", action: options.action },
      ]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    };
    return () => {
      addToastFn = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`animate-slide-up flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : toast.type === "error"
                ? "bg-red-600 text-white"
                : "bg-gray-800 text-white"
          }`}
        >
          <span>{toast.message}</span>
          {toast.action && (
            <button
              onClick={() => {
                toast.action!.onClick();
                dismiss(toast.id);
              }}
              className="shrink-0 rounded bg-white/20 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/30"
            >
              {toast.action.label}
            </button>
          )}
          <button
            onClick={() => dismiss(toast.id)}
            className="ml-1 shrink-0 text-white/60 transition-colors hover:text-white"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
