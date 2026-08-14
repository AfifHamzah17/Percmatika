// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import DashboardPresenter from "./features/dashboard/dashboard-presenter";
import ProdukPresenter from "./features/produk/produk-presenter";
import AnalitikPresenter from "./features/analitik/analitik-presenter";
import BantuanPage from "./features/bantuan/BantuanPage";
import ProfilPage from "./features/profil/ProfilPage";
import PenjualanPresenter from "./features/penjualan/penjualan-presenter";

function Placeholder({ title }) {
  return (
    <div className="flex items-center justify-center py-24">
      <p className="text-gray-400 text-sm">{title} — segera hadir</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<DashboardPresenter />} />
                <Route path="/produk" element={<ProdukPresenter />} />
                <Route path="/penjualan" element={<PenjualanPresenter />} />
                <Route path="/analitik" element={<AnalitikPresenter />} />
                <Route path="/bantuan" element={<BantuanPage />} />
                <Route path="/profil" element={<ProfilPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}