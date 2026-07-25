// src/features/dashboard/dashboard-view.jsx
import { RefreshCw, Loader2, AlertTriangle, Clock, Upload, FileDown } from "lucide-react";
import { useState } from "react";
import { useApp } from "../../context/AppContext";
import InputDataModal from "../../components/modal/InputDataModal";

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Dec"];
const fmtShort = (d) => `${d.getDate()} ${BULAN[d.getMonth()]}`;

function calcDeadline(lt, iso) { const d = new Date(iso); d.setDate(d.getDate() - lt); return d; }
function daysLeft(lt, iso) { return Math.ceil((calcDeadline(lt, iso) - new Date()) / 864e5); }
function hijriLabel(iso) {
  try { return new Intl.DateTimeFormat("id-ID-u-ca-islamic", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso)); }
  catch { return "Ramadhan 1446 H"; }
}

/* ── EVENT BOOST: otomatis naik saat event tertentu ── */
const EVENT_BOOST = {
  2:  { "Sajadah": 50, "Mukena": 35, "Sarung Bantal": 40 },
  3:  { "Sajadah": 50, "Mukena": 35, "Sarung Bantal": 40 },
  10: { "Sajadah": 30, "Sarung Bantal": 25 },
  11: { "Sajadah": 30, "Sarung Bantal": 25 },
  12: { "Sajadah": 25, "Tasbih": 20 },
};
const EVENT_LABELS = { 2: "Ramadhan", 3: "Ramadhan", 10: "Idul Fitri", 11: "Idul Fitri", 12: "Natal" };

function getEventLabel(month) { return EVENT_LABELS[month] || null; }

function seasonalBoost(nama, targetISO) {
  const month = new Date(targetISO).getMonth() + 1;
  return EVENT_BOOST[month]?.[nama] || 0;
}

/* ── SCORING: urgency + seasonal boost ── */
function urgencyScore(p, targetISO) {
  let s = 0;
  const r = p.rekomendasi;
  if ((r.y_lembur || 0) > 0) s += 10;
  if (r.e_expres_display && r.e_expres_display !== "-") s += 15;
  if ((r.b_backorder || 0) > 0) s += 10;
  if (p.leadTime <= 7) s += 20;
  else if (p.leadTime <= 14) s += 5;
  s += seasonalBoost(p.nama, targetISO);
  return s;
}

function sortProducts(list, targetISO) {
  return [...list].sort((a, b) => {
    const sa = urgencyScore(a, targetISO), sb = urgencyScore(b, targetISO);
    if (sb !== sa) return sb - sa;
    return daysLeft(a.leadTime, targetISO) - daysLeft(b.leadTime, targetISO);
  });
}

/* ── DYNAMIC BADGE berdasarkan alasan naik ── */
function getCardBadge(r, eventLabel) {
  if (r.b_backorder > 0) return { text: "Perlu Perhatian", type: "danger" };
  if (r.e_expres_display && r.e_expres_display !== "-") return { text: "Perlu Perhatian", type: "warning" };
  if (r.y_lembur > 0) return { text: eventLabel ? `Produk Utama ${eventLabel}` : "Prioritas Lembur", type: "primary" };
  return { text: "Prioritas", type: "primary" };
}

const PB = { P10: "#b5d4f4", P50: "#378add", P90: "#0c447c" };

/* ══════════════════════════════════════════════════════
   SKELETON
   ══════════════════════════════════════════════════════ */
const Skel = ({ cls }) => <div className={`animate-pulse bg-gray-100 rounded-xl ${cls}`} />;

function SkeletonView() {
  return (
    <div className="space-y-8">
      <div className="space-y-2"><Skel cls="h-7 w-1/2" /><Skel cls="h-4 w-1/3" /></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <Skel key={i} className="h-28" />)}</div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <Skel cls="h-14 rounded-none" />
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-4 gap-2">{[1, 2, 3, 4].map(i => <Skel key={i} className="h-20" />)}</div>
          <Skel cls="h-16" /><Skel cls="h-10" />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════ */

