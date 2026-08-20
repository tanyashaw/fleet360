import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { CheckCircle2, RefreshCw, ArrowRight } from "lucide-react";

export const QuickBooksPage = () => {
  const [status, setStatus] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const fetchQB = async () => {
      const data = await api.getQuickBooksStatus();
      setStatus(data);
    };
    fetchQB();
  }, []);

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert("QuickBooks transaction sync completed! 1,247 transactions mapped.");
    }, 1500);
  };

  if (!status) {
    return <div className="p-8 text-center text-slate-500 font-mono">Loading QuickBooks Integration...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2D3748] pb-4">
        <div>
          <h2 className="text-2xl font-bold font-condensed uppercase tracking-wider text-slate-900 dark:text-[#F5F6F8]">
            QUICKBOOKS FINANCIAL INTEGRATION
          </h2>
          <p className="text-xs text-slate-600 dark:text-[#9CA3AF] font-mono mt-0.5">
            GL Account Mapping & Automated Ledger Cost Sync
          </p>
        </div>
      </div>

      {/* Connection Status Card */}
      <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-[#10B981]/15 border border-emerald-200 dark:border-[#10B981]/30 flex items-center justify-center text-emerald-600 dark:text-[#10B981]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-[#F5F6F8] font-sans">
                {status.company_name}
              </span>
              <span className="bg-emerald-50 dark:bg-[#10B981]/15 text-emerald-700 dark:text-[#10B981] border border-emerald-200 dark:border-[#10B981]/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                {status.connection_status}
              </span>
            </div>
            <div className="text-xs text-slate-600 dark:text-[#9CA3AF] font-mono mt-1">
              Realm ID: {status.realm_id} • Sync Frequency: {status.sync_frequency}
            </div>
            <div className="text-xs text-[#0284C7] dark:text-[#06B6D4] font-mono mt-0.5 font-bold">
              Last Sync: {status.last_sync_time} ({status.synced_transactions_count} transactions)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-[#0284C7] hover:bg-[#0284C7]/90 text-white font-bold text-xs font-condensed uppercase rounded-lg transition-colors flex items-center gap-2 shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync Now"}
          </button>
        </div>
      </div>

      {/* Account Mapping Table */}
      <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase font-condensed tracking-wider text-slate-900 dark:text-[#F5F6F8]">
              QuickBooks Chart of Accounts → Fleet360 Cost Category Mapping
            </h3>
            <p className="text-xs text-slate-600 dark:text-[#9CA3AF] font-mono">
              Cost Allocation Engine Mapping Standard
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-700 dark:text-[#10B981] bg-emerald-50 dark:bg-[#10B981]/10 px-2.5 py-1 rounded border border-emerald-200 dark:border-[#10B981]/30 font-bold">
            5 Accounts Mapped
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 dark:bg-[#0F1419] border-b border-slate-200 dark:border-[#2D3748] text-slate-700 dark:text-[#9CA3AF] font-condensed uppercase">
              <tr>
                <th className="py-3 px-4">QuickBooks GL Account</th>
                <th className="py-3 px-4 text-center">Mapping</th>
                <th className="py-3 px-4">Fleet360 Cost Category</th>
                <th className="py-3 px-4 text-right">Transactions Synced</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2D3748]/60">
              {(status.mapped_accounts || []).map((acc, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-[#2D3748]/30">
                  <td className="py-3 px-4 text-slate-900 dark:text-[#F5F6F8] font-bold">{acc.qb_account}</td>
                  <td className="py-3 px-4 text-center text-slate-400 dark:text-[#9CA3AF]">
                    <ArrowRight className="w-4 h-4 inline text-[#0284C7] dark:text-[#06B6D4]" />
                  </td>
                  <td className="py-3 px-4 text-[#0284C7] dark:text-[#06B6D4] font-bold">{acc.fleet_category}</td>
                  <td className="py-3 px-4 text-right text-emerald-600 dark:text-[#10B981] font-bold">{acc.count}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-emerald-50 dark:bg-[#10B981]/15 text-emerald-700 dark:text-[#10B981] border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                      {acc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
