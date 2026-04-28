"use client";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function Home() {
  return (
    <div className="flex bg-[#050B18] text-white min-h-screen">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 pl-[260px] pr-6 py-6">

        <Topbar />

        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-[#0A1330] to-[#0B1A3A] rounded-2xl p-6 mb-6 shadow-xl">
          <h1 className="text-2xl font-semibold">
            Braes Creek HQ / Unified Financial & Operational Cockpit
          </h1>
          <p className="text-gray-400 mt-2">
            Live overview of estate financial and operational performance.
          </p>
        </div>

        {/* Alerts */}
        <div className="space-y-3 mb-6">
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
            ⚠️ Overdue Loans Detected
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
            ⚠️ Equipment Maintenance Required
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Cumulative Op-Ex", value: "$397,950" },
            { label: "Active Payroll", value: "$40,650" },
            { label: "Loan Liability", value: "$735,000" },
            { label: "Livestock Inventory", value: "4,379" },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-[#0B162E] rounded-xl p-5 shadow-md border border-white/5"
            >
              <p className="text-gray-400 text-sm">{card.label}</p>
              <h2 className="text-2xl font-bold mt-2">{card.value}</h2>
            </div>
          ))}
        </div>

        {/* Chart Placeholder */}
        <div className="bg-[#0B162E] rounded-xl p-6 h-[300px] border border-white/5">
          <p className="text-gray-400">Operational Velocity / Spend Trend</p>
        </div>

      </div>
    </div>
  );
}