import React, { useState } from "react";
import { SlidePanel } from "../common/SlidePanel";
import { StatusBadge } from "../common/StatusBadge";
import { AlertTriangle, CheckCircle, Wrench, Fuel, Calendar, MapPin, User } from "lucide-react";

export const VehicleDetailModal = ({ vehicle, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!vehicle) return null;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "performance", label: "Performance" },
    { id: "routes", label: "Assigned Routes" },
    { id: "maintenance", label: "Maintenance" },
    { id: "utilization", label: "Utilization" }
  ];

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={vehicle.id}
      subtitle={`Reg: ${vehicle.registration_plate} • ${vehicle.vehicle_type}`}
      badge={<StatusBadge health={vehicle.health_status} status={vehicle.status} />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Header Asset Image Card */}
          <div className="relative h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-[#2D3748] flex items-end p-4 shadow-sm group">
            <img
              src="/fleet_depot.jpg"
              alt="Vehicle Asset"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
            <div className="relative z-10 flex items-center justify-between w-full text-white">
              <div className="text-xs font-mono font-bold">
                Depot Yard Location: <span className="text-[#06B6D4]">Bengaluru Central Logistics Hub</span>
              </div>
              <span className="text-[10px] font-mono bg-slate-900/80 border border-[#06B6D4]/40 px-2 py-0.5 rounded text-[#06B6D4] font-bold">
                GPS TELEM ACTIVE
              </span>
            </div>
          </div>

          {/* Key Metrics Grid */}


          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0F1419] p-3.5 rounded-lg border border-[#2D3748]">
              <div className="text-[10px] font-condensed uppercase font-semibold text-[#9CA3AF]">
                Monthly Revenue
              </div>
              <div className="text-lg font-bold font-mono text-[#10B981] mt-0.5">
                ₹{(vehicle.revenue / 1000).toFixed(0)}K
              </div>
            </div>
            <div className="bg-[#0F1419] p-3.5 rounded-lg border border-[#2D3748]">
              <div className="text-[10px] font-condensed uppercase font-semibold text-[#9CA3AF]">
                Op. Cost
              </div>
              <div className="text-lg font-bold font-mono text-[#EF4444] mt-0.5">
                ₹{(vehicle.operating_cost / 1000).toFixed(0)}K
              </div>
            </div>
            <div className="bg-[#0F1419] p-3.5 rounded-lg border border-[#2D3748]">
              <div className="text-[10px] font-condensed uppercase font-semibold text-[#9CA3AF]">
                Contribution
              </div>
              <div className="text-lg font-bold font-mono text-[#06B6D4] mt-0.5">
                ₹{(vehicle.contribution / 1000).toFixed(0)}K
              </div>
            </div>
            <div className="bg-[#0F1419] p-3.5 rounded-lg border border-[#2D3748]">
              <div className="text-[10px] font-condensed uppercase font-semibold text-[#9CA3AF]">
                Margin %
              </div>
              <div className={`text-lg font-bold font-mono mt-0.5 ${
                vehicle.margin_pct > 20 ? "text-[#10B981]" : vehicle.margin_pct > 10 ? "text-[#F59E0B]" : "text-[#EF4444]"
              }`}>
                {vehicle.margin_pct}%
              </div>
            </div>
          </div>

          {/* Anomaly Alert Box if Loss / Warning */}
          {vehicle.health_status !== "Healthy" && (
            <div className="bg-[#EF4444]/10 border-status-red border border-[#EF4444]/30 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs text-[#EF4444] uppercase font-condensed tracking-wider">
                  Cost Anomaly Flagged by Backend
                </div>
                <div className="text-xs text-[#F5F6F8] mt-1 font-sans">
                  This vehicle is operating at {vehicle.margin_pct}% contribution margin vs fleet 45% benchmark.
                  High fuel consumption ({vehicle.fuel_efficiency_km} km/L) and maintenance overhead.
                </div>
              </div>
            </div>
          )}

          {/* Operational Details List */}
          <div className="bg-[#0F1419] p-4 rounded-lg border border-[#2D3748] space-y-3">
            <h4 className="text-xs font-bold uppercase font-condensed tracking-wider text-[#9CA3AF]">
              Operational Assignment & Status
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-[#9CA3AF]">Driver:</span>{" "}
                <span className="text-[#F5F6F8] font-bold">{vehicle.assigned_driver}</span>
              </div>
              <div>
                <span className="text-[#9CA3AF]">Engine Hours:</span>{" "}
                <span className="text-[#F5F6F8] font-bold">{vehicle.engine_hours} hrs ({vehicle.engine_life_pct}% life)</span>
              </div>
              <div>
                <span className="text-[#9CA3AF]">Next Service:</span>{" "}
                <span className="text-[#06B6D4] font-bold">{vehicle.next_service_days} days</span>
              </div>
              <div>
                <span className="text-[#9CA3AF]">Cost per km:</span>{" "}
                <span className="text-[#F5F6F8] font-bold">₹{vehicle.cost_per_km}/km</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === "performance" && (
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase font-condensed tracking-wider text-[#9CA3AF]">
            Cost Allocation Breakdown (This Month)
          </h4>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center bg-[#0F1419] p-3 rounded border border-[#2D3748]">
              <span className="text-[#9CA3AF]">Fuel Expense:</span>
              <span className="text-[#F5F6F8] font-bold">₹{vehicle.fuel_cost_monthly.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center bg-[#0F1419] p-3 rounded border border-[#2D3748]">
              <span className="text-[#9CA3AF]">Maintenance & Spares:</span>
              <span className="text-[#F5F6F8] font-bold">₹{vehicle.maintenance_cost_monthly.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center bg-[#0F1419] p-3 rounded border border-[#2D3748]">
              <span className="text-[#9CA3AF]">Allocated Driver Salary:</span>
              <span className="text-[#F5F6F8] font-bold">₹{vehicle.driver_cost_monthly.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center bg-[#0F1419] p-3 rounded border border-[#2D3748]">
              <span className="text-[#9CA3AF]">Overhead Allocation:</span>
              <span className="text-[#F5F6F8] font-bold">₹{vehicle.allocation_cost_monthly.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Routes Tab */}
      {activeTab === "routes" && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase font-condensed tracking-wider text-[#9CA3AF]">
            Assigned Active Routes
          </h4>
          {vehicle.assigned_routes.map((rt) => (
            <div key={rt} className="bg-[#0F1419] p-3 rounded border border-[#2D3748] flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-[#06B6D4]">{rt}</span>
              <StatusBadge status="Active" health="Healthy" size="sm" />
            </div>
          ))}
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === "maintenance" && (
        <div className="space-y-4">
          <div className="bg-[#0F1419] p-4 rounded border border-[#2D3748]">
            <div className="text-xs font-bold text-[#F5F6F8] font-mono">Last Service Date: {vehicle.last_service_date}</div>
            <div className="text-xs text-[#9CA3AF] mt-1">Status: Serviced oil filter, brake pads, transmission check.</div>
          </div>
          <div className="bg-[#0F1419] p-4 rounded border border-[#2D3748]">
            <div className="text-xs font-bold text-[#F59E0B] font-mono">Upcoming Inspection: In {vehicle.next_service_days} Days</div>
            <div className="text-xs text-[#9CA3AF] mt-1">Scheduled: Engine overhaul & tire alignment.</div>
          </div>
        </div>
      )}

      {/* Utilization Tab */}
      {activeTab === "utilization" && (
        <div className="space-y-4">
          <div className="bg-[#0F1419] p-4 rounded border border-[#2D3748] text-center">
            <div className="text-xs text-[#9CA3AF] font-condensed uppercase">Monthly Fleet Utilization Score</div>
            <div className="text-3xl font-bold font-mono text-[#06B6D4] mt-2">{vehicle.utilization_pct}%</div>
            <div className="text-xs text-[#10B981] font-mono mt-1">↑ {vehicle.utilization_trend}% vs last month</div>
          </div>
        </div>
      )}
    </SlidePanel>
  );
};
