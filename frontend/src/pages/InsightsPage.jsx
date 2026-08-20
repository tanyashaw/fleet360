import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { ArrowUpRight } from "lucide-react";

export const InsightsPage = ({ onNavigate }) => {
  const [insights, setInsights] = useState([]);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");

  useEffect(() => {
    const fetchInsights = async () => {
      const data = await api.getInsights();
      setInsights(data);
    };
    fetchInsights();
  }, []);

  const filtered = insights.filter((item) => {
    const matchSev = severityFilter === "ALL" || item.severity === severityFilter;
    const matchEnt = entityFilter === "ALL" || item.entity_type.toUpperCase() === entityFilter;
    return matchSev && matchEnt;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2D3748] pb-4">
        <div>
          <h2 className="text-2xl font-bold font-condensed uppercase tracking-wider text-slate-900 dark:text-[#F5F6F8]">
            AI COST ANOMALIES & INSIGHTS
          </h2>
          <p className="text-xs text-slate-600 dark:text-[#9CA3AF] font-mono mt-0.5">
            Real-Time Cost Leakage & Anomaly Detection
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-condensed uppercase text-slate-700 dark:text-[#9CA3AF] font-bold">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-50 dark:bg-[#0F1419] border border-slate-200 dark:border-[#2D3748] rounded-lg text-xs font-mono text-slate-900 dark:text-[#F5F6F8] px-3 py-1.5 focus:outline-none focus:border-[#0284C7] dark:focus:border-[#06B6D4]"
            >
              <option value="ALL">All Severities</option>
              <option value="HIGH">High Severity Only</option>
              <option value="MEDIUM">Medium Severity</option>
              <option value="LOW">Low / Info</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-condensed uppercase text-slate-700 dark:text-[#9CA3AF] font-bold">Entity:</span>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="bg-slate-50 dark:bg-[#0F1419] border border-slate-200 dark:border-[#2D3748] rounded-lg text-xs font-mono text-slate-900 dark:text-[#F5F6F8] px-3 py-1.5 focus:outline-none focus:border-[#0284C7] dark:focus:border-[#06B6D4]"
            >
              <option value="ALL">All Entities</option>
              <option value="VEHICLE">Vehicles</option>
              <option value="ROUTE">Routes</option>
              <option value="CUSTOMER">Customers</option>
              <option value="DRIVER">Drivers</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-600 dark:text-[#9CA3AF] font-bold">
          Showing {filtered.length} of {insights.length} Anomalies
        </div>
      </div>

      {/* Alert Feed List */}
      <div className="space-y-4">
        {filtered.map((item) => {
          let borderClass = "border-l-4 border-l-red-500 bg-white dark:bg-[#1A1F2E]";
          let badgeColor = "bg-red-50 dark:bg-[#EF4444]/15 text-red-700 dark:text-[#EF4444] border-red-200";
          if (item.severity === "MEDIUM") {
            borderClass = "border-l-4 border-l-amber-500 bg-white dark:bg-[#1A1F2E]";
            badgeColor = "bg-amber-50 dark:bg-[#F59E0B]/15 text-amber-700 dark:text-[#F59E0B] border-amber-200";
          } else if (item.severity === "LOW") {
            borderClass = "border-l-4 border-l-emerald-500 bg-white dark:bg-[#1A1F2E]";
            badgeColor = "bg-emerald-50 dark:bg-[#10B981]/15 text-emerald-700 dark:text-[#10B981] border-emerald-200";
          }

          return (
            <div
              key={item.id}
              className={`p-5 rounded-xl border border-slate-200 dark:border-[#2D3748] ${borderClass} flex flex-wrap items-start justify-between gap-4 transition-all hover:border-[#0284C7] shadow-xs`}
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${badgeColor}`}>
                    {item.severity} SEVERITY
                  </span>
                  <span className="text-xs font-mono text-[#0284C7] dark:text-[#06B6D4] bg-[#0284C7]/10 dark:bg-[#06B6D4]/10 px-2 py-0.5 rounded border border-[#0284C7]/30 font-bold">
                    {item.entity_type}: {item.entity_id}
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-[#9CA3AF]">{item.timestamp}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-[#F5F6F8] font-sans">
                  {item.headline}
                </h3>

                <p className="text-xs text-slate-600 dark:text-[#9CA3AF] font-sans">
                  Financial Impact: <span className="text-red-600 dark:text-[#EF4444] font-mono font-bold">{item.metric_impact}</span>
                </p>

                <div className="bg-slate-50 dark:bg-[#0F1419] p-3 rounded border border-slate-200 dark:border-[#2D3748] text-xs text-slate-800 dark:text-[#F5F6F8] font-sans mt-2">
                  <span className="font-bold text-[#0284C7] dark:text-[#06B6D4] font-condensed uppercase tracking-wider">
                    Recommended Action:
                  </span>{" "}
                  {item.recommendation}
                </div>
              </div>

              <div>
                <button
                  onClick={() => {
                    if (item.entity_type === "Vehicle") onNavigate("vehicles");
                    else if (item.entity_type === "Route") onNavigate("routes");
                    else if (item.entity_type === "Customer") onNavigate("customers");
                    else if (item.entity_type === "Driver") onNavigate("drivers");
                  }}
                  className="px-4 py-2 bg-[#0284C7] hover:bg-[#0284C7]/90 text-white font-bold text-xs font-condensed uppercase rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  Review Entity
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
