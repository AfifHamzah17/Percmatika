// src/hooks/useProvinsiKota.js
// Fetch data provinsi & kota dari API emsifa.com (gratis, no auth)
// Data di-cache di memory supaya tidak fetch ulang saat ganti halaman
import { useState, useEffect, useCallback } from "react";

const API = "https://www.emsifa.com/api-wilayah-indonesia/api";

// Cache di level modul — hidup selama app masih terbuka
let _provinsiCache = null;
const _kotaCache = {};

export function useProvinsiKota() {
  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [isLoadingProvinsi, setIsLoadingProvinsi] = useState(false);
  const [isLoadingKota, setIsLoadingKota] = useState(false);

  // ── Fetch provinsi (cached setelah pertama kali) ──
  const fetchProvinsi = useCallback(async () => {
    if (_provinsiCache) {
      setProvinsiList(_provinsiCache);
      return;
    }
    setIsLoadingProvinsi(true);
    try {
      const res = await fetch(`${API}/provinces.json`);
      const data = await res.json();
      // Bersihkan prefix "PROVINSI " dari nama
      const cleaned = data.map((p) => ({
        id: p.id,
        name: p.name.replace(/^PROVINSI\s+/i, "").trim(),
      }));
      cleaned.sort((a, b) => a.name.localeCompare(b.name));
      _provinsiCache = cleaned;
      setProvinsiList(cleaned);
    } catch (err) {
      console.error("Gagal fetch provinsi:", err);
    } finally {
      setIsLoadingProvinsi(false);
    }
  }, []);

  // ── Fetch kota/kabupaten by provinsi ID (cached per provinsi) ──
  const fetchKota = useCallback(async (provinsiId) => {
    if (!provinsiId) {
      setKotaList([]);
      return [];
    }
    if (_kotaCache[provinsiId]) {
      setKotaList(_kotaCache[provinsiId]);
      return _kotaCache[provinsiId];
    }
    setIsLoadingKota(true);
    try {
      const res = await fetch(`${API}/regencies/${provinsiId}.json`);
      const data = await res.json();
      // Bersihkan prefix "KABUPATEN " / "KOTA "
      const cleaned = data.map((k) => ({
        id: k.id,
        name: k.name.replace(/^(KABUPATEN|KOTA)\s+/i, "").trim(),
      }));
      cleaned.sort((a, b) => a.name.localeCompare(b.name));
      _kotaCache[provinsiId] = cleaned;
      setKotaList(cleaned);
      return cleaned;
    } catch (err) {
      console.error("Gagal fetch kota:", err);
      return [];
    } finally {
      setIsLoadingKota(false);
    }
  }, []);

  // Auto-fetch provinsi saat hook pertama dipakai
  useEffect(() => {
    fetchProvinsi();
  }, [fetchProvinsi]);

  return {
    provinsiList,
    kotaList,
    isLoadingProvinsi,
    isLoadingKota,
    fetchKota,
  };
}