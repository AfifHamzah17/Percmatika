// src/features/analitik/analitik-view.jsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";
import { AlertTriangle } from "lucide-react";
import { EmptyState, PageHeader, ScenarioWeights } from "../../components/ui";
import { rupiahJuta, rupiah, angka } from "../../lib/format";

const C = { aksen: "#146b5a", aksen2: "#3f9a86", aksenMuda: "#a7d4c7", aksenSangatMuda: "#cfe8e0", lembur: "#c98a1b", tinta: "#18201c", garis: "#e6ebe8", teks: "#6d7a73" };
const axisTick = { fontSize: 12, fill: C.teks };

function ChartTip({ active, payload, label, unit = "unit" }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid var(--pm-line)", borderRadius: 12, padding: "10px 12px", boxShadow: "var(--pm-shadow-pop)", fontSize: 13 }}>
      <p style={{ fontWeight: 600, color: "var(--pm-ink)", marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ display: "flex", justifyContent: "space-between", gap: 24, color: "var(--pm-text)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><i style={{ width: 9, height: 9, borderRadius: 3, background: p.color || p.payload?.fill }} />{p.name}</span>
          <b className="pm-num" style={{ fontWeight: 500 }}>{typeof p.value === "number" ? angka(p.value, p.value % 1 ? 1 : 0) : p.value} {unit}</b>
        </p>
      ))}
    </div>
  );
}
const JamTip = (props) => <ChartTip {...props} unit="jam" />;
const RpJamTip = (props) => <ChartTip {...props} unit="Rp/jam" />;

function Section({ id, judul, ket, children }) {
  return (
    <section aria-labelledby={id}>
      <div className="pm-secthead"><h2 id={id} className="pm-h2">{judul}</h2>{ket && <p>{ket}</p>}</div>
      {children}
    </section>
  );
}

/* tangga nilai: EEV (rencana rata-rata) → RP (rencana ini) → WS (tahu pasti) */
function SkalaNilai({ eev, rp, ws }) {
  const vss = rp - eev, vpi = ws - rp, total = ws - eev || 1;
  const a = Math.max(0, (vss / total) * 100), b = Math.max(0, (vpi / total) * 100);
  return (
    <div className="pm-panel pm-panel--pad">
      <div style={{ display: "flex", height: 14, borderRadius: 8, overflow: "hidden", background: "var(--pm-surface-2)" }} role="img"
        aria-label={`Tambahan nilai perencanaan ${rupiahJuta(vss)}, potensi tambahan bila permintaan diketahui pasti ${rupiahJuta(vpi)}`}>
        <i style={{ width: `${a}%`, background: C.aksen, transition: "width .8s var(--pm-ease)" }} />
        <i style={{ width: `${b}%`, background: C.aksenMuda, transition: "width .8s var(--pm-ease)" }} />
      </div>
      <dl style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginTop: 18 }}>
        {[
          ["Rencana rata-rata", eev, "Memakai permintaan rata-rata saja"],
          ["Rencana ini", rp, "Menimbang beberapa skenario"],
          ["Bila permintaan pasti diketahui", ws, "Batas atas teoritis"],
        ].map(([k, v, s], i) => (
          <div key={k}>
            <dt className="pm-small">{k}</dt>
            <dd className="pm-num" style={{ fontFamily: "var(--font-mono)", fontSize: 19, color: i === 1 ? "var(--pm-accent)" : "var(--pm-ink)", marginTop: 2 }}>{rupiahJuta(v)}</dd>
            <p className="pm-help">{s}</p>
          </div>
        ))}
      </dl>
      <div className="pm-legend" style={{ marginTop: 16 }}>
        <span><i className="pm-sq" style={{ background: C.aksen }} />Tambahan dari menimbang skenario: <b className="pm-num">{rupiahJuta(vss)}</b></span>
        <span><i className="pm-sq" style={{ background: C.aksenMuda }} />Masih bisa naik bila permintaan pasti: <b className="pm-num">{rupiahJuta(vpi)}</b></span>
      </div>
    </div>
  );
}

function Penjelasan({ judul, isi }) {
  return (
    <div className="pm-panel pm-panel--pad" style={{ borderLeft: `3px solid ${C.aksenMuda}`, borderRadius: "6px 18px 18px 6px" }}>
      <h3 className="pm-h3">{judul}</h3>
      <p className="pm-small" style={{ marginTop: 6 }}>{isi}</p>
    </div>
  );
}

