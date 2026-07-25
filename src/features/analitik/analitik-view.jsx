// src/features/analitik/analitik-view.jsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from "recharts";
import { BarChart3, Info } from "lucide-react";

const fmtRp = (v) => `Rp ${(v / 1e6).toFixed(2)} jt`;

/* ── Shared tooltip ── */
function ChartTip({ active, payload, label, unit = "unit" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm text-xs space-y-0.5">
      <p className="font-semibold text-gray-800">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="flex justify-between gap-6">
          <span>{p.name}</span>
          <span className="font-medium tabular-nums">{p.value} {unit}</span>
        </p>
      ))}
    </div>
  );
}

function JamTip(props) { return <ChartTip {...props} unit="jam" />; }

/* ── Axis defaults ── */
const axisTick = { fontSize: 11, fill: "#9ca3af" };
const gridStroke = "#f3f4f6";

/* ── Metrik card ── */
function MetricCard({ label, value, sub, accent }) {
  const c = {
    blue:   "bg-blue-50 border-blue-200 text-blue-700",
    emerald:"bg-emerald-50 border-emerald-200 text-emerald-700",
    amber:  "bg-amber-50 border-amber-200 text-amber-700",
    gray:   "bg-gray-50 border-gray-200 text-gray-600",
  }[accent] || "bg-gray-50 border-gray-200 text-gray-600";
  const vc = c.split(" ").pop();
  return (
    <div className={`border-2 ${c} rounded-2xl p-4`}>
      <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{label}</p>
      <p className={`text-xl lg:text-2xl font-bold ${vc} mt-1`}>{value}</p>
      <p className="text-[10px] text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

/* ── Profit scale bar (EEV → RP → WS) ── */
function ProfitScale({ eev, rp, ws }) {
  const vss = rp - eev;
  const vpi = ws - rp;
  const total = ws - eev || 1;
  const vssW = Math.max((vss / total) * 100, 0);
  const vpiW = Math.max((vpi / total) * 100, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h2 className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-semibold mb-4">Skala Profit Model</h2>
      <div className="relative mb-6">
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
          <div className="bg-blue-400 h-full transition-all" style={{ width: `${vssW}%` }} />
          <div className="bg-amber-300 h-full transition-all" style={{ width: `${vpiW}%` }} />
        </div>
        {/* Markers */}
        <div className="absolute -top-1 w-1 h-6 bg-gray-800 rounded" style={{ left: 0 }} />
        <div className="absolute -top-1 w-1.5 h-6 bg-blue-600 rounded" style={{ left: `${vssW}%`, transform: "translateX(-50%)" }} />
        <div className="absolute -top-1 w-1 h-6 bg-gray-800 rounded" style={{ right: 0 }} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">EEV (Deterministik)</p>
          <p className="text-sm font-bold text-gray-700 mt-0.5">{fmtRp(eev)}</p>
        </div>
        <div>
          <p className="text-[10px] text-blue-600 uppercase tracking-wider font-bold">RP (Solusi Ini)</p>
          <p className="text-sm font-bold text-blue-700 mt-0.5">{fmtRp(rp)}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">WS (Info Sempurna)</p>
          <p className="text-sm font-bold text-gray-700 mt-0.5">{fmtRp(ws)}</p>
        </div>
      </div>
      <div className="flex justify-center gap-6 mt-4 text-[11px]">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-400 rounded" />VSS: {fmtRp(vss)}</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-300 rounded" />VPI: {fmtRp(vpi)}</span>
      </div>
    </div>
  );
}

/* ── Info card ── */
function InfoCard({ title, body }) {
  return (
    <div className="border-l-4 border-blue-400 bg-blue-50/50 rounded-r-xl p-4">
      <p className="text-xs font-bold text-blue-800 mb-1">{title}</p>
      <p className="text-[12px] text-gray-600 leading-relaxed">{body}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN VIEW
   ══════════════════════════════════════════════ */
export default function AnalitikView({ data, onGoToDashboard }) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <BarChart3 className="text-blue-500" size={28} />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Belum Ada Data Analitik</h3>
        <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
          Jalankan optimasi di Dashboard terlebih dahulu untuk melihat analisis mendalam.
        </p>
        <button onClick={onGoToDashboard} className="px-6 py-3 bg-gray-900 text-white font-medium text-sm rounded-xl hover:bg-gray-700 transition-colors">
          Buka Dashboard
        </button>
      </div>
    );
  }

  const { metrics, forecastVsProduksi, marginPerJam, kapasitasBreakdown, tableData, kapasitas } = data;

  // Warna bar margin (gradient biru ke ungu berdasarkan ranking)
  const marginColors = ["#1e40af", "#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Analitik</h1>
        <p className="text-sm text-gray-500 mt-0.5">Analisis mendalam hasil optimasi TSSP-PHA</p>
      </div>

      {/* ── Metrik Kunci ── */}
      <section>
        <h2 className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-semibold mb-4">Metrik Kunci</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <MetricCard label="VSS" value={fmtRp(metrics.vss)} sub="Nilai tambah stochastic vs deterministik" accent="blue" />
          <MetricCard label="VPI" value={fmtRp(metrics.vpi)} sub="Potensi tambahan jika info sempurna" accent="amber" />
          <MetricCard label="Profit (RP)" value={fmtRp(metrics.rp)} sub="Expected profit solusi optimal" accent="emerald" />
          <MetricCard label="Profit (EEV)" value={fmtRp(metrics.eev)} sub="Benchmark model deterministik" accent="gray" />
        </div>
      </section>

      {/* ── Profit Scale ── */}
      <ProfitScale eev={metrics.eev} rp={metrics.rp} ws={metrics.ws} />

      {/* ── Forecast vs Produksi ── */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-semibold">Forecast vs Produksi</h2>
          <p className="text-[12px] text-gray-500">P10/P50/P90 dibandingkan keputusan optimizer</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={forecastVsProduksi} barGap={2} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="nama" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="P10" fill="#93c5fd" radius={[2, 2, 0, 0]} name="P10 (pesimis)" />
              <Bar dataKey="P50" fill="#3b82f6" radius={[2, 2, 0, 0]} name="P50 (realistis)" />
              <Bar dataKey="P90" fill="#1e3a5f" radius={[2, 2, 0, 0]} name="P90 (optimis)" />
              <Bar dataKey="produksi" fill="#10b981" radius={[2, 2, 0, 0]} name="Produksi total" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── Margin per Jam ── */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-semibold">Prioritas Optimasi: Margin per Jam</h2>
          <p className="text-[12px] text-gray-500">Mengapa optimizer memprioritaskan produk tertentu</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <ResponsiveContainer width="100%" height={40 * marginPerJam.length + 40}>
            <BarChart data={marginPerJam} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
              <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}rb`} />
              <YAxis type="category" dataKey="nama" tick={axisTick} axisLine={false} tickLine={false} width={110} />
              <Tooltip content={<ChartTip unit="Rp/jam" />} />
              <Bar dataKey="margin" radius={[0, 4, 4, 0]} name="Margin/jam">
                {marginPerJam.map((_, i) => (
                  <Cell key={i} fill={marginColors[i % marginColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── Kapasitas Breakdown ── */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-semibold">Alokasi Kapasitas</h2>
          <p className="text-[12px] text-gray-500">
            Terpakai {kapasitas.totalJamReg + kapasitas.totalJamLem} jam dari {kapasitas.regulerMaks + kapasitas.lemburMaks} jam
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={kapasitasBreakdown} barGap={0} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="nama" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} />
              <Tooltip content={<JamTip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="reguler" stackId="kap" fill="#3b82f6" radius={[0, 0, 0, 0]} name="Jam reguler" />
              <Bar dataKey="lembur"  stackId="kap" fill="#f59e0b" radius={[2, 2, 0, 0]} name="Jam lembur" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── Tabel Detail ── */}
      <section>
        <h2 className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-semibold mb-4">Detail Per Produk</h2>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["#", "Produk", "Forecast P50", "Produksi", "Lembur", "Backorder", "Ekspres", "Jam", "Margin/jam", "Est. Profit"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((r, i) => (
                  <tr key={r.nama} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{r.nama}</td>
                    <td className="px-4 py-3 text-gray-600 text-right">{r.forecastP50}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium text-right">{r.produksi}</td>
                    <td className="px-4 py-3 text-right text-amber-700">{r.lembur || "-"}</td>
                    <td className="px-4 py-3 text-right text-red-600">{r.backorder || "-"}</td>
                    <td className="px-4 py-3 text-right">{r.ekspres}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{r.jamTerpakai}</td>
                    <td className="px-4 py-3 text-right text-gray-600">Rp {r.marginJam.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-emerald-700 font-medium whitespace-nowrap">{r.estimasiProfit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Penjelasan Metrik ── */}
      <section>
        <h2 className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-semibold mb-4 flex items-center gap-2"><Info size={14} /> Tentang Metrik Ini</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard
            title="VSS (Value of Stochastic Solution)"
            body="Selisih profit antara solusi stochastic (RP) dan model deterministik (EEV). Semakin besar VSS, semakin berharga pendekatan stochastic untuk menangani ketidakpastian demand."
          />
          <InfoCard
            title="VPI (Value of Perfect Information)"
            body="Selisih antara solusi dengan informasi sempurna (WS) dan solusi stochastic (RP). VPI kecil berarti model sudah menangkap sebagian besar nilai ekonomis tanpa perlu prediksi sempurna."
          />
          <InfoCard
            title="BIB (Bayesian Improvement)"
            body="Peningkatan profit dari dynamic Bayesian-LSTM weighting dibandingkan fixed-weight stochastic planning (Afnaria et al., 2025). Memerlukan data baseline SP untuk dihitung — segera hadir."
          />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="text-[12px] text-gray-400 border-t border-gray-200 pt-5 pb-10 leading-relaxed">
        <p>Metrik VSS, VPI, dan BIB mengikuti framework evaluasi标准的 Two-Stage Stochastic Programming (Birge & Louveaux, 2011). Analitik ini merepresentasikan hasil untuk satu periode perencanaan. Rolling horizon analysis across 12 periode akan tersedia di pembaruan mendatang.</p>
      </footer>
    </div>
  );
}