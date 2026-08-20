import React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export const RevenueMarginChart = () => {
  const data = [
    { day: "Aug 01", revenue: 1.85, margin: 42.5 },
    { day: "Aug 04", revenue: 2.10, margin: 45.0 },
    { day: "Aug 07", revenue: 1.95, margin: 41.2 },
    { day: "Aug 10", revenue: 2.35, margin: 48.6 },
    { day: "Aug 13", revenue: 2.20, margin: 46.0 },
    { day: "Aug 16", revenue: 2.45, margin: 52.4 },
    { day: "Aug 19", revenue: 2.43, margin: 53.8 },
  ];

  return (
    <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase font-condensed tracking-wider text-slate-900 dark:text-[#F5F6F8]">
            Revenue & Margin Trend (Last 30 Days)
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#9CA3AF] font-mono">
            Dual-Axis Cost Allocation Output (₹ Cr vs Margin %)
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#0284C7] dark:text-[#06B6D4]">
            <span className="w-3 h-3 bg-[#0284C7] dark:bg-[#06B6D4] rounded-xs" />
            Revenue (₹ Cr)
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-[#10B981]">
            <span className="w-3 h-0.5 bg-emerald-600 dark:bg-[#10B981]" />
            Margin %
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" opacity={0.6} />
            <XAxis dataKey="day" stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
            <YAxis yAxisId="left" stroke="#0284C7" tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} unit="Cr" />
            <YAxis yAxisId="right" orientation="right" stroke="#16A34A" tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} unit="%" />
            <Tooltip
              contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#CBD5E1", borderRadius: "8px", color: "#0F172A", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
              itemStyle={{ fontSize: "12px", fontFamily: "IBM Plex Mono", color: "#0F172A" }}
            />
            <Bar yAxisId="left" dataKey="revenue" fill="#0284C7" radius={[4, 4, 0, 0]} maxBarSize={30} />
            <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#16A34A" strokeWidth={3} dot={{ r: 4, fill: "#16A34A" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
