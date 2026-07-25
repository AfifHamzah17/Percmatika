// src/features/analitik/analitik-model.js
import { useMemo } from "react";
import { useApp } from "../../context/AppContext";

export function useAnalitikModel() {
  const { dashboardData } = useApp();

  return useMemo(() => {
    if (!dashboardData?._meta || !dashboardData.produkList?.length) {
      return { data: null };
    }

    const meta = dashboardData._meta;
    const produkList = dashboardData.produkList;
    const kap = dashboardData.kapasitas || {};

    // ── VSS / VPI / EEV / WS (dari Section 3.6 paper) ──
    const rp  = meta.profitRp || 0;
    const eev = meta.profitEev || 0;
    const vss = meta.vss ?? (rp - eev);
    const vpi = meta.vpi || 0;
    const ws  = rp + vpi;

    // ── Chart: Forecast vs Produksi ──
    const forecastVsProduksi = produkList.map(p => {
      const r = p.rekomendasi || {};
      return {
        nama: p.nama,
        P10: p.forecast?.P10 || 0,
        P50: p.forecast?.P50 || 0,
        P90: p.forecast?.P90 || 0,
        produksi: (r.x_reguler || 0) + (r.y_lembur || 0),
      };
    });

    // ── Chart: Margin/jam sorted desc ──
    const marginPerJam = [...produkList]
      .map(p => ({ nama: p.nama, margin: p.marginJam || 0 }))
      .sort((a, b) => b.margin - a.margin);

    // ── Chart: Kapasitas breakdown per produk ──
    const kapasitasBreakdown = produkList.map(p => {
      const r = p.rekomendasi || {};
      const w = p.waktuJam || 0;
      return {
        nama: p.nama,
        reguler: Math.round((r.x_reguler || 0) * w * 10) / 10,
        lembur:  Math.round((r.y_lembur  || 0) * w * 10) / 10,
      };
    });

    // ── Tabel detail ──
    const tableData = produkList.map(p => {
      const r = p.rekomendasi || {};
      const total = (r.x_reguler || 0) + (r.y_lembur || 0);
      return {
        nama: p.nama,
        forecastP50: p.forecast?.P50 || 0,
        produksi: total,
        lembur: r.y_lembur || 0,
        backorder: r.b_backorder || 0,
        ekspres: r.e_expres_display === "Pertimbangkan" ? "Ya" : "Tidak",
        jamTerpakai: Math.round(total * (p.waktuJam || 0) * 10) / 10,
        marginJam: p.marginJam || 0,
        estimasiProfit: p.estimasiProfit || "-",
      };
    });

    const totalJamReg = kapasitasBreakdown.reduce((s, p) => s + p.reguler, 0);
    const totalJamLem = kapasitasBreakdown.reduce((s, p) => s + p.lembur, 0);

    return {
      data: {
        metrics: { rp, eev, vss, vpi, ws },
        forecastVsProduksi,
        marginPerJam,
        kapasitasBreakdown,
        tableData,
        kapasitas: {
          totalJamReg: Math.round(totalJamReg * 10) / 10,
          totalJamLem: Math.round(totalJamLem * 10) / 10,
          regulerMaks: kap.reguler_maks || 0,
          lemburMaks:  kap.lembur_maks  || 0,
        },
      },
    };
  }, [dashboardData]);
}