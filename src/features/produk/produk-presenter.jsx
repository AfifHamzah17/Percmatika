// src/features/produk/produk-presenter.jsx
import { useState } from "react";
import { useProdukModel } from "./produk-model";
import ProdukView from "./produk-view";
import InputDataModal from "../../components/modal/InputDataModal";
import ConfirmModal from "../../components/modal/ConfirmModal";

export default function ProdukPresenter() {
  const model = useProdukModel();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <ProdukView
        {...model}
        onImportOpen={() => setModalOpen(true)}
      />
      <InputDataModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onRun={() => setModalOpen(false)}
      />
      <ConfirmModal
        isOpen={model.deleteIdx !== null}
        title="Hapus Produk"
        message={`Apakah Anda yakin ingin menghapus "${model.produkList[model.deleteIdx]?.nama}"?`}
        onConfirm={model.confirmDelete}
        onCancel={() => model.setDeleteIdx(null)}
      />
    </>
  );
}