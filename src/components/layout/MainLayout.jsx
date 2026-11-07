// src/components/layout/MainLayout.jsx
import { Component } from "react";
import AppNav from "./AppNav";
import FABScrollTop from "../FABScrollTop";
import InputProfilUMKM from "../modal/InputProfilUMKM";
import { useAuth } from "../../context/AuthContext";

class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error) { console.error("[ErrorBoundary]", error); }
  render() { return this.state.hasError ? null : this.props.children; }
}
const Safe = ({ children }) => <ErrorBoundary>{children}</ErrorBoundary>;

export default function MainLayout({ children }) {
  const { firstLogin } = useAuth();
  return (
    <div className="pm-shell">
      {/* Onboarding profil usaha: muncul hanya pada login pertama */}
      {firstLogin && <Safe><InputProfilUMKM onComplete={() => {}} /></Safe>}
      <Safe><AppNav /></Safe>
      <main id="konten" className="pm-main">{children}</main>
      <Safe><FABScrollTop /></Safe>
    </div>
  );
}
