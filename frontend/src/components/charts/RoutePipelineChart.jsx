import React from "react";

export const RoutePipelineChart = () => {
  const pipeline = [
    { label: "On Schedule", count: 432, pct: 98.2, color: "bg-emerald-500" },
    { label: "Minor Delay (<15m)", count: 5, pct: 1.1, color: "bg-amber-500" },
    { label: "Major Exception", count: 3, pct: 0.7, color: "bg-red-500" }
  ];

  return (
    <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase font-condensed tracking-wider text-slate-900 dark:text-[#F5F6F8]">
            Route SLA & Exception Pipeline
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#9CA3AF] font-mono">Real-time Dispatch Health</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="h-4 w-full bg-slate-100 dark:bg-[#0F1419] rounded-full overflow-hidden flex border border-slate-200 dark:border-[#2D3748]">
          {pipeline.map((item, i) => (
            <div
              key={i}
              style={{ width: `${item.pct}%` }}
              className={`h-full ${item.color} transition-all duration-300`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          {pipeline.map((item, i) => (
            <div key={i} className="bg-slate-50 dark:bg-[#0F1419] p-3 rounded-lg border border-slate-200 dark:border-[#2D3748]">
              <div className="text-[10px] font-condensed uppercase font-semibold text-slate-500 dark:text-[#9CA3AF]">
                {item.label}
              </div>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-[#F5F6F8] mt-1">
                {item.count}
              </div>
              <div className="text-[10px] font-mono text-slate-500 dark:text-[#9CA3AF]">{item.pct}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
