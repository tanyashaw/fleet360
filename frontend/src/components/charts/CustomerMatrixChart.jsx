import React from "react";

export const CustomerMatrixChart = ({ customers = [], onSelectCustomer }) => {
  return (
    <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl p-5 relative overflow-hidden shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase font-condensed tracking-wider text-slate-900 dark:text-[#F5F6F8]">
            Customer Portfolio Matrix (Revenue vs. Contribution Margin %)
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#9CA3AF] font-mono">
            Quadrant Strategic Decision Matrix
          </p>
        </div>
      </div>

      {/* 2D Quadrant Canvas Container */}
      <div className="relative w-full h-80 bg-slate-50 dark:bg-[#0F1419] border border-slate-200 dark:border-[#2D3748] rounded-lg p-4 flex flex-col justify-between">
        {/* Quadrant Axis Dividers */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
          <div className="border-r border-b border-slate-200 dark:border-[#2D3748]/60 p-3 flex flex-col justify-between">
            <span className="text-[10px] font-condensed uppercase font-bold text-[#0284C7] dark:text-[#06B6D4] bg-[#0284C7]/10 dark:bg-[#06B6D4]/10 px-2 py-0.5 rounded w-max border border-[#0284C7]/30">
              Q2: Growth (High Margin / Low Rev)
            </span>
          </div>
          <div className="border-b border-slate-200 dark:border-[#2D3748]/60 p-3 flex flex-col justify-between items-end">
            <span className="text-[10px] font-condensed uppercase font-bold text-emerald-600 dark:text-[#10B981] bg-emerald-50 dark:bg-[#10B981]/10 px-2 py-0.5 rounded w-max border border-emerald-200">
              Q1: Key Accounts (High Margin / High Rev)
            </span>
          </div>
          <div className="border-r border-slate-200 dark:border-[#2D3748]/60 p-3 flex flex-col justify-between">
            <span className="text-[10px] font-condensed uppercase font-bold text-red-600 dark:text-[#EF4444] bg-red-50 dark:bg-[#EF4444]/10 px-2 py-0.5 rounded w-max border border-red-200">
              Q3: Discontinue (Low Margin / Low Rev)
            </span>
          </div>
          <div className="p-3 flex flex-col justify-between items-end">
            <span className="text-[10px] font-condensed uppercase font-bold text-amber-600 dark:text-[#F59E0B] bg-amber-50 dark:bg-[#F59E0B]/10 px-2 py-0.5 rounded w-max border border-amber-200">
              Q4: Renegotiate (Low Margin / High Rev)
            </span>
          </div>
        </div>

        {/* Customer Interactive Bubbles */}
        <div className="relative w-full h-full z-10">
          {customers.map((cust) => {
            const xPct = Math.min(Math.max((cust.monthly_revenue / 2000000) * 100, 10), 90);
            const yPct = Math.min(Math.max(100 - (cust.margin_pct / 60) * 100, 10), 90);

            let bubbleBg = "bg-emerald-500";
            if (cust.quadrant === "Q4") bubbleBg = "bg-amber-500";
            if (cust.quadrant === "Q3") bubbleBg = "bg-red-500";
            if (cust.quadrant === "Q2") bubbleBg = "bg-sky-500";

            return (
              <div
                key={cust.id}
                onClick={() => onSelectCustomer(cust)}
                style={{ left: `${xPct}%`, top: `${yPct}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all duration-200"
              >
                <div
                  className={`w-11 h-11 rounded-full ${bubbleBg} text-white flex items-center justify-center font-mono text-xs font-bold shadow-md group-hover:scale-125 transition-transform border-2 border-white`}
                >
                  {cust.margin_pct.toFixed(0)}%
                </div>

                {/* Tooltip Card */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 bg-white dark:bg-[#0F1419] border border-slate-200 dark:border-[#2D3748] p-3 rounded-lg shadow-xl w-52 text-left">
                  <div className="font-bold text-xs text-slate-900 dark:text-[#F5F6F8] font-sans truncate">
                    {cust.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-[#9CA3AF] mt-0.5">
                    Rev: ₹{(cust.monthly_revenue / 1000).toFixed(0)}K | Margin: {cust.margin_pct}%
                  </div>
                  <div className="mt-2 text-[10px] text-[#0284C7] dark:text-[#06B6D4] font-condensed font-semibold uppercase">
                    Click for full contract details →
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
