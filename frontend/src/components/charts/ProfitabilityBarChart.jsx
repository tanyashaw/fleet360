import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer
} from "recharts";

export const ProfitabilityBarChart = ({ vehicles = [] }) => {
  const chartData = vehicles.map((v) => ({
    name: v.id,
    margin: v.margin_pct,
    contribution: v.contribution,
    status: v.health_status
  }));

  return (
    <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase font-condensed tracking-wider text-slate-900 dark:text-[#F5F6F8]">
            Vehicle Profitability Ranking (Contribution Margin %)
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#9CA3AF] font-mono">
            Calculated via Operating Cost Allocation Engine
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" opacity={0.6} />
            <XAxis type="number" stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} unit="%" />
            <YAxis type="category" dataKey="name" stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} width={70} />
            <Tooltip
              contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#CBD5E1", borderRadius: "8px", color: "#0F172A", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
              formatter={(val) => [`${val}%`, "Margin"]}
            />
            <Bar dataKey="margin" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => {
                let color = "#16A34A";
                if (entry.margin < 10) color = "#DC2626";
                else if (entry.margin < 20) color = "#D97706";
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
