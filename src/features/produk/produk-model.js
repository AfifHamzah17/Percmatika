// src/features/produk/produk-model.js
import { useState, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import { saveUserConfig } from "../../services/apiClient";
import { toast } from "react-toastify";

// Default produk sesuai field baru (waktu_hari, bukan waktu_jam)
const EMPTY_PRODUK = (nama) => ({
  nama: nama || `Produk Baru`,
  harga_jual: 0,
  biaya_material: 0,
  biaya_tk: 0,
  biaya_lembur: 0,
  ongkir_ekspres: 0,
  ongkir_reguler: 0,
  waktu_hari: 1,
  // Tersembunyi dari UI — default untuk backend/TSSP
  penalti_backorder: 10000,
  lead_time: 7,
});

export { EMPTY_PRODUK };

export function useProdukModel() {
  const { umkm, setUmkm, produkList, setProdukList } = useApp();
  const [activeTab, setActiveTab] = useState("daftar");
  const [deleteIdx, setDeleteIdx] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // ── Computed ──────────────────────────────────────────────────
  // waktu_hari → waktu_jam untuk kalkulasi utilisasi (1 hari = 24 jam)
  const totalJam = produkList.reduce(
    (s, p) => s + (p.waktu_hari || 1) * 24,
    0
  );
  const kapasitasTersisa = umkm.Cr - totalJam;
  const utilisasiPct = umkm.Cr > 0 ? Math.round((totalJam / umkm.Cr) * 100) : 0;

  // ── UMKM ──────────────────────────────────────────────────────
  const updateUmkm = useCallback(
    (key, val) => {
      setUmkm((prev) => ({
        ...prev,
        [key]: key === "nama" ? val : Number(val) || 0,
      }));
    },
    [setUmkm]
  );

  // ── Produk ────────────────────────────────────────────────────
  const updateProduk = useCallback(
    (idx, key, val) => {
      setProdukList((prev) => {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          [key]: key === "nama" ? val : Number(val) || 0,
        };
        return next;
      });
    },
    [setProdukList]
  );

  const confirmDelete = useCallback(() => {
    if (deleteIdx === null) return;
    const nama = produkList[deleteIdx]?.nama;
    setProdukList((prev) => prev.filter((_, i) => i !== deleteIdx));
    setDeleteIdx(null);
    toast.success(`"${nama}" dihapus`);
  }, [deleteIdx, produkList, setProdukList]);

  const addProduct = useCallback(() => {
    setProdukList((prev) => [...prev, EMPTY_PRODUK()]);
  }, [setProdukList]);

  // ── Save ke backend ───────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await saveUserConfig(produkList, umkm);
      toast.success("Data tersimpan ke server");
    } catch (err) {
      toast.error("Gagal menyimpan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  }, [produkList, umkm]);

  // ── Tabel helper ──────────────────────────────────────────────
  const tableRows = produkList.map((p, i) => {
    const waktuJam = (p.waktu_hari || 1) * 24;
    const totalBiaya = (p.biaya_material || 0) + (p.biaya_tk || 0) + (p.biaya_lembur || 0);
    const margin = (p.harga_jual || 0) - totalBiaya;
    const marginJam = waktuJam > 0 ? Math.round(margin / waktuJam) : 0;
    return {
      ...p,
      _idx: i,
      _waktuJam: waktuJam,
      _totalBiaya: totalBiaya,
      _margin: margin,
      _marginJam: marginJam,
    };
  });

  return {
    activeTab,
    setActiveTab,
    deleteIdx,
    setDeleteIdx,
    isSaving,
    umkm,
    produkList,
    tableRows,
    totalJam,
    kapasitasTersisa,
    utilisasiPct,
    updateUmkm,
    updateProduk,
    confirmDelete,
    handleSave,
    addProduct,
  };
}