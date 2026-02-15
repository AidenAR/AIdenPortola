interface SuperAdminToggleProps {
  isOn: boolean;
  onToggle: () => void;
}

export function SuperAdminToggle({ isOn, onToggle }: SuperAdminToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-600">Super Admin</span>
      <button
        role="switch"
        aria-checked={isOn}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
          isOn ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isOn ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <span
        className={`text-xs font-semibold uppercase tracking-wide ${
          isOn ? "text-blue-600" : "text-gray-400"
        }`}
      >
        {isOn ? "ON" : "OFF"}
      </span>
    </div>
  );
}
