"use client";

import { useState, useEffect, useMemo } from 'react';
import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationCenter from "@/components/NotificationCenter";
import { useUIStore } from '@/store/useUIStore';
import { useAppStore } from '@/store/useAppStore';
import { 
  Building2, Tractor, Wrench, Fuel, Sparkles, Plus, 
  Search, Download, LayoutGrid, Timer, AlertTriangle,
  CheckCircle2, Activity, Gauge, Battery, Zap,
  TrendingUp, TrendingDown, History, Info, ArrowUpRight,
  Settings, PenTool as Tool, Truck, Package, MoreVertical,
  AlertCircle, ShieldAlert, CheckCircle, Clock
} from "lucide-react";

import { THEME_COLORS as COLORS, TC } from '@/lib/theme-colors';

export default function InfrastructureOpsPage() {
  const { sidebarCollapsed } = useUIStore();
  const { theme } = useAppStore();
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState('maintenance');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-body)' }}>
      <Sidebar />

      <div style={{ marginLeft: sidebarCollapsed ? 64 : 250, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease' }}>
        <header style={{ height: 72, background: 'var(--bg-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border-soft)' }}>
          <div>
             <h1 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Infrastructure & Operations</h1>
             <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>Strategic asset management and operational command hub</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ThemeToggle />
            <NotificationCenter />
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--status-success)', color: 'var(--text-inverse)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13 }}>I</div>
          </div>
        </header>

        <main style={{ padding: '24px 32px', flex: 1, overflowY: 'auto' }}>
           
           {/* TOP HERO BAR (FULL WIDTH) */}
           <div className="grid-12" style={{ gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Equipment Health', val: '94%', icon: <Activity size={14}/>, color: 'var(--status-success)' },
                { label: 'Active Issues', val: '03', icon: <AlertTriangle size={14}/>, color: 'var(--status-critical)' },
                { label: 'Maint. Cost (MTD)', val: '$4,280', icon: <TrendingDown size={14}/>, color: 'var(--status-info)' },
                { label: 'Supply Status', val: 'Optimal', icon: <Package size={14}/>, color: 'var(--status-success)' },
                { label: 'Vendor Risk', val: 'Low', icon: <ShieldAlert size={14}/>, color: 'var(--status-success)' },
              ].map((card, i) => (
                <div key={i} className="col-2-4 card-compact" style={{ 
                    borderLeft: `2px solid ${card.color}`, 
                    background: isLight ? `color-mix(in srgb, ${card.color}, transparent 92%)` : 'var(--bg-card)',
                    boxShadow: isLight ? `0 4px 12px color-mix(in srgb, ${card.color}, transparent 90%)` : `inset 4px 0 10px ${card.color}10`,
                    transition: 'all 0.2s ease'
                 }}>
                   <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {card.icon} {card.label}
                   </div>
                   <div style={{ fontSize: 18, fontWeight: 950, color: 'var(--text-primary)' }}>{card.val}</div>
                </div>
              ))}
           </div>

           <div className="grid-12" style={{ gap: 24, alignItems: 'flex-start' }}>
              
              {/* MAIN CONTENT (LEFT — 70%) */}
              <div className="col-8">
                 <div className="glass-container">
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-soft)', padding: '0 24px' }}>
                       {[
                         { id: 'maintenance', label: 'Maintenance', icon: Tool },
                         { id: 'feed',        label: 'Feed & Supplies', icon: Package },
                         { id: 'vendors',     label: 'Vendors',   icon: Truck },
                         { id: 'alerts',      label: 'Alerts',    icon: Bell },
                       ].map(tab => {
                          const Icon = tab.icon;
                          const isActive = activeTab === tab.id;
                          return (
                            <button 
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              style={{
                                padding: '16px 0',
                                marginRight: 32,
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
                                transition: 'all 0.2s'
                              }}
                            >
                               <Icon size={14} /> {tab.label}
                            </button>
                          )
                       })}
                    </div>

                    <div style={{ padding: '24px' }}>
                       {activeTab === 'maintenance' && (
                         <div className="animate-fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                               <h4 style={{ fontSize: 14, fontWeight: 800, margin: 0 }}>Active Fleet Maintenance</h4>
                               <button className="btn-small"><Plus size={12}/> New Log</button>
                            </div>
                            <table className="ops-table">
                               <thead>
                                  <tr>
                                     <th>Asset</th>
                                     <th>Schedule</th>
                                     <th>Assigned</th>
                                     <th>Status</th>
                                  </tr>
                               </thead>
                               <tbody>
                                  <tr>
                                     <td><div style={{ fontWeight: 700 }}>John Deere 8R</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>EQ-001</div></td>
                                     <td>48h Rem.</td>
                                     <td>John Doe</td>
                                     <td><span className="badge-warning">PENDING</span></td>
                                  </tr>
                                  <tr>
                                     <td><div style={{ fontWeight: 700 }}>Combine S2</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>EQ-042</div></td>
                                     <td>Overdue</td>
                                     <td>Alex Smith</td>
                                     <td><span className="badge-danger">CRITICAL</span></td>
                                  </tr>
                               </tbody>
                            </table>
                         </div>
                       )}

                       {activeTab === 'feed' && (
                         <div className="animate-fade-in">
                            <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 20 }}>Inventory & Supply Chains</h4>
                            <div className="grid-12" style={{ gap: 12 }}>
                               {[
                                 { name: 'Poultry Feed', qty: '4,200 kg', level: 85, color: COLORS.success },
                                 { name: 'Diesel Fuel', qty: '850 L', level: 32, color: COLORS.warning },
                                 { name: 'Water Treatment', qty: '12 units', level: 92, color: COLORS.success },
                               ].map((s, i) => (
                                 <div key={i} className="col-4" style={{ padding: '16px', background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', borderRadius: 12 }}>
                                    <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 4 }}>{s.name}</div>
                                    <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>{s.qty}</div>
                                    <div style={{ height: 4, background: 'var(--bg-card-elevated)', borderRadius: 2 }}>
                                       <div style={{ width: `${s.level}%`, height: '100%', background: s.color, borderRadius: 2 }} />
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* SIDE PANEL (RIGHT — 30%) */}
              <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                 
                 {/* LIVE ALERTS */}
                 <div className="glass-container" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                       <h3 style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <AlertCircle size={16} color={COLORS.danger} /> Live Alerts
                       </h3>
                       <span style={{ fontSize: 9, fontWeight: 900, color: COLORS.danger }}>3 ACTIVE</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                       <div className="alert-item">
                          <Clock size={14} color={COLORS.danger} />
                          <div>
                             <div style={{ fontSize: 12, fontWeight: 800 }}>Overdue Maintenance</div>
                             <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Combine S2 is 24h past service.</div>
                          </div>
                       </div>
                       <div className="alert-item">
                          <Package size={14} color={COLORS.warning} />
                          <div>
                             <div style={{ fontSize: 12, fontWeight: 800 }}>Low Supplies</div>
                             <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Diesel fuel at 32% capacity.</div>
                          </div>
                       </div>
                       <div className="alert-item">
                          <Truck size={14} color={COLORS.warning} />
                          <div>
                             <div style={{ fontSize: 12, fontWeight: 800 }}>Vendor Delay</div>
                             <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Seed delivery delayed by 48h.</div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* AI OPERATIONS INSIGHTS */}
                 <div className="glass-container" style={{ padding: '24px', borderLeft: `3px solid ${COLORS.success}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                       <Sparkles size={16} color={COLORS.success} />
                       <h3 style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>AI Operations Insights</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                       {[
                         { issue: 'Inefficient Irrigation', impact: '22% Waste', action: 'Shift load to 11AM-3PM' },
                         { issue: 'Tractor Bearing Wear', impact: '$4.5k Risk', action: 'Pre-emptive replacement' },
                         { issue: 'Feed Supply Lag', impact: 'Yield Drop', action: 'Audit regional logistics' },
                       ].map((insight, i) => (
                         <div key={i} style={{ borderBottom: i < 2 ? '1px solid var(--border-soft)' : 'none', paddingBottom: i < 2 ? 16 : 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{insight.issue}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                               <span style={{ fontSize: 10, color: 'var(--status-critical)', fontWeight: 700 }}>{insight.impact} IMPACT</span>
                               <ArrowUpRight size={12} color={COLORS.success} />
                            </div>
                            <div style={{ fontSize: 11, color: COLORS.muted }}>Action: <span style={{ color: 'var(--status-success)' }}>{insight.action}</span></div>
                         </div>
                       ))}
                    </div>
                 </div>

              </div>
           </div>

        </main>
      </div>

      <style jsx>{`
        .col-2-4 { width: calc(20% - 10px); }
        .card-compact {
          background: var(--bg-card);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-soft);
          border-radius: 12px;
          padding: 12px 16px;
        }
        .glass-container {
          background: var(--bg-card);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-soft);
          border-radius: 20px;
          overflow: hidden;
        }
        .ops-table {
           width: 100%;
           border-collapse: collapse;
        }
        .ops-table th {
           text-align: left;
           font-size: 10px;
           color: var(--text-muted);
           text-transform: uppercase;
           padding: 12px;
           border-bottom: 1px solid var(--border-soft);
        }
        .ops-table td {
           padding: 16px 12px;
           font-size: 13px;
           color: var(--text-primary);
           border-bottom: 1px solid var(--border-soft);
        }
        .alert-item {
           display: flex;
           gap: 12px;
           align-items: center;
           padding: 12px;
           background: var(--bg-card-elevated);
           border-radius: 12px;
           border: 1px solid var(--border-soft);
        }
        .btn-small {
           background: var(--status-success);
           color: var(--text-inverse);
           border: none;
           padding: 4px 12px;
           border-radius: 8px;
           font-size: 11px;
           font-weight: 800;
           cursor: pointer;
           display: flex;
           align-items: center;
           gap: 6px;
        }
        .badge-warning { font-size: 9px; font-weight: 900; background: var(--status-warning-glow); color: var(--status-warning); padding: 4px 8px; border-radius: 4px; }
        .badge-danger { font-size: 9px; font-weight: 900; background: var(--status-critical-glow); color: var(--status-critical); padding: 4px 8px; border-radius: 4px; }
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

import { Bell } from "lucide-react";
import React from 'react';
