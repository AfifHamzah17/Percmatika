// src/components/FABScrollTop.jsx
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function FABScrollTop() {
  const [tampil, setTampil] = useState(false);
  useEffect(() => {
    const fn = () => setTampil(window.scrollY > 480);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  if (!tampil) return null;
  return (
    <button type="button" aria-label="Kembali ke atas" className="pm-iconbtn fab-enter"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{ position: "fixed", right: 16, bottom: 86, zIndex: 35, width: 44, height: 44, background: "var(--pm-ink)", color: "#fff", boxShadow: "var(--pm-shadow-pop)" }}>
      <ArrowUp size={20} strokeWidth={1.75} />
    </button>
  );
}