export default function AnalitikView({ data, onGoToDashboard }) {
  if (!data) {
    return (
      <EmptyState
        judul="Belum ada hasil untuk dianalisis"
        isi="Hitung rencana produksi di halaman Rencana dulu. Setelah itu grafik dan perbandingan akan muncul di sini."
        aksi={<button type="button" className="pm-btn pm-btn--primary pm-btn--lg" onClick={onGoToDashboard}>Buka halaman Rencana</button>}
      />
    );
  }
  const { metrics, forecastVsProduksi, marginPerJam, kapasitasBreakdown, tableData, kapasitas, ai, isMock } = data;
  const marginWarna = [C.aksen, C.aksen2, "#77b9a8", C.aksenMuda, C.aksenSangatMuda, "#e3f0ec"];
  const pr = ai?.prakiraan, op = ai?.optimasi, sk = ai?.skenario;

  return (
    <div className="pm-stack pm-stack--lg">
      <PageHeader judul="Analitik" deskripsi="Mengapa rencana bulan ini begini, dan seberapa jauh angkanya bisa dipercaya." />

      {isMock && (
        <div className="pm-notice" role="status"><AlertTriangle size={18} strokeWidth={1.75} style={{ flex: "none", marginTop: 1 }} /><span><b>Data contoh.</b> Grafik di bawah belum berasal dari hitungan usaha Anda.</span></div>
      )}

      <Section id="a-nilai" judul="Nilai perencanaan" ket="Dihitung di dalam model, bukan jaminan hasil">
        <SkalaNilai eev={metrics.eev} rp={metrics.rp} ws={metrics.ws} />
      </Section>

      {(pr || sk || op) && (
        <Section id="a-ai" judul="Seberapa bisa dipercaya?" ket="Tentang prakiraan dan optimasi di balik rencana">
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            {pr && (
              <div className="pm-panel pm-panel--pad">
                <h3 className="pm-h3">Akurasi prakiraan permintaan</h3>
                <p className="pm-stat__v" style={{ fontSize: 30, margin: "10px 0 6px" }}>{pr.mase != null ? angka(pr.mase, 2) : "–"}<small>MASE</small></p>
                <p className="pm-small">
                  Model: <b style={{ color: "var(--pm-ink)", fontWeight: 500 }}>{pr.model}</b>
                  {pr.bobot_lstm != null && <> (bobot LSTM {angka(pr.bobot_lstm * 100)}%)</>}.
                  {pr.mase != null && (pr.mase < 1
                    ? " Nilai di bawah 1 berarti lebih baik daripada menebak seperti bulan sebelumnya."
                    : " Nilai 1 atau lebih berarti belum lebih baik daripada menebak seperti bulan sebelumnya.")}
                </p>
                {pr.bulan_uji && <p className="pm-help" style={{ marginTop: 10 }}>Diuji pada {pr.bulan_uji} bulan terakhir yang tidak dipakai saat melatih model.</p>}
              </div>
            )}
            {op && (
              <div className="pm-panel pm-panel--pad">
                <h3 className="pm-h3">Kualitas optimasi</h3>
                <p style={{ margin: "10px 0 6px" }}>
                  <span className={`pm-chip ${op.status === "natural" ? "pm-chip--accent" : "pm-chip--warn"}`}>{op.status === "natural" ? "Konvergen" : "Dipaksa sepakat"}</span>
                </p>
                <p className="pm-small">
                  {op.status === "natural"
                    ? <>Semua skenario menyepakati rencana yang sama setelah <b className="pm-num">{op.iterasi}</b> iterasi{op.gap_ef_pct != null && <>, hanya <b className="pm-num">{angka(op.gap_ef_pct, 2)}%</b> di bawah optimum eksak</>}.</>
                    : "Algoritma tidak mencapai kesepakatan sendiri, sehingga rencana disatukan secara paksa. Periksa ulang hasilnya sebelum dipakai."}
                </p>
                <p className="pm-help" style={{ marginTop: 10 }}>Metode: {op.metode === "PHA" ? "Progressive Hedging (PHA)" : op.metode}</p>
              </div>
            )}
            {sk && (
              <div className="pm-panel pm-panel--pad">
                <h3 className="pm-h3">Keyakinan pada tiap skenario</h3>
                <div style={{ marginTop: 16 }}><ScenarioWeights mu={sk.mu} bobot={sk.bobot} prior={sk.prior} /></div>
              </div>
            )}
          </div>
        </Section>
      )}

      <Section id="a-fc" judul="Prakiraan dan keputusan produksi" ket="Rentang permintaan dibandingkan jumlah yang direncanakan">
        <div className="pm-panel pm-panel--pad">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={forecastVsProduksi} barGap={2} barCategoryGap="22%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.garis} vertical={false} />
              <XAxis dataKey="nama" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(24,32,28,.04)" }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12.5, paddingTop: 8 }} />
              <Bar dataKey="P10" fill={C.aksenSangatMuda} radius={[3, 3, 0, 0]} name="Permintaan rendah (P10)" />
              <Bar dataKey="P50" fill={C.aksenMuda} radius={[3, 3, 0, 0]} name="Permintaan tengah (P50)" />
              <Bar dataKey="P90" fill={C.aksen2} radius={[3, 3, 0, 0]} name="Permintaan tinggi (P90)" />
              <Bar dataKey="produksi" fill={C.tinta} radius={[3, 3, 0, 0]} name="Produksi direncanakan" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <Section id="a-margin" judul="Produk mana yang diprioritaskan" ket="Keuntungan per jam kerja">
        <div className="pm-panel pm-panel--pad">
          <ResponsiveContainer width="100%" height={46 * marginPerJam.length + 40}>
            <BarChart data={marginPerJam} layout="vertical" margin={{ left: 8, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.garis} horizontal={false} />
              <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)} rb`} />
              <YAxis type="category" dataKey="nama" tick={axisTick} axisLine={false} tickLine={false} width={108} />
              <Tooltip content={<RpJamTip />} cursor={{ fill: "rgba(24,32,28,.04)" }} />
              <Bar dataKey="margin" radius={[0, 5, 5, 0]} name="Margin per jam">
                {marginPerJam.map((_, i) => <Cell key={i} fill={marginWarna[i % marginWarna.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <Section id="a-kap" judul="Pembagian jam kerja" ket={`Terpakai ${angka(kapasitas.totalJamReg + kapasitas.totalJamLem)} dari ${angka(kapasitas.regulerMaks + kapasitas.lemburMaks)} jam`}>
        <div className="pm-panel pm-panel--pad">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kapasitasBreakdown} barCategoryGap="22%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.garis} vertical={false} />
              <XAxis dataKey="nama" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} />
              <Tooltip content={<JamTip />} cursor={{ fill: "rgba(24,32,28,.04)" }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12.5, paddingTop: 8 }} />
              <Bar dataKey="reguler" stackId="kap" fill={C.aksen} name="Jam reguler" />
              <Bar dataKey="lembur" stackId="kap" fill={C.lembur} radius={[3, 3, 0, 0]} name="Jam lembur" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <Section id="a-tabel" judul="Detail per produk">
        <div className="pm-panel" style={{ overflow: "hidden" }}>
          <div className="pm-tablewrap">
            <table className="pm-table">
              <thead>
                <tr>
                  <th>Produk</th><th className="r">Prakiraan (P50)</th><th className="r">Produksi</th><th className="r">Lembur</th>
                  <th className="r">Tak terpenuhi</th><th className="r">Ekspres</th><th className="r">Jam</th><th className="r">Margin/jam</th><th className="r">Laba</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((r) => (
                  <tr key={r.nama}>
                    <td style={{ fontWeight: 500, color: "var(--pm-ink)", whiteSpace: "nowrap" }}>{r.nama}</td>
                    <td className="r">{r.forecastP50}</td>
                    <td className="r" style={{ color: "var(--pm-ink)", fontWeight: 500 }}>{r.produksi}</td>
                    <td className="r" style={{ color: r.lembur ? "var(--pm-warn)" : undefined }}>{r.lembur || "–"}</td>
                    <td className="r" style={{ color: r.backorder ? "var(--pm-danger)" : undefined }}>{r.backorder || "–"}</td>
                    <td className="r">{r.ekspres}</td>
                    <td className="r">{r.jamTerpakai}</td>
                    <td className="r">{rupiah(r.marginJam)}</td>
                    <td className="r" style={{ color: "var(--pm-accent)", fontWeight: 500, whiteSpace: "nowrap" }}>{r.estimasiProfit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section id="a-istilah" judul="Arti istilah">
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          <Penjelasan judul="Nilai perencanaan (VSS)" isi="Selisih laba antara rencana yang menimbang beberapa skenario dan rencana yang hanya memakai permintaan rata-rata. Makin besar, makin berguna menimbang ketidakpastian." />
          <Penjelasan judul="Potensi tambahan (VPI)" isi="Selisih laba bila permintaan bisa diketahui pasti di awal bulan. Nilai kecil berarti rencana ini sudah menangkap hampir semua nilai yang mungkin diraih." />
          <Penjelasan judul="Manfaat belajar (BIB)" isi="Selisih laba antara rencana dengan bobot skenario yang diperbarui dari penjualan terbaru dan rencana dengan bobot awal tetap. Pada uji dengan data survei kami, selisihnya belum berbeda nyata dari nol, jadi bukan janji keuntungan." />
        </div>
      </Section>

      <footer className="pm-small" style={{ borderTop: "1px solid var(--pm-line)", paddingTop: 20, maxWidth: "80ch" }}>
        Ukuran VSS dan VPI mengikuti kerangka evaluasi pemrograman stokastik dua tahap (Birge & Louveaux, 2011). Halaman ini menggambarkan satu periode perencanaan; analisis beberapa bulan berjalan akan ditambahkan kemudian.
      </footer>
    </div>
  );
}