function RingkasanCard({ label, value, sub, accent }) {
  const m = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    neutral: "bg-gray-50 border-gray-200 text-gray-600",
  };
  const c = m[accent] || m.neutral;
  const vc = c.split(" ").pop();
  return (
    <div className={`border-2 ${c} rounded-2xl p-4 hover:scale-[1.02] transition-transform duration-200 cursor-default`}>
      <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl lg:text-3xl font-bold ${vc}`}>{value}</p>
      <p className="text-[11px] text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function Badge({ children, type }) {
  const m = {
    primary: "bg-blue-50 text-blue-700 border-blue-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    safe: "bg-emerald-50 text-emerald-700 border-emerald-200",
    danger: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border ${m[type] || m.safe}`}>
      {children}
    </span>
  );
}

function DeadlineChip({ leadTime, tISO }) {
  const dl = daysLeft(leadTime, tISO);
  const dd = calcDeadline(leadTime, tISO);
  let color, text;
  if (dl < 0) { color = "text-red-600 bg-red-50"; text = `TERLAMBAT ${Math.abs(dl)} hari`; }
  else if (dl === 0) { color = "text-red-600 bg-red-50"; text = "DEADLINE HARI INI"; }
  else if (dl <= 3) { color = "text-amber-700 bg-amber-50"; text = `${dl} hari lagi`; }
  else if (dl <= 7) { color = "text-amber-600 bg-amber-50"; text = `${dl} hari lagi`; }
  else { color = "text-gray-500 bg-gray-50"; text = fmtShort(dd); }
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${color}`}>
      <Clock size={11} />{text}
    </span>
  );
}

function DecBox({ label, value, varLabel, accent, highlight, subLabel }) {
  const s = {
    blue: { bg: "bg-blue-50", bd: "border-blue-200", l: "text-blue-600", v: "text-blue-800", vr: "text-blue-400" },
    amber: { bg: "bg-amber-50", bd: "border-amber-200", l: "text-amber-600", v: "text-amber-800", vr: "text-amber-400" },
    red: { bg: "bg-red-50", bd: "border-red-200", l: "text-red-600", v: "text-red-800", vr: "text-red-400" },
    neutral: { bg: "bg-gray-50", bd: "border-gray-200", l: "text-gray-500", v: "text-gray-700", vr: "text-gray-400" },
  }[accent] || { bg: "bg-gray-50", bd: "border-gray-200", l: "text-gray-500", v: "text-gray-700", vr: "text-gray-400" };
  return (
    <div className={`${s.bg} ${s.bd} border rounded-xl p-3 text-center ${highlight ? "ring-2 ring-inset ring-current/20" : ""}`}>
      <p className={`${s.l} text-[10px] uppercase tracking-wider font-semibold`}>{label}</p>
      <p className={`${s.v} font-bold text-xl leading-tight mt-0.5`}>{value}</p>
      {subLabel
        ? <p className="text-[10px] text-gray-500 mt-0.5">{subLabel}</p>
        : <p className={`${s.vr} text-[9px]`}>({varLabel})</p>
      }
    </div>
  );
}

function MiniBox({ label, value, varLabel }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
      <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">{label}</p>
      <p className="text-gray-800 font-bold text-xl leading-tight mt-0.5">{value}</p>
      <p className="text-gray-400 text-[9px]">({varLabel})</p>
    </div>
  );
}

function QuoteBlock({ title, body, footer }) {
  return (
    <div className="border-l-4 border-amber-400 bg-amber-50 rounded-r-xl p-4 space-y-1.5">
      {title && <p className="text-[12px] font-bold text-amber-800 uppercase tracking-wider">{title}</p>}
      <p className="text-[13px] text-gray-700 leading-relaxed">{body}</p>
      {footer && <p className="text-[12px] text-gray-500 italic">{footer}</p>}
    </div>
  );
}

function ScenarioBars({ forecast }) {
  const max = Math.max(forecast.P10, forecast.P50, forecast.P90, 1);
  const items = [
    { key: "P10", label: "pesimis", val: forecast.P10, color: PB.P10 },
    { key: "P50", label: "realistis", val: forecast.P50, color: PB.P50 },
    { key: "P90", label: "optimis", val: forecast.P90, color: PB.P90 },
  ];
  return (
    <div className="flex items-start gap-4">
      <div className="w-[20%] shrink-0 pt-1">
        <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold leading-tight">Skenario<br />permintaan</p>
      </div>
      <div className="w-[80%] space-y-2.5">
        {items.map(it => (
          <div key={it.key} className="flex items-center gap-3">
            <span className="text-[11px] text-gray-500 w-28 shrink-0">
              <span className="font-semibold text-gray-700">{it.key}</span> ({it.label})
            </span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(it.val / max) * 100}%`, backgroundColor: it.color }} />
            </div>
            <span className="text-[12px] font-semibold text-gray-700 w-14 text-right">{it.val} unit</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PRODUCT CARDS
   ══════════════════════════════════════════════════════ */

