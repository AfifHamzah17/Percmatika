// src/features/dashboard/dashboard-view.jsx
// Halaman Rencana: satu layar yang menjawab "bulan ini buat berapa unit, kapan lembur, kapan pesan bahan".
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  RefreshCw, Loader2, AlertTriangle, Upload, FileDown, ChevronLeft, ChevronRight, ChevronDown,
  Check, X, Info, Clock,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import InputDataModal from "../../components/modal/InputDataModal";
import { QuiltUnits, QuiltLegend, ScenarioWeights, EmptyState, Skeleton } from "../../components/ui";
import { NAMA_BULAN, BULAN_SINGKAT, labelHijriBulan, penandaMusim } from "../../lib/kalender";
import { angka, rupiah, tanggalPendek } from "../../lib/format";

/* ───────── fungsi bantu ───────── */
const deadline = (leadTime, iso) => {
  const d = new Date(iso);
  d.setDate(d.getDate() - leadTime);
  return d;
};
const bulanSudahLewat = (iso) => {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59) < new Date();
};
/** Sisa hari sampai tenggat pesan bahan. null bila bulan target sudah berlalu (tenggat tak relevan lagi). */
const sisaHari = (leadTime, iso) => (bulanSudahLewat(iso) ? null : Math.ceil((deadline(leadTime, iso) - new Date()) / 864e5));
const labelSisa = (sisa) => (sisa == null ? "bulan sudah berlalu" : sisa < 0 ? `terlambat ${Math.abs(sisa)} hari` : sisa === 0 ? "hari ini" : `${sisa} hari lagi`);
const mendesak = (sisa) => sisa != null && sisa <= 3;

/** "1 unit(P50)/3 unit(peak)" -> 1 ; "Tidak" -> 0 */
function unitEkspres(label) {
  if (!label || label === "Tidak") return 0;
  const m = String(label).match(/(\d+)\s*unit/i) || String(label).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 1;
}

function skorPrioritas(p) {
  const r = p.rekomendasi;
  let s = 0;
  if ((r.b_backorder || 0) > 0) s += 30;
  if (unitEkspres(r.e_expres_label) > 0) s += 20;
  if ((r.y_lembur || 0) > 0) s += 15;
  if (p.leadTime <= 7) s += 10;
  return s;
}

function lencana(p) {
  const r = p.rekomendasi;
  const out = [];
  if ((r.b_backorder || 0) > 0) out.push({ t: "Berisiko kurang saat puncak", k: "danger" });
  if (unitEkspres(r.e_expres_label) > 0) out.push({ t: "Siapkan bahan ekspres", k: "warn" });
  if ((r.y_lembur || 0) > 0) out.push({ t: "Perlu lembur", k: "accent" });
  if (out.length === 0) out.push({ t: "Aman dengan jam reguler", k: "line" });
  return out;
}

/* ───────── bagian kecil ───────── */
function RentangPermintaan({ f }) {
  if (!f || f.P90 == null) return null;
  const maks = Math.max(f.P90 * 1.15, 1);
  const kiri = (f.P10 / maks) * 100;
  const lebar = ((f.P90 - f.P10) / maks) * 100;
  const tengah = (f.P50 / maks) * 100;
  return (
    <div>
      <div style={{ position: "relative", height: 8, borderRadius: 8, background: "var(--pm-surface-2)" }}
        role="img" aria-label={`Permintaan mungkin ${f.P10} sampai ${f.P90} unit, paling mungkin sekitar ${f.P50}`}>
        <i style={{ position: "absolute", left: `${kiri}%`, width: `${lebar}%`, top: 0, bottom: 0, borderRadius: 8, background: "var(--pm-accent-line)" }} />
        <i style={{ position: "absolute", left: `calc(${tengah}% - 2px)`, top: -3, width: 4, height: 14, borderRadius: 2, background: "var(--pm-accent)" }} />
      </div>
      <p className="pm-help" style={{ marginTop: 8 }}>
        Permintaan mungkin <b className="pm-num" style={{ color: "var(--pm-ink)", fontWeight: 500 }}>{f.P10}–{f.P90}</b> unit, paling mungkin sekitar <b className="pm-num" style={{ color: "var(--pm-ink)", fontWeight: 500 }}>{f.P50}</b>.
      </p>
    </div>
  );
}

