import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { StatusBadge } from "../components/common/StatusBadge";
import { CustomerMatrixChart } from "../components/charts/CustomerMatrixChart";
import { CustomerDetailModal } from "../components/details/CustomerDetailModal";
import { SearchFilterBar } from "../components/common/SearchFilterBar";
import { AlertTriangle } from "lucide-react";

export const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortOption, setSortOption] = useState("revenue_desc");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      const data = await api.getCustomersRanking();
      setCustomers(data);
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers
    .filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contract_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "ALL" || c.quadrant === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOption === "revenue_desc") return b.monthly_revenue - a.monthly_revenue;
      if (sortOption === "margin_desc") return b.margin_pct - a.margin_pct;
      if (sortOption === "renewal_asc") return a.renewal_days - b.renewal_days;
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2D3748] pb-4">
        <div>
          <h2 className="text-2xl font-bold font-condensed uppercase tracking-wider text-slate-900 dark:text-[#F5F6F8]">
            CUSTOMER PORTFOLIO & CONTRACT MATRIX
          </h2>
          <p className="text-xs text-slate-600 dark:text-[#9CA3AF] font-mono mt-0.5">
            Contract Margin Analytics & Renewal Signals
          </p>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1A1F2E] p-4 rounded-xl border border-slate-200 dark:border-[#2D3748] shadow-xs">
          <div className="text-[10px] font-condensed uppercase text-slate-600 dark:text-[#9CA3AF] font-bold">Total Customers</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-[#F5F6F8] mt-1">18 Active</div>
        </div>
        <div className="bg-white dark:bg-[#1A1F2E] p-4 rounded-xl border border-slate-200 dark:border-[#2D3748] shadow-xs">
          <div className="text-[10px] font-condensed uppercase text-slate-600 dark:text-[#9CA3AF] font-bold">Contract Revenue YTD</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-[#10B981] mt-1">₹85.4M</div>
        </div>
        <div className="bg-white dark:bg-[#1A1F2E] p-4 rounded-xl border border-slate-200 dark:border-[#2D3748] shadow-xs">
          <div className="text-[10px] font-condensed uppercase text-slate-600 dark:text-[#9CA3AF] font-bold">Avg Portfolio Margin</div>
          <div className="text-2xl font-bold font-mono text-[#0284C7] dark:text-[#06B6D4] mt-1">18.2%</div>
        </div>
        <div className="bg-white dark:bg-[#1A1F2E] p-4 rounded-xl border border-red-200 dark:border-[#EF4444]/40 shadow-xs">
          <div className="text-[10px] font-condensed uppercase text-red-600 dark:text-[#EF4444] font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Contracts At Risk
          </div>
          <div className="text-2xl font-bold font-mono text-red-600 dark:text-[#EF4444] mt-1">2 (Renewal &lt; 45d)</div>
        </div>
      </div>

      {/* 2D Quadrant Matrix Chart */}
      <CustomerMatrixChart customers={customers} onSelectCustomer={setSelectedCustomer} />

      {/* Filter Bar */}
      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        statusOptions={[
          { value: "Q1", label: "Q1: Key Accounts" },
          { value: "Q2", label: "Q2: Growth" },
          { value: "Q3", label: "Q3: Discontinue / Reprice" },
          { value: "Q4", label: "Q4: Renegotiate" }
        ]}
        sortOption={sortOption}
        onSortChange={setSortOption}
        sortOptions={[
          { value: "revenue_desc", label: "Monthly Revenue (High to Low)" },
          { value: "margin_desc", label: "Contribution Margin (High to Low)" },
          { value: "renewal_asc", label: "Renewal Countdown (Urgent First)" }
        ]}
        placeholder="Search customer name or contract ID..."
      />

      {/* Table */}
      <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-100 dark:bg-[#0F1419] border-b border-slate-200 dark:border-[#2D3748] font-condensed uppercase tracking-wider text-slate-700 dark:text-[#9CA3AF]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Customer Name</th>
                <th className="py-3.5 px-4 font-bold">Contract ID</th>
                <th className="py-3.5 px-4 font-bold">Quadrant</th>
                <th className="py-3.5 px-4 font-bold text-right">Monthly Rev</th>
                <th className="py-3.5 px-4 font-bold text-right">Margin %</th>
                <th className="py-3.5 px-4 font-bold text-right">Renewal Days</th>
                <th className="py-3.5 px-4 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2D3748]/60 font-mono">
              {filteredCustomers.map((c) => {
                let borderClass = "border-l-4 border-l-emerald-500";
                if (c.quadrant === "Q4") borderClass = "border-l-4 border-l-amber-500";
                if (c.quadrant === "Q3") borderClass = "border-l-4 border-l-red-500";
                if (c.quadrant === "Q2") borderClass = "border-l-4 border-l-sky-500";

                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className={`${borderClass} hover:bg-slate-50 dark:hover:bg-[#2D3748]/40 cursor-pointer transition-colors`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-[#F5F6F8] font-sans">{c.name}</td>
                    <td className="py-3.5 px-4 text-[#0284C7] dark:text-[#06B6D4] font-bold">{c.contract_id}</td>
                    <td className="py-3.5 px-4 font-condensed uppercase font-bold text-slate-700 dark:text-[#9CA3AF]">
                      {c.quadrant} - {c.status}
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-[#10B981] font-bold">₹{(c.monthly_revenue / 1000).toFixed(0)}K</td>
                    <td className={`py-3.5 px-4 text-right font-bold ${
                      c.margin_pct > 25 ? "text-emerald-600 dark:text-[#10B981]" : c.margin_pct > 15 ? "text-amber-600 dark:text-[#F59E0B]" : "text-red-600 dark:text-[#EF4444]"
                    }`}>
                      {c.margin_pct}%
                    </td>
                    <td className={`py-3.5 px-4 text-right font-bold ${c.renewal_days < 45 ? "text-red-600 dark:text-[#EF4444]" : "text-slate-600 dark:text-[#9CA3AF]"}`}>
                      {c.renewal_days} d
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge health={c.health_status} status={c.status} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
};
