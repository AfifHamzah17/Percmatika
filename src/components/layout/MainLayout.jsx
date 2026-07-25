// src/components/layout/MainLayout.jsx
import { useState, useEffect, Component } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import FABScrollTop from "../FABScrollTop";
import OnboardingWizard from "../modal/OnboardingWizard";

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error) { console.error("[ErrorBoundary]", error); }
  render() { if (this.state.hasError) return null; return this.props.children; }
}
function Safe({ children }) { return <ErrorBoundary>{children}</ErrorBoundary>; }

export default function MainLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Safe><OnboardingWizard /></Safe>

      <Safe>
        <Navbar onToggleSidebar={() => {
          if (window.innerWidth < 1024) setMobileOpen(!mobileOpen);
          else setSidebarCollapsed(!sidebarCollapsed);
        }} />
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

      <Safe><FABScrollTop /></Safe>
    </div>
  );
}