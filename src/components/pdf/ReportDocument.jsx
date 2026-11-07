//src/components/pdf/ReportDocument.jsx
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";

// ── Cache logo base64 ──
let _logo = null;
async function getLogo() {
  if (_logo) return _logo;
  try {
    const url = new URL("../../assets/hero.png", import.meta.url).href;
    const resp = await fetch(url);
    const blob = await resp.blob();
    _logo = await new Promise((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result);
      r.readAsDataURL(blob);
    });
    return _logo;
  } catch { return null; }
}

// ── Register custom font jika ada Inter di sistem ──
Font.registerHyphenation("Inter", {
  family: "Inter",
  subsets: ["latin"],
  hyphenation: "always",
});

const styles = StyleSheet.create({
  page: { padding: 0, fontSize: 9, fontFamily: "Helvetica", color: "#1e293b" },
  headerSection: {
    backgroundColor: "#f8fafc",
    padding: "40 40 30 40",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    marginBottom: 0,
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    objectFit: "contain",
  },
  headerTexts: { flex: 1 },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#0f172a", marginBottom: 2 },
  subtitle: { fontSize: 9, color: "#64748b" },
  divider: { height: 2, backgroundColor: "#3b82f6", marginVertical: 8 },
  sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#374151", marginTop: 14, marginBottom: 8 },
  statGrid: { flexDirection: "row", gap: 8, marginBottom: 14 },
  statBox: { flex: 1, padding: 10, borderRadius: 6, border: "1px solid #e5e7eb", backgroundColor: "#ffffff" },
  statLabel: { fontSize: 7, color: "#9ca3af", textTransform: "uppercase", marginBottom: 2 },
  statValue: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  table: { marginBottom: 8 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f3f4f6", borderBottomStyle: "solid" },
  tableHeader: { backgroundColor: "#f9fafb" },
  cell: { flex: 1, padding: 5, fontSize: 8 },
  cellBold: { fontFamily: "Helvetica-Bold" },
  cellCenter: { textAlign: "center" },
  barContainer: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
  barTrack: { flex: 1, height: 7, backgroundColor: "#f1f5f9", borderRadius: 4 },
  barFill: { height: "100%", borderRadius: 4 },
  barLabel: { width: 70, fontSize: 7 },
  barValue: { width: 45, fontSize: 7, textAlign: "right" },
  quoteBox: { borderLeftWidth: 3, borderLeftColor: "#f59e0b", backgroundColor: "#fffbeb", padding: 8, borderRadius: 4, marginBottom: 8 },
  quoteTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#92400e", marginBottom: 2 },
  quoteBody: { fontSize: 8, color: "#78716c", lineHeight: 1.4 },
  pageFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 40,
    paddingRight: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#9ca3af",
  },
  urgent: { color: "#dc2626" },
});

const PB = { P10: "#b5d4f4", P50: "#378add", P90: "#0c447c" };

function StatBox({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}
function TH({ cols }) {
  return (
    <View style={[styles.tableRow, styles.tableHeader]}>
      {cols.map((c, i) => (
        <View key={i} style={[styles.cell, styles.cellBold, styles.cellCenter]}>
          <Text>{c}</Text>
        </View>
      ))}
    </View>
  );
}
function TR({ cols, urgent }) {
  return (
    <View style={styles.tableRow}>
      {cols.map((c, i) => (
        <View key={i} style={[styles.cell, i === 0 ? styles.cellBold : null, i > 0 ? styles.cellCenter : null]}>
          <Text style={urgent && i === 2 ? styles.urgent : null}>{c}</Text>
        </View>
      ))}
    </View>
  );
}
function Bar({ label, value, max, color }) {
  return (
    <View style={styles.barContainer}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${max > 0 ? (value / max) * 100 : 0}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.barValue}>{value} unit</Text>
    </View>
  );
}

