/**
 * Dashboard Model — transformasi raw API response → state yang dipakai DashboardView.
 *
 * Mapping field dari tssp_engine.py (FIX B):
 *   item.Rekomendasi.x_reguler          → rekomendasi.x_reguler
 *   item.Rekomendasi.y_lembur_max       → rekomendasi.y_lembur
 *   item.Rekomendasi.e_ekspres_label    → rekomendasi.e_expres_display / e_expres_label
 *   item.Rekomendasi.b_backorder_max    → rekomendasi.b_backorder
 *   item.waktu_jam                      → waktuJam
 *   item.Margin_Per_Jam                 → marginJam
 *   item.Forecast.P10/P50/P90          → forecast
 *   item.Lead_Time_Hari                 → leadTime
 *   item.Logika_Optimasi               → quote.body / note
 */

import { useState, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { useApp } from "../../context/AppContext";

// ── Helper: ekstrak "YYYY-MM" dari objek data ─────────────────────
function _getDataMonth(d) {
  if (!d?.header?.targetDate) return null;
  const dt = new Date(d.header.targetDate);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}

// ── Material name fallback (untuk jadwal pengadaan) ────────────────
const MATERIAL_MAP = {
  Sajadah: "Kain motif sajadah",
  Selimut: "Batting/dakron quilting",
  "Selimut Quilting": "Batting/dakron quilting",
  Totebag: "Kain kanvas totebag",
  Pouch: "Kain pouch (standar)",
  "Sarung Bantal": "Kain sarung bantal",
  "Taplak Meja": "Kain taplak meja",
};
const getMaterial = (nama) =>
  MATERIAL_MAP[nama] ?? `Bahan ${nama.toLowerCase()}`;

// ── Map e_ekspres_label → nilai yang dipakai DashboardView ─────────
function mapEkspresDisplay(ekLabel) {
  if (!ekLabel || ekLabel === "Tidak") return "-";
  return "Pertimbangkan";
}

// ── MOCK DATA — ditampilkan saat API belum tersedia ────────────────
const MOCK_DATA = {
  header: {
    title: "PercaMatika — Rencana Produksi Optimal",
    umkm: "Bu Aminah, Medan",
    meta: "TSSP-PHA · Data contoh · 5 skenario musiman",
    targetDate: new Date().toISOString(),
  },
  estimasiKeuntungan: "Rp 2.7 jt",
  kapasitas: { reguler_maks: 1040, lembur_maks: 200 },
  produkList: [
    {
      nama: "Sarung Bantal",
      waktuJam: 3.2,
      marginJam: 78750,
      leadTime: 14,
      estimasiProfit: "Rp 0.59 jt",
      forecast: { P10: 5, P50: 9, P90: 14 },
      rekomendasi: {
        x_reguler: 7,
        y_lembur: 2,
        e_expres_display: "-",
        e_expres_label: "Tidak",
        b_backorder: 1,
      },
      quote: {
        title: "Mengapa ada lembur?",
        body: "Sarung Bantal memiliki margin tertinggi per jam (Rp 78.750). Model memprioritaskan kapasitas lembur ke produk ini.",
      },
    },
    {
      nama: "Sajadah",
      waktuJam: 19.2,
      marginJam: 3750,
      leadTime: 10,
      estimasiProfit: "Rp 0.09 jt",
      forecast: { P10: 5, P50: 8, P90: 12 },
      rekomendasi: {
        x_reguler: 7,
        y_lembur: 0,
        e_expres_display: "Pertimbangkan",
        e_expres_label: "1 unit(P50)/3 unit(peak)",
        b_backorder: 2,
      },
      quote: {
        title: "Pengadaan cepat tersedia",
        body: "Demand sajadah meningkat saat Ramadhan. Pengadaan ekspres diaktifkan untuk skenario peak.",
      },
    },
    {
      nama: "Totebag",
      waktuJam: 19.2,
      marginJam: 7500,
      leadTime: 2,
      estimasiProfit: "Rp 0.26 jt",
      forecast: { P10: 5, P50: 8, P90: 11 },
      rekomendasi: {
        x_reguler: 6,
        y_lembur: 0,
        e_expres_display: "-",
        e_expres_label: "Tidak",
        b_backorder: 2,
      },
      note: "Demand P50:8. Reguler 6 mencukupi. Lead time 2 hari — bisa pesan mendekati tanggal produksi.",
    },
    {
      nama: "Taplak Meja",
      waktuJam: 12.8,
      marginJam: 4500,
      leadTime: 30,
      estimasiProfit: "Rp 0.27 jt",
      forecast: { P10: 6, P50: 9, P90: 10 },
      rekomendasi: {
        x_reguler: 7,
        y_lembur: 0,
        e_expres_display: "-",
        e_expres_label: "Tidak",
        b_backorder: 0,
      },
      note: "Lead time 30 hari — harus pesan bahan paling awal. Reguler 7 mencukupi.",
    },
    {
      nama: "Pouch",
      waktuJam: 6.4,
      marginJam: 28125,
      leadTime: 4,
      estimasiProfit: "Rp 0.19 jt",
      forecast: { P10: 3, P50: 7, P90: 12 },
      rekomendasi: {
        x_reguler: 7,
        y_lembur: 2,
        e_expres_display: "-",
        e_expres_label: "Tidak",
        b_backorder: 0,
      },
      note: "Demand P50:7. Reg7+Lem2 mencukupi. Margin/jam Rp28.125 ≥ median.",
    },
    {
      nama: "Selimut",
      waktuJam: 44.8,
      marginJam: 8035,
      leadTime: 7,
      estimasiProfit: "Rp 0.60 jt",
      forecast: { P10: 5, P50: 6, P90: 8 },
      rekomendasi: {
        x_reguler: 5,
        y_lembur: 0,
        e_expres_display: "-",
        e_expres_label: "Tidak",
        b_backorder: 1,
      },
      note: "Demand P50:6. Reguler 5 mencukupi. Margin/jam Rp8.035 ≥ median.",
    },
  ],
  pengadaan: [
    { material: "Kain taplak meja", leadTime: 30, urgent: false },
    { material: "Kain motif sajadah", leadTime: 14, urgent: false },
    { material: "Kain motif sajadah", leadTime: 10, urgent: false },
    { material: "Batting/dakron quilting", leadTime: 7, urgent: false },
    { material: "Kain pouch (standar)", leadTime: 4, urgent: false },
    { material: "Kain kanvas totebag", leadTime: 2, urgent: false },
  ],
};

// ── TRANSFORM: raw API response → shape yang dipakai DashboardView ──
export function transformApiResponse(raw, targetISO) {
  if (!raw || !raw.tssp || !raw.tssp.alokasi_produk) return null;

  const tssp = raw.tssp;
  const vssVpi = raw.vss_vpi ?? {};
  const kap = tssp.kapasitas ?? {};
  const jadwal = raw.jadwal_pengadaan ?? [];
  const tp = tssp.expected_profit ?? 0;

  let totalWeight = 0;
  const weights = tssp.alokasi_produk.map((item) => {
    const rek = item.Rekomendasi ?? {};
    const w = (rek.x_reguler ?? 0) * (item.Margin_Per_Jam ?? 0);
    totalWeight += w;
    return w;
  });

  const produkList = tssp.alokasi_produk.map((item, i) => {
    const rek = item.Rekomendasi ?? {};
    const logika = item.Logika_Optimasi ?? "";
    const isUrgent =
      (rek.y_lembur_max ?? 0) > 0 ||
      (rek.b_backorder_max ?? 0) > 0 ||
      (rek.e_ekspres_label && rek.e_ekspres_label !== "Tidak");

    const profitShare =
      totalWeight > 0 ? (weights[i] / totalWeight) * tp : 0;

    const eDisplay = mapEkspresDisplay(rek.e_ekspres_label);
    const eLabel = rek.e_ekspres_label ?? "Tidak";

    return {
      nama: item.Produk,
      waktuJam: item.waktu_jam ?? 1.0,
      marginJam: item.Margin_Per_Jam ?? 0,
      leadTime: item.Lead_Time_Hari ?? 7,
      estimasiProfit: `Rp ${(profitShare / 1e6).toFixed(2)} jt`,
      forecast: item.Forecast ?? { P10: 0, P50: 0, P90: 0 },
      rekomendasi: {
        x_reguler: rek.x_reguler ?? 0,
        y_lembur: rek.y_lembur_max ?? 0,
        e_expres_display: eDisplay,
        e_expres_label: eLabel,
        b_backorder: rek.b_backorder_max ?? 0,
      },
      ...(isUrgent
        ? {
            quote: {
              title:
                (rek.b_backorder_max ?? 0) > 0
                  ? `Mengapa hanya ${(rek.x_reguler ?? 0) + (rek.y_lembur_max ?? 0)} unit?`
                  : "Yang perlu dilakukan",
              body: logika,
            },
          }
        : { note: logika }),
      _mat: getMaterial(item.Produk),
    };
  });

  const pengadaan = jadwal
    .map((j) => ({
      material: getMaterial(j.produk),
      leadTime: j.lead_time_hari ?? 7,
      urgent: (j.lead_time_hari ?? 7) <= 3,
    }))
    .sort((a, b) => b.leadTime - a.leadTime);

  const usedISO = targetISO ?? new Date().toISOString();
  const event = raw.event ?? "normal";
  const eventMap = {
    ramadhan: "Ramadhan",
    pra_ramadhan: "Pra-Ramadhan",
    syawal: "Syawal",
    dzulhijjah: "Idul Adha",
    natal: "Natal",
    tahun_ajaran: "Tahun Ajaran",
  };

  return {
    header: {
      title: "PercaMatika — Rencana Produksi Optimal",
      umkm: raw.umkm_nama ?? "PercaMatika UMKM",
      meta: `TSSP-PHA · Optimasi berhasil · ${produkList.length} produk · ${eventMap[event] ?? "Normal"}`,
      targetDate: usedISO,
    },
    estimasiKeuntungan: `Rp ${(tp / 1e6).toFixed(2)} jt`,
    kapasitas: {
      reguler_maks: kap.reguler_maks ?? 1040,
      lembur_maks: kap.lembur_maks ?? 200,
    },
    produkList,
    pengadaan,
    _meta: {
      vss: vssVpi.vss ?? 0,
      vpi: vssVpi.vpi ?? 0,
      profitRp: vssVpi.profit_rp ?? tp,
      profitEev: vssVpi.profit_eev ?? 0,
      utilisasi: kap.utilisasi_pct ?? 0,
    },
  };
}

// ── useDashboardModel ──────────────────────────────────────────────
export function useDashboardModel() {
  const {
    targetDate,
    umkm,
    produkList,
    dashboardData,
    setDashboardData,
  } = useApp();

  const _initBulan = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}`;
  const [data, setData] = useState(() =>
    _getDataMonth(dashboardData) === _initBulan ? dashboardData : null
  );
  const [isCheckingCache, setIsCheckingCache] = useState(false);
  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  // ── BARU: Data status untuk gate "Mulai Hitung" ──
  const [dataStatus, setDataStatus] = useState(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const _bulanTarget = () =>
    `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}`;

  const _applyResult = (raw) => {
    const transformed = transformApiResponse(raw, targetDate.toISOString());
    if (transformed) {
      transformed.header.umkm = umkm.nama;
      setData(transformed);
      setDashboardData(transformed);
    }
    return transformed;
  };

  // ── BARU: Cek data status (produk & penjualan) ──
  const fetchDataStatus = useCallback(async () => {
    setIsCheckingStatus(true);
    try {
      const { getDataStatus } = await import("../../services/apiClient");
      const status = await getDataStatus();
      setDataStatus(status);
    } catch {
      // Jika gagal (misal token expired), tetap biarkan null —
      // tombol hitung akan disabled tapi tidak error
      setDataStatus(null);
    } finally {
      setIsCheckingStatus(false);
    }
  }, []);

  // ── Cek cache SAJA — tanpa auto-hitung ──────────────────────────
  const checkCacheOnly = useCallback(async () => {
    const bulan = _bulanTarget();
    if (_getDataMonth(dataRef.current) === bulan) return;

    setIsCheckingCache(true);
    setError(null);

    try {
      const { fetchCachedResult } = await import("../../services/apiClient");
      const cached = await fetchCachedResult(bulan);
      _applyResult(cached);
    } catch {
      setData(null);
    } finally {
      setIsCheckingCache(false);
    }
  }, [targetDate, umkm.nama]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Hitung ulang — HANYA dipanggil saat user klik tombol ────────
  const runOptimization = async () => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setIsComputing(true);
    setError(null);
    const bulanTarget = _bulanTarget();

    try {
      const { runHitung } = await import("../../services/apiClient");
      const raw = await runHitung(bulanTarget, produkList, umkm);
      if (ctrl.signal.aborted) return;

      const transformed = _applyResult(raw);
      if (transformed) {
        toast.success(
          `Optimasi selesai! Expected profit: ${transformed.estimasiKeuntungan}`,
          { position: "top-right" }
        );
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      console.warn(
        "[Dashboard] API error, tampilkan mock data:",
        err.message
      );
      const mock = {
        ...MOCK_DATA,
        header: {
          ...MOCK_DATA.header,
          targetDate: targetDate.toISOString(),
          umkm: umkm.nama,
        },
      };
      setData(mock);
      setDashboardData(mock);
      toast.info("Data contoh ditampilkan (API belum tersedia)", {
        position: "top-right",
      });
    } finally {
      if (!ctrl.signal.aborted) setIsComputing(false);
    }
  };

  return {
    data,
    isCheckingCache,
    isComputing,
    isLoading: isCheckingCache || isComputing || isCheckingStatus,
    error,
    runOptimization,
    checkCacheOnly,
    // BARU
    dataStatus,
    fetchDataStatus,
  };
}