import React, { useState } from "react";
import { SlidePanel } from "../common/SlidePanel";
import { StatusBadge } from "../common/StatusBadge";
import { User, Award, Shield, DollarSign } from "lucide-react";

export const DriverDetailModal = ({ driver, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!driver) return null;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "performance", label: "Scorecard Trends" },
    { id: "routes", label: "Assigned Routes" },
    { id: "incidents", label: "Incidents & Quality" },
    { id: "training", label: "Peer Comparison" }
  ];

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={driver.name}
      subtitle={`ID: ${driver.id} • Rank: #${driver.rank} of ${driver.total_drivers}`}
      badge={<StatusBadge health={driver.health_status} status={driver.status} />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Header Cockpit Image Card */}
          <div className="relative h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-[#2D3748] flex items-end p-4 shadow-sm group">
            <img
              src="/driver_cockpit.jpg"
              alt="Driver Cockpit"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
            <div className="relative z-10 flex items-center justify-between w-full text-white">
              <div className="text-xs font-mono font-bold">
                Driver Telemetry: <span className="text-emerald-400">Safe Operation Mode</span>
              </div>
              <span className="text-[10px] font-mono bg-slate-900/80 border border-emerald-400/40 px-2 py-0.5 rounded text-emerald-400 font-bold">
                CAM & SENSOR ACTIVE
              </span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0F1419] p-5 rounded-lg border border-slate-200 dark:border-[#06B6D4]/30 flex items-center justify-between">
            <div>

              <div className="text-xs font-condensed uppercase font-bold text-[#9CA3AF]">
                Normalized Productivity Scorecard
              </div>
              <div className="text-3xl font-bold font-mono text-[#06B6D4] mt-1">
                {driver.productivity_score} <span className="text-xs text-[#9CA3AF]">/ 100</span>
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <div className="text-[#10B981] font-bold">Top {Math.round((driver.rank / driver.total_drivers) * 100)}%</div>
              <div className="text-[#9CA3AF]">Rank #{driver.rank} Overall</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0F1419] p-3.5 rounded-lg border border-[#2D3748]">
              <div className="text-[10px] font-condensed uppercase font-semibold text-[#9CA3AF]">
                Trips / Month
              </div>
              <div className="text-lg font-bold font-mono text-[#F5F6F8] mt-0.5">
                {driver.trips_this_month}
              </div>
            </div>
            <div className="bg-[#0F1419] p-3.5 rounded-lg border border-[#2D3748]">
              <div className="text-[10px] font-condensed uppercase font-semibold text-[#9CA3AF]">
                Service Hours
              </div>
              <div className="text-lg font-bold font-mono text-[#06B6D4] mt-0.5">
                {driver.service_hours} hrs
              </div>
            </div>
            <div className="bg-[#0F1419] p-3.5 rounded-lg border border-[#2D3748]">
              <div className="text-[10px] font-condensed uppercase font-semibold text-[#9CA3AF]">
                Attendance
              </div>
              <div className="text-lg font-bold font-mono text-[#10B981] mt-0.5">
                {driver.attendance_pct}%
              </div>
            </div>
            <div className="bg-[#0F1419] p-3.5 rounded-lg border border-[#2D3748]">
              <div className="text-[10px] font-condensed uppercase font-semibold text-[#9CA3AF]">
                Cost / Trip
              </div>
              <div className="text-lg font-bold font-mono text-[#F59E0B] mt-0.5">
                ₹{driver.cost_per_trip}
              </div>
            </div>
          </div>

          <div className="bg-[#0F1419] p-4 rounded-lg border border-[#2D3748] space-y-3 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-[#9CA3AF]">Assigned Vehicle:</span>
              <span className="text-[#06B6D4] font-bold">{driver.assigned_vehicle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9CA3AF]">Primary Route:</span>
              <span className="text-[#F5F6F8] font-bold">{driver.assigned_route}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9CA3AF]">Allocated Monthly Salary:</span>
              <span className="text-[#10B981] font-bold">₹{driver.salary_monthly.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === "performance" && (
        <div className="space-y-4">
          <div className="bg-[#0F1419] p-4 rounded border border-[#2D3748] text-xs font-mono">
            Fuel Correlation Index: <span className="text-[#10B981] font-bold">{driver.fuel_correlation_score}</span>
          </div>
        </div>
      )}

      {/* Routes Tab */}
      {activeTab === "routes" && (
        <div className="space-y-3">
          <div className="bg-[#0F1419] p-4 rounded border border-[#2D3748] text-xs font-mono">
            Active Assignment: <span className="text-[#06B6D4] font-bold">{driver.assigned_route}</span>
          </div>
        </div>
      )}

      {/* Incidents Tab */}
      {activeTab === "incidents" && (
        <div className="space-y-3">
          <div className="bg-[#0F1419] p-4 rounded border border-[#2D3748] flex items-center justify-between text-xs font-mono">
            <span className="text-[#9CA3AF]">Safety Incidents:</span>
            <span className="text-[#F5F6F8] font-bold">{driver.incidents_count} Recorded</span>
          </div>
        </div>
      )}

      {/* Training / Peer Tab */}
      {activeTab === "training" && (
        <div className="space-y-3">
          <div className="bg-[#0F1419] p-4 rounded border border-[#2D3748] text-xs font-mono">
            Ranked #{driver.rank} in trip efficiency among {driver.total_drivers} active drivers.
          </div>
        </div>
      )}
    </SlidePanel>
  );
};
