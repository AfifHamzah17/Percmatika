// src/features/produk/produk-model.js
import { useState, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import { saveUserConfig } from "../../services/apiClient";
import { toast } from "react-toastify";

export function useProdukModel() {
  const { umkm, setUmkm, produkList, setProdukList } = useApp();
  const [activeTab, setActiveTab] = useState("daftar");
  const [deleteIdx, setDeleteIdx] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // ── Computed ──────────────────────────────────────────────────
  const totalJam = produkList.reduce((s, p) => s + (p.waktu_jam || 0), 0);
  const kapasitasTersisa = umkm.Cr - totalJam;
  const utilisasiPct = umkm.Cr > 0 ? Math.round((totalJam / umkm.Cr) * 100) : 0;

  // ── UMKM ──────────────────────────────────────────────────────
  const updateUmkm = useCallback((key, val) => {
    setUmkm(prev => ({ ...prev, [key]: key === "nama" ? val : Number(val) || 0 }));
  }, [setUmkm]);

  // ── Produk ────────────────────────────────────────────────────
  const updateProduk = useCallback((idx, key, val) => {
    setProdukList(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: key === "nama" ? val : Number(val) || 0 };
      return next;
    });
  }, [setProdukList]);

  const confirmDelete = useCallback(() => {
    if (deleteIdx === null) return;
    const nama = produkList[deleteIdx]?.nama;
    setProdukList(prev => prev.filter((_, i) => i !== deleteIdx));
    setDeleteIdx(null);
    toast.success(`"${nama}" dihapus`);
  }, [deleteIdx, produkList, setProdukList]);

  const addProduct = useCallback(() => {
    setProdukList(prev => [...prev, {
      nama: `Produk Baru ${prev.length + 1}`,
      harga_jual: 0, biaya_material: 0, biaya_tk: 0, waktu_jam: 1,
      ongkir_ekspres: 0, penalti_backorder: 0, lead_time: 7,
    }]);
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
  const tableRows = produkList.map((p, i) => ({
    ...p,
    _idx: i,
    _marginJam: p.waktu_jam > 0
      ? Math.round((p.harga_jual - p.biaya_material - p.biaya_tk) / p.waktu_jam)
      : 0,
  }));

  return {
    activeTab, setActiveTab,
    deleteIdx, setDeleteIdx,
    isSaving,
    umkm, produkList, tableRows,
    totalJam, kapasitasTersisa, utilisasiPct,
    updateUmkm, updateProduk, confirmDelete, handleSave, addProduct,
  };
}