interface BatchToolbarProps {
  selectedCount: number;
  onClearSelected: () => void;
  onDeselectAll: () => void;
  isProcessing: boolean;
}

export function BatchToolbar({
  selectedCount,
  onClearSelected,
  onDeselectAll,
  isProcessing,
}: BatchToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky bottom-4 z-20 mx-auto max-w-xl">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-5 py-3 shadow-lg">
        <span className="text-sm font-medium text-gray-700">
          {selectedCount} transaction{selectedCount === 1 ? "" : "s"} selected
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={onDeselectAll}
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
          >
            Deselect All
          </button>
          <button
            onClick={onClearSelected}
            disabled={isProcessing}
            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <svg
                  className="h-3.5 w-3.5 animate-spin"
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
              </>
            ) : (
              "Clear Selected"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
