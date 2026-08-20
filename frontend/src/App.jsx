import React, { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { Header } from "./components/layout/Header";
import { LiveRibbon } from "./components/layout/LiveRibbon";
import { Sidebar } from "./components/layout/Sidebar";

import { DashboardPage } from "./pages/DashboardPage";
import { VehiclesPage } from "./pages/VehiclesPage";
import { RoutesPage } from "./pages/RoutesPage";
import { CustomersPage } from "./pages/CustomersPage";
import { DriversPage } from "./pages/DriversPage";
import { InsightsPage } from "./pages/InsightsPage";
import { QuickBooksPage } from "./pages/QuickBooksPage";
import { ReportsPage } from "./pages/ReportsPage";

import { api } from "./services/api";

export function Fleet360App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState("light"); // Default to bright theme
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    // Ensure document element starts in bright light mode
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      setTheme("light");
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  };

  const loadSummary = async () => {
    const sum = await api.getDashboardSummary();
    setSummary(sum);
  };

  useEffect(() => {
    loadSummary();
    const interval = setInterval(() => {
      loadSummary();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderCurrentPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage onNavigate={setActivePage} />;
      case "vehicles":
        return <VehiclesPage />;
      case "routes":
        return <RoutesPage />;
      case "customers":
        return <CustomersPage />;
      case "drivers":
        return <DriversPage />;
      case "insights":
        return <InsightsPage onNavigate={setActivePage} />;
      case "quickbooks":
        return <QuickBooksPage />;
      case "reports":
        return <ReportsPage />;
      default:
        return <DashboardPage onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1419] text-slate-900 dark:text-[#F5F6F8] flex flex-col font-sans transition-colors duration-200 selection:bg-[#0284C7]/20 selection:text-[#0284C7]">
      {/* 1. Header */}
      <Header
        onRefreshData={loadSummary}
        activePage={activePage}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* 2. Signature Live Status Ribbon */}
      <LiveRibbon summary={summary} />

      {/* 3. Main Workspace Grid */}
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <Sidebar
          activePage={activePage}
          onSelectPage={setActivePage}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Fleet360App />
    </AuthProvider>
  );
}
