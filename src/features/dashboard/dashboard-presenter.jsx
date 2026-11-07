// src/features/dashboard/dashboard-presenter.jsx
import { useEffect } from "react";
import { useDashboardModel } from "./dashboard-model";
import DashboardView from "./dashboard-view";
import HitungLoadingModal from "../../components/modal/HitungLoadingModal";

export default function DashboardPresenter() {
  const {
    data,
    isCheckingCache,
    isComputing,
    error,
    runOptimization,
    checkCacheOnly,
    // BARU
    dataStatus,
    fetchDataStatus,
  } = useDashboardModel();

  // Saat mount atau ganti bulan → cek cache + data status
  useEffect(() => {
    checkCacheOnly();
    fetchDataStatus();
  }, [checkCacheOnly, fetchDataStatus]);

  return (
    <>
      {isComputing && <HitungLoadingModal />}
      <DashboardView
        isLoading={isCheckingCache}
        error={error}
        data={data}
        onRefresh={runOptimization}
        // BARU
        dataStatus={dataStatus}
        fetchDataStatus={fetchDataStatus}
      />
    </>
  );
}