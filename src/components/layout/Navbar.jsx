//src/components/layout/Navbar.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, Search, User, ChevronDown } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({ onToggleSidebar }) {
  const [showProfile, setShowProfile] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { umkm, produkList } = useApp();
  const { user, logout } = useAuth();

  const ROUTE_MAP = [
    { keys:["dashboard","utama","beranda","home"], path:"/" },
    { keys:["analitik","chart","grafik","statistik"], path:"/analitik" },
    { keys:["produk","product","item","barang"], path:"/produk" },
    { keys:["bantuan","help","info"], path:"/bantuan" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.toLowerCase().trim();
    if (!q) return;
    for (const route of ROUTE_MAP) {
      if (route.keys.some(k => k.includes(q))) { navigate(route.path); setSearch(""); return; }
    }
    const found = produkList.find(p => p.nama.toLowerCase().includes(q));
    if (found) { navigate("/produk"); setSearch(""); return; }
    navigate("/");
    setSearch("");
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Menu size={20} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <h1 className="text-lg font-bold text-gray-800 hidden sm:block">PercaMatika</h1>
          </div>
        </div>

        <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari fitur, produk, atau data..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="relative">
            <button onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <ChevronDown size={14} className={`text-gray-500 hidden sm:block transition-transform ${showProfile ? "rotate-180" : ""}`} />
            </button>
            {showProfile && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{umkm.nama}</p>
                    <p className="text-xs text-gray-500">{user?.email ?? ""}</p>
                  </div>
                  <button onClick={() => { navigate("/profil"); setShowProfile(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profil</button>
                  <button onClick={() => { logout(); setShowProfile(false); navigate("/login"); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Keluar</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}