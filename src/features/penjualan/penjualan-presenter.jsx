// src/features/penjualan/penjualan-presenter.jsx
import { useState, useCallback } from "react";
import { usePenjualanModel } from "./penjualan-model";
import PenjualanView from "./penjualan-view";
import { useApp } from "../../context/AppContext";
import { toast } from "react-toastify";

export default function PenjualanPresenter() {
  const { produkList } = useApp();
  const model = usePenjualanModel();
  const [isExporting, setIsExporting] = useState(false);

  // ── Export Excel ──
  const handleExportExcel = useCallback(async () => {
    setIsExporting(true);
    try {
      const data = await model.fetchExportData();
      if (data.length === 0) {
        toast.info("Tidak ada data untuk di-export.");
        return;
      }
      const { BULAN_LABEL } = await import("./penjualan-model");
      const rows = data.map((d, i) => ({
        No: i + 1,
        Produk: d.produk_nama,
        Bulan: BULAN_LABEL[d.bulan] || d.bulan,
        Tahun: d.tahun,
        "Jumlah Terjual": d.jumlah_terjual,
      }));
      const { exportToExcel } = await import("../../services/excelService");
      await exportToExcel(rows, "Data_Penjualan_PercaMatika");
      toast.success("Export Excel berhasil!");
    } catch (err) {
      toast.error("Gagal export Excel: " + err.message);
    } finally {
      setIsExporting(false);
    }
  }, [model]);

  // ── Export PDF ──
  const handleExportPdf = useCallback(async () => {
    setIsExporting(true);
    try {
      const data = await model.fetchExportData();
      if (data.length === 0) {
        toast.info("Tidak ada data untuk di-export.");
        return;
      }
      const { generatePenjualanPdf } = await import("../../services/pdfExportService");
      await generatePenjualanPdf(data);
      toast.success("Export PDF berhasil!");
    } catch (err) {
      toast.error("Gagal export PDF: " + err.message);
    } finally {
      setIsExporting(false);
    }
  }, [model]);

  return (
    <PenjualanView
      penjualanList={model.penjualanList}
      isLoading={model.isLoading}
      filterTahun={model.filterTahun}
      setFilterTahun={model.setFilterTahun}
      filterProduk={model.filterProduk}
      setFilterProduk={model.setFilterProduk}
      availableTahun={model.availableTahun}
      produkList={produkList}
      onAdd={model.addPenjualan}
      onEdit={model.editPenjualan}
      onDelete={model.removePenjualan}
      onExportExcel={handleExportExcel}
      onExportPdf={handleExportPdf}
      isExporting={isExporting}
    />
  );
}