import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export const MetricCard = ({ title, value, trend, subtext, status = "neutral", accentLine = false }) => {
  const getTrendIcon = () => {
    if (!trend && trend !== 0) return null;
    if (trend > 0) return <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-[#10B981]" />;
    if (trend < 0) return <TrendingDown className="w-3.5 h-3.5 text-red-600 dark:text-[#EF4444]" />;
    return <Minus className="w-3.5 h-3.5 text-slate-400 dark:text-[#9CA3AF]" />;
  };

  const getTrendColor = () => {
    if (!trend && trend !== 0) return "text-slate-400 dark:text-[#9CA3AF]";
    return trend > 0 ? "text-emerald-600 dark:text-[#10B981]" : trend < 0 ? "text-red-600 dark:text-[#EF4444]" : "text-slate-400 dark:text-[#9CA3AF]";
  };

  const getValueColor = () => {
    if (status === "healthy") return "text-emerald-600 dark:text-[#10B981]";
    if (status === "warning") return "text-amber-600 dark:text-[#F59E0B]";
    if (status === "urgent") return "text-red-600 dark:text-[#EF4444]";
    return "text-slate-900 dark:text-[#F5F6F8]";
  };

  return (
    <div className="relative bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl p-5 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
      {accentLine && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0284C7] dark:bg-[#06B6D4]" />
      )}
      <div>
        <div className="text-xs font-semibold tracking-wider text-slate-500 dark:text-[#9CA3AF] uppercase mb-1 font-condensed">
          {title}
        </div>
        <div className={`text-2xl font-bold font-mono tracking-tight ${getValueColor()}`}>
          {value}
        </div>
      </div>

      {(trend !== undefined || subtext) && (
        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#2D3748]/50 flex items-center justify-between text-xs">
          {trend !== undefined && (
            <span className={`inline-flex items-center gap-1 font-mono font-medium ${getTrendColor()}`}>
              {getTrendIcon()}
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
          {subtext && (
            <span className="text-slate-500 dark:text-[#9CA3AF] truncate ml-2 font-sans">{subtext}</span>
          )}
        </div>
      )}
    </div>
  );
};
