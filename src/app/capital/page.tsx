"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from "@/components/Sidebar";
import NotificationCenter from "@/components/NotificationCenter";
import ThemeToggle from "@/components/ThemeToggle";
import { useUIStore } from '@/store/useUIStore';
import { 
  Landmark, Building2, Tractor, Wallet, 
  TrendingUp, TrendingDown, ShieldCheck, 
  Zap, Sparkles, DollarSign, Activity, 
  PieChart as LucidePieChart, ArrowUpRight, 
  ArrowDownRight, RefreshCw, Calendar, Filter,
  Download, Layers, Briefcase, Share2, MoreVertical, Plus,
  ChevronRight, ArrowRightLeft, ShieldAlert,
  ArrowRight, FileText, ChevronDown, Clock, Search,
  Warehouse, HardHat, Scale, History
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart as RePieChart, Pie, Legend
} from 'recharts';

const COLORS = {
  success: '#39C86A',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  muted: '#8a8a8e',
  border: 'rgba(255, 255, 255, 0.08)',
  accent: '#39C86A'
};

const CHART_COLORS = ['#39C86A', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const assetData = [
  { name: 'Real Estate', value: 850000, color: '#39C86A' },
  { name: 'Machinery', value: 320000, color: '#3b82f6' },
  { name: 'Livestock', value: 145000, color: '#f59e0b' },
  { name: 'Inventory', value: 68000, color: '#ef4444' },
];

export default function CapitalPage() {
  const { sidebarCollapsed } = useUIStore();
  const [mountedTime, setMountedTime] = useState("");
  
  useEffect(() => {
    setMountedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const totalCapital = assetData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-body)' }}>
      <Sidebar />

      <div style={{ marginLeft: sidebarCollapsed ? 64 : 250, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease' }}>
        
        <header style={{ height: 72, background: 'var(--color-bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${COLORS.border}` }}>
          <div>
             <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>Capital & Asset Control</h1>
             <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>Strategic equity positioning & infrastructure valuation</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontSize: 12, color: COLORS.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={14} /> Asset Registry Synced: {mountedTime}
            </div>
            <ThemeToggle />
            <NotificationCenter />
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
               <Landmark size={16} /> Asset Appraisal
            </button>
          </div>
        </header>

        <main style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          
          {/* 1. CAPITAL HERO */}
          <div className="grid-12" style={{ gap: 24, marginBottom: 32 }}>
             <div className="col-8 card" style={{ padding: '32px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(5, 5, 5, 1) 100%)', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Total Capital Employed</div>
                      <div style={{ fontSize: 48, fontWeight: 950, color: '#fff', display: 'flex', alignItems: 'center', gap: 16 }}>
                         ${totalCapital.toLocaleString()}
                         <div style={{ fontSize: 14, fontWeight: 700, padding: '4px 12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 20, color: COLORS.muted, border: '1px solid rgba(255,255,255,0.1)' }}>
                            Equity Position: 74%
                         </div>
                      </div>
                      <div style={{ fontSize: 14, color: COLORS.muted, marginTop: 12 }}>Capital Health: <span style={{ color: COLORS.success, fontWeight: 700 }}>Excellent (Low Leverage)</span></div>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 8 }}>Net Asset Value (NAV)</div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>$1,383,000</div>
                      <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>Appraised: Q2 2026</div>
                   </div>
                </div>
                
                <div style={{ display: 'flex', gap: 64, marginTop: 40 }}>
                   <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 8 }}>Fixed Assets</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>$1,170,000</div>
                   </div>
                   <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 8 }}>Current Assets</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>$213,000</div>
                   </div>
                   <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 8 }}>Debt-to-Equity</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: COLORS.info }}>0.35x</div>
                   </div>
                </div>
             </div>

             <div className="col-4 card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                   <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(57, 200, 106, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={20} color={COLORS.success} />
                   </div>
                   <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Capital Strategy</div>
                      <div style={{ fontSize: 12, color: COLORS.muted }}>AI-driven equity optimization</div>
                   </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.5 }}>
                         <span style={{ fontWeight: 800, color: COLORS.success }}>Equity Signal:</span> Your strong equity position allows for favorable tractor financing in Q3.
                      </div>
                   </div>
                   <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.5 }}>
                         <span style={{ fontWeight: 800, color: COLORS.info }}>Depreciation:</span> Q2 machinery depreciation is 4% below forecast; maintenance ROI is high.
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="grid-12" style={{ gap: 24, marginBottom: 32 }}>
             {/* 2. ASSET PORTFOLIO */}
             <div className="col-8 card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                   <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0 }}>Asset Portfolio Audit</h3>
                   <div style={{ display: 'flex', gap: 12 }}>
                      <button className="btn-ghost-small"><History size={14} /> History</button>
                      <button className="btn-ghost-small"><Plus size={14} /> Add Asset</button>
                   </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                         <th style={{ padding: '16px', fontSize: 11, color: COLORS.muted, textTransform: 'uppercase' }}>Asset Category</th>
                         <th style={{ padding: '16px', fontSize: 11, color: COLORS.muted, textTransform: 'uppercase' }}>Valuation</th>
                         <th style={{ padding: '16px', fontSize: 11, color: COLORS.muted, textTransform: 'uppercase' }}>Condition</th>
                         <th style={{ padding: '16px', fontSize: 11, color: COLORS.muted, textTransform: 'uppercase' }}>ROI Index</th>
                         <th style={{ padding: '16px', fontSize: 11, color: COLORS.muted, textTransform: 'uppercase' }}>Status</th>
                      </tr>
                   </thead>
                   <tbody>
                      {[
                         { name: 'Braes Creek Main Land', value: '$850,000', cond: 'Prime', roi: '1.2x', status: 'Core' },
                         { name: 'John Deere Fleet (3)', value: '$320,000', cond: 'Good', roi: '0.8x', status: 'Productive' },
                         { name: 'Biological Inventory', value: '$145,000', cond: 'Optimal', roi: '2.4x', status: 'High Growth' },
                         { name: 'Cold Storage Infra', value: '$68,000', cond: 'New', roi: '1.5x', status: 'Strategic' },
                         { name: 'Grain Silos (2)', value: '$45,000', cond: 'Maintenance', roi: '0.9x', status: 'Warning' }
                      ].map((row, i) => (
                         <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '16px' }}>
                               <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{row.name}</div>
                            </td>
                            <td style={{ padding: '16px', fontSize: 14, fontWeight: 700 }}>{row.value}</td>
                            <td style={{ padding: '16px', fontSize: 13, color: COLORS.muted }}>{row.cond}</td>
                            <td style={{ padding: '16px', fontSize: 13, fontWeight: 700, color: COLORS.success }}>{row.roi}</td>
                            <td style={{ padding: '16px' }}>
                               <span style={{ fontSize: 10, fontWeight: 900, padding: '4px 10px', borderRadius: 6, background: row.status === 'Warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(57, 200, 106, 0.1)', color: row.status === 'Warning' ? COLORS.warning : COLORS.success }}>
                                  {row.status.toUpperCase()}
                               </span>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>

             {/* 3. ALLOCATION PIE */}
             <div className="col-4 card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 32 }}>Capital Allocation</h3>
                <div style={{ height: 280 }}>
                   <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                         <Pie
                            data={assetData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={8}
                            dataKey="value"
                         >
                            {assetData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                         </Pie>
                         <RechartsTooltip />
                      </RePieChart>
                   </ResponsiveContainer>
                </div>
                <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                   {assetData.map((s, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                            <span style={{ fontSize: 13, color: COLORS.muted }}>{s.name}</span>
                         </div>
                         <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{((s.value / totalCapital) * 100).toFixed(0)}%</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="grid-12" style={{ gap: 24, marginBottom: 32 }}>
             {/* 4. DEPRECIATION TRACKING */}
             <div className="col-6 card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                   <Scale size={20} color={COLORS.info} />
                   <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Capital Structure</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: COLORS.muted }}>Equity (Owner Capital)</span>
                      <span style={{ fontWeight: 800, color: COLORS.success }}>$1,023,000</span>
                   </div>
                   <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '74%', background: COLORS.success }} />
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: COLORS.muted }}>External Debt (Loans)</span>
                      <span style={{ fontWeight: 800, color: COLORS.danger }}>$360,000</span>
                   </div>
                   <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '26%', background: COLORS.danger }} />
                   </div>
                </div>
             </div>

             {/* 5. CAPEX ROADMAP */}
             <div className="col-6 card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                   <Briefcase size={20} color={COLORS.warning} />
                   <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Strategic CapEx Roadmap</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Tractor size={20} color={COLORS.warning} />
                      </div>
                      <div style={{ flex: 1 }}>
                         <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Tractor Fleet Expansion</div>
                         <div style={{ fontSize: 11, color: COLORS.muted }}>Planned: Q3 2026 • $120,000</div>
                      </div>
                      <ChevronRight size={16} color={COLORS.muted} />
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(57, 200, 106, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Warehouse size={20} color={COLORS.success} />
                      </div>
                      <div style={{ flex: 1 }}>
                         <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Greenhouse Infrastructure</div>
                         <div style={{ fontSize: 11, color: COLORS.muted }}>Planned: Q4 2026 • $45,000</div>
                      </div>
                      <ChevronRight size={16} color={COLORS.muted} />
                   </div>
                </div>
             </div>
          </div>

        </main>
      </div>

      <style jsx>{`
        .card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
        }
        .btn-primary {
          background: #39C86A;
          color: #050505;
          border: none;
          border-radius: 12px;
          padding: 10px 20px;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        .btn-primary:hover {
          background: #4ade80;
          transform: scale(1.02);
        }
        .btn-ghost-small {
          background: rgba(255, 255, 255, 0.03);
          color: #8a8a8e;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-ghost-small:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }
      `}</style>
    </div>
  );
}
