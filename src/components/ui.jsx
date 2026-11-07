// src/components/ui.jsx
// Komponen kecil yang dipakai di banyak halaman. Gaya ada di index.css (kelas pm-*).
import { Link } from "react-router-dom";

/** Logo: empat kain perca yang dijahit, satu dipotong diagonal. */
export function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="PercaMatika">
      <rect x="2" y="2" width="13" height="13" rx="3.5" fill="#146b5a" />
      <rect x="17" y="2" width="13" height="13" rx="3.5" fill="#a7d4c7" />
      <rect x="2" y="17" width="13" height="13" rx="3.5" fill="#cfe8e0" />
      <path d="M17 17h9.5a3.5 3.5 0 0 1 3.5 3.5V30H20.5A3.5 3.5 0 0 1 17 26.5V17Z" fill="#c98a1b" />
      <path d="M5 8.5h7M20 8.5h7M5 23.5h7" stroke="#fff" strokeWidth="1.2" strokeDasharray="1.6 2.2" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

/** Satu kotak = satu unit. reg = reguler, ot = lembur, ex = bahan ekspres, bo = tidak terpenuhi. */
export function QuiltUnits({ reg = 0, ot = 0, ex = 0, bo = 0, max = 28 }) {
  const items = [
    ...Array(Math.max(0, Math.round(reg))).fill("reg"),
    ...Array(Math.max(0, Math.round(ot))).fill("ot"),
    ...Array(Math.max(0, Math.round(ex))).fill("ex"),
    ...Array(Math.max(0, Math.round(bo))).fill("bo"),
  ];
  const shown = items.slice(0, max);
  const rest = items.length - shown.length;
  const kata = { reg: "reguler", ot: "lembur", ex: "ekspres", bo: "tidak terpenuhi" };
  const ringkas = `Reguler ${Math.round(reg)}, lembur ${Math.round(ot)}, ekspres ${Math.round(ex)}, tidak terpenuhi ${Math.round(bo)} unit`;
  return (
    <div className="pm-quilt" role="img" aria-label={ringkas}>
      {shown.map((k, i) => <span key={i} className={`pm-sq pm-sq--${k}`} title={kata[k]} />)}
      {rest > 0 && <span className="pm-sq pm-sq--more">+{rest}</span>}
      {items.length === 0 && <span className="pm-small">Tidak ada unit direncanakan</span>}
    </div>
  );
}

export function QuiltLegend() {
  return (
    <div className="pm-legend" aria-hidden="true">
      <span><i className="pm-sq pm-sq--reg" />Reguler</span>
      <span><i className="pm-sq pm-sq--ot" />Lembur</span>
      <span><i className="pm-sq pm-sq--ex" />Bahan ekspres</span>
      <span><i className="pm-sq pm-sq--bo" />Tidak terpenuhi</span>
    </div>
  );
}

export function PageHeader({ judul, deskripsi, aksi }) {
  return (
    <header className="pm-secthead" style={{ marginBottom: 28, alignItems: "flex-end" }}>
      <div style={{ display: "grid", gap: 8 }}>
        <h1 className="pm-h1">{judul}</h1>
        {deskripsi && <p className="pm-lead">{deskripsi}</p>}
      </div>
      {aksi && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{aksi}</div>}
    </header>
  );
}

export function EmptyState({ judul, isi, aksi, to, tombol }) {
  return (
    <div className="pm-empty">
      <div className="pm-empty__art" aria-hidden="true">
        {["reg", "ot", "reg", "ex", "reg", "bo", "reg", "reg", "ot"].map((k, i) => <span key={i} className={`pm-sq pm-sq--${k}`} style={{ width: 14, height: 14 }} />)}
      </div>
      <h2 className="pm-h2">{judul}</h2>
      <p className="pm-lead" style={{ textAlign: "center" }}>{isi}</p>
      {to && <Link className="pm-btn pm-btn--primary pm-btn--lg" to={to}>{tombol}</Link>}
      {aksi}
    </div>
  );
}

export function Skeleton({ h = 20, w = "100%", r }) {
  return <div className="pm-skel" style={{ height: h, width: w, borderRadius: r }} />;
}

/** Bobot skenario: batang = keyakinan sekarang, garis putus = bobot awal sebelum belajar dari bulan terakhir. */
export function ScenarioWeights({ mu, bobot, prior }) {
  if (!mu?.length || !bobot?.length) return null;
  const maks = Math.max(...bobot, ...(prior || []), 0.01);
  const AREA = 108; // px tinggi area batang
  const px = (v) => Math.max(3, (v / maks) * AREA);
  const puncak = bobot.indexOf(Math.max(...bobot));
  const nama = (m) => {
    const d = Math.round((m - 1) * 100);
    return d === 0 ? "sesuai prakiraan" : d > 0 ? `+${d}%` : `${d}%`;
  };
  return (
    <figure style={{ margin: 0 }}>
      <div className="pm-scen" role="img"
        aria-label={`Bobot skenario: ${mu.map((m, i) => `${nama(m)} ${Math.round(bobot[i] * 100)} persen`).join(", ")}`}>
        {bobot.map((b, i) => (
          <div className="pm-scen__col" key={i}>
            <span className="pm-scen__pct">{Math.round(b * 100)}%</span>
            <div style={{ position: "relative", width: "100%", height: AREA, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div className="pm-scen__bar" style={{ height: px(b), opacity: i === puncak ? 1 : 0.5 }} />
              {prior?.[i] != null && <i className="pm-scen__prior" style={{ bottom: px(prior[i]) }} />}
            </div>
          </div>
        ))}
      </div>
      <div className="pm-scenlabels">{mu.map((m, i) => <span key={i}>{nama(m)}</span>)}</div>
      {prior && <figcaption className="pm-help" style={{ marginTop: 10 }}>Garis putus: bobot awal sebelum sistem belajar dari penjualan bulan terakhir.</figcaption>}
    </figure>
  );
}