function FullCard({ produk, tISO, eventLabel }) {
  const r = produk.rekomendasi;
  const badge = getCardBadge(r, eventLabel);
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="font-bold text-lg text-gray-800">{produk.nama}</h3>
          <Badge type={badge.type}>{badge.text}</Badge>
          <DeadlineChip leadTime={produk.leadTime} tISO={tISO} />
        </div>
        {produk.estimasiProfit && (
          <span className="text-emerald-700 font-semibold text-[13px]">
            {produk.estimasiProfit} <span className="text-gray-400 font-normal text-[10px]">estimasi</span>
          </span>
        )}
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <DecBox label="Produksi reguler" value={r.x_reguler} varLabel="x_j" accent="blue" />
          <DecBox label="Tambah lembur" value={r.y_lembur} varLabel="y_js" accent="amber" highlight={r.y_lembur > 0} />
          <DecBox label="Pengadaan cepat" value={r.e_expres_display || "-"} varLabel="e_js" accent="red" highlight={r.e_expres_display === "Pertimbangkan"} subLabel={r.e_expres_label} />
          <DecBox label="Backorder diterima" value={r.b_backorder} varLabel="b_js" accent="neutral" highlight={r.b_backorder > 0} />
        </div>
        {produk.quote && <QuoteBlock {...produk.quote} />}
        {produk.forecast && <ScenarioBars forecast={produk.forecast} />}
      </div>
    </div>
  );
}

