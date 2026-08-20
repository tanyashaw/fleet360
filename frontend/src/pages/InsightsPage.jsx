import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { ArrowUpRight } from "lucide-react";

export const InsightsPage = ({ onNavigate }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const data = await api.getInsights();
        setInsights(data || []);
      } catch (err) {
        console.error("Insights fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const filtered = insights.filter((item) => {
    const matchSev = severityFilter === "ALL" || item.severity === severityFilter;
    const matchEnt = entityFilter === "ALL" || (item.entity_type && item.entity_type.toUpperCase() === entityFilter);
    return matchSev && matchEnt;
  });

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-600 dark:text-[#9CA3AF] font-mono flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-[#0284C7] border-t-transparent rounded-full animate-spin" />
        <div>Analyzing Fleet Telematics & Querying AI Engine...</div>
      </div>
    );
  }

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

        <div className="text-xs font-mono text-slate-500">
          Showing <span className="font-bold text-slate-900 dark:text-white">{filtered.length}</span> anomalies detected
        </div>
      </div>

      {/* Insights Cards List */}
      <div className="space-y-4">
        {filtered.map((item) => {
          let badgeColor = "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800";
          if (item.severity === "MEDIUM") {
            badgeColor = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800";
          } else if (item.severity === "LOW") {
            badgeColor = "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800";
          }

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${badgeColor}`}>
                    {item.severity} SEVERITY
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    {item.entity_type}: <strong className="text-slate-900 dark:text-white">{item.entity_name || item.entity_id}</strong>
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">{item.timestamp || "Recently detected"}</span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F5F6F8] font-sans">
                {item.headline || item.message}
              </h3>

              {item.metric_impact && (
                <div className="text-xs font-mono text-red-600 dark:text-red-400 font-bold bg-red-50/50 dark:bg-red-950/20 px-3 py-1.5 rounded border border-red-100 dark:border-red-900/40 inline-block">
                  Financial Impact: {item.metric_impact}
                </div>
              )}

              <div className="bg-slate-50 dark:bg-[#0F1419] p-3 rounded-lg border border-slate-200 dark:border-[#2D3748] text-xs font-mono text-slate-700 dark:text-[#9CA3AF]">
                <strong className="text-[#0284C7] dark:text-[#06B6D4] font-condensed uppercase tracking-wider block mb-1">
                  AI Recommendation:
                </strong>
                {item.recommendation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
