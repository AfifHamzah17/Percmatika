// src/lib/format.js
export const rupiah = (v) => `Rp${Math.round(v || 0).toLocaleString("id-ID")}`;

/** Rp 2,70 jt — dua desimal, koma desimal Indonesia. */
export const rupiahJuta = (v) => `Rp${((v || 0) / 1e6).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} jt`;

export const angka = (v, digit = 0) =>
  (v ?? 0).toLocaleString("id-ID", { minimumFractionDigits: digit, maximumFractionDigits: digit });

export const persen = (v, digit = 0) => `${angka(v, digit)}%`;

export function tanggalPendek(d) {
  const b = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return `${d.getDate()} ${b[d.getMonth()]}`;
}