export async function generatePdf(data) {
  const logoUrl = await getLogo();
  const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Dec"];
  const td = new Date(data.header.targetDate);
  const period = `${BULAN[td.getMonth()]} ${td.getFullYear()}`;

  const Doc = (
    <Document size="A4">
      {/* ══════ PAGE 1: COVER ══════ */}
      <Page style={styles.page} wrap={false}>
        <View style={styles.headerSection}>
          <View style={styles.headerInner}>
            {logoUrl && <Image src={logoUrl} style={styles.logoBox} />}
            <View style={styles.headerTexts}>
              <Text style={styles.title}>Laporan Rencana Produksi Optimal</Text>
              <Text style={styles.subtitle}>
                {data.header.umkm} · Periode: {period}
              </Text>
              <Text style={[styles.subtitle, { fontStyle: "italic" }]}>
                {data.header.meta}
              </Text>
            </View>
          </View>
        </View>

        {/* Body content starts below header */}
        <View style={{ padding: "20px 40px 40px 40px" }}>
          <Text style={styles.sectionTitle}>Ringkasan</Text>
          <View style={styles.statGrid}>
            <StatBox label="Estimasi Keuntungan" value={data.estimasiKeuntungan} />
            <StatBox label={`Produksi (${data.produkList.length} produk)`} value={`${data.produkList.reduce((s, p) => s + (p.rekomendasi?.x_reguler || 0), 0)} unit`} />
            <StatBox label="Jam Lembur" value={`${data.produkList.reduce((s, p) => s + (p.rekomendasi?.y_lembur || 0) * (p.waktuJam || 0), 0)} jam`} />
            <StatBox label="Utilisasi" value={`${Math.round((data.produkList.reduce((s, p) => s + (p.rekomendasi?.x_reguler || 0) * (p.waktuJam || 0), 0) + data.produkList.reduce((s, p) => s + (p.rekomendasi?.y_lembur || 0) * (p.waktuJam || 0), 0)) / (data.kapasitas.reguler_maks + data.kapasitas.lembur_maks) * 100)}%`} />
          </View>

          <Text style={styles.sectionTitle}>Alokasi Produksi Per Produk</Text>
          <View style={styles.table}>
            <TH cols={["Produk", "Reguler (x_j)", "Lembur (y_js)", "Ekspres (e_js)", "Backorder (b_js)"]} />
            {data.produkList.map((p, i) => (
              <TR key={p.nama} cols={[p.nama, String(p.rekomendasi?.x_reguler ?? "-"), String(p.rekomendasi?.y_lembur ?? "-"), p.rekomendasi?.e_expres_display ?? "-", String(p.rekomendasi?.b_backorder ?? "-")]} bold={i === 0} />
            ))}
          </View>
          <Text style={{ fontSize: 7, color: "#9ca3af", marginTop: 8 }}>
            Kapasitas: {data.kapasitas.reguler_maks} jam reguler + {data.kapasitas.lembur_maks} jam lembur. Angka produksi merupakan hasil optimasi TSSP-PHA yang memaksimalkan expected profit.
          </Text>
        </View>

        <View style={styles.pageFooter} fixed>
          <Text>PercaMatika — Optimasi Produksi UMKM</Text>
          <Text>Dicetak otomatis oleh sistem</Text>
          <Text render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>

      {/* ══════ DETAIL PER PRODUK ══════ */}
      {data.produkList.map((p) => (
        <Page key={p.nama} size="A4" style={styles.page} wrap>
          <View style={{ padding: "20px 40px 40px 40px" }}>
            <Text style={[styles.title, { fontSize: 14 }]}>{p.nama}</Text>
            <Text style={styles.subtitle}>
              Margin/jam: Rp {(p.marginJam || 0).toLocaleString()} · Lead Time: {p.leadTime} hari
            </Text>
            <View style={[styles.divider, { marginVertical: 10 }]} />
          </View>

          <View style={{ padding: "0 40px 40px 40px" }}>
            <Text style={styles.sectionTitle}>Keputusan Produksi</Text>
            <View style={styles.table}>
              <TH cols={["Variabel", "Nilai", "Keterangan"]} />
              <TR cols={["Produksi Reguler (x_j)", String(p.rekomendasi?.x_reguler ?? "-"), "Keputusan first-stage"]} />
              <TR cols={["Tambah Lembur (y_js)", String(p.rekomendasi?.y_lembur ?? "-"), p.rekomendasi?.y_lembur > 0 ? "Perlu kapasitas tambahan" : "Tidak perlu"]} />
              <TR cols={["Pengadaan Cepat (e_js)", String(p.rekomendasi?.e_expres_display ?? "-"), p.rekomendasi?.e_expres_label ?? "-"]} />
              <TR cols={["Backorder (b_js)", String(p.rekomendasi?.b_backorder ?? "-"), p.rekomendasi?.b_backorder > 0 ? "Diterima" : "Tidak ada"]} />
            </View>

            {p.forecast && (
              <>
                <Text style={styles.sectionTitle}>Skenario Permintaan</Text>
                <Bar label="P10 (pesimis)" value={p.forecast.P10} max={p.forecast.P90} color={PB.P10} />
                <Bar label="P50 (realistis)" value={p.forecast.P50} max={p.forecast.P90} color={PB.P50} />
                <Bar label="P90 (optimis)" value={p.forecast.P90} max={p.forecast.P90} color={PB.P90} />
              </>
            )}

            {(p.quote || p.note) && (
              <View style={styles.quoteBox}>
                <Text style={styles.quoteTitle}>{p.quote?.title || "Catatan"}</Text>
                <Text style={styles.quoteBody}>{p.quote?.body || p.note}</Text>
              </View>
            )}
          </View>

          <View style={styles.pageFooter} fixed>
            <Text>PercaMatika — {p.nama}</Text>
            <Text render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} / ${totalPages}`} />
          </View>
        </Page>
      ))}

      {/* ══════ PENGADAAN ══════ */}
      <Page size="A4" style={[styles.page, { padding: "20px 40px 60px 40px" }]}>
        <View style={{ padding: "0 40px 20px 40px" }}>
          <Text style={[styles.title, { marginBottom: 12 }]}>Jadwal Pengadaan Bahan Baku</Text>
          <Text style={[styles.subtitle, { marginBottom: 16 }]}>Apa yang harus dipesan dan kapan</Text>
        </View>
        <View style={{ padding: "0 40px 40px 40px" }}>
          <View style={styles.table}>
            <TH cols={["Material", "Tipe", "Deadline"]} />
            {data.pengadaan?.map((item, i) => (
              <TR key={i} cols={[item.material, item.urgent ? "Ekspres" : "Reguler", item.urgent ? `Pesan sekarang — lead time ${item.leadTime} hari` : `Paling lambat ${item.leadTime} hari sebelum produksi`]} urgent={item.urgent} />
            ))}
          </View>

          <View style={{ marginTop: 24, borderTop: "1px solid #f3f4f6", paddingTop: 12, flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 7, color: "#9ca3af" }}>
              Dokumen ini digunakan untuk keperluan internal. Distribusi tanpa izin tidak diperkenankan.
            </Text>
            <Text style={{ fontSize: 7, color: "#9ca3af" }}>
              Dicetak: {new Date().toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" })}
            </Text>
          </View>
        </View>

        <View style={styles.pageFooter} fixed>
          <Text>PercaMatika — Jadwal Pengadaan</Text>
          <Text render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );

  const blob = await pdf(Doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `laporan_produksi_${period.replace(" ", "_")}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}