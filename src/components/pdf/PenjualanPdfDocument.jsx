// src/components/pdf/PenjualanPdfDocument.jsx
// Template PDF untuk export data penjualan
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e3a5f",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: "#6b7280",
  },
  table: {
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e40af",
  },
  headerCell: {
    flex: 1,
    padding: 8,
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerCellNo: {
    width: 35,
    padding: 8,
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    borderBottom: "1px solid #f3f4f6",
  },
  rowAlt: {
    flexDirection: "row",
    borderBottom: "1px solid #f3f4f6",
    backgroundColor: "#f0f7ff",
  },
  cell: {
    flex: 1,
    padding: 7,
    fontSize: 9,
    color: "#374151",
  },
  cellNo: {
    width: 35,
    padding: 7,
    fontSize: 9,
    color: "#6b7280",
    textAlign: "center",
  },
  cellRight: {
    flex: 1,
    padding: 7,
    fontSize: 9,
    color: "#374151",
    textAlign: "right",
  },
  footer: {
    marginTop: 16,
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "center",
  },
});

export default function PenjualanPdfDocument({ rows, namaUmkm, tanggalExport }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Laporan Data Penjualan</Text>
          <Text style={styles.subtitle}>{namaUmkm} — Diekspor: {tanggalExport}</Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Header row */}
          <View style={styles.tableHeader}>
            <Text style={styles.headerCellNo}>No</Text>
            <Text style={styles.headerCell}>Produk</Text>
            <Text style={styles.headerCell}>Bulan</Text>
            <Text style={styles.headerCell}>Tahun</Text>
            <Text style={[styles.headerCell, { textAlign: "right" }]}>Jumlah Terjual</Text>
          </View>

          {/* Data rows */}
          {rows.map((row, i) => {
            const rowStyle = i % 2 === 0 ? styles.row : styles.rowAlt;
            return (
              <View key={i} style={rowStyle}>
                <Text style={styles.cellNo}>{row.no}</Text>
                <Text style={styles.cell}>{row.produk}</Text>
                <Text style={styles.cell}>{row.bulan}</Text>
                <Text style={styles.cell}>{row.tahun}</Text>
                <Text style={styles.cellRight}>{row.jumlah}</Text>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Dokumen ini dihasilkan otomatis oleh PercaMatika — Sistem Optimasi Persediaan Perca UMKM
        </Text>
      </Page>
    </Document>
  );
}