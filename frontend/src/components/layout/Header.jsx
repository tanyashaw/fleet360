import React from "react";
import { Bell, User, RefreshCw, Sun, Moon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const Header = ({ onRefreshData, activePage, theme, onToggleTheme }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white dark:bg-[#0F1419] border-b border-slate-200 dark:border-[#2D3748] px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs transition-colors duration-200">
      {/* Brand & Page Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0284C7] to-[#7C3AED] flex items-center justify-center font-bold text-white shadow-md">
            F
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wider font-condensed text-slate-900 dark:text-white uppercase leading-none">
              FLEET<span className="text-[#0284C7] dark:text-[#06B6D4]">360</span>
            </h1>
            <span className="text-[10px] text-slate-500 dark:text-[#9CA3AF] font-mono">Cost Analytics Engine v2.4</span>
          </div>
        </div>
      </div>

      {/* Controls & User Profile */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          title="Toggle Light / Dark UI Theme"
          className="p-2 text-slate-700 dark:text-[#9CA3AF] hover:text-[#0284C7] dark:hover:text-[#06B6D4] bg-slate-100 hover:bg-slate-200 dark:bg-[#1A1F2E] dark:hover:bg-[#2D3748] rounded-lg transition-colors border border-slate-300 dark:border-[#2D3748] flex items-center gap-2 text-xs font-mono font-bold"
        >
          {theme === "light" ? (
            <>
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Bright Mode Active</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Dark Mode Active</span>
            </>
          )}
        </button>

        <button
          onClick={onRefreshData}
          title="Refresh Backend Analytics Data"
          className="p-2 text-slate-600 dark:text-[#9CA3AF] hover:text-[#0284C7] dark:hover:text-[#06B6D4] hover:bg-slate-100 dark:hover:bg-[#1A1F2E] rounded-lg transition-colors border border-slate-200 dark:border-[#2D3748]"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button className="p-2 text-slate-600 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-[#F5F6F8] hover:bg-slate-100 dark:hover:bg-[#1A1F2E] rounded-lg transition-colors border border-slate-200 dark:border-[#2D3748]">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#0F1419]" />
          </button>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-[#2D3748]">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1A1F2E] border border-[#0284C7]/40 dark:border-[#06B6D4]/40 flex items-center justify-center text-[#0284C7] dark:text-[#06B6D4]">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-900 dark:text-[#F5F6F8] font-sans">
              {user?.name || "Operations Lead"}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-[#9CA3AF] font-mono">
              {user?.role || "CFO Controller"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
