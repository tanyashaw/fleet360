import React, { useState } from "react";
import { Settings, Sliders, Shield, Save } from "lucide-react";

export const SettingsPage = () => {
  const [fuelWeight, setFuelWeight] = useState(40);
  const [maintWeight, setMaintWeight] = useState(30);
  const [driverWeight, setDriverWeight] = useState(20);
  const [overheadWeight, setOverheadWeight] = useState(10);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between border-b border-[#2D3748] pb-4">
        <div>
          <h2 className="text-2xl font-bold font-condensed uppercase tracking-wider text-[#F5F6F8]">
            COST ALLOCATION ENGINE CONFIGURATION
          </h2>
          <p className="text-xs text-[#9CA3AF] font-mono mt-0.5">
            Backend Analytics Service Weights & Threshold Parameters
          </p>
        </div>
      </div>

      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-xl p-6 space-y-6">
        <h3 className="text-sm font-bold uppercase font-condensed tracking-wider text-[#06B6D4]">
          Cost Allocation Weights (%)
        </h3>

        <div className="space-y-4 font-mono text-xs">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[#9CA3AF]">Fuel Expense Weight:</span>
              <span className="text-[#06B6D4] font-bold">{fuelWeight}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              value={fuelWeight}
              onChange={(e) => setFuelWeight(Number(e.target.value))}
              className="w-full accent-[#06B6D4]"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[#9CA3AF]">Maintenance & Spares Weight:</span>
              <span className="text-[#06B6D4] font-bold">{maintWeight}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              value={maintWeight}
              onChange={(e) => setMaintWeight(Number(e.target.value))}
              className="w-full accent-[#06B6D4]"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[#9CA3AF]">Driver Salary Allocation:</span>
              <span className="text-[#06B6D4] font-bold">{driverWeight}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="40"
              value={driverWeight}
              onChange={(e) => setDriverWeight(Number(e.target.value))}
              className="w-full accent-[#06B6D4]"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[#9CA3AF]">Shared Overhead Allocation:</span>
              <span className="text-[#06B6D4] font-bold">{overheadWeight}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              value={overheadWeight}
              onChange={(e) => setOverheadWeight(Number(e.target.value))}
              className="w-full accent-[#06B6D4]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#2D3748] flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#06B6D4] hover:bg-[#06B6D4]/80 text-[#0F1419] font-bold text-xs font-condensed uppercase rounded-lg transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saved ? "Configuration Saved!" : "Save Parameters"}
          </button>
        </div>
      </div>
    </div>
  );
};
