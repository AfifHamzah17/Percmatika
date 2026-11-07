// src/components/layout/AppNav.jsx
// Navigasi atas (desktop) + tab bawah (ponsel). Menggantikan Navbar dan Sidebar lama.
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, BarChart3, Package, TrendingUp, HelpCircle, UserRound, LogOut } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { LogoMark } from "../ui";

export const MENU = [
  { to: "/", label: "Rencana", icon: LayoutDashboard, end: true },
  { to: "/analitik", label: "Analitik", icon: BarChart3 },
  { to: "/produk", label: "Produk", icon: Package },
  { to: "/penjualan", label: "Penjualan", icon: TrendingUp },
  { to: "/bantuan", label: "Bantuan", icon: HelpCircle },
];

const IKON = 18;

export default function AppNav() {
  const [buka, setBuka] = useState(false);
  const navigate = useNavigate();
  const lokasi = useLocation();
  const { umkm } = useApp();
  const { user, logout } = useAuth();
  const wadah = useRef(null);

  useEffect(() => setBuka(false), [lokasi.pathname]);
  useEffect(() => {
    if (!buka) return;
    const tutup = (e) => { if (!wadah.current?.contains(e.target)) setBuka(false); };
    const esc = (e) => { if (e.key === "Escape") setBuka(false); };
    document.addEventListener("mousedown", tutup);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", tutup); document.removeEventListener("keydown", esc); };
  }, [buka]);

  const inisial = (umkm?.nama || user?.email || "P").trim().charAt(0).toUpperCase();

  return (
    <>
      <header className="pm-topnav">
        <div className="pm-topnav__in">
          <Link to="/" className="pm-brand" aria-label="PercaMatika, ke halaman rencana">
            <LogoMark size={30} />
            <span className="pm-brand__name">Perca<b>Matika</b></span>
          </Link>

          <nav className="pm-navlinks" aria-label="Menu utama">
            {MENU.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className="pm-navlink">{label}</NavLink>
            ))}
          </nav>

          <div className="pm-topnav__right" ref={wadah}>
            <button type="button" className="pm-iconbtn" style={{ width: "auto", padding: 2, borderRadius: 12 }}
              onClick={() => setBuka((v) => !v)} aria-haspopup="menu" aria-expanded={buka} aria-label="Menu akun">
              <span className="pm-avatar">{inisial}</span>
            </button>
            {buka && (
              <div className="pm-menu" role="menu">
                <div className="pm-menu__who">
                  <p className="pm-h3">{umkm?.nama || "Usaha Anda"}</p>
                  <p className="pm-small" style={{ overflowWrap: "anywhere" }}>{user?.email}</p>
                </div>
                <button type="button" role="menuitem" className="pm-menu__item" onClick={() => navigate("/profil")}>
                  <UserRound size={IKON} strokeWidth={1.75} /> Profil usaha
                </button>
                <button type="button" role="menuitem" className="pm-menu__item pm-menu__item--danger"
                  onClick={() => { logout(); navigate("/login"); }}>
                  <LogOut size={IKON} strokeWidth={1.75} /> Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="pm-bottomnav" aria-label="Menu utama">
        {MENU.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}>
            <Icon size={21} strokeWidth={1.75} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