function HalfCard({ produk, tISO }) {
  const r = produk.rekomendasi;
  const dl = daysLeft(produk.leadTime, tISO);
  const bt = dl <= 3 ? "danger" : dl <= 7 ? "warning" : "safe";
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-2 p-4 border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-2.5">
          <h3 className="font-bold text-[15px] text-gray-800">{produk.nama}</h3>
          <Badge type={bt}>Aman</Badge>
        </div>
        <DeadlineChip leadTime={produk.leadTime} tISO={tISO} />
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <MiniBox label="Reguler" value={r.x_reguler} varLabel="x_j" />
          <MiniBox label="Lembur" value={r.y_lembur} varLabel="y_js" />
        </div>
        {produk.note && <p className="text-[12.5px] text-gray-500 leading-relaxed pl-0.5">{produk.note}</p>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN VIEW
   ══════════════════════════════════════════════════════ */
export default function DashboardView({ isLoading, error, data, onRefresh }) {
  const { targetDate, setTargetDate } = useApp();
  const [inputOpen, setInputOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);

  const handlePdf = async () => {
    try {
      const { generatePdf } = await import("../../components/pdf/ReportDocument");
      await generatePdf(data);
    } catch (err) {
      alert("Gagal generate PDF: " + err.message);
    }
  };

  if (isLoading && !data) return <SkeletonView />;
  if (error && !data) return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4"><AlertTriangle className="text-red-500" size={28} /></div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">Terjadi Kesalahan</h3>
      <p className="text-sm text-gray-500 mb-6 text-center max-w-md">{error}</p>
      <button onClick={onRefresh} className="px-5 py-2.5 bg-gray-900 text-white font-medium text-sm rounded-xl hover:bg-gray-700 transition-colors">Coba Lagi</button>
    </div>
  );
  if (!data) return (
  <div className="flex flex-col items-center justify-center py-24">
    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
      <RefreshCw className="text-blue-500" size={28} />
    </div>
    <h3 className="text-lg font-bold text-gray-800 mb-2">Belum Ada Hasil Optimasi</h3>
    <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
      Bulan ini belum dihitung. Klik tombol di bawah untuk menjalankan optimasi TSSP-PHA.
    </p>
    <button
      onClick={onRefresh}
      className="px-6 py-3 bg-gray-900 text-white font-medium text-sm rounded-xl hover:bg-gray-700 transition-colors"
    >
      Mulai Hitung
    </button>
  </div>
  );
  if (!data.header || !data.produkList) return (
    <div className="py-12 text-center">
      <p className="text-red-400 text-sm">Data diterima tapi format salah</p>
      <pre className="text-[10px] text-gray-400 mt-2 max-w-md mx-auto text-left bg-gray-50 p-3 rounded-lg overflow-auto">{JSON.stringify(data, null, 2).substring(0, 500)}</pre>
    </div>
  );

  /* ── COMPUTED ── */
  const tISO = data.header.targetDate;
  const hLabel = hijriLabel(tISO);
  const gLabel = fmtShort(new Date(tISO));
  const eventLabel = getEventLabel(new Date(tISO).getMonth() + 1);

  const totalReg = data.produkList.reduce((s, p) => s + (p.rekomendasi.x_reguler || 0), 0);
  const jamLembur = data.produkList.reduce((s, p) => s + (p.rekomendasi.y_lembur || 0) * (p.waktuJam || 0), 0);
  const jamReg = data.produkList.reduce((s, p) => s + (p.rekomendasi.x_reguler || 0) * (p.waktuJam || 0), 0);
  const totalKap = data.kapasitas.reguler_maks + data.kapasitas.lembur_maks;
  const utilisasi = Math.round(((jamReg + jamLembur) / totalKap) * 100);

  const sorted = sortProducts(data.produkList, tISO);
  const fullCards = sorted.slice(0, 2);
  const halfCards = sorted.slice(2);
  const sortedPengadaan = [...(data.pengadaan || [])].sort((a, b) => daysLeft(a.leadTime, tISO) - daysLeft(b.leadTime, tISO));
  const refreshing = isLoading;

  return (
    <div className="space-y-8">
      {/* ═══════ HEADER ═══════ */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pb-6 border-b border-gray-200 anim-in">
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 tracking-tight">{data.header.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{data.header.umkm} · {gLabel} ({hLabel})</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-[11px] font-semibold tracking-wide uppercase bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{data.header.meta}</span>
            {eventLabel && (
              <span className="text-[11px] font-semibold tracking-wide bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full">🌙 {eventLabel}</span>
            )}
            <button onClick={() => setMonthOpen(true)} className="text-[11px] font-semibold tracking-wide bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">{gLabel} ▾</button>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button onClick={() => setInputOpen(true)} className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"><Upload size={15} />Input Data</button>
          <button onClick={handlePdf} className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"><FileDown size={15} />PDF</button>
          <button onClick={onRefresh} disabled={refreshing} className="flex items-center gap-1.5 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 disabled:bg-gray-400 transition-colors">{refreshing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}Hitung</button>
        </div>
      </header>

      {/* ═══════ MONTH PICKER POPOVER ═══════ */}
      {monthOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setMonthOpen(false)}>
          <div className="absolute top-32 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-72 modal-anim" onClick={e => e.stopPropagation()}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Pilih Bulan Target</p>
            <div className="grid grid-cols-3 gap-1.5">
              {BULAN.map((b, i) => {
                const d = new Date(tISO);
                return (
                  <button key={b} onClick={() => { setTargetDate(new Date(d.getFullYear(), i, 1)); setMonthOpen(false); }}
                    className={`px-2 py-2 text-xs rounded-lg font-medium transition-colors ${i === d.getMonth() ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                    {b}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ INPUT MODAL ═══════ */}
      <InputDataModal isOpen={inputOpen} onClose={() => setInputOpen(false)} onRun={onRefresh} />

      {/* ═══════ RINGKASAN ═══════ */}
      <section>
        <h2 className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-semibold mb-4 anim-in anim-d1">Ringkasan Bulan Ini</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <RingkasanCard label="Estimasi keuntungan" value={data.estimasiKeuntungan} sub="Expected profit optimal" accent="emerald" />
          <RingkasanCard label="Total produksi reguler" value={`${totalReg} unit`} sub={`dari ${data.produkList.length} jenis produk`} accent="blue" />
          <RingkasanCard label="Jam lembur dibutuhkan" value={`${Math.round(jamLembur)} jam`} sub={`dari maks ${data.kapasitas.lembur_maks} jam/bulan`} accent="amber" />
          <RingkasanCard label="Utilisasi kapasitas" value={`${utilisasi}%`} sub="reguler + lembur" accent={utilisasi > 90 ? "amber" : utilisasi > 70 ? "blue" : "neutral"} />
        </div>
      </section>

      {/* ═══════ KARTU PRODUK ═══════ */}
      <section className="space-y-4">
        <h2 className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-semibold mb-4 anim-in anim-d2">Rencana Produksi Per Produk</h2>
        {fullCards[0] && (<div className="anim-in anim-d2"><FullCard produk={fullCards[0]} tISO={tISO} eventLabel={eventLabel} /></div>)}
        {fullCards[1] && (<div className="anim-in anim-d3"><FullCard produk={fullCards[1]} tISO={tISO} eventLabel={eventLabel} /></div>)}
        {halfCards.length >= 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 anim-in anim-d4">
            <HalfCard produk={halfCards[0]} tISO={tISO} />
            <HalfCard produk={halfCards[1]} tISO={tISO} />
          </div>
        )}
        {halfCards.length >= 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 anim-in anim-d5">
            <HalfCard produk={halfCards[2]} tISO={tISO} />
            <HalfCard produk={halfCards[3]} tISO={tISO} />
          </div>
        )}
      </section>

      {/* ═══════ PENGADAAN ═══════ */}
      <section className="anim-in anim-d5">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-semibold">Jadwal Pengadaan Bahan Baku</h2>
          <p className="text-[12px] text-gray-500">Apa yang harus dipesan dan kapan</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
          {sortedPengadaan.map(item => {
            const dl = daysLeft(item.leadTime, tISO);
            const isUrgent = item.urgent || dl <= 3;
            const isLocal = item.leadTime <= 5;
            let txt;
            if (isLocal) txt = "Tersedia lokal, bisa pesan kapan saja";
            else if (dl < 0) txt = `Pesan sekarang — terlambat ${Math.abs(dl)} hari`;
            else if (dl <= 3) txt = `Pesan sekarang — lead time ${item.leadTime} hari`;
            else txt = `Pesan paling lambat ${fmtShort(calcDeadline(item.leadTime, tISO))}`;
            return (
              <div key={item.material} className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 px-5 py-3.5 ${isUrgent ? "bg-red-50/40" : ""}`}>
                <span className="sm:w-[40%] font-medium text-[13px] text-gray-800 shrink-0">{item.material}</span>
                <span className="sm:w-[20%] shrink-0"><Badge type={isUrgent ? "danger" : "safe"}>{isUrgent ? "Ekspres" : "Reguler"}</Badge></span>
                <span className={`sm:w-[40%] text-[13px] ${isUrgent ? "text-red-600 font-semibold" : "text-gray-500"}`}>{txt}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="text-[12px] text-gray-400 border-t border-gray-200 pt-5 pb-10 leading-relaxed anim-in anim-d6">
        <p>Rekomendasi dihasilkan dari optimasi TSSP-PHA atas 5 skenario permintaan musiman. Angka produksi <span className="text-gray-600 font-semibold">bukan</span> sekadar mengikuti forecast — melainkan solusi yang memaksimalkan expected profit. Kapasitas: <span className="text-gray-600 font-semibold">{data.kapasitas.reguler_maks} jam reguler + {data.kapasitas.lembur_maks} jam lembur</span>.</p>
      </footer>
    </div>
  );
}