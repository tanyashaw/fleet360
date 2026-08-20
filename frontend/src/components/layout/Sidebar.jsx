import React from "react";
import {
  LayoutDashboard,
  Truck,
  MapPin,
  Briefcase,
  Users,
  Lightbulb,
  DollarSign,
  BarChart3,
  ChevronLeft,
  ChevronRight

} from "lucide-react";

export const Sidebar = ({ activePage, onSelectPage, isCollapsed, onToggleCollapse }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "vehicles", label: "Vehicles", icon: Truck },
    { id: "routes", label: "Routes", icon: MapPin },
    { id: "customers", label: "Customers", icon: Briefcase },
    { id: "drivers", label: "Drivers", icon: Users },
    { id: "insights", label: "Insights", icon: Lightbulb, badge: "5" },
    { id: "quickbooks", label: "QuickBooks", icon: DollarSign },
    { id: "reports", label: "Reports", icon: BarChart3 }
  ];

  return (
    <aside
      className={`bg-white dark:bg-[#0F1419] border-r border-slate-200 dark:border-[#2D3748] transition-all duration-250 ease-in-out flex flex-col justify-between sticky top-[108px] h-[calc(100vh-108px)] z-20 shadow-xs ${
        isCollapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Navigation List */}
      <div className="py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              title={isCollapsed ? item.label : ""}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-medium font-sans transition-all relative group ${
                isActive
                  ? "bg-slate-100 dark:bg-[#1A1F2E] text-slate-900 dark:text-[#F5F6F8] font-bold"
                  : "text-slate-600 dark:text-[#9CA3AF] hover:bg-slate-50 dark:hover:bg-[#1A1F2E]/60 hover:text-slate-900 dark:hover:text-[#F5F6F8]"
              }`}
            >
              {/* Active Left Border Accent */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0284C7] dark:bg-[#06B6D4]" />
              )}

              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive ? "text-[#0284C7] dark:text-[#06B6D4]" : "text-slate-500 dark:text-[#9CA3AF] group-hover:text-[#0284C7] dark:group-hover:text-[#06B6D4]"
                }`}
              />

              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between font-condensed tracking-wide uppercase text-sm">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse Toggle Button */}
      <div className="p-3 border-t border-slate-200 dark:border-[#2D3748]">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg bg-slate-100 dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] text-slate-600 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-[#F5F6F8] transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2 text-xs font-condensed font-semibold uppercase">
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
