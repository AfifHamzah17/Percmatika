// src/features/produk/produk-view.jsx
import { useState } from "react";
import { Upload, Save, Trash2, Package, Settings, ChevronDown, Plus, Loader2 } from "lucide-react";
import { PageHeader, EmptyState } from "../../components/ui";
import { jamPerUnit } from "./produk-model";
import { rupiah, angka } from "../../lib/format";

/* Isian angka. Rupiah diformat ribuan otomatis; id dan htmlFor dipasang agar bisa dibaca pembaca layar. */
function Field({ id, label, value, isCurrency = false, onChange, suffix, help }) {
  const tampil = isCurrency ? Number(value || 0).toLocaleString("id-ID") : value;
  return (
    <div className="pm-field">
      <label className="pm-label" htmlFor={id}>{label}</label>
      <div style={{ position: "relative" }}>
        {isCurrency && <span aria-hidden="true" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "var(--pm-faint)" }}>Rp</span>}
        <input id={id} type="text" inputMode={isCurrency ? "numeric" : "decimal"} className="pm-input pm-num"
          style={{ textAlign: "right", paddingLeft: isCurrency ? 38 : undefined, paddingRight: suffix ? 52 : undefined }}
          value={tampil} onChange={(e) => onChange(isCurrency ? e.target.value.replace(/\./g, "") : e.target.value)} />
        {suffix && <span aria-hidden="true" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--pm-faint)" }}>{suffix}</span>}
      </div>
      {help && <span className="pm-help">{help}</span>}
    </div>
  );
}

function Kelompok({ judul, children, kolom = "repeat(auto-fit, minmax(190px, 1fr))" }) {
  return (
    <fieldset style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
      <legend className="pm-h3" style={{ marginBottom: 10 }}>{judul}</legend>
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: kolom }}>{children}</div>
    </fieldset>
  );
}

