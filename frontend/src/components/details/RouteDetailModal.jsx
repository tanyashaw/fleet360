import React, { useState } from "react";
import { SlidePanel } from "../common/SlidePanel";
import { StatusBadge } from "../common/StatusBadge";
import { MapPin, AlertCircle, ArrowRight } from "lucide-react";

export const RouteDetailModal = ({ route, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!route) return null;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "performance", label: "Performance" },
    { id: "vehicles", label: "Assigned Vehicles" },
    { id: "drivers", label: "Driver Allocation" },
    { id: "customer", label: "Customer Info" },
    { id: "exceptions", label: "SLA Exceptions" }
  ];

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={route.route_code}
      subtitle={`${route.origin} → ${route.destination} (${route.distance_km} km)`}
      badge={<StatusBadge health={route.health_status} status={route.status} />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="bg-[#0F1419] p-4 rounded-lg border border-[#2D3748] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#06B6D4]" />
              <div>
                <div className="text-xs font-mono font-bold text-[#F5F6F8]">
                  {route.origin} <ArrowRight className="w-3 h-3 inline text-[#9CA3AF]" /> {route.destination}
                </div>
                <div className="text-xs text-[#9CA3AF] mt-0.5 font-sans">
                  Contract Customer: <span className="text-[#06B6D4] font-semibold">{route.customer_name}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0F1419] p-3.5 rounded-lg border border-[#2D3748]">
              <div className="text-[10px] font-condensed uppercase font-semibold text-[#9CA3AF]">
                Monthly Revenue
              </div>
              <div className="text-lg font-bold font-mono text-[#10B981] mt-0.5">
                ₹{(route.revenue / 1000).toFixed(0)}K
              </div>
            </div>
            <div className="bg-[#0F1419] p-3.5 rounded-lg border border-[#2D3748]">
              <div className="text-[10px] font-condensed uppercase font-semibold text-[#9CA3AF]">
                Total Cost
              </div>
              <div className="text-lg font-bold font-mono text-[#EF4444] mt-0.5">
                ₹{(route.cost / 1000).toFixed(0)}K
              </div>
            </div>
            <div className="bg-[#0F1419] p-3.5 rounded-lg border border-[#2D3748]">
              <div className="text-[10px] font-condensed uppercase font-semibold text-[#9CA3AF]">
                Margin %
              </div>
              <div className={`text-lg font-bold font-mono mt-0.5 ${
                route.margin_pct > 25 ? "text-[#10B981]" : route.margin_pct > 15 ? "text-[#F59E0B]" : "text-[#EF4444]"
              }`}>
                {route.margin_pct}%
              </div>
            </div>
            <div className="bg-[#0F1419] p-3.5 rounded-lg border border-[#2D3748]">
              <div className="text-[10px] font-condensed uppercase font-semibold text-[#9CA3AF]">
                Trips / Mo
              </div>
              <div className="text-lg font-bold font-mono text-[#F5F6F8] mt-0.5">
                {route.trips_per_month}
              </div>
            </div>
          </div>

          <div className="bg-[#0F1419] p-4 rounded-lg border border-[#2D3748] space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-[#9CA3AF]">Cost per KM:</span>
              <span className="text-[#F5F6F8] font-bold">₹{route.cost_per_km}/km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9CA3AF]">Revenue per KM:</span>
              <span className="text-[#10B981] font-bold">₹{route.revenue_per_km}/km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9CA3AF]">SLA On-Time Performance:</span>
              <span className="text-[#06B6D4] font-bold">{route.sla_performance_pct}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === "performance" && (
        <div className="space-y-4">
          <div className="bg-[#0F1419] p-4 rounded border border-[#2D3748]">
            <h4 className="text-xs font-condensed uppercase text-[#9CA3AF] font-bold">Contribution Efficiency</h4>
            <div className="text-2xl font-bold font-mono text-[#10B981] mt-1">{route.margin_pct}% Margin</div>
            <p className="text-xs text-[#9CA3AF] mt-2">
              Route delivers high revenue volume (₹{route.revenue.toLocaleString()}) with {route.assigned_vehicles} dedicated vehicles.
            </p>
          </div>
        </div>
      )}

      {/* Vehicles Tab */}
      {activeTab === "vehicles" && (
        <div className="space-y-3">
          <div className="bg-[#0F1419] p-4 rounded border border-[#2D3748] text-xs font-mono">
            Assigned Fleet: <span className="text-[#06B6D4] font-bold">{route.assigned_vehicles} Vehicles</span>
          </div>
        </div>
      )}

      {/* Drivers Tab */}
      {activeTab === "drivers" && (
        <div className="space-y-3">
          <div className="bg-[#0F1419] p-4 rounded border border-[#2D3748] text-xs font-mono">
            Lead Route Driver: <span className="text-[#F5F6F8] font-bold">{route.assigned_driver}</span>
          </div>
        </div>
      )}

      {/* Customer Tab */}
      {activeTab === "customer" && (
        <div className="space-y-3">
          <div className="bg-[#0F1419] p-4 rounded border border-[#2D3748] text-xs font-mono">
            Contract Account: <span className="text-[#06B6D4] font-bold">{route.customer_name}</span>
          </div>
        </div>
      )}

      {/* Exceptions Tab */}
      {activeTab === "exceptions" && (
        <div className="space-y-3">
          <div className="bg-[#0F1419] p-4 rounded border border-[#2D3748] flex items-center justify-between text-xs font-mono">
            <span className="text-[#9CA3AF]">SLA Delay Exceptions:</span>
            <span className="text-[#EF4444] font-bold">{route.exceptions_count} Incident(s)</span>
          </div>
        </div>
      )}
    </SlidePanel>
  );
};
