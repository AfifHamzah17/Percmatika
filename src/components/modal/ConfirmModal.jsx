//src/components/modal/ConfirmModal.jsx
import { useEffect, useRef } from "react";

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText, confirmColor }) {
  const batal = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    batal.current?.focus();
    const esc = (e) => { if (e.key === "Escape") onCancel?.(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [isOpen, onCancel]);
  if (!isOpen) return null;
  const aman = typeof confirmColor === "string" && !confirmColor.includes("red");
  return (
    <div className="pm-modal" role="alertdialog" aria-modal="true" aria-labelledby="cm-judul" aria-describedby="cm-isi">
      <div className="pm-modal__scrim" onClick={onCancel} />
      <div className="pm-modal__box">
        <h3 id="cm-judul" className="pm-h2">{title}</h3>
        <p id="cm-isi" className="pm-lead" style={{ marginTop: 8 }}>{message}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
          <button ref={batal} type="button" className="pm-btn pm-btn--ghost" onClick={onCancel}>Batal</button>
          <button type="button" className={`pm-btn ${aman ? "pm-btn--primary" : "pm-btn--danger"}`} onClick={onConfirm}>{confirmText || "Hapus"}</button>
        </div>
      </div>
    </div>
  );
}
