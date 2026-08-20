import React, { useEffect, useState } from "react";
import { MetricCard } from "../components/common/MetricCard";
import { RevenueMarginChart } from "../components/charts/RevenueMarginChart";
import { ProfitabilityBarChart } from "../components/charts/ProfitabilityBarChart";
import { RoutePipelineChart } from "../components/charts/RoutePipelineChart";
import { api } from "../services/api";
import { AlertTriangle, Monitor, Truck, ShieldCheck, Eye } from "lucide-react";

export const DashboardPage = ({ onNavigate }) => {
  const [summary, setSummary] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    const fetchFastData = async () => {
      try {
        const [sum, v] = await Promise.all([
          api.getDashboardSummary(),
          api.getVehiclesRanking()
        ]);
        setSummary(sum);
        setVehicles(v);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchFastData();

    // Fetch AI insights in background without blocking initial render
    api.getInsights()
      .then((ins) => setInsights(ins || []))
      .catch((e) => console.warn("Background insights load error:", e));
  }, []);

  if (!summary) {
    return <div className="p-8 text-center text-slate-500 font-mono">Loading Operations Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2D3748] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#0284C7]/10 text-[#0284C7] dark:text-[#06B6D4] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#0284C7]/30">
              FASTAPI ANALYTICS ENGINE ACTIVE
            </span>
          </div>
          <h2 className="text-3xl font-extrabold font-condensed uppercase tracking-wider text-slate-900 dark:text-[#F5F6F8]">
            FLEET360 OPERATIONS COMMAND CENTER
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#9CA3AF] font-mono mt-0.5">
            Real-Time Vehicle Telematics, Cost Allocation & SLA Dispatch Engine
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-[#10B981]/15 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-[#10B981]/30 text-emerald-700 dark:text-[#10B981] font-mono text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          24/7 Operations Live
        </div>
      </div>

      {/* OPERATIONS VISUAL GALLERY - 3 CLEAR FEATURED PICTURE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Image 1: Command Center */}
        <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
          <div className="relative h-48 overflow-hidden bg-slate-100">
            <img
              src="/command_center.jpg"
              alt="Logistics Command Center"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-[#0284C7]" />
              COMMAND CENTER FEED
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-condensed font-bold text-base uppercase text-slate-900 dark:text-[#F5F6F8]">
                Central Operations Monitoring
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#9CA3AF] mt-1">
                24/7 Wall of Monitors tracking active routes, dispatch status, and cost anomaly alerts.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#2D3748] flex justify-between items-center text-xs font-mono text-[#0284C7] dark:text-[#06B6D4] font-bold">
              <span>Status: Operational</span>
              <Eye className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Image 2: Fleet Depot */}
        <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
          <div className="relative h-48 overflow-hidden bg-slate-100">
            <img
              src="/fleet_depot.jpg"
              alt="Night Fleet Depot"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              CENTRAL LOGISTICS DEPOT
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-condensed font-bold text-base uppercase text-slate-900 dark:text-[#F5F6F8]">
                Central Fleet Yard & Depot
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#9CA3AF] mt-1">
                Active yard tracking for 280 heavy haul container trucks & cargo carriers.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#2D3748] flex justify-between items-center text-xs font-mono text-emerald-600 dark:text-[#10B981] font-bold">
              <span>247 Active Vehicles</span>
              <Eye className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Image 3: Driver Cockpit */}
        <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
          <div className="relative h-48 overflow-hidden bg-slate-100">
            <img
              src="/driver_cockpit.jpg"
              alt="Driver Telematics Cockpit"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              DRIVER TELEMATICS FEED
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-condensed font-bold text-base uppercase text-slate-900 dark:text-[#F5F6F8]">
                On-Board Cockpit Telematics
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#9CA3AF] mt-1">
                Real-time driver efficiency, fuel consumption correlation, and safety telemetry.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#2D3748] flex justify-between items-center text-xs font-mono text-slate-700 dark:text-[#F5F6F8] font-bold">
              <span>45 Drivers On Route</span>
              <Eye className="w-4 h-4 text-[#0284C7]" />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Metric Card & Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Hero Card */}
        <div className="lg:col-span-1 bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xs">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0284C7]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0284C7] dark:bg-[#06B6D4]" />
          <div>
            <div className="text-xs font-semibold tracking-wider text-slate-500 dark:text-[#9CA3AF] uppercase font-condensed">
              Fleet Contribution Margin Today
            </div>
            <div className="text-4xl font-extrabold font-mono text-emerald-600 dark:text-[#10B981] mt-2">
              ₹1.18 Cr
            </div>
            <div className="text-xs text-emerald-600 dark:text-[#10B981] font-mono mt-1 flex items-center gap-1 font-bold">
              ↑ 2.4% vs. yesterday baseline
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#2D3748] text-xs text-slate-500 dark:text-[#9CA3AF] font-sans">
            Calculated after fuel, maintenance, driver salary, and shared overhead allocation.
          </div>
        </div>

        {/* Secondary Metrics 4-Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard
            title="VEHICLES ACTIVE"
            value={`${summary.active_vehicles} / ${summary.total_vehicles}`}
            trend={summary.utilization_trend_pct}
            subtext="88.2% Fleet Active"
            status="healthy"
          />
          <MetricCard
            title="ROUTES ON TIME"
            value={`${summary.routes_on_schedule} / ${summary.routes_total}`}
            trend={0.8}
            subtext="98.2% SLA Compliance"
            status="healthy"
          />
          <MetricCard
            title="CUSTOMERS ACTIVE"
            value={`${summary.customers_active} / ${summary.customers_total}`}
            subtext="2 Contracts at Risk"
            status="warning"
          />
          <MetricCard
            title="AVG UTILIZATION"
            value={`${summary.fleet_utilization_pct}%`}
            trend={summary.utilization_trend_pct}
            subtext="Target: 90%"
            status="healthy"
          />
        </div>
      </div>

      {/* 3 Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RevenueMarginChart />
        <ProfitabilityBarChart vehicles={vehicles} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Route Exception Pipeline (2 cols) */}
        <div className="lg:col-span-2">
          <RoutePipelineChart />
        </div>

        {/* Anomaly Feed (1 col) */}
        <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase font-condensed tracking-wider text-slate-900 dark:text-[#F5F6F8] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Emerging Anomalies
              </h3>
              <button
                onClick={() => onNavigate("insights")}
                className="text-xs text-[#0284C7] dark:text-[#06B6D4] hover:underline font-mono font-bold"
              >
                View all →
              </button>
            </div>

            <div className="space-y-3">
              {insights.slice(0, 3).map((ins) => (
                <div
                  key={ins.id}
                  onClick={() => onNavigate("insights")}
                  className={`p-3 rounded-lg bg-slate-50 dark:bg-[#0F1419] border-l-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1F2E] transition-colors border border-slate-200 dark:border-[#2D3748] ${
                    ins.severity === "HIGH" ? "border-l-red-500" : "border-l-amber-500"
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 dark:text-[#F5F6F8] font-sans truncate">
                    {ins.headline}
                  </div>
                  <div className="text-[10px] font-mono text-red-600 dark:text-[#EF4444] mt-0.5 font-bold">
                    {ins.metric_impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
