//src/context/AppContext.jsx
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { fetchUserConfig } from "../services/apiClient";

const AppContext = createContext(null);

const DEFAULT_UMKM = { nama:"Bu Aminah, Medan", Cr:160, Co:200, cost_overtime_hr:25000 };

const DEFAULT_PRODUCTS = [
  { nama:"Sajadah", harga_jual:162500, biaya_material:35000, biaya_tk:15000, waktu_jam:2.5, ongkir_ekspres:15000, penalti_backorder:20000, lead_time:14 },
  { nama:"Selimut Quilting", harga_jual:192500, biaya_material:40000, biaya_tk:18000, waktu_jam:3.5, ongkir_ekspres:20000, penalti_backorder:25000, lead_time:8 },
  { nama:"Totebag", harga_jual:85000, biaya_material:20000, biaya_tk:10000, waktu_jam:1.0, ongkir_ekspres:8000, penalti_backorder:10000, lead_time:10 },
  { nama:"Pouch", harga_jual:45000, biaya_material:12000, biaya_tk:6000, waktu_jam:0.5, ongkir_ekspres:5000, penalti_backorder:5000, lead_time:5 },
  { nama:"Sarung Bantal", harga_jual:120000, biaya_material:25000, biaya_tk:12000, waktu_jam:1.5, ongkir_ekspres:10000, penalti_backorder:12000, lead_time:7 },
  { nama:"Taplak Meja", harga_jual:95000, biaya_material:22000, biaya_tk:11000, waktu_jam:1.2, ongkir_ekspres:9000, penalti_backorder:10000, lead_time:6 },
];

export function AppProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const now = new Date();
  const [targetDate, setTargetDate] = useState(new Date(now.getFullYear(), now.getMonth() + 1, 1));
  const [umkm, setUmkm] = useState(DEFAULT_UMKM);
  const [produkList, setProdukList] = useState(DEFAULT_PRODUCTS);
  const [dashboardData, setDashboardData] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [configChecked, setConfigChecked] = useState(false);
  const wasAuthenticated = useRef(isAuthenticated);

  // Begitu user login, ambil config tersimpan miliknya dari backend (Firestore).
  // Kalau belum pernah simpan apa-apa (produk_list kosong) -> tandai perlu
  // onboarding (wizard input pertama kali). Reset ke default hanya saat
  // transisi login->logout (bukan tiap render/mount).
  useEffect(() => {
    if (!isAuthenticated) {
      if (wasAuthenticated.current) {
        // Reset ke default HARUS sinkron di sini (transisi login->logout,
        // bukan hasil operasi async yg bisa dipindah ke .then()/callback).
        setUmkm(DEFAULT_UMKM); // eslint-disable-line react-hooks/set-state-in-effect
        setProdukList(DEFAULT_PRODUCTS);
      }
      wasAuthenticated.current = false;
      setConfigChecked(false);
      return;
    }
    wasAuthenticated.current = true;
    fetchUserConfig()
      .then(({ produk_list, umkm: savedUmkm }) => {
        if (produk_list && produk_list.length > 0) {
          setProdukList(produk_list);
          if (savedUmkm) setUmkm(savedUmkm);
          setNeedsOnboarding(false);
        } else {
          setNeedsOnboarding(true); // user baru, belum pernah isi apa-apa
        }
      })
      .catch(() => { /* gagal load -> tetap pakai default, jangan paksa onboarding */ })
      .finally(() => setConfigChecked(true));
  }, [isAuthenticated, user?.email]);

  const completeOnboarding = (newProdukList, newUmkm) => {
    setProdukList(newProdukList);
    setUmkm(newUmkm);
    setNeedsOnboarding(false);
  };

  return (
    <AppContext.Provider value={{
      targetDate, setTargetDate, umkm, setUmkm, produkList, setProdukList,
      dashboardData, setDashboardData, needsOnboarding, configChecked, completeOnboarding,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}