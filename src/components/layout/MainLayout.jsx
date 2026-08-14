// src/components/layout/MainLayout.jsx
import { useState, useEffect, Component } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import FABScrollTop from "../FABScrollTop";
import InputProfilUMKM from "../modal/InputProfilUMKM";
import { useAuth } from "../../context/AuthContext";

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error) {
    console.error("[ErrorBoundary]", error);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
function Safe({ children }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

export default function MainLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { firstLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // Setelah modal onboarding selesai / skip, firstLogin otomatis false
  // karena completeProfile() di AuthContext sudah update state user
  const handleOnboardingComplete = () => {
    // Tidak perlu navigasi manual — modal hilang otomatis karena
    // firstLogin berubah jadi false
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Modal Onboarding: muncul HANYA jika firstLogin === true ── */}
      {firstLogin && (
        <Safe>
          <InputProfilUMKM onComplete={handleOnboardingComplete} />
        </Safe>
      )}

      <Safe>
        <Navbar
          onToggleSidebar={() => {
            if (window.innerWidth < 1024) setMobileOpen(!mobileOpen);
            else setSidebarCollapsed(!sidebarCollapsed);
          }}
        />
      </Safe>

      <div className="flex">
        <Safe>
          <Sidebar
            isCollapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            isMobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
          />
        </Safe>

        <main className="flex-1 min-w-0 min-h-[calc(100vh-4rem)] p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      <Safe>
        <FABScrollTop />
      </Safe>
    </div>
  );
}