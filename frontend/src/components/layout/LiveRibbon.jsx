import React from "react";
import { AlertTriangle, Activity, CheckCircle2, TrendingUp, Truck } from "lucide-react";

export const LiveRibbon = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="bg-white dark:bg-[#1A1F2E] border-b border-slate-200 dark:border-[#2D3748] px-6 py-2.5 text-xs text-slate-800 dark:text-[#F5F6F8] sticky top-[57px] z-30 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-6 whitespace-nowrap">
        {/* Live Pulse & Title */}
        <div className="flex items-center gap-2.5 pr-4 border-r border-slate-200 dark:border-[#2D3748]">
          <div className="relative flex items-center justify-center">
            <span className="pulse-dot w-2.5 h-2.5 rounded-full bg-[#0284C7] dark:bg-[#06B6D4]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] dark:bg-[#06B6D4] absolute" />
          </div>
          <span className="font-condensed font-bold tracking-wider text-[#0284C7] dark:text-[#06B6D4] uppercase text-xs">
            FLEET STATUS LIVE
          </span>
        </div>

        {/* Metric 1: Active Vehicles */}
        <div className="flex items-center gap-2 px-3 border-r border-slate-200 dark:border-[#2D3748]/60">
          <Truck className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#06B6D4]" />
          <span className="text-slate-500 dark:text-[#9CA3AF]">Active Fleet:</span>
          <span className="font-mono font-bold text-slate-900 dark:text-[#F5F6F8]">
            {summary.active_vehicles} / {summary.total_vehicles}
          </span>
          <span className="text-[#16A34A] dark:text-[#10B981] font-mono text-[11px]">
            ({summary.active_vehicles_pct}%)
          </span>
        </div>

        {/* Metric 2: Alerts */}
        <div className="flex items-center gap-2 px-3 border-r border-slate-200 dark:border-[#2D3748]/60">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-slate-500 dark:text-[#9CA3AF]">Critical Alerts:</span>
          <span className="font-mono font-bold text-red-600 dark:text-[#EF4444] bg-red-50 dark:bg-[#EF4444]/10 px-2 py-0.5 rounded border border-red-200 dark:border-[#EF4444]/30">
            {summary.critical_alerts} Anom.
          </span>
        </div>

        {/* Metric 3: Today's Revenue */}
        <div className="flex items-center gap-2 px-3 border-r border-slate-200 dark:border-[#2D3748]/60">
          <TrendingUp className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#10B981]" />
          <span className="text-slate-500 dark:text-[#9CA3AF]">Today's Revenue:</span>
          <span className="font-mono font-bold text-[#16A34A] dark:text-[#10B981]">
            ₹{(summary.today_revenue / 10000000).toFixed(2)}Cr
          </span>
          <span className="text-[#16A34A] dark:text-[#10B981] text-[10px] font-mono">
            (↑ {summary.revenue_trend_pct}%)
          </span>
        </div>

        {/* Metric 4: Utilization */}
        <div className="flex items-center gap-2 px-3 border-r border-slate-200 dark:border-[#2D3748]/60">
          <Activity className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#06B6D4]" />
          <span className="text-slate-500 dark:text-[#9CA3AF]">Fleet Util.:</span>
          <span className="font-mono font-bold text-[#0284C7] dark:text-[#06B6D4]">
            {summary.fleet_utilization_pct}%
          </span>
        </div>

        {/* Metric 5: On-Schedule Routes */}
        <div className="flex items-center gap-2 pl-3">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#10B981]" />
          <span className="text-slate-500 dark:text-[#9CA3AF]">On-Schedule:</span>
          <span className="font-mono font-bold text-slate-900 dark:text-[#F5F6F8]">
            {summary.routes_on_schedule} / {summary.routes_total}
          </span>
        </div>
      </div>
    </div>
  );
};
