import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Header } from "./components/layout/Header";
import { LiveRibbon } from "./components/layout/LiveRibbon";
import { Sidebar } from "./components/layout/Sidebar";

import { LoginPage } from "./pages/LoginPage";
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
  const { isAuthenticated } = useAuth();
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
    try {
      const sum = await api.getDashboardSummary();
      setSummary(sum);
    } catch (e) {
      console.warn("Summary load error:", e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadSummary();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage onNavigate={setActivePage} />;
      case "vehicles":
        return <VehiclesPage onNavigate={setActivePage} />;
      case "routes":
        return <RoutesPage onNavigate={setActivePage} />;
      case "customers":
        return <CustomersPage onNavigate={setActivePage} />;
      case "drivers":
        return <DriversPage onNavigate={setActivePage} />;
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F1419] text-slate-900 dark:text-[#F5F6F8] font-sans antialiased transition-colors duration-200">
      <Header theme={theme} onToggleTheme={toggleTheme} summary={summary} />
      <LiveRibbon summary={summary} />

      <div className="flex pt-32 min-h-screen">
        <Sidebar
          activePage={activePage}
          onSelectPage={setActivePage}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main
          className={`flex-1 p-6 transition-all duration-300 overflow-x-hidden ${
            isSidebarCollapsed ? "ml-16" : "ml-64"
          }`}
        >
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
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
