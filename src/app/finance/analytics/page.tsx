"use client";

import { useEffect, useState, useMemo } from 'react';
import Sidebar from "@/components/Sidebar";
import NotificationCenter from "@/components/NotificationCenter";
import ThemeToggle from "@/components/ThemeToggle";
import { useDashboardStore } from '@/store/useDashboardStore';
import { useUIStore } from '@/store/useUIStore';
import { useAlertStore } from '@/store/useAlertStore';
import {
  TrendingUp, TrendingDown, Target, Zap, ShieldCheck, Activity,
  Sparkles, BarChart3, Search, RefreshCw, Calendar, ArrowUpRight, 
  ArrowDownRight, Info, AlertTriangle, CheckCircle2, ChevronRight, 
  LayoutGrid, PieChart, LineChart, Wallet, Scale
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, LineChart as RechartsLineChart, Line
} from 'recharts';

const COLORS = {
  primary: '#39C86A',
  success: '#39C86A',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  muted: '#8a8a8e',
  border: 'rgba(255, 255, 255, 0.08)',
  card: 'rgba(255, 255, 255, 0.03)',
  bg: 'var(--color-bg-body)'
};

const TABS = [
  { id: 'pl',         label: 'P&L Matrix',          icon: LayoutGrid },
  { id: 'revenue',    label: 'Revenue Analysis',    icon: TrendingUp },
  { id: 'expenses',   label: 'Expense Auditing',    icon: TrendingDown },
  { id: 'efficiency', label: 'Efficiency Matrix',   icon: Scale },
  { id: 'ai',         label: 'AI Profit Optimization', icon: Sparkles },
];

export default function ProfitIntelligenceHub() {
  const { transactions, fetchTransactions } = useDashboardStore();
  const { sidebarCollapsed } = useUIStore();
  const [activeTab, setActiveTab] = useState('pl');
  
  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const metrics = useMemo(() => {
    const inc = transactions.filter(t => t.type === 'income');
    const exp = transactions.filter(t => t.type === 'expense');
    const totalInc = inc.reduce((s, t) => s + Number(t.amount), 0);
    const totalExp = exp.reduce((s, t) => s + Number(t.amount), 0);
    const margin = totalInc > 0 ? ((totalInc - totalExp) / totalInc * 100).toFixed(1) : "0";
    return { totalInc, totalExp, profit: totalInc - totalExp, margin };
  }, [transactions]);

  const trendData = [
    { n: 'Jan', rev: 4200, exp: 3800 }, { n: 'Feb', rev: 5100, exp: 3900 },
    { n: 'Mar', rev: 4800, exp: 4100 }, { n: 'Apr', rev: 6200, exp: 4500 },
    { n: 'May', rev: 7400, exp: 5800 }, { n: 'Jun', rev: 8100, exp: 6200 },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: COLORS.bg }}>
      <Sidebar />

      <div style={{ marginLeft: sidebarCollapsed ? 64 : 250, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease' }}>
        <header style={{ height: 72, background: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${COLORS.border}` }}>
          <div>
             <h1 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>Profit Intelligence</h1>
             <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>Advanced Strategic Oversight Engine</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ThemeToggle />
            <NotificationCenter />
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: COLORS.primary, color: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13 }}>P</div>
          </div>
        </header>

        {/* Tab Bar */}
        <div style={{ padding: '0 32px', background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}`, display: 'flex', gap: 32, position: 'sticky', top: 72, zIndex: 40, overflowX: 'auto' }} className="no-scrollbar">
           {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '20px 0',
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? `2px solid ${COLORS.success}` : '2px solid transparent',
                    color: isActive ? COLORS.success : COLORS.muted,
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                >
                   <Icon size={14} /> {tab.label}
                </button>
              )
           })}
        </div>

        <main style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>

           {activeTab === 'pl' && (
             <div className="animate-fade-in">
                <div className="grid-12" style={{ gap: 16, marginBottom: 32 }}>
                   <div className="col-4 card" style={{ padding: '24px' }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 8 }}>Total Revenue</div>
                      <div style={{ fontSize: 28, fontWeight: 950, color: '#fff' }}>${metrics.totalInc.toLocaleString()}</div>
                   </div>
                   <div className="col-4 card" style={{ padding: '24px' }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 8 }}>Total Expenses</div>
                      <div style={{ fontSize: 28, fontWeight: 950, color: COLORS.danger }}>${metrics.totalExp.toLocaleString()}</div>
                   </div>
                   <div className="col-4 card" style={{ padding: '24px' }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 8 }}>Net Profit Margin</div>
                      <div style={{ fontSize: 28, fontWeight: 950, color: COLORS.primary }}>{metrics.margin}%</div>
                   </div>
                </div>

                <div className="card" style={{ padding: '32px' }}>
                   <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 32 }}>Financial Trajectory</h3>
                   <div style={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fill: COLORS.muted, fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.muted, fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12 }} />
                            <Area type="monotone" dataKey="rev" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.05} strokeWidth={3} />
                            <Area type="monotone" dataKey="exp" stroke={COLORS.danger} fill={COLORS.danger} fillOpacity={0.05} strokeWidth={3} />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'ai' && (
             <div className="animate-fade-in">
                <div className="card" style={{ padding: '32px', border: '1px solid rgba(139, 92, 246, 0.2)', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, var(--color-bg-body) 100%)', marginBottom: 32 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                      <Sparkles size={18} color="#a78bfa" />
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0 }}>AI Profit Optimization</h3>
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                         <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Margin Recovery Signal</div>
                         <p style={{ fontSize: 12, color: COLORS.muted }}>Operational inefficiencies in feed management (+18%) are putting pressure on net margins. Implement immediate audit to capture 4.5% recovery.</p>
                      </div>
                      <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                         <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Revenue Expansion Opportunity</div>
                         <p style={{ fontSize: 12, color: COLORS.muted }}>Sustained growth in high-yield crop sectors suggests capacity for 15% acreage expansion in the next cycle.</p>
                      </div>
                   </div>
                </div>
             </div>
           )}

        </main>
      </div>

      <style jsx>{`
        .card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

import React from 'react';