function BarisProduk({ p, iso, i }) {
  const r = p.rekomendasi;
  const total = (r.x_reguler || 0) + (r.y_lembur || 0) + unitEkspres(r.e_expres_label);
  const alasan = p.quote?.body || p.note;
  const sisa = sisaHari(p.leadTime, iso);
  return (
    <article className="pm-panel pm-prow pm-rise" style={{ "--i": i }}>
      <div className="pm-prow__top">
        <div className="pm-prow__name">
          <h3 className="pm-h2" style={{ fontSize: 18 }}>{p.nama}</h3>
          {lencana(p).map((b) => <span key={b.t} className={`pm-chip pm-chip--${b.k}`}>{b.t}</span>)}
        </div>
        <p className="pm-prow__tot"><b>{total}</b>unit direncanakan</p>
      </div>

      <QuiltUnits reg={r.x_reguler} ot={r.y_lembur} ex={unitEkspres(r.e_expres_label)} bo={r.b_backorder} />

      <dl className="pm-numbers">
        <div><dt>Reguler</dt><dd>{r.x_reguler || 0}</dd></div>
        <div><dt>Jam per unit</dt><dd>{angka(p.waktuJam, 1)}</dd></div>
        <div><dt>Margin per jam</dt><dd>{rupiah(p.marginJam)}</dd></div>
        <div><dt>Sumbangan laba</dt><dd>{p.estimasiProfit}</dd></div>
      </dl>

      <RentangPermintaan f={p.forecast} />

      {alasan && (
        <details>
          <summary><Info size={15} strokeWidth={1.75} />{p.quote?.title || "Mengapa begini?"}</summary>
          <p className={`pm-reason ${p.quote ? "pm-reason--warn" : ""}`}>{alasan}</p>
        </details>
      )}

      <p className="pm-small" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <Clock size={14} strokeWidth={1.75} />
        Pesan bahan sebelum <b className="pm-num" style={{ color: "var(--pm-ink)", fontWeight: 500 }}>{tanggalPendek(deadline(p.leadTime, iso))}</b>
        <span style={{ color: mendesak(sisa) ? "var(--pm-danger)" : "var(--pm-faint)" }}>· {labelSisa(sisa)}</span>
      </p>
    </article>
  );
}

function PilihBulan({ targetDate, onPilih, onTutup }) {
  const [tahun, setTahun] = useState(targetDate.getFullYear());
  const ref = useRef(null);
  useEffect(() => {
    const klik = (e) => { if (!ref.current?.contains(e.target)) onTutup(); };
    const esc = (e) => { if (e.key === "Escape") onTutup(); };
    document.addEventListener("mousedown", klik);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", klik); document.removeEventListener("keydown", esc); };
  }, [onTutup]);
  return (
    <div ref={ref} className="pm-menu" style={{ width: 280, right: 0, padding: 14 }} role="dialog" aria-label="Pilih bulan">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button type="button" className="pm-iconbtn" onClick={() => setTahun((t) => t - 1)} aria-label="Tahun sebelumnya"><ChevronLeft size={18} /></button>
        <b className="pm-num" style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>{tahun}</b>
        <button type="button" className="pm-iconbtn" onClick={() => setTahun((t) => t + 1)} aria-label="Tahun berikutnya"><ChevronRight size={18} /></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
        {BULAN_SINGKAT.map((b, i) => {
          const aktif = i === targetDate.getMonth() && tahun === targetDate.getFullYear();
          return (
            <button key={b} type="button" className={`pm-btn pm-btn--sm ${aktif ? "pm-btn--ink" : "pm-btn--ghost"}`}
              onClick={() => onPilih(new Date(tahun, i, 1))}>{b}</button>
          );
        })}
      </div>
    </div>
  );
}

