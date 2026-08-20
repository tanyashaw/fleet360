import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { StatusBadge } from "../components/common/StatusBadge";
import { SearchFilterBar } from "../components/common/SearchFilterBar";
import { VehicleDetailModal } from "../components/details/VehicleDetailModal";
import { Truck } from "lucide-react";

export const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortOption, setSortOption] = useState("margin_desc");
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      const data = await api.getVehiclesRanking();
      setVehicles(data);
    };
    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles
    .filter((v) => {
      const matchesSearch =
        v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.registration_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.vehicle_type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "ALL" || v.health_status.toUpperCase() === filterStatus;
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
            VEHICLE PROFITABILITY & ASSET TRACKING
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#9CA3AF] font-mono mt-0.5">
            Ranked by Contribution Margin % calculated via cost-allocation engine
          </p>

        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-[#10B981]/15 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-[#10B981]/30 text-emerald-700 dark:text-[#10B981] font-mono text-xs font-bold">
          <Truck className="w-4 h-4" />
          280 Total Vehicles (247 Active)
        </div>
      </div>

      {/* Fleet Depot Image Showcase Banner */}
      <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 h-56 relative bg-slate-100">
          <img
            src="/fleet_depot.jpg"
            alt="Central Logistics Fleet Depot"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            LIVE FLEET DEPOT YARD
          </div>
        </div>
        <div className="w-full md:w-1/2 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold uppercase">
              ACTIVE ASSET TELEMATICS
            </span>
          </div>
          <h3 className="text-xl font-bold font-condensed uppercase text-slate-900 dark:text-[#F5F6F8]">
            Central Logistics Depot Yard
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#9CA3AF] font-sans">
            Real-time operating cost calculation, engine service hours monitoring, fuel efficiency tracking, and maintenance schedules for your heavy container truck fleet.
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2 border-t border-slate-100 dark:border-[#2D3748]">
            <div>
              <span className="text-slate-500">Fleet Active:</span>{" "}
              <span className="font-bold text-emerald-600">88.2%</span>
            </div>
            <div>
              <span className="text-slate-500">Avg Utilization:</span>{" "}
              <span className="font-bold text-[#0284C7]">94.2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        statusOptions={[
          { value: "HEALTHY", label: "Healthy (Margin > 20%)" },
          { value: "WARNING", label: "Warning (Margin 10-20%)" },
          { value: "LOSS", label: "Loss-Making (Margin < 10%)" }
        ]}
        sortOption={sortOption}
        onSortChange={setSortOption}
        sortOptions={[
          { value: "margin_desc", label: "Profitability Margin (High to Low)" },
          { value: "margin_asc", label: "Profitability Margin (Low to High)" },
          { value: "revenue_desc", label: "Revenue (High to Low)" }
        ]}
        placeholder="Search vehicle ID, plate number, or type..."
      />

      {/* Table / Grid View */}
      <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-100 dark:bg-[#0F1419] border-b border-slate-200 dark:border-[#2D3748] font-condensed uppercase tracking-wider text-slate-600 dark:text-[#9CA3AF]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Vehicle ID</th>
                <th className="py-3.5 px-4 font-bold">Plate Number</th>
                <th className="py-3.5 px-4 font-bold">Vehicle Type</th>
                <th className="py-3.5 px-4 font-bold text-right">Revenue</th>
                <th className="py-3.5 px-4 font-bold text-right">Op. Cost</th>
                <th className="py-3.5 px-4 font-bold text-right">Margin %</th>
                <th className="py-3.5 px-4 font-bold text-right">Util. %</th>
                <th className="py-3.5 px-4 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2D3748]/60 font-mono">
              {filteredVehicles.map((v) => {
                let borderClass = "border-l-4 border-l-emerald-500";
                if (v.health_status === "Warning") borderClass = "border-l-4 border-l-amber-500";
                if (v.health_status === "Loss") borderClass = "border-l-4 border-l-red-500";

                return (
                  <tr
                    key={v.id}
                    onClick={() => setSelectedVehicle(v)}
                    className={`${borderClass} hover:bg-slate-50 dark:hover:bg-[#2D3748]/40 cursor-pointer transition-colors`}
                  >
                    <td className="py-3.5 px-4 font-bold text-[#0284C7] dark:text-[#06B6D4]">{v.id}</td>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-[#F5F6F8]">{v.registration_plate}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-[#9CA3AF] font-sans">{v.vehicle_type}</td>
                    <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-[#10B981] font-bold">₹{(v.revenue / 1000).toFixed(0)}K</td>
                    <td className="py-3.5 px-4 text-right text-red-600 dark:text-[#EF4444] font-bold">₹{(v.operating_cost / 1000).toFixed(0)}K</td>
                    <td className={`py-3.5 px-4 text-right font-bold ${
                      v.margin_pct > 20 ? "text-emerald-600 dark:text-[#10B981]" : v.margin_pct > 10 ? "text-amber-600 dark:text-[#F59E0B]" : "text-red-600 dark:text-[#EF4444]"
                    }`}>
                      {v.margin_pct}%
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-800 dark:text-[#F5F6F8]">{v.utilization_pct}%</td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge health={v.health_status} status={v.status} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide Drawer Detail Panel */}
      <VehicleDetailModal
        vehicle={selectedVehicle}
        isOpen={Boolean(selectedVehicle)}
        onClose={() => setSelectedVehicle(null)}
      />
    </div>
  );
};
