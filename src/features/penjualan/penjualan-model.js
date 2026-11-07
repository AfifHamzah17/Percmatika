// src/features/penjualan/penjualan-model.js
import { useState, useEffect, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import {
  getPenjualan,
  createPenjualan,
  updatePenjualan,
  deletePenjualan as apiDeletePenjualan,
  getPenjualanExport,
} from "../../services/apiClient";
import { toast } from "react-toastify";

const BULAN_LABEL = [
  "",
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export { BULAN_LABEL };

export function usePenjualanModel() {
  const { produkList } = useApp();
  const [penjualanList, setPenjualanList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear());
  const [filterProduk, setFilterProduk] = useState("");

  // ── Fetch penjualan ──
  const fetchPenjualan = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filterTahun) params.tahun = filterTahun;
      if (filterProduk) params.produk_nama = filterProduk;
      const data = await getPenjualan(params);
      setPenjualanList(data.penjualan || []);
    } catch (err) {
      toast.error("Gagal memuat data penjualan: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filterTahun, filterProduk]);

  useEffect(() => {
    fetchPenjualan();
  }, [fetchPenjualan]);

  // ── Tambah penjualan ──
  const addPenjualan = useCallback(
    async (record) => {
      try {
        const data = await createPenjualan(record);
        toast.success("Data penjualan ditambahkan");
        fetchPenjualan();
        return data.penjualan;
      } catch (err) {
        toast.error("Gagal menambah: " + err.message);
        throw err;
      }
    },
    [fetchPenjualan]
  );

  // ── Update penjualan ──
  const editPenjualan = useCallback(
    async (docId, record) => {
      try {
        await updatePenjualan(docId, record);
        toast.success("Data penjualan diperbarui");
        fetchPenjualan();
      } catch (err) {
        toast.error("Gagal mengupdate: " + err.message);
        throw err;
      }
    },
    [fetchPenjualan]
  );

  // ── Hapus penjualan ──
  const removePenjualan = useCallback(
    async (docId) => {
      try {
        await apiDeletePenjualan(docId);
        toast.success("Data penjualan dihapus");
        fetchPenjualan();
      } catch (err) {
        toast.error("Gagal menghapus: " + err.message);
        throw err;
      }
    },
    [fetchPenjualan]
  );

  // ── Export data (semua, tanpa filter) ──
  const fetchExportData = useCallback(async () => {
    try {
      const data = await getPenjualanExport();
      return data.penjualan || [];
    } catch (err) {
      toast.error("Gagal mengambil data export: " + err.message);
      return [];
    }
  }, []);

  // ── Tersedia tahun-tahun apa saja di data? ──
  const availableTahun = [...new Set(penjualanList.map((p) => p.tahun))].sort(
    (a, b) => b - a
  );

  return {
    penjualanList,
    isLoading,
    filterTahun,
    setFilterTahun,
    filterProduk,
    setFilterProduk,
    availableTahun,
    addPenjualan,
    editPenjualan,
    removePenjualan,
    fetchPenjualan,
    fetchExportData,
  };
}