function PanelTentangHitungan({ ai, meta }) {
  if (!ai && !(meta?.vss > 0)) return null;
  const pr = ai?.prakiraan, op = ai?.optimasi;
  const baris = [];
  if (pr?.model) baris.push(["Model prakiraan", pr.model]);
  if (pr?.mase != null) {
    baris.push([
      "Akurasi prakiraan",
      <>MASE <b className="pm-num">{angka(pr.mase, 2)}</b>{pr.mase < 1 ? ": lebih baik daripada menebak seperti bulan lalu." : ": belum lebih baik daripada menebak seperti bulan lalu."}</>,
    ]);
  }
  if (op) {
    const ok = op.status === "natural";
    baris.push([
      "Kualitas optimasi",
      ok
        ? <>Konvergen dalam <b className="pm-num">{op.iterasi}</b> iterasi{op.gap_ef_pct != null && <>, selisih <b className="pm-num">{angka(op.gap_ef_pct, 2)}%</b> dari optimum eksak</>}.</>
        : <span style={{ color: "var(--pm-warn)" }}>Solusi dipaksa menyepakati satu rencana; gunakan dengan hati-hati.</span>,
    ]);
  }
  if (meta?.vss > 0) baris.push(["Nilai perencanaan stokastik", <>Sekitar <b className="pm-num">{rupiah(meta.vss)}</b> lebih tinggi daripada rencana rata-rata, dihitung di dalam model.</>]);
  return (
    <section className="pm-panel pm-panel--pad pm-rise" style={{ "--i": 4 }} aria-labelledby="t-hitung">
      <h2 id="t-hitung" className="pm-h3" style={{ marginBottom: 12 }}>Tentang hitungan ini</h2>
      <dl style={{ display: "grid", gap: 12 }}>
        {baris.map(([k, v]) => (
          <div key={k}>
            <dt className="pm-small" style={{ fontWeight: 500, color: "var(--pm-ink)" }}>{k}</dt>
            <dd className="pm-small">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="pm-help" style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--pm-line)" }}>
        Semua angka adalah perkiraan berdasarkan data penjualan yang Anda isi. Hasil sebenarnya bisa berbeda.
      </p>
    </section>
  );
}

function SkeletonView() {
  return (
    <div className="pm-stack pm-stack--lg" aria-busy="true" aria-label="Memuat rencana">
      <div style={{ display: "grid", gap: 10 }}><Skeleton h={40} w="52%" /><Skeleton h={18} w="34%" /></div>
      <Skeleton h={108} r="18px" />
      <div className="pm-grid-main">
        <div className="pm-stack"><Skeleton h={250} r="18px" /><Skeleton h={250} r="18px" /></div>
        <div className="pm-stack"><Skeleton h={220} r="18px" /><Skeleton h={170} r="18px" /></div>
      </div>
    </div>
  );
}

function ChecklistData({ dataStatus }) {
  const baris = [
    { ok: dataStatus?.has_produk, label: "Data produk", to: "/produk", aksi: "Isi data produk" },
    { ok: dataStatus?.has_penjualan, label: "Data penjualan bulanan", to: "/penjualan", aksi: "Isi data penjualan" },
  ];
  return (
    <ul className="pm-panel pm-divide" style={{ width: "100%", textAlign: "left", listStyle: "none", margin: 0, padding: 0 }}>
      {baris.map((b) => (
        <li key={b.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", flexWrap: "wrap" }}>
          <span aria-hidden="true" style={{
            width: 24, height: 24, borderRadius: 8, display: "grid", placeItems: "center",
            background: b.ok ? "var(--pm-accent-soft)" : "var(--pm-danger-soft)", color: b.ok ? "var(--pm-accent)" : "var(--pm-danger)",
          }}>{b.ok ? <Check size={15} strokeWidth={2.25} /> : <X size={15} strokeWidth={2.25} />}</span>
          <span style={{ fontWeight: 500, color: "var(--pm-ink)" }}>{b.label}</span>
          <span className="pm-small">{b.ok ? "sudah terisi" : "belum terisi"}</span>
          {!b.ok && <Link to={b.to} className="pm-btn pm-btn--ghost pm-btn--sm" style={{ marginLeft: "auto" }}>{b.aksi}</Link>}
        </li>
      ))}
    </ul>
  );
}

/* ───────── halaman ───────── */
export default function DashboardView({ isLoading, error, data, onRefresh, dataStatus, fetchDataStatus }) {
  const { targetDate, setTargetDate } = useApp();
  const [inputOpen, setInputOpen] = useState(false);
  const [bulanOpen, setBulanOpen] = useState(false);

  useEffect(() => {
    if (!dataStatus) fetchDataStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePdf = async () => {
    try {
      const { generatePdf } = await import("../../components/pdf/ReportDocument");
      await generatePdf(data);
    } catch (err) {
      toast.error("PDF belum bisa dibuat: " + err.message);
    }
  };

  const dataReady = dataStatus && dataStatus.has_produk && dataStatus.has_penjualan;
  const handleHitung = () => { if (dataReady) onRefresh(); };
  const geser = (n) => setTargetDate(new Date(targetDate.getFullYear(), targetDate.getMonth() + n, 1));

  /* judul halaman mengikuti bulan yang dipilih */
  const namaBulan = `${NAMA_BULAN[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
  const musim = penandaMusim(targetDate.getFullYear(), targetDate.getMonth() + 1);
  const hijri = labelHijriBulan(targetDate.getFullYear(), targetDate.getMonth() + 1);

  const PenggantiBulan = (
    <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
      <button type="button" className="pm-iconbtn" onClick={() => geser(-1)} aria-label="Bulan sebelumnya"><ChevronLeft size={19} /></button>
      <button type="button" className="pm-btn pm-btn--ghost" onClick={() => setBulanOpen((v) => !v)} aria-haspopup="dialog" aria-expanded={bulanOpen}>
        {namaBulan}<ChevronDown size={16} strokeWidth={1.75} />
      </button>
      <button type="button" className="pm-iconbtn" onClick={() => geser(1)} aria-label="Bulan berikutnya"><ChevronRight size={19} /></button>
      {bulanOpen && <PilihBulan targetDate={targetDate} onPilih={(d) => { setTargetDate(d); setBulanOpen(false); }} onTutup={() => setBulanOpen(false)} />}
    </div>
  );

  const Judul = (
    <div style={{ display: "grid", gap: 10 }}>
      <h1 className="pm-h1">Rencana produksi {namaBulan}</h1>
      <p className="pm-lead" style={{ fontSize: 14 }}>
        {data?.header?.umkm ? `${data.header.umkm} · ` : ""}{hijri}
      </p>
      {musim.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {musim.map((m) => <span key={m} className="pm-chip pm-chip--warn">{m}</span>)}
        </div>
      )}
    </div>
  );

  if (isLoading && !data) return <SkeletonView />;

  if (error && !data)
    return (
      <EmptyState
        judul="Rencana belum bisa dimuat"
        isi={error}
        aksi={<button type="button" className="pm-btn pm-btn--ink pm-btn--lg" onClick={onRefresh}><RefreshCw size={17} />Coba lagi</button>}
      />
    );

  /* belum ada hasil */
  if (!data)
    return (
      <div className="pm-stack pm-stack--lg">
        <div className="pm-secthead" style={{ alignItems: "flex-end" }}>{Judul}{PenggantiBulan}</div>
        <div className="pm-panel pm-stitch" style={{ padding: "44px 24px" }}>
          <div style={{ maxWidth: 520, margin: "0 auto", display: "grid", gap: 22, justifyItems: "center", textAlign: "center" }}>
            <QuiltUnits reg={6} ot={2} ex={1} bo={0} />
            <div style={{ display: "grid", gap: 8 }}>
              <h2 className="pm-h2">Belum ada rencana untuk {namaBulan}</h2>
              <p className="pm-lead" style={{ textAlign: "center" }}>
                Sistem butuh data produk dan riwayat penjualan Anda untuk memprakirakan permintaan lalu menghitung rencana produksi.
              </p>
            </div>
            <ChecklistData dataStatus={dataStatus} />
            <button type="button" className="pm-btn pm-btn--primary pm-btn--lg" onClick={handleHitung} disabled={!dataReady}>
              {dataReady ? "Hitung rencana bulan ini" : "Lengkapi data dulu"}
            </button>
            <p className="pm-help">Perhitungan biasanya selesai dalam hitungan detik sampai satu menit.</p>
          </div>
        </div>
      </div>
    );

  if (!data.header || !data.produkList)
    return <EmptyState judul="Format data tidak dikenali" isi="Server mengirim data yang bentuknya tidak sesuai. Coba hitung ulang; jika berulang, hubungi pengembang." aksi={<button type="button" className="pm-btn pm-btn--ink" onClick={onRefresh}>Hitung ulang</button>} />;

  /* hitungan ringkasan */
  const iso = data.header.targetDate;
  const totalReg = data.produkList.reduce((s, p) => s + (p.rekomendasi.x_reguler || 0), 0);
  const jamLembur = data.produkList.reduce((s, p) => s + (p.rekomendasi.y_lembur || 0) * (p.waktuJam || 0), 0);
  const jamReg = data.produkList.reduce((s, p) => s + (p.rekomendasi.x_reguler || 0) * (p.waktuJam || 0), 0);
  const totalKap = data.kapasitas.reguler_maks + data.kapasitas.lembur_maks;
  const utilisasi = Math.round(((jamReg + jamLembur) / totalKap) * 100);
  const urut = [...data.produkList].sort((a, b) => skorPrioritas(b) - skorPrioritas(a) || a.leadTime - b.leadTime);
  const pengadaan = [...(data.pengadaan || [])].sort((a, b) => a.leadTime - b.leadTime).reverse();

  /* daftar tindakan: dari data yang sama, ditulis sebagai kalimat perintah */
  const tindakan = [];
  pengadaan.slice(0, 2).forEach((o) => tindakan.push({ t: `Pesan ${o.material.toLowerCase()} sebelum ${tanggalPendek(deadline(o.leadTime, iso))}`, urgent: mendesak(sisaHari(o.leadTime, iso)) }));
  if (jamLembur > 0) tindakan.push({ t: `Siapkan sekitar ${Math.round(jamLembur)} jam lembur` });
  urut.filter((p) => unitEkspres(p.rekomendasi.e_expres_label) > 0).slice(0, 1).forEach((p) => tindakan.push({ t: `Siapkan opsi bahan ekspres untuk ${p.nama}` }));
  urut.filter((p) => (p.rekomendasi.b_backorder || 0) > 0).slice(0, 1).forEach((p) => tindakan.push({ t: `Beri tahu pelanggan ${p.nama}: bisa terlambat saat permintaan puncak` }));

  const PanelTindakan = (sfx) => tindakan.length > 0 && (
    <section className={`pm-panel pm-panel--pad pm-stitch pm-rise ${sfx === "d" ? "pm-only-desktop" : "pm-only-mobile"}`} style={{ "--i": 2 }} aria-labelledby={`t-tindakan-${sfx}`}>
      <h2 id={`t-tindakan-${sfx}`} className="pm-h3" style={{ marginBottom: 12 }}>Yang perlu Anda lakukan</h2>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
        {tindakan.map((a, i) => (
          <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span className="pm-num" aria-hidden="true" style={{
              flex: "none", width: 24, height: 24, borderRadius: 8, display: "grid", placeItems: "center", fontSize: 12.5, fontFamily: "var(--font-mono)",
              background: a.urgent ? "var(--pm-danger-soft)" : "var(--pm-accent-soft)", color: a.urgent ? "var(--pm-danger)" : "var(--pm-accent)",
            }}>{i + 1}</span>
            <span style={{ fontSize: 14.5, lineHeight: 1.5, color: "var(--pm-ink)" }}>{a.t}{a.urgent && <span className="pm-chip pm-chip--danger" style={{ marginLeft: 8 }}>segera</span>}</span>
          </li>
        ))}
      </ol>
    </section>
  );

  return (
    <div className="pm-stack pm-stack--lg">
      {/* judul + kendali */}
      <header className="pm-secthead pm-rise" style={{ alignItems: "flex-end", marginBottom: 0 }}>
        {Judul}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
          {PenggantiBulan}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button type="button" className="pm-btn pm-btn--ghost pm-btn--sm" onClick={() => setInputOpen(true)}><Upload size={15} strokeWidth={1.75} />Input data</button>
            <button type="button" className="pm-btn pm-btn--ghost pm-btn--sm" onClick={handlePdf}><FileDown size={15} strokeWidth={1.75} />PDF</button>
            <button type="button" className="pm-btn pm-btn--primary pm-btn--sm" onClick={handleHitung} disabled={isLoading || !dataReady}>
              {isLoading ? <Loader2 size={15} className="pm-spin" /> : <RefreshCw size={15} strokeWidth={1.75} />}Hitung ulang
            </button>
          </div>
        </div>
      </header>

      {data.isMock && (
        <div className="pm-notice" role="status">
          <AlertTriangle size={18} strokeWidth={1.75} style={{ flex: "none", marginTop: 1 }} />
          <span><b>Ini data contoh</b>, bukan hasil hitung usaha Anda. Server belum merespons. Coba “Hitung ulang” setelah koneksi pulih.</span>
        </div>
      )}

      {/* ringkasan: satu pita */}
      <section className="pm-panel pm-panel--raised pm-stats pm-rise" style={{ "--i": 1 }} aria-label="Ringkasan bulan ini">
        <div className="pm-stat pm-stat--lead">
          <p className="pm-stat__k">Perkiraan laba bersih</p>
          <p className="pm-stat__v">{data.estimasiKeuntungan.replace("Rp ", "Rp")}</p>
          <p className="pm-stat__s">Nilai harapan dari beberapa skenario permintaan</p>
        </div>
        <div className="pm-stat">
          <p className="pm-stat__k">Produksi reguler</p>
          <p className="pm-stat__v">{totalReg}<small>unit</small></p>
          <p className="pm-stat__s">dari {data.produkList.length} jenis produk</p>
        </div>
        <div className="pm-stat">
          <p className="pm-stat__k">Jam lembur</p>
          <p className="pm-stat__v">{Math.round(jamLembur)}<small>jam</small></p>
          <div className="pm-meter pm-meter--warn" aria-hidden="true"><i style={{ width: `${Math.min(100, (jamLembur / Math.max(1, data.kapasitas.lembur_maks)) * 100)}%` }} /></div>
          <p className="pm-stat__s">batas {data.kapasitas.lembur_maks} jam per bulan</p>
        </div>
        <div className="pm-stat">
          <p className="pm-stat__k">Kapasitas terpakai</p>
          <p className="pm-stat__v">{utilisasi}<small>%</small></p>
          <div className={`pm-meter ${utilisasi > 90 ? "pm-meter--warn" : ""}`} aria-hidden="true"><i style={{ width: `${Math.min(100, utilisasi)}%` }} /></div>
          <p className="pm-stat__s">jam reguler + lembur</p>
        </div>
      </section>

      {PanelTindakan("m")}

      <div className="pm-grid-main">
        {/* kiri: rencana per produk */}
        <div className="pm-stack pm-stack--lg" style={{ minWidth: 0 }}>
          <section aria-labelledby="t-rencana">
            <div className="pm-secthead">
              <h2 id="t-rencana" className="pm-h2">Rencana per produk</h2>
              <p>Diurutkan dari yang paling perlu perhatian</p>
            </div>
            <div className="pm-stack">
              {urut.map((p, i) => <BarisProduk key={p.nama} p={p} iso={iso} i={i + 2} />)}
            </div>
            <div className="pm-panel pm-panel--pad" style={{ marginTop: 16, display: "grid", gap: 10 }}>
              <QuiltLegend />
              <p className="pm-help">Jumlah lembur, ekspres, dan tidak terpenuhi adalah batas maksimum pada skenario permintaan tinggi, bukan angka pasti.</p>
            </div>
          </section>

          {pengadaan.length > 0 && (
            <section aria-labelledby="t-pengadaan">
              <div className="pm-secthead">
                <h2 id="t-pengadaan" className="pm-h2">Jadwal pesan bahan</h2>
                <p>Berdasarkan waktu tunggu tiap bahan</p>
              </div>
              <div className="pm-panel pm-divide" style={{ overflow: "hidden" }}>
                {pengadaan.map((o, i) => {
                  const sisa = sisaHari(o.leadTime, iso);
                  const urgent = mendesak(sisa);
                  return (
                    <div key={i} className={`pm-order ${urgent ? "pm-order--urgent" : ""}`}>
                      <b style={{ color: "var(--pm-ink)", fontWeight: 500 }}>{o.material}</b>
                      <span className="pm-small pm-num">Tunggu {o.leadTime} hari</span>
                      <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span className="pm-num">Pesan sebelum <b style={{ fontWeight: 500, color: "var(--pm-ink)" }}>{tanggalPendek(deadline(o.leadTime, iso))}</b></span>
                        <span className={`pm-chip ${urgent ? "pm-chip--danger" : ""}`}>{labelSisa(sisa)}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* kanan: tindakan + keyakinan skenario + tentang hitungan */}
        <aside className="pm-stack pm-sticky" aria-label="Ringkasan tindakan">
          {PanelTindakan("d")}

          {data.ai?.skenario && (
            <section className="pm-panel pm-panel--pad pm-rise" style={{ "--i": 3 }} aria-labelledby="t-skenario">
              <h2 id="t-skenario" className="pm-h3">Seberapa yakin sistem pada tiap kemungkinan?</h2>
              <p className="pm-small" style={{ margin: "6px 0 18px" }}>
                Sistem menimbang lima kemungkinan permintaan dibanding prakiraan dasar, dan memperbarui bobotnya dari penjualan bulan-bulan terakhir.
              </p>
              <ScenarioWeights mu={data.ai.skenario.mu} bobot={data.ai.skenario.bobot} prior={data.ai.skenario.prior} />
            </section>
          )}

          <PanelTentangHitungan ai={data.ai} meta={data._meta} />
        </aside>
      </div>

      <InputDataModal isOpen={inputOpen} onClose={() => setInputOpen(false)} onRun={onRefresh} />
    </div>
  );
}
