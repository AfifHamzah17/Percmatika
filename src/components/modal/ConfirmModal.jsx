//src/components/modal/ConfirmModal.jsx
export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText, confirmColor }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full modal-anim">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="px-4 py-2.5 text-sm text-gray-600 font-medium hover:text-gray-800 rounded-xl hover:bg-gray-50 transition-colors">Batal</button>
          <button onClick={onConfirm} className={`px-4 py-2.5 text-sm text-white font-medium rounded-xl transition-colors ${confirmColor || "bg-red-600 hover:bg-red-700"}`}>{confirmText || "Hapus"}</button>
        </div>
      </div>
    </div>
  );
}