import React, { useState } from "react";
import { Download, FileText } from "lucide-react";

export const ReportsPage = () => {
  const [downloading, setDownloading] = useState(null);

  const reports = [
    { id: "RPT-001", name: "Monthly Vehicle Profitability & Cost Allocation Report", period: "Aug 2026", format: "CSV / Excel", status: "Ready" },
    { id: "RPT-002", name: "Route Contribution Margin & Exception Summary", period: "Aug 2026", format: "PDF", status: "Ready" },
    { id: "RPT-003", name: "Customer Portfolio Quadrant & Renewal Risk Matrix", period: "Q3 2026", format: "CSV", status: "Ready" },
    { id: "RPT-004", name: "Driver Productivity & Fuel Efficiency Scorecards", period: "Aug 2026", format: "PDF", status: "Ready" }
  ];

  const handleDownload = (id) => {
    setDownloading(id);
    setTimeout(() => {
      setDownloading(null);
      alert(`Report ${id} exported successfully!`);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2D3748] pb-4">
        <div>
          <h2 className="text-2xl font-bold font-condensed uppercase tracking-wider text-slate-900 dark:text-[#F5F6F8]">
            SCHEDULED REPORTS & EXPORTS
          </h2>
          <p className="text-xs text-slate-600 dark:text-[#9CA3AF] font-mono mt-0.5">
            Automated Management Analytics PDF & CSV Exporter
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reports.map((rpt) => (
          <div
            key={rpt.id}
            className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs hover:border-[#0284C7] transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#0284C7]/10 dark:bg-[#06B6D4]/10 border border-[#0284C7]/30 dark:border-[#06B6D4]/30 flex items-center justify-center text-[#0284C7] dark:text-[#06B6D4]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-[#F5F6F8] font-sans">{rpt.name}</h3>
                <div className="text-xs text-slate-600 dark:text-[#9CA3AF] font-mono mt-0.5 font-bold">
                  ID: {rpt.id} • Period: {rpt.period} • Format: {rpt.format}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDownload(rpt.id)}
              disabled={downloading === rpt.id}
              className="px-4 py-2 bg-white dark:bg-[#1A1F2E] border border-[#0284C7] dark:border-[#06B6D4] hover:bg-[#0284C7] hover:text-white text-[#0284C7] dark:text-[#06B6D4] font-bold text-xs font-condensed uppercase rounded-lg transition-colors flex items-center gap-2 shadow-xs"
            >
              <Download className="w-4 h-4" />
              {downloading === rpt.id ? "Exporting..." : "Download Export"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