function KartuProduk({ p, idx, buka, onToggle, onDelete, onUpdate }) {
  const jam = jamPerUnit(p);
  const totalBiaya = (p.biaya_material || 0) + (p.biaya_tk || 0) + (p.biaya_lembur || 0); // sama dengan tabel Daftar
  const margin = (p.harga_jual || 0) - totalBiaya;
  const marginJam = jam > 0 ? Math.round(margin / jam) : 0;
  const idp = `p${idx}`;
  return (
    <div className="pm-panel" style={{ overflow: "hidden", borderColor: buka ? "var(--pm-accent-line)" : undefined }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <button type="button" onClick={onToggle} aria-expanded={buka} aria-controls={`${idp}-isi`}
          style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: "none", border: 0, cursor: "pointer", textAlign: "left", minWidth: 0 }}>
          <ChevronDown size={18} strokeWidth={1.75} style={{ flex: "none", color: "var(--pm-faint)", transform: buka ? "none" : "rotate(-90deg)", transition: "transform .2s var(--pm-ease)" }} />
          <span className="pm-h3" style={{ flex: "none" }}>{p.nama || "Produk tanpa nama"}</span>
          <span className="pm-small pm-num" style={{ marginLeft: "auto", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {rupiah(p.harga_jual)} · {angka(jam, 1)} jam · margin {rupiah(marginJam)}/jam
          </span>
        </button>
        <button type="button" className="pm-iconbtn" onClick={() => onDelete(idx)} aria-label={`Hapus ${p.nama}`} style={{ marginRight: 8 }}><Trash2 size={17} strokeWidth={1.75} /></button>
      </div>
      {buka && (
        <div id={`${idp}-isi`} style={{ padding: "6px 18px 22px", borderTop: "1px solid var(--pm-line)", display: "grid", gap: 24, paddingTop: 20 }}>
          <div className="pm-field" style={{ maxWidth: 420 }}>
            <label className="pm-label" htmlFor={`${idp}-nama`}>Nama produk</label>
            <input id={`${idp}-nama`} className="pm-input" value={p.nama} onChange={(e) => onUpdate(idx, "nama", e.target.value)} />
          </div>
          <Kelompok judul="Harga jual">
            <Field id={`${idp}-harga`} label="Harga jual per unit" value={p.harga_jual} isCurrency onChange={(v) => onUpdate(idx, "harga_jual", v)} />
          </Kelompok>
          <Kelompok judul="Biaya produksi per unit">
            <Field id={`${idp}-mat`} label="Bahan" value={p.biaya_material} isCurrency onChange={(v) => onUpdate(idx, "biaya_material", v)} />
            <Field id={`${idp}-tk`} label="Upah" value={p.biaya_tk} isCurrency onChange={(v) => onUpdate(idx, "biaya_tk", v)} />
            <Field id={`${idp}-lembur`} label="Tambahan bila dikerjakan lembur" value={p.biaya_lembur} isCurrency onChange={(v) => onUpdate(idx, "biaya_lembur", v)} help="Selisih upah lembur per unit, di luar upah biasa." />
          </Kelompok>
          <Kelompok judul="Ongkos kirim bahan">
            <Field id={`${idp}-ongreg`} label="Pengiriman reguler" value={p.ongkir_reguler} isCurrency onChange={(v) => onUpdate(idx, "ongkir_reguler", v)} />
            <Field id={`${idp}-ongeks`} label="Pengiriman ekspres" value={p.ongkir_ekspres} isCurrency onChange={(v) => onUpdate(idx, "ongkir_ekspres", v)} />
          </Kelompok>
          <Kelompok judul="Waktu pengerjaan">
            <Field id={`${idp}-jam`} label="Jam kerja per unit" value={jam} onChange={(v) => onUpdate(idx, "waktu_jam", v)} suffix="jam" help="Jam kerja nyata untuk membuat satu unit, bukan lama menunggu." />
          </Kelompok>
        </div>
      )}
    </div>
  );
}

export default function ProdukView({
  activeTab, setActiveTab, isSaving, umkm, produkList, tableRows, kapasitasTersisa,
  updateUmkm, updateProduk, setDeleteIdx, handleSave, addProduct, onImportOpen,
}) {
  const [terbuka, setTerbuka] = useState(() => new Set([0]));
  const toggle = (i) => setTerbuka((prev) => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });
  const terbaik = [...tableRows].sort((a, b) => b._marginJam - a._marginJam)[0];

  const Aksi = activeTab === "daftar"
    ? <button type="button" className="pm-btn pm-btn--ink" onClick={onImportOpen}><Upload size={16} strokeWidth={1.75} />Impor dari Excel</button>
    : <button type="button" className="pm-btn pm-btn--primary" onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 size={16} className="pm-spin" /> : <Save size={16} strokeWidth={1.75} />}{isSaving ? "Menyimpan" : "Simpan perubahan"}</button>;

  return (
    <div className="pm-stack pm-stack--lg">
      <PageHeader judul="Produk dan kapasitas" deskripsi={`${umkm.nama} · ${produkList.length} produk. Harga, biaya, dan jam kerja di sini menjadi dasar semua perhitungan rencana.`} aksi={Aksi} />

      <div className="pm-seg" role="tablist" aria-label="Tampilan produk">
        {[{ id: "daftar", label: "Daftar", icon: Package }, { id: "edit", label: "Ubah data", icon: Settings }].map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)}><Icon size={16} strokeWidth={1.75} />{label}</button>
        ))}
      </div>

      {activeTab === "daftar" && (
        <>
          <section className="pm-panel pm-panel--raised pm-stats" aria-label="Ringkasan kapasitas">
            <div className="pm-stat pm-stat--lead"><p className="pm-stat__k">Jumlah produk</p><p className="pm-stat__v">{produkList.length}</p><p className="pm-stat__s">jenis produk terdaftar</p></div>
            <div className="pm-stat"><p className="pm-stat__k">Jam reguler</p><p className="pm-stat__v">{angka(umkm.Cr)}<small>jam</small></p><p className="pm-stat__s">per bulan</p></div>
            <div className="pm-stat"><p className="pm-stat__k">Jam lembur</p><p className="pm-stat__v">{angka(umkm.Co)}<small>jam</small></p><p className="pm-stat__s">maksimum per bulan</p></div>
            <div className="pm-stat"><p className="pm-stat__k">Margin per jam tertinggi</p><p className="pm-stat__v" style={{ fontSize: 20 }}>{terbaik ? rupiah(terbaik._marginJam) : "–"}</p><p className="pm-stat__s">{terbaik?.nama ?? "belum ada produk"}</p></div>
          </section>

          {tableRows.length === 0 ? (
            <EmptyState judul="Belum ada produk" isi="Tambahkan produk lewat tab Ubah data, atau impor dari berkas Excel." aksi={<button type="button" className="pm-btn pm-btn--primary pm-btn--lg" onClick={onImportOpen}>Impor dari Excel</button>} />
          ) : (
            <div className="pm-panel" style={{ overflow: "hidden" }}>
              <div className="pm-tablewrap">
                <table className="pm-table">
                  <thead><tr><th>Produk</th><th className="r">Harga jual</th><th className="r">Biaya per unit</th><th className="r">Jam per unit</th><th className="r">Margin per jam</th></tr></thead>
                  <tbody>
                    {tableRows.map((r) => (
                      <tr key={r._idx}>
                        <td style={{ fontWeight: 500, color: "var(--pm-ink)" }}>{r.nama}</td>
                        <td className="r">{rupiah(r.harga_jual)}</td>
                        <td className="r">{rupiah(r._totalBiaya)}</td>
                        <td className="r">{angka(r._waktuJam, 1)}</td>
                        <td className="r" style={{ color: r._marginJam > 0 ? "var(--pm-accent)" : "var(--pm-danger)", fontWeight: 500 }}>{rupiah(r._marginJam)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <p className="pm-small">Untuk menambah atau mengubah produk, buka tab <b>Ubah data</b> atau impor dari Excel.</p>
        </>
      )}

      {activeTab === "edit" && (
        <>
          <section className="pm-panel pm-panel--pad" aria-labelledby="t-usaha">
            <h2 id="t-usaha" className="pm-h2" style={{ marginBottom: 16 }}>Usaha dan kapasitas</h2>
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
              <div className="pm-field"><label className="pm-label" htmlFor="u-nama">Nama usaha</label><input id="u-nama" className="pm-input" value={umkm.nama} onChange={(e) => updateUmkm("nama", e.target.value)} /></div>
              <Field id="u-cr" label="Jam kerja reguler per bulan" value={umkm.Cr} onChange={(v) => updateUmkm("Cr", v)} suffix="jam" help="Jumlah pengrajin × hari kerja × jam per hari." />
              <Field id="u-co" label="Jam lembur maksimum per bulan" value={umkm.Co} onChange={(v) => updateUmkm("Co", v)} suffix="jam" />
              <Field id="u-lb" label="Biaya lembur per jam" value={umkm.cost_overtime_hr} isCurrency onChange={(v) => updateUmkm("cost_overtime_hr", v)} />
            </div>
            {kapasitasTersisa < 0 && <p className="pm-notice" style={{ marginTop: 16 }}>Jam kerja reguler terlalu kecil dibanding data produk. Periksa kembali jam per unit.</p>}
          </section>

          <section aria-labelledby="t-prod">
            <div className="pm-secthead">
              <h2 id="t-prod" className="pm-h2">Produk ({produkList.length})</h2>
              <button type="button" className="pm-btn pm-btn--ghost pm-btn--sm" onClick={addProduct}><Plus size={15} strokeWidth={1.75} />Tambah produk</button>
            </div>
            {produkList.length === 0 && <p className="pm-small" style={{ padding: "24px 0" }}>Belum ada produk. Klik <b>Tambah produk</b>.</p>}
            <div className="pm-stack">
              {produkList.map((p, i) => (
                <KartuProduk key={i} p={p} idx={i} buka={terbuka.has(i)} onToggle={() => toggle(i)} onDelete={setDeleteIdx} onUpdate={updateProduk} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
