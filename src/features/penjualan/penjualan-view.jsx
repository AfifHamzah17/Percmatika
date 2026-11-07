// src/features/penjualan/penjualan-view.jsx
import { useState, useMemo, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, FileSpreadsheet, FileText, X, Loader2 } from "lucide-react";
import { BULAN_LABEL } from "./penjualan-model";
import { PageHeader, EmptyState, Skeleton } from "../../components/ui";
import ConfirmModal from "../../components/modal/ConfirmModal";
import { BULAN_SINGKAT } from "../../lib/kalender";
import { angka } from "../../lib/format";

/* Peta penjualan: baris = produk, kolom = 12 bulan. Kotak kosong = bulan belum diisi (model butuh riwayat yang rapat). */
function PetaKuilt({ list, tahun }) {
  const peta = useMemo(() => {
    const m = {};
    for (const r of list) { (m[r.produk_nama] ||= {})[r.bulan] = r.jumlah_terjual; }
    return m;
  }, [list]);
  const produk = Object.keys(peta);
  if (produk.length === 0) return null;
  const maks = Math.max(1, ...list.map((r) => r.jumlah_terjual || 0));
  return (
    <section className="pm-panel pm-panel--pad" aria-labelledby="t-peta">
      <div className="pm-secthead" style={{ marginBottom: 12 }}>
        <h2 id="t-peta" className="pm-h3">Kelengkapan data {tahun}</h2>
        <p>Makin pekat, makin banyak unit terjual. Kotak putus-putus berarti bulan belum diisi.</p>
      </div>
      <div className="pm-tablewrap">
        <div style={{ display: "grid", gridTemplateColumns: "132px repeat(12, minmax(26px, 1fr))", gap: 4, minWidth: 520, alignItems: "center" }}>
          <span />
          {BULAN_SINGKAT.map((b) => <span key={b} className="pm-help" style={{ textAlign: "center" }}>{b}</span>)}
          {produk.map((p) => (
            <div key={p} style={{ display: "contents" }}>
              <span className="pm-small" style={{ color: "var(--pm-ink)", paddingRight: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p}</span>
              {Array.from({ length: 12 }, (_, i) => {
                const v = peta[p][i + 1];
                const ada = v != null;
                return (
                  <i key={i} title={ada ? `${p}, ${BULAN_LABEL[i + 1]}: ${v} unit` : `${p}, ${BULAN_LABEL[i + 1]}: belum diisi`}
                    style={{ display: "block", height: 24, borderRadius: 6,
                      background: ada ? `color-mix(in srgb, var(--pm-accent) ${Math.round(14 + (v / maks) * 86)}%, white)` : "transparent",
                      border: ada ? "0" : "1.5px dashed var(--pm-line-strong)" }} />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FormModal({ buka, edit, nilai, setNilai, produkList, saving, onSubmit, onClose, tahunPilihan }) {
  const pertama = useRef(null);
  useEffect(() => {
    if (!buka) return;
    pertama.current?.focus();
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [buka, onClose]);
  if (!buka) return null;
  const set = (k) => (e) => setNilai({ ...nilai, [k]: e.target.value });
  return (
    <div className="pm-modal" role="dialog" aria-modal="true" aria-labelledby="fm-judul">
      <div className="pm-modal__scrim" onClick={onClose} />
      <form className="pm-modal__box" onSubmit={onSubmit} style={{ maxWidth: 440, display: "grid", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 id="fm-judul" className="pm-h2">{edit ? "Ubah data penjualan" : "Tambah data penjualan"}</h3>
          <button type="button" className="pm-iconbtn" onClick={onClose} aria-label="Tutup"><X size={19} strokeWidth={1.75} /></button>
        </div>
        <div className="pm-field">
          <label className="pm-label" htmlFor="f-produk">Produk</label>
          <select id="f-produk" ref={pertama} className="pm-select" value={nilai.produk} onChange={set("produk")} required>
            {produkList.map((p) => <option key={p.nama} value={p.nama}>{p.nama}</option>)}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="pm-field">
            <label className="pm-label" htmlFor="f-bulan">Bulan</label>
            <select id="f-bulan" className="pm-select" value={nilai.bulan} onChange={set("bulan")}>
              {BULAN_LABEL.slice(1).map((b, i) => <option key={b} value={i + 1}>{b}</option>)}
            </select>
          </div>
          <div className="pm-field">
            <label className="pm-label" htmlFor="f-tahun">Tahun</label>
            <select id="f-tahun" className="pm-select" value={nilai.tahun} onChange={set("tahun")}>
              {tahunPilihan.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="pm-field">
          <label className="pm-label" htmlFor="f-jumlah">Unit terjual</label>
          <input id="f-jumlah" className="pm-input pm-num" type="number" inputMode="numeric" min="0" required value={nilai.jumlah} onChange={set("jumlah")} placeholder="mis. 12" />
          <span className="pm-help">Isi 0 bila bulan itu tidak ada penjualan. Jangan dikosongkan, agar prakiraan tidak salah membaca.</span>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
          <button type="button" className="pm-btn pm-btn--ghost" onClick={onClose}>Batal</button>
          <button type="submit" className="pm-btn pm-btn--primary" disabled={saving}>{saving ? <><Loader2 size={16} className="pm-spin" />Menyimpan</> : "Simpan"}</button>
        </div>
      </form>
    </div>
  );
}

export default function PenjualanView({
  penjualanList, isLoading, filterTahun, setFilterTahun, filterProduk, setFilterProduk,
  produkList, onAdd, onEdit, onDelete, onExportExcel, onExportPdf, isExporting,
}) {
  const sekarang = new Date();
  const [form, setForm] = useState({ buka: false, edit: false, id: null, produk: "", bulan: sekarang.getMonth() + 1, tahun: sekarang.getFullYear(), jumlah: "" });
  const [saving, setSaving] = useState(false);
  const [hapus, setHapus] = useState(null);
  // pilihan tahun tetap (bukan diturunkan dari data terfilter, agar tidak menyempit sendiri)
  const tahunPilihan = Array.from({ length: 6 }, (_, i) => sekarang.getFullYear() - 4 + i);

  const bukaTambah = () => setForm({ buka: true, edit: false, id: null, produk: produkList[0]?.nama ?? "", bulan: sekarang.getMonth() + 1, tahun: filterTahun || sekarang.getFullYear(), jumlah: "" });
  const bukaUbah = (r) => setForm({ buka: true, edit: true, id: r.id, produk: r.produk_nama, bulan: r.bulan, tahun: r.tahun, jumlah: String(r.jumlah_terjual) });
  const tutup = () => setForm((f) => ({ ...f, buka: false }));

  const simpan = async (e) => {
    e.preventDefault();
    if (!form.produk || form.jumlah === "" || Number(form.jumlah) < 0) return;
    setSaving(true);
    try {
      const rec = { produk_nama: form.produk, bulan: Number(form.bulan), tahun: Number(form.tahun), jumlah_terjual: Number(form.jumlah) };
      if (form.edit && form.id) await onEdit(form.id, rec); else await onAdd(rec);
      tutup();
    } catch { /* pesan galat sudah ditampilkan oleh model */ } finally { setSaving(false); }
  };

  const Aksi = (
    <>
      <button type="button" className="pm-btn pm-btn--ghost pm-btn--sm" onClick={onExportExcel} disabled={isExporting}><FileSpreadsheet size={15} strokeWidth={1.75} />Excel</button>
      <button type="button" className="pm-btn pm-btn--ghost pm-btn--sm" onClick={onExportPdf} disabled={isExporting}><FileText size={15} strokeWidth={1.75} />PDF</button>
      <button type="button" className="pm-btn pm-btn--primary" onClick={bukaTambah}><Plus size={16} strokeWidth={1.75} />Tambah data</button>
    </>
  );

  return (
    <div className="pm-stack pm-stack--lg">
      <PageHeader judul="Data penjualan" deskripsi="Riwayat unit terjual per bulan. Makin rapat dan lengkap datanya, makin baik prakiraan permintaan." aksi={Aksi} />

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="pm-field" style={{ minWidth: 140 }}>
          <label className="pm-label" htmlFor="flt-tahun">Tahun</label>
          <select id="flt-tahun" className="pm-select" value={filterTahun ?? ""} onChange={(e) => setFilterTahun(e.target.value ? Number(e.target.value) : "")}>
            <option value="">Semua tahun</option>
            {tahunPilihan.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="pm-field" style={{ minWidth: 190 }}>
          <label className="pm-label" htmlFor="flt-produk">Produk</label>
          <select id="flt-produk" className="pm-select" value={filterProduk} onChange={(e) => setFilterProduk(e.target.value)}>
            <option value="">Semua produk</option>
            {produkList.map((p) => <option key={p.nama} value={p.nama}>{p.nama}</option>)}
          </select>
        </div>
        {(filterProduk || !filterTahun) && <button type="button" className="pm-btn pm-btn--quiet" onClick={() => { setFilterProduk(""); setFilterTahun(sekarang.getFullYear()); }}>Atur ulang</button>}
        <p className="pm-small" style={{ marginLeft: "auto" }}><b className="pm-num" style={{ color: "var(--pm-ink)", fontWeight: 500 }}>{angka(penjualanList.length)}</b> catatan</p>
      </div>

      {isLoading && penjualanList.length === 0 ? (
        <div className="pm-stack"><Skeleton h={160} r="18px" /><Skeleton h={300} r="18px" /></div>
      ) : penjualanList.length === 0 ? (
        <EmptyState judul="Belum ada data penjualan" isi="Tambahkan unit terjual tiap bulan. Mulailah dari bulan-bulan terakhir; sistem butuh riwayat untuk memprakirakan permintaan."
          aksi={<button type="button" className="pm-btn pm-btn--primary pm-btn--lg" onClick={bukaTambah}>Tambah data pertama</button>} />
      ) : (
        <>
          {filterTahun && <PetaKuilt list={penjualanList} tahun={filterTahun} />}
          <div className="pm-panel" style={{ overflow: "hidden" }}>
            <div className="pm-tablewrap">
              <table className="pm-table">
                <thead><tr><th>Produk</th><th>Bulan</th><th>Tahun</th><th className="r">Unit terjual</th><th className="r" style={{ width: 96 }}><span className="sr-only">Aksi</span></th></tr></thead>
                <tbody>
                  {penjualanList.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 500, color: "var(--pm-ink)" }}>{r.produk_nama}</td>
                      <td>{BULAN_LABEL[r.bulan]}</td>
                      <td className="pm-num">{r.tahun}</td>
                      <td className="r" style={{ color: "var(--pm-ink)" }}>{angka(r.jumlah_terjual)}</td>
                      <td className="r">
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 2, whiteSpace: "nowrap" }}>
                          <button type="button" className="pm-iconbtn pm-iconbtn--sm" onClick={() => bukaUbah(r)} aria-label={`Ubah ${r.produk_nama} ${BULAN_LABEL[r.bulan]} ${r.tahun}`}><Pencil size={16} strokeWidth={1.75} /></button>
                          <button type="button" className="pm-iconbtn pm-iconbtn--sm" onClick={() => setHapus(r)} aria-label={`Hapus ${r.produk_nama} ${BULAN_LABEL[r.bulan]} ${r.tahun}`}><Trash2 size={16} strokeWidth={1.75} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <FormModal buka={form.buka} edit={form.edit} nilai={form} setNilai={(n) => setForm({ ...n, buka: true })} produkList={produkList} saving={saving} onSubmit={simpan} onClose={tutup} tahunPilihan={tahunPilihan} />
      <ConfirmModal isOpen={!!hapus} title="Hapus data penjualan"
        message={hapus ? `Hapus ${hapus.produk_nama} bulan ${BULAN_LABEL[hapus.bulan]} ${hapus.tahun}? Tindakan ini tidak bisa dibatalkan.` : ""}
        onCancel={() => setHapus(null)} onConfirm={async () => { const r = hapus; setHapus(null); await onDelete(r.id); }} />
    </div>
  );
}
