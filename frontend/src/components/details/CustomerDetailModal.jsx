import React, { useState } from "react";
import { SlidePanel } from "../common/SlidePanel";
import { StatusBadge } from "../common/StatusBadge";
import { ShieldAlert, TrendingUp, AlertCircle, FileText } from "lucide-react";

export const CustomerDetailModal = ({ customer, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!customer) return null;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "performance", label: "Performance" },
    { id: "routes", label: "Assigned Routes" },
    { id: "billing", label: "Billing & Cost" },
    { id: "renewal", label: "Renewal Signals" }
  ];

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={customer.name}
      subtitle={`Contract: ${customer.contract_id} • End Date: ${customer.renewal_date}`}
      badge={<StatusBadge health={customer.health_status} status={customer.status} />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0F1419] p-3.5 rounded-lg border border-[#2D3748]">
              <div className="text-[10px] font-condensed uppercase font-semibold text-[#9CA3AF]">
                Monthly Revenue
              </div>
              <div className="text-lg font-bold font-mono text-[#10B981] mt-0.5">
                ₹{(customer.monthly_revenue / 1000).toFixed(0)}K
              </div>
            </div>
            <div className="bg-[#0F1419] p-3.5 rounded-lg border border-[#2D3748]">
              <div className="text-[10px] font-condensed uppercase font-semibold text-[#9CA3AF]">
                Direct Cost
              </div>
              <div className="text-lg font-bold font-mono text-[#EF4444] mt-0.5">
                ₹{(customer.direct_cost / 1000).toFixed(0)}K
              </div>
            </div>
            <div className="bg-[#0F1419] p-3.5 rounded-lg border border-[#2D3748]">
              <div className="text-[10px] font-condensed uppercase font-semibold text-[#9CA3AF]">
                Allocated Cost
              </div>
              <div className="text-lg font-bold font-mono text-[#F59E0B] mt-0.5">
                ₹{(customer.allocated_cost / 1000).toFixed(0)}K
              </div>
            </div>
            <div className="bg-[#0F1419] p-3.5 rounded-lg border border-[#2D3748]">
              <div className="text-[10px] font-condensed uppercase font-semibold text-[#9CA3AF]">
                Margin %
              </div>
              <div className={`text-lg font-bold font-mono mt-0.5 ${
                customer.margin_pct > 25 ? "text-[#10B981]" : customer.margin_pct > 15 ? "text-[#F59E0B]" : "text-[#EF4444]"
              }`}>
                {customer.margin_pct}%
              </div>
            </div>
          </div>

          {/* Quadrant Classification Box */}
          <div className="bg-[#0F1419] p-4 rounded-lg border border-[#2D3748] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-condensed uppercase font-bold text-[#06B6D4]">
                Portfolio Quadrant: {customer.quadrant} - {customer.status}
              </span>
              <span className="text-xs font-mono text-[#9CA3AF]">
                Satisfaction: {customer.satisfaction_score} / 5.0
              </span>
            </div>
            <p className="text-xs text-[#F5F6F8] font-sans">
              Strategic Action: <span className="text-[#06B6D4] font-semibold">{customer.pricing_recommendation}</span>
            </p>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === "performance" && (
        <div className="space-y-4">
          <div className="bg-[#0F1419] p-4 rounded border border-[#2D3748] space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-[#9CA3AF]">Contract YTD Revenue:</span>
              <span className="text-[#10B981] font-bold">₹{(customer.revenue / 1000000).toFixed(2)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9CA3AF]">SLA Delivery Score:</span>
              <span className="text-[#06B6D4] font-bold">{customer.sla_performance_pct}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Routes Tab */}
      {activeTab === "routes" && (
        <div className="space-y-3">
          <div className="bg-[#0F1419] p-4 rounded border border-[#2D3748] text-xs font-mono">
            Dedicated Vehicle Fleet: <span className="text-[#06B6D4] font-bold">{customer.assigned_vehicles_count} Vehicles</span>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === "billing" && (
        <div className="space-y-3">
          <div className="bg-[#0F1419] p-4 rounded border border-[#2D3748] font-mono text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[#9CA3AF]">Direct Vehicle & Driver Cost:</span>
              <span className="text-[#EF4444]">₹{customer.direct_cost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9CA3AF]">Shared Overhead Allocation:</span>
              <span className="text-[#F59E0B]">₹{customer.allocated_cost.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Renewal Tab */}
      {activeTab === "renewal" && (
        <div className="space-y-4">
          <div className="bg-[#0F1419] p-4 rounded border border-[#06B6D4]/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-condensed uppercase font-bold text-[#F5F6F8]">
                Contract Renewal Countdown
              </span>
              <span className="text-xs font-mono font-bold text-[#06B6D4] bg-[#06B6D4]/10 px-2 py-0.5 rounded border border-[#06B6D4]/30">
                {customer.renewal_days} Days Left
              </span>
            </div>
            <div className="text-xs text-[#9CA3AF] font-sans">
              Renewal Probability: <span className="text-[#10B981] font-bold font-mono">{customer.renewal_probability_pct}%</span>
            </div>
            <div className="p-3 bg-[#1A1F2E] rounded border border-[#2D3748] text-xs text-[#F5F6F8]">
              <div className="font-bold text-[#06B6D4] uppercase font-condensed text-[11px]">AI Price Signal Recommendation</div>
              <p className="mt-1">{customer.pricing_recommendation}</p>
            </div>
          </div>
        </div>
      )}
    </SlidePanel>
  );
};
