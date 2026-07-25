// src/features/analitik/analitik-presenter.jsx
import { useNavigate } from "react-router-dom";
import { useAnalitikModel } from "./analitik-model";
import AnalitikView from "./analitik-view";

export default function AnalitikPresenter() {
  const { data } = useAnalitikModel();
  const navigate = useNavigate();

  return (
    <AnalitikView
      data={data}
      onGoToDashboard={() => navigate("/")}
    />
  );
}