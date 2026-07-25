// src/components/layout/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BarChart3, Package, HelpCircle, ChevronLeft, ChevronRight, X } from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analitik", label: "Analitik", icon: BarChart3 },
  { to: "/produk", label: "Produk", icon: Package },
  { to: "/bantuan", label: "Bantuan", icon: HelpCircle },
];

/* ═══════ MOBILE: full-screen drawer dari atas ═══════ */
function MobileSidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72
          bg-white shadow-2xl shadow-black/20
          flex flex-col
          sidebar-transition
          -translate-x-full
          lg:hidden
          ${isOpen ? "translate-x-0" : ""}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-[15px] text-gray-800">PercaMatika</span>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                  ${active
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-600 active:bg-gray-50"
                  }
                `}
              >
                <Icon size={21} className="shrink-0" />
                <span className="text-[15px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/60">
          <p className="text-[11px] text-gray-400 leading-relaxed">PercaMatika v1.0 · Optimasi Produksi UMKM</p>
        </div>
      </aside>
    </>
  );
}

/* ═══════ DESKTOP: sticky sidebar ═══════ */
function DesktopSidebar({ isCollapsed, onToggle }) {
  const location = useLocation();
  const w = isCollapsed ? "w-[68px]" : "w-60";

  return (
    <aside
      className={`
        hidden lg:flex lg:flex-col lg:shrink-0
        sticky top-16 z-auto
        h-[calc(100vh-4rem)]
        bg-white border-r border-gray-200
        sidebar-transition ${w}
      `}
    >
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {NAV.map(item => {
          const active = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              title={isCollapsed ? item.label : undefined}
              className={`
                flex items-center rounded-lg transition-all
                ${isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"}
                ${active
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <Icon size={20} className="shrink-0" />
              {!isCollapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 p-2">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!isCollapsed && <span className="text-sm">Tutup Sidebar</span>}
        </button>
      </div>
    </aside>
  );
}

/* ═══════ EXPORT ═══════ */
export default function Sidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }) {
  return (
    <>
      <MobileSidebar isOpen={isMobileOpen} onClose={onMobileClose} />
      <DesktopSidebar isCollapsed={isCollapsed} onToggle={onToggle} />
    </>
  );
}