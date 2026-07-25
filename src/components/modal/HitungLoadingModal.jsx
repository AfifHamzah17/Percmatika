// src/components/modal/HitungLoadingModal.jsx
import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

const STEPS = [
  "Mengambil forecast demand musiman...",
  "Menyusun 5 skenario permintaan...",
  "Mengoptimasi jadwal produksi (TSSP-PHA)...",
  "Menghitung rekomendasi lembur & ekspedisi...",
  "Menyelesaikan perhitungan...",
];

export default function HitungLoadingModal() {
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress bar naik bertahap, melambat mendekati 90% (menunggu API
    // beneran selesai, bukan janji waktu pasti -- supaya tidak "bohong"
    // kalau ternyata prosesnya lebih lama dari estimasi).
    const stepTimer = setInterval(() => {
      setStepIdx((i) => (i < STEPS.length - 1 ? i + 1 : i));
    }, 3500);

    const progressTimer = setInterval(() => {
      setProgress((p) => (p < 90 ? p + (90 - p) * 0.08 : p));
    }, 300);

    return () => { clearInterval(stepTimer); clearInterval(progressTimer); };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Sparkles size={28} className="text-blue-600 animate-pulse" />
        </div>

        <h3 className="text-base font-bold text-gray-800 mb-1">Sedang Menghitung...</h3>
        <p className="text-sm text-gray-500 mb-5 min-h-[20px]">{STEPS[stepIdx]}</p>

        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-3">Biasanya perlu beberapa detik hingga sekitar setengah menit</p>
      </div>
    </div>
  );
}
