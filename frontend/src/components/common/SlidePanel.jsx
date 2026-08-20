import React, { useEffect } from "react";
import { X } from "lucide-react";

export const SlidePanel = ({ isOpen, onClose, title, subtitle, badge, tabs = [], activeTab, onTabChange, children }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1A1F2E] text-slate-900 dark:text-[#F5F6F8] shadow-2xl border-l border-slate-200 dark:border-[#2D3748] flex flex-col h-full z-10 transition-transform duration-250 ease-in-out">
        {/* Panel Header */}
        <div className="p-6 border-b border-slate-200 dark:border-[#2D3748] bg-slate-50 dark:bg-[#0F1419]/50 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-[#F5F6F8]">
                {title}
              </h2>
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-[#9CA3AF] mt-1 font-mono">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-[#2D3748] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Header */}
        {tabs.length > 0 && (
          <div className="flex border-b border-slate-200 dark:border-[#2D3748] bg-slate-50/50 dark:bg-[#0F1419]/30 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider font-condensed transition-colors border-b-2 whitespace-nowrap ${
                    isActive
                      ? "border-[#0284C7] dark:border-[#06B6D4] text-[#0284C7] dark:text-[#06B6D4]"
                      : "border-transparent text-slate-500 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-[#F5F6F8]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};
