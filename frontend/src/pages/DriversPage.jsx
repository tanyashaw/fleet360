import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { StatusBadge } from "../components/common/StatusBadge";
import { SearchFilterBar } from "../components/common/SearchFilterBar";
import { DriverDetailModal } from "../components/details/DriverDetailModal";
import { Users, ShieldCheck } from "lucide-react";

export const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortOption, setSortOption] = useState("score_desc");
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      const data = await api.getDriversScorecard();
      setDrivers(data);
    };
    fetchDrivers();
  }, []);

  const filteredDrivers = drivers
    .filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.assigned_vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.assigned_route.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "ALL" || d.health_status.toUpperCase() === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOption === "score_desc") return b.productivity_score - a.productivity_score;
      if (sortOption === "trips_desc") return b.trips_this_month - a.trips_this_month;
      if (sortOption === "cost_asc") return a.cost_per_trip - b.cost_per_trip;
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2D3748] pb-4">
        <div>
          <h2 className="text-2xl font-bold font-condensed uppercase tracking-wider text-slate-900 dark:text-[#F5F6F8]">
            DRIVER ROSTER & PRODUCTIVITY SCORECARD
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#9CA3AF] font-mono mt-0.5">
            Normalized 0–100 Operational Quality Metric
          </p>

        </div>
        <div className="flex items-center gap-2 bg-[#0284C7]/10 px-3 py-1.5 rounded-lg border border-[#0284C7]/30 text-[#0284C7] dark:text-[#06B6D4] font-mono text-xs font-bold">
          <Users className="w-4 h-4" />
          45 Active Drivers
        </div>
      </div>

      {/* Driver Cockpit Image Showcase Banner */}
      <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 h-56 relative bg-slate-100">
          <img
            src="/driver_cockpit.jpg"
            alt="Driver Telematics Cockpit"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            LIVE DRIVER TELEMATICS FEED
          </div>
        </div>
        <div className="w-full md:w-1/2 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#0284C7]/10 text-[#0284C7] border border-[#0284C7]/30 text-[10px] font-mono font-bold uppercase">
              COCKPIT TELEMETRY & SAFETY
            </span>
          </div>
          <h3 className="text-xl font-bold font-condensed uppercase text-slate-900 dark:text-[#F5F6F8]">
            Driver Safety & Productivity Cockpit
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#9CA3AF] font-sans">
            Real-time monitoring of driver attendance, trip completion speeds, fuel consumption correlation, and salary cost per trip.
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2 border-t border-slate-100 dark:border-[#2D3748]">
            <div>
              <span className="text-slate-500">Fleet Lead Driver:</span>{" "}
              <span className="font-bold text-[#0284C7]">Ravi Kumar (#3)</span>
            </div>
            <div>
              <span className="text-slate-500">Avg Cost/Trip:</span>{" "}
              <span className="font-bold text-amber-600">₹380</span>
            </div>
          </div>
        </div>
      </div>

      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        statusOptions={[
          { value: "HEALTHY", label: "Top Performers (Score 80+)" },
          { value: "WARNING", label: "Mid Performers (65-79)" },
          { value: "LOSS", label: "Attention Needed (< 65)" }
        ]}
        sortOption={sortOption}
        onSortChange={setSortOption}
        sortOptions={[
          { value: "score_desc", label: "Productivity Score (High to Low)" },
          { value: "trips_desc", label: "Trips Completed (High to Low)" },
          { value: "cost_asc", label: "Cost Per Trip (Low to High)" }
        ]}
        placeholder="Search driver ID, name, vehicle or route..."
      />

      {/* Table */}
      <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-100 dark:bg-[#0F1419] border-b border-slate-200 dark:border-[#2D3748] font-condensed uppercase tracking-wider text-slate-600 dark:text-[#9CA3AF]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Driver ID</th>
                <th className="py-3.5 px-4 font-bold">Name</th>
                <th className="py-3.5 px-4 font-bold">Assigned Vehicle</th>
                <th className="py-3.5 px-4 font-bold font-mono text-right">Trips</th>
                <th className="py-3.5 px-4 font-bold text-right">Service Hrs</th>
                <th className="py-3.5 px-4 font-bold text-right">Cost/Trip</th>
                <th className="py-3.5 px-4 font-bold text-right">Productivity Score</th>
                <th className="py-3.5 px-4 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2D3748]/60 font-mono">
              {filteredDrivers.map((d) => {
                let borderClass = "border-l-4 border-l-emerald-500";
                if (d.productivity_score < 75) borderClass = "border-l-4 border-l-amber-500";
                if (d.productivity_score < 65) borderClass = "border-l-4 border-l-red-500";

                return (
                  <tr
                    key={d.id}
                    onClick={() => setSelectedDriver(d)}
                    className={`${borderClass} hover:bg-slate-50 dark:hover:bg-[#2D3748]/40 cursor-pointer transition-colors`}
                  >
                    <td className="py-3.5 px-4 font-bold text-[#0284C7] dark:text-[#06B6D4]">{d.id}</td>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-[#F5F6F8] font-sans font-semibold">{d.name}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-[#9CA3AF]">{d.assigned_vehicle}</td>
                    <td className="py-3.5 px-4 text-right text-slate-900 dark:text-[#F5F6F8] font-bold">{d.trips_this_month}</td>
                    <td className="py-3.5 px-4 text-right text-slate-500 dark:text-[#9CA3AF]">{d.service_hours} h</td>
                    <td className="py-3.5 px-4 text-right text-amber-600 dark:text-[#F59E0B] font-bold">₹{d.cost_per_trip}</td>
                    <td className="py-3.5 px-4 text-right font-bold">
                      <span className={`px-2 py-0.5 rounded border ${
                        d.productivity_score >= 80 ? "bg-emerald-50 dark:bg-[#10B981]/15 text-emerald-700 dark:text-[#10B981] border-emerald-200" : d.productivity_score >= 65 ? "bg-amber-50 dark:bg-[#F59E0B]/15 text-amber-700 dark:text-[#F59E0B] border-amber-200" : "bg-red-50 dark:bg-[#EF4444]/15 text-red-700 dark:text-[#EF4444] border-red-200"
                      }`}>
                        {d.productivity_score} / 100
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge health={d.health_status} status={d.status} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DriverDetailModal
        driver={selectedDriver}
        isOpen={Boolean(selectedDriver)}
        onClose={() => setSelectedDriver(null)}
      />
    </div>
  );
};
