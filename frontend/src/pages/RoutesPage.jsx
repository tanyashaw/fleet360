import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { StatusBadge } from "../components/common/StatusBadge";
import { SearchFilterBar } from "../components/common/SearchFilterBar";
import { RouteDetailModal } from "../components/details/RouteDetailModal";
import { ArrowRight } from "lucide-react";

export const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortOption, setSortOption] = useState("margin_desc");
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      const data = await api.getRoutesRanking();
      setRoutes(data);
    };
    fetchRoutes();
  }, []);

  const filteredRoutes = routes
    .filter((r) => {
      const matchesSearch =
        r.route_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "ALL" || r.health_status.toUpperCase() === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOption === "margin_desc") return b.margin_pct - a.margin_pct;
      if (sortOption === "margin_asc") return a.margin_pct - b.margin_pct;
      if (sortOption === "revenue_desc") return b.revenue - a.revenue;
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2D3748] pb-4">
        <div>
          <h2 className="text-2xl font-bold font-condensed uppercase tracking-wider text-slate-900 dark:text-[#F5F6F8]">
            ROUTE PROFITABILITY & CONTRIBUTION
          </h2>
          <p className="text-xs text-slate-600 dark:text-[#9CA3AF] font-mono mt-0.5">
            Logistics Dispatch & Contribution Margin Performance
          </p>
        </div>
      </div>

      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        statusOptions={[
          { value: "HEALTHY", label: "Healthy Routes (Margin > 25%)" },
          { value: "WARNING", label: "Warning (15-25%)" },
          { value: "LOSS", label: "Loss / At Risk (< 15%)" }
        ]}
        sortOption={sortOption}
        onSortChange={setSortOption}
        sortOptions={[
          { value: "margin_desc", label: "Margin % (High to Low)" },
          { value: "margin_asc", label: "Margin % (Low to High)" },
          { value: "revenue_desc", label: "Revenue (High to Low)" }
        ]}
        placeholder="Search route code, origin, destination or customer..."
      />

      {/* Table Container */}
      <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-100 dark:bg-[#0F1419] border-b border-slate-200 dark:border-[#2D3748] font-condensed uppercase tracking-wider text-slate-700 dark:text-[#9CA3AF]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Route Code</th>
                <th className="py-3.5 px-4 font-bold">Origin → Destination</th>
                <th className="py-3.5 px-4 font-bold">Customer Contract</th>
                <th className="py-3.5 px-4 font-bold text-right">Revenue</th>
                <th className="py-3.5 px-4 font-bold text-right">Cost</th>
                <th className="py-3.5 px-4 font-bold text-right">Margin %</th>
                <th className="py-3.5 px-4 font-bold text-right">Trips/Mo</th>
                <th className="py-3.5 px-4 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2D3748]/60 font-mono">
              {filteredRoutes.map((r) => {
                let borderClass = "border-l-4 border-l-emerald-500";
                if (r.health_status === "Warning") borderClass = "border-l-4 border-l-amber-500";
                if (r.health_status === "Loss") borderClass = "border-l-4 border-l-red-500";

                return (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRoute(r)}
                    className={`${borderClass} hover:bg-slate-50 dark:hover:bg-[#2D3748]/40 cursor-pointer transition-colors`}
                  >
                    <td className="py-3.5 px-4 font-bold text-[#0284C7] dark:text-[#06B6D4]">{r.route_code}</td>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-[#F5F6F8]">
                      {r.origin} <ArrowRight className="w-3 h-3 inline text-slate-400 dark:text-[#9CA3AF]" /> {r.destination}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-[#9CA3AF] font-sans">{r.customer_name}</td>
                    <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-[#10B981] font-bold">₹{(r.revenue / 1000).toFixed(0)}K</td>
                    <td className="py-3.5 px-4 text-right text-red-600 dark:text-[#EF4444] font-bold">₹{(r.cost / 1000).toFixed(0)}K</td>
                    <td className={`py-3.5 px-4 text-right font-bold ${
                      r.margin_pct > 25 ? "text-emerald-600 dark:text-[#10B981]" : r.margin_pct > 15 ? "text-amber-600 dark:text-[#F59E0B]" : "text-red-600 dark:text-[#EF4444]"
                    }`}>
                      {r.margin_pct}%
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-800 dark:text-[#F5F6F8] font-bold">{r.trips_per_month}</td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge health={r.health_status} status={r.status} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <RouteDetailModal
        route={selectedRoute}
        isOpen={Boolean(selectedRoute)}
        onClose={() => setSelectedRoute(null)}
      />
    </div>
  );
};
