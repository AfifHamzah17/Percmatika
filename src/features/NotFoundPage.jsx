// src/features/NotFoundPage.jsx
import { EmptyState } from "../components/ui";

export default function NotFoundPage() {
  return <EmptyState judul="Halaman tidak ditemukan" isi="Alamat yang Anda buka tidak ada atau sudah dipindahkan. Kembali ke rencana produksi bulan ini." to="/" tombol="Ke halaman Rencana" />;
}
