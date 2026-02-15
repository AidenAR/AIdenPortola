import { SuperAdminToggle } from "./SuperAdminToggle";

interface NavBarProps {
  isSuperAdmin: boolean;
  onToggleSuperAdmin: () => void;
}

export function NavBar({ isSuperAdmin, onToggleSuperAdmin }: NavBarProps) {
  return (
    <nav className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
            <span className="text-sm font-bold text-white">P</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-gray-900">
              Portola
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
              Mission Control
            </p>
          </div>
        </div>
        <SuperAdminToggle isOn={isSuperAdmin} onToggle={onToggleSuperAdmin} />
      </div>
    </nav>
  );
}
