import React from "react";

export const StatusBadge = ({ status, health, size = "md" }) => {
  const getColors = () => {
    const val = (health || status || "").toLowerCase();
    if (val.includes("healthy") || val.includes("profitable") || val.includes("strong") || val.includes("active") || val.includes("key accounts")) {
      return "bg-emerald-50 dark:bg-[#10B981]/15 text-emerald-700 dark:text-[#10B981] border-emerald-200 dark:border-[#10B981]/30 font-bold";
    }
    if (val.includes("warning") || val.includes("at risk") || val.includes("growth") || val.includes("renegotiate") || val.includes("idle")) {
      return "bg-amber-50 dark:bg-[#F59E0B]/15 text-amber-700 dark:text-[#F59E0B] border-amber-200 dark:border-[#F59E0B]/30 font-bold";
    }
    if (val.includes("loss") || val.includes("critical") || val.includes("discontinue") || val.includes("maintenance")) {
      return "bg-red-50 dark:bg-[#EF4444]/15 text-red-700 dark:text-[#EF4444] border-red-200 dark:border-[#EF4444]/30 font-bold";
    }
    return "bg-sky-50 dark:bg-[#06B6D4]/15 text-sky-700 dark:text-[#06B6D4] border-sky-200 dark:border-[#06B6D4]/30 font-bold";
  };

  const getDotColor = () => {
    const val = (health || status || "").toLowerCase();
    if (val.includes("healthy") || val.includes("profitable") || val.includes("strong") || val.includes("active") || val.includes("key accounts")) {
      return "bg-emerald-500";
    }
    if (val.includes("warning") || val.includes("at risk") || val.includes("growth") || val.includes("renegotiate") || val.includes("idle")) {
      return "bg-amber-500";
    }
    if (val.includes("loss") || val.includes("critical") || val.includes("discontinue") || val.includes("maintenance")) {
      return "bg-red-500";
    }
    return "bg-sky-500";
  };

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${getColors()} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
      {status || health}
    </span>
  );
};
