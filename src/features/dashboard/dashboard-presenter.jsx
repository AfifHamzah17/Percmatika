/**
 * Dashboard Presenter — jembatan antara Model dan View.
 *
 * Sangat tipis: panggil useDashboardModel() → render DashboardView.
 * useEffect hanya menjalankan checkCacheOnly (ringan, tanpa modal).
 * Hitung berat (runOptimization) HANYA terjadi saat user klik tombol.
 */

import { useEffect } from "react";
import { useDashboardModel } from "./dashboard-model";
import DashboardView from "./dashboard-view";
import HitungLoadingModal from "../../components/modal/HitungLoadingModal";

export default function DashboardPresenter() {
  const { data, isCheckingCache, isComputing, error, runOptimization, checkCacheOnly } = useDashboardModel();

  // Saat mount atau ganti bulan → cek cache (ringan, tanpa modal).
  // checkCacheOnly berubah hanya saat targetDate/umkm.nama berubah,
  // jadi tidak ada pemanggilan ulang saat pindah tab balik ke dashboard
  // (selama bulan tetap sama).
  useEffect(() => {
    checkCacheOnly();
  }, [checkCacheOnly]);

  return (
    <>
      {isComputing && <HitungLoadingModal />}
      <DashboardView
        isLoading={isCheckingCache}
        error={error}
        data={data}
        onRefresh={runOptimization}
      />
    </>
  );
}