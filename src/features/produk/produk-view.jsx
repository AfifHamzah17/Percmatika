// src/features/produk/produk-view.jsx
import { useState } from "react";
import { Upload, Save, Trash2, Package, Settings, Clock, Zap, ChevronDown, ChevronRight, Plus } from "lucide-react";

/* ── Shared ── */
const ic = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
const lb = "text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5 block";

function SummaryCard({ icon: Icon, label, value, sub, accent }) {
  const colors = { blue: "bg-blue-50 border-blue-200 text-blue-700", amber: "bg-amber-50 border-amber-200 text-amber-700" };
  const c = colors[accent] || colors.blue;
  const vc = c.split(" ").pop();
  return (
    <div className={`border-2 ${c} rounded-2xl p-4`}>
      <div className="flex items-center gap-2 mb-1"><Icon size={14} className={vc} /><p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{label}</p></div>
      <p className={`text-2xl font-bold ${vc}`}>{value}</p>
      <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

/* ── Edit: field atom (otomatis format ribuan untuk Rp) ── */
function Field({ label, value, isCurrency = false, onChange }) {
  // Tampilkan format ribuan titik (id-ID) kalau isCurrency
  const displayVal = isCurrency
    ? Number(value || 0).toLocaleString("id-ID")
    : value;

  const handleChange = (e) => {
    // Kalau currency, hapus titik pemisah ribuan sebelum simpan ke state
    const raw = isCurrency ? e.target.value.replace(/\./g, "") : e.target.value;
    onChange(raw);
  };

  return (
    <div>
      <label className="text-[10px] text-gray-500 block mb-1">{label}</label>
      <input
        type="text"
        inputMode={isCurrency ? "numeric" : "decimal"}
        className="w-full px-2.5 py-2 text-sm border border-gray-200 rounded-lg text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
        value={displayVal}
        onChange={handleChange}
      />
    </div>
  );
}

/* ── Edit: product accordion card ── */
function ProductCard({ p, idx, isExpanded, onToggle, onDelete, onUpdate }) {
  const marginJam = p.waktu_jam > 0 ? Math.round((p.harga_jual - p.biaya_material - p.biaya_tk) / p.waktu_jam) : 0;

  return (
    <div className={`border rounded-xl overflow-hidden transition-colors duration-150 ${isExpanded ? "border-blue-200 bg-blue-50/20" : "border-gray-200 hover:border-gray-300"}`}>
      {/* ── Collapsed header ── */}
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3 text-left group">
        {isExpanded
          ? <ChevronDown size={15} className="text-gray-400 shrink-0" />
          : <ChevronRight size={15} className="text-gray-400 shrink-0" />}
        <span className="text-sm font-semibold text-gray-800">{idx + 1}. {p.nama}</span>
        <span className="text-[11px] text-gray-400 ml-auto hidden sm:inline">
          Rp {Number(p.harga_jual).toLocaleString("id-ID")} · {p.waktu_jam} jam · Rp {marginJam.toLocaleString("id-ID")}/jam
        </span>
        <span
          onClick={e => { e.stopPropagation(); onDelete(idx); }}
          className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
        >
          <Trash2 size={13} />
        </span>
      </button>

      {/* ── Expanded body ── */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-4">
          {/* Nama produk */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1 block">Nama Produk</label>
            <input
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              value={p.nama} onChange={e => onUpdate(idx, "nama", e.target.value)}
            />
          </div>

          {/* Biaya Produksi */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Biaya Produksi</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Field label="Harga Jual (Rp)" value={p.harga_jual} isCurrency onChange={v => onUpdate(idx, "harga_jual", v)} />
              <Field label="Biaya Material (Rp)" value={p.biaya_material} isCurrency onChange={v => onUpdate(idx, "biaya_material", v)} />
              <Field label="Biaya TK Reg (Rp)" value={p.biaya_tk} isCurrency onChange={v => onUpdate(idx, "biaya_tk", v)} />
              <Field label="Waktu (jam)" value={p.waktu_jam} onChange={v => onUpdate(idx, "waktu_jam", v)} />
            </div>
          </div>

          {/* Logistik & Penalti */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Logistik & Penalti</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Field label="Ongkir Ekspres (Rp)" value={p.ongkir_ekspres} isCurrency onChange={v => onUpdate(idx, "ongkir_ekspres", v)} />
              <Field label="Penalti BO (Rp)" value={p.penalti_backorder} isCurrency onChange={v => onUpdate(idx, "penalti_backorder", v)} />
              <Field label="Lead Time (hari)" value={p.lead_time} onChange={v => onUpdate(idx, "lead_time", v)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN VIEW
   ══════════════════════════════════════════════ */
export default function ProdukView({
  activeTab, setActiveTab,
  deleteIdx, setDeleteIdx,
  isSaving,
  umkm, produkList, tableRows,
  totalJam, kapasitasTersisa, utilisasiPct,
  updateUmkm, updateProduk, handleSave, addProduct,
  onImportOpen,
}) {
  const tabs = [
    { id: "daftar", label: "Daftar Produk", icon: Package },
    { id: "edit", label: "Edit Data", icon: Settings },
  ];

  // Accordion state: produk ke-0 expanded by default
  const [expanded, setExpanded] = useState(() => new Set([0]));
  const toggle = (i) => setExpanded(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Manajemen Produk</h1>
          <p className="text-sm text-gray-500 mt-0.5">{umkm.nama} · {produkList.length} produk terdaftar</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "daftar" && (
            <button onClick={onImportOpen} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">
              <Upload size={15} /> Import Data
            </button>
          )}
          {activeTab === "edit" && (
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 disabled:bg-gray-400 transition-colors">
              <Save size={15} /> {isSaving ? "Menyimpan..." : "Simpan"}
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ═══════ TAB: DAFTAR PRODUK ═══════ */}
      {activeTab === "daftar" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard icon={Package} label="Total Produk" value={produkList.length} sub="jenis produk" accent="blue" />
            <SummaryCard icon={Clock} label="Jam Reguler Total" value={`${totalJam} jam`} sub={`dari ${umkm.Cr} jam`} accent="blue" />
            <SummaryCard icon={Zap} label="Utilisasi Kapasitas" value={`${utilisasiPct}%`} sub={kapasitasTersisa >= 0 ? `${kapasitasTersisa} jam tersisa` : "over kapasitas"} accent={utilisasiPct > 90 ? "amber" : "blue"} />
            <SummaryCard icon={Clock} label="Kapasitas Lembur" value={`${umkm.Co} jam`} sub="maks per bulan" accent="amber" />
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["#", "Nama Produk", "Harga Jual", "Waktu (jam)", "Margin/jam", "Lead Time"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map(r => (
                    <tr key={r.nama} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500">{r._idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{r.nama}</td>
                      <td className="px-4 py-3 text-right text-gray-600">Rp {r.harga_jual?.toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{r.waktu_jam}</td>
                      <td className="px-4 py-3 text-right text-gray-600">Rp {r._marginJam.toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{r.lead_time} hari</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-gray-400">Untuk mengedit atau menambah produk, gunakan tab <strong>Edit Data</strong> atau tombol <strong>Import Data</strong>.</p>
        </>
      )}

      {/* ═══════ TAB: EDIT DATA ═══════ */}
      {activeTab === "edit" && (
        <>
          {/* Parameter UMKM */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-4">Parameter UMKM</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div><label className={lb}>Nama UMKM</label><input className={ic} value={umkm.nama} onChange={e => updateUmkm("nama", e.target.value)} /></div>
              <div><label className={lb}>Kapasitas Reguler (jam/bulan)</label><input type="number" className={ic} value={umkm.Cr} onChange={e => updateUmkm("Cr", e.target.value)} /></div>
              <div><label className={lb}>Kapasitas Lembur (jam/bulan)</label><input type="number" className={ic} value={umkm.Co} onChange={e => updateUmkm("Co", e.target.value)} /></div>
              <div><label className={lb}>Biaya Lembur/jam (Rp)</label><input type="text" inputMode="numeric" className={ic} value={Number(umkm.cost_overtime_hr).toLocaleString("id-ID")} onChange={e => updateUmkm("cost_overtime_hr", e.target.value.replace(/\./g, ""))} /></div>
            </div>
          </div>

          {/* Produk list — accordion */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-700">Data Produk ({produkList.length})</h2>
              <button
                onClick={addProduct}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Plus size={13} /> Tambah
              </button>
            </div>

            {produkList.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">Belum ada produk. Klik <strong>Tambah</strong> atau <strong>Import Data</strong>.</p>
            )}

            <div className="space-y-2">
              {produkList.map((p, i) => (
                <ProductCard
                  key={i}
                  p={p} idx={i}
                  isExpanded={expanded.has(i)}
                  onToggle={() => toggle(i)}
                  onDelete={setDeleteIdx}
                  onUpdate={updateProduk}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}