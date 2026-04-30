"use client";
import { 
  Activity, 
  AlertTriangle, 
  ShieldCheck,
  Zap, 
  Clock, 
  Signal,
  ArrowUpRight,
  Circle
} from 'lucide-react'
import { useEffect, useState } from 'react';
import { useDashboardStore } from '@/store/useDashboardStore';

export default function RightPanel() {
  const [time, setTime] = useState(new Date());
  const { getTotalExpenses, getNetProfit } = useDashboardStore();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const alerts = [
    { 
      title: "Fiscal Pulse", 
      desc: getTotalExpenses() > 10000 ? "Operating spend alert" : "Expenses nominal", 
      color: getTotalExpenses() > 10000 ? "text-amber-500" : "text-teal-500", 
      icon: getTotalExpenses() > 10000 ? AlertTriangle : ShieldCheck 
    },
    { 
      title: "System Sync", 
      desc: "Cloud bridge active", 
      color: "text-teal-500", 
      icon: Signal 
    },
  ];

  return (
    <aside className="fixed right-0 top-0 h-screen w-[260px] bg-[#030406] border-l border-white/[0.03] p-8 flex flex-col gap-10 z-50">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Operational Status</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
            <span className="text-[9px] font-bold text-teal-500">LIVE</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-slate-600 font-mono">
            {time.toLocaleTimeString([], { hour12: false })}
          </span>
        </div>
      </div>

      {/* Sync Node */}
      <div className="glass-panel p-5">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle className="text-white/[0.03]" strokeWidth="8" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
              <circle className="text-teal-500" strokeWidth="8" strokeDasharray={264} strokeDashoffset={264 - (264 * 98) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">98%</div>
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-white uppercase tracking-tight">Sync Index</h3>
            <p className="text-[9px] text-slate-600 font-bold uppercase mt-0.5">Secure</p>
          </div>
        </div>
      </div>

      {/* Alert Stream */}
      <div className="flex flex-col gap-4">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1">Active Alerts</p>
        {alerts.map((alert, i) => (
          <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] group hover:border-teal-500/20 transition-all">
            <div className="flex items-center gap-3 mb-1.5">
              <alert.icon className={`w-3.5 h-3.5 ${alert.color}`} />
              <p className="text-[11px] font-bold text-white uppercase tracking-tight">{alert.title}</p>
            </div>
            <p className="text-[10px] text-slate-600 font-medium tracking-tight px-6 uppercase">
              {alert.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Activity Visualizer */}
      <div className="mt-auto">
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-teal-500" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Live Flow</span>
            </div>
          </div>
          <div className="flex gap-1 h-10 items-end">
            {[40, 70, 45, 90, 65, 80, 50, 85, 40, 60, 75, 55].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 bg-teal-500/10 rounded-t-sm hover:bg-teal-500/30 transition-all" 
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}