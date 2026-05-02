"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from "@/components/Sidebar";
import NotificationCenter from "@/components/NotificationCenter";
import ThemeToggle from "@/components/ThemeToggle";
import { useUIStore } from '@/store/useUIStore';
import { 
  LineChart, BarChart3, TrendingUp, TrendingDown, 
  Target, Sparkles, Zap, DollarSign, Activity,
  PieChart as LucidePieChart, ArrowUpRight, 
  ArrowDownRight, RefreshCw, Calendar, Filter,
  Download, Layers, Briefcase, Share2, MoreVertical,
  ChevronRight, ArrowRightLeft, ShieldAlert,
  ArrowRight, FileText, ChevronDown, Clock, Search, AlertTriangle
} from "lucide-react";
import { exportToCSV } from '@/lib/exportUtils';
import { toast, Toaster } from 'react-hot-toast';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart as RePieChart, Pie, Legend, ComposedChart, Line
} from 'recharts';

const performanceData = [
  { name: 'Jan', revenue: 45000, expenses: 32000, profit: 13000, mortality: 1.2, feed: 12000 },
  { name: 'Feb', revenue: 52000, expenses: 34000, profit: 18000, mortality: 1.4, feed: 13500 },
  { name: 'Mar', revenue: 48000, expenses: 38000, profit: 10000, mortality: 1.1, feed: 14000 },
  { name: 'Apr', revenue: 61000, expenses: 42000, profit: 19000, mortality: 2.1, feed: 18000 },
  { name: 'May', revenue: 55000, expenses: 39000, profit: 16000, mortality: 1.5, feed: 15500 },
  { name: 'Jun', revenue: 67000, expenses: 41000, profit: 26000, mortality: 1.3, feed: 16000 },
];

export default function AnalyticsPage() {
  const { sidebarCollapsed } = useUIStore();
  const [mountedTime, setMountedTime] = useState("");
  const [comparisonMode, setComparisonMode] = useState('YoY');
  const [timeFilter, setTimeFilter] = useState('30D');

  useEffect(() => {
    setMountedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const handleExport = (format: string) => {
    if (format === 'Excel' || format === 'CSV') {
      const dataToExport = performanceData.map(d => ({
        Month: d.name,
        Revenue: d.revenue,
        Expenses: d.expenses,
        Profit: d.profit,
        'Mortality Rate': `${d.mortality}%`,
        'Feed Cost': d.feed
      }));
      exportToCSV(dataToExport, 'Decision_Intelligence_Report');
    } else {
      const id = toast.loading(`Generating high-fidelity ${format} report...`);
      setTimeout(() => {
        toast.success(`${format} export complete. Financial matrix archived.`, { id, icon: format === 'PDF' ? '📄' : '📊' });
      }, 2000);
    }
  };

  const handleAuditAction = () => {
    const id = toast.loading('Initiating deep-scan audit of fiscal drift...');
    setTimeout(() => {
      toast.success('Audit Complete: No critical compliance failures detected.', { id, icon: '🛡️' });
    }, 2500);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', maxWidth: '100vw', overflow: 'hidden', background: 'var(--color-bg-body)' }}>
      <Toaster position="top-right" />
      <Sidebar />

      <div style={{ marginLeft: sidebarCollapsed ? 64 : 250, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease', overflow: 'hidden' }}>
        
        <header style={{ height: 72, background: 'var(--color-surface-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid var(--color-border)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
             <div>
                <h1 style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-text-primary)', margin: 0 }}>Decision Intelligence</h1>
                <p className="label-small">Strategic forecasting & operational auditing</p>
             </div>
             
             <div style={{ display: 'flex', gap: 6, background: 'var(--color-surface-input)', padding: '4px', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                {['7D', '30D', 'Q', 'Custom'].map(f => (
                   <button 
                     key={f}
                     onClick={() => setTimeFilter(f)}
                     className="btn-secondary"
                     style={{ 
                        padding: '6px 12px', fontSize: 11, borderRadius: 8, border: 'none',
                        background: timeFilter === f ? 'var(--color-surface-elevated)' : 'transparent',
                        color: timeFilter === f ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                        borderColor: timeFilter === f ? 'var(--color-border-strong)' : 'transparent'
                     }}
                   >
                     {f}
                   </button>
                ))}
             </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="label-small" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} /> Synced: {mountedTime}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
               <button className="btn-secondary" onClick={() => handleExport('PDF')} style={{ padding: '8px 16px', cursor: 'pointer' }}><Download size={14} /> PDF</button>
               <button className="btn-secondary" onClick={() => handleExport('Excel')} style={{ padding: '8px 16px', cursor: 'pointer' }}><FileText size={14} /> Excel</button>
            </div>
            <ThemeToggle />
            <NotificationCenter />
          </div>
        </header>

        <main style={{ padding: '40px', flex: 1, overflowY: 'auto' }} className="page-padding">
           <div className="max-container">
          
              {/* 1. ANALYTICS COMMAND HERO */}
              <div className="card" style={{ marginBottom: 32, padding: '40px', background: 'radial-gradient(circle at top right, rgba(34, 197, 94, 0.08), transparent 40%), var(--color-surface-card)', border: '1px solid var(--color-primary-glow)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                          <span className="label-small" style={{ color: 'var(--color-text-muted)' }}>Performance Status:</span>
                          <span className="badge-healthy">STRONG</span>
                       </div>
                       
                       <div style={{ display: 'flex', gap: 64, marginBottom: 32 }}>
                          <div>
                             <div className="label-small" style={{ marginBottom: 4 }}>Profit Change %</div>
                             <div className="metric-main" style={{ color: 'var(--color-primary)' }}>+18.4% <ArrowUpRight size={24} style={{ verticalAlign: 'middle' }} /></div>
                          </div>
                          <div>
                             <div className="label-small" style={{ marginBottom: 4 }}>Expense Growth</div>
                             <div className="metric-main" style={{ color: 'var(--color-warning)' }}>+4.2% <TrendingUp size={24} style={{ verticalAlign: 'middle' }} /></div>
                          </div>
                          <div>
                             <div className="label-small" style={{ marginBottom: 4 }}>Efficiency Score</div>
                             <div className="metric-main">88/100</div>
                          </div>
                       </div>

                       <div className="card-elevated" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderRadius: 16, maxWidth: 800 }}>
                          <Sparkles size={18} color="var(--color-warning)" />
                          <div className="text-body" style={{ color: 'var(--color-text-primary)' }}>
                             <span style={{ fontWeight: 800 }}>AI Summary:</span> Profitability is at a 6-month high, primarily driven by optimized livestock margins and a 12% reduction in fuel burn rate.
                          </div>
                       </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <div className="label-small" style={{ marginBottom: 8 }}>Est. Savings Opportunity</div>
                       <div className="metric-main" style={{ color: 'var(--color-info)', fontSize: 28 }}>$14,200</div>
                       <div className="label-small" style={{ marginTop: 4, textTransform: 'none' }}>Identified in Feed & Labor leakage</div>
                    </div>
                 </div>
              </div>

              {/* 2. YEAR COMPARISON ENGINE */}
              <div className="card" style={{ padding: '32px', marginBottom: 32 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <div>
                       <h3 className="section-title" style={{ color: 'var(--color-text-primary)', textTransform: 'none', fontSize: 18 }}>Comparative Performance Matrix</h3>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <p className="text-body" style={{ margin: 0 }}>Analyzing fiscal drift vs previous periods</p>
                          <button className="btn-secondary" onClick={handleAuditAction} style={{ padding: '4px 12px', fontSize: 10, borderRadius: 20, background: 'rgba(34, 197, 94, 0.05)', color: 'var(--color-primary)', border: '1px solid var(--color-primary-glow)', cursor: 'pointer' }}>RUN AUDIT</button>
                       </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, background: 'var(--color-surface-input)', padding: '6px', borderRadius: 12, border: '1px solid var(--color-border)' }}>
                       {['YoY', 'MoM', 'Quarterly'].map(m => (
                          <button 
                            key={m}
                            onClick={() => setComparisonMode(m)}
                            className="btn-secondary"
                            style={{ 
                                padding: '8px 16px', fontSize: 12, borderRadius: 8, border: 'none',
                                background: comparisonMode === m ? 'var(--color-text-primary)' : 'transparent',
                                color: comparisonMode === m ? '#101010' : 'var(--color-text-muted)',
                                fontWeight: 950,
                                boxShadow: comparisonMode === m ? '0 4px 12px rgba(255,255,255,0.1)' : 'none',
                                cursor: 'pointer'
                            }}
                          >
                            {m}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="grid-12">
                    {[
                       { label: 'Revenue', current: '$67,000', prev: '$58,400', change: '+14.7%', up: true },
                       { label: 'Expenses', current: '$41,000', prev: '$39,200', change: '+4.5%', up: false, warning: true },
                       { label: 'Net Profit', current: '$26,000', prev: '$19,200', change: '+35.4%', up: true },
                       { label: 'Feed Cost', current: '$16,000', prev: '$14,500', change: '+10.3%', up: false, danger: true },
                       { label: 'Labor Cost', current: '$12,400', prev: '$12,800', change: '-3.1%', up: true, flip: true },
                       { label: 'Mortality Rate', current: '1.3%', prev: '1.8%', change: '-27.7%', up: true, flip: true },
                    ].map((stat, i) => (
                       <div 
                          key={i} 
                          className="card-elevated" 
                          onClick={() => toast(`Deep analysis of ${stat.label} drift active.`, { icon: '🔍' })}
                          style={{ gridColumn: 'span 2', padding: '20px', borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          <div className="label-small" style={{ marginBottom: 12 }}>{stat.label}</div>
                          <div style={{ fontSize: 20, fontWeight: 950, color: 'var(--color-text-primary)', marginBottom: 4 }}>{stat.current}</div>
                          <div className="label-small" style={{ marginBottom: 12, textTransform: 'none' }}>vs {stat.prev}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 900, color: (stat.flip ? (stat.up ? 'var(--color-primary)' : 'var(--color-danger)') : (stat.up ? 'var(--color-primary)' : (stat.danger ? 'var(--color-danger)' : 'var(--color-warning)'))) }}>
                             {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                             {stat.change}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="grid-12" style={{ marginBottom: 32 }}>
                 {/* 3. TREND CHARTS */}
                 <div className="card" style={{ gridColumn: 'span 8', padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                       <h3 className="section-title" style={{ color: 'var(--color-text-primary)', textTransform: 'none', fontSize: 18 }}>Revenue vs Expenses Matrix</h3>
                       <div style={{ display: 'flex', gap: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                             <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)' }} />
                             <span className="label-small">Revenue</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                             <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-danger)' }} />
                             <span className="label-small">Expenses</span>
                          </div>
                       </div>
                    </div>
                    <div style={{ height: 350 }}>
                       <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={performanceData}>
                             <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} dy={10} />
                             <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
                             <RechartsTooltip contentStyle={{ background: 'var(--color-surface-sidebar)', border: '1px solid var(--color-border)', borderRadius: 12 }} />
                             <Area type="monotone" dataKey="revenue" fill="var(--color-primary)" fillOpacity={0.08} stroke="var(--color-primary)" strokeWidth={3} />
                             <Area type="monotone" dataKey="expenses" fill="var(--color-danger)" fillOpacity={0.08} stroke="var(--color-danger)" strokeWidth={3} />
                             <Line type="monotone" dataKey="feed" stroke="var(--color-warning)" strokeWidth={2} strokeDasharray="5 5" />
                          </ComposedChart>
                       </ResponsiveContainer>
                    </div>
                    <div className="card-elevated" style={{ marginTop: 24, padding: '12px 20px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                       <AlertTriangle size={16} color="var(--color-danger)" />
                       <span className="text-body" style={{ color: 'var(--color-text-primary)' }}>
                          <span style={{ fontWeight: 900 }}>Anomaly Detected (Apr):</span> Feed cost spike identified. Correlation found with Broiler mortality surge.
                       </span>
                    </div>
                 </div>

                 <div style={{ gridColumn: 'span 4' }}>
                    {/* 4. AI INSIGHT PANEL */}
                    <div className="card" style={{ padding: '32px', marginBottom: 24 }}>
                       <h3 className="label-small" style={{ color: 'var(--color-text-primary)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Sparkles size={18} color="var(--color-warning)" /> Performance Signals
                       </h3>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          {[
                             { text: "Feed cost increased 10.3% this period; review vendor contracts.", type: "danger" },
                             { text: "Profit growth primarily driven by Livestock margin expansion.", type: "success" },
                             { text: "Labor efficiency improved by 3.1% due to automation tracking.", type: "success" },
                             { text: "Mortality above normal range in Broiler sector (April Anomaly).", type: "warning" }
                          ].map((insight, i) => (
                             <div key={i} className="card-elevated" style={{ padding: '16px', borderRadius: 16, display: 'flex', gap: 12 }}>
                                <Zap size={16} color={insight.type === 'success' ? 'var(--color-primary)' : (insight.type === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)')} style={{ flexShrink: 0 }} />
                                <div className="text-body" style={{ color: 'var(--color-text-primary)' }}>{insight.text}</div>
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* 6. COST BREAKDOWN */}
                    <div className="card" style={{ padding: '32px' }}>
                       <h3 className="label-small" style={{ color: 'var(--color-text-primary)', marginBottom: 24 }}>Expense Contributions</h3>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                          {[
                             { label: 'Feed', value: '$16,000', pct: 39, color: 'var(--color-info)' },
                             { label: 'Labor', value: '$12,400', pct: 30, color: 'var(--color-primary)' },
                             { label: 'Fuel', value: '$5,200', pct: 12, color: 'var(--color-warning)' },
                             { label: 'Fertilizer', value: '$4,100', pct: 10, color: 'var(--color-danger)' },
                             { label: 'Medicine', value: '$3,300', pct: 9, color: 'var(--color-ai)' }
                       ].map((exp, i) => (
                          <div key={i}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span className="text-body" style={{ fontWeight: 800 }}>{exp.label}</span>
                                <span style={{ fontWeight: 900, color: 'var(--color-text-primary)', fontSize: 12 }}>{exp.value} <span className="label-small">({exp.pct}%)</span></span>
                             </div>
                             <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                                <div style={{ height: '100%', width: `${exp.pct}%`, background: exp.color, borderRadius: 2 }} />
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           <div className="grid-12">
              {/* 7. OPERATIONAL EFFICIENCY */}
              <div className="card" style={{ gridColumn: 'span 4', padding: '32px' }}>
                 <h3 className="label-small" style={{ color: 'var(--color-text-primary)', marginBottom: 24 }}>Efficiency Metrics</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ textAlign: 'center' }}>
                       <div className="metric-main" style={{ color: 'var(--color-primary)' }}>1.24x</div>
                       <div className="label-small" style={{ marginTop: 4 }}>Feed Efficiency</div>
                       <p className="label-small" style={{ marginTop: 8, textTransform: 'none' }}>Optimal Range: 1.15 - 1.25</p>
                    </div>
                    <div style={{ width: '100%', height: 1, background: 'var(--color-border)' }} />
                    <div style={{ textAlign: 'center' }}>
                       <div className="metric-main" style={{ color: 'var(--color-info)' }}>92%</div>
                       <div className="label-small" style={{ marginTop: 4 }}>Labor Efficiency</div>
                    </div>
                    <div style={{ width: '100%', height: 1, background: 'var(--color-border)' }} />
                    <div style={{ textAlign: 'center' }}>
                       <div className="metric-main">94.2</div>
                       <div className="label-small" style={{ marginTop: 4 }}>Performance Score</div>
                    </div>
                 </div>
              </div>

              {/* 8. PROFIT DRIVERS */}
              <div className="card" style={{ gridColumn: 'span 8', padding: '32px' }}>
                 <h3 className="label-small" style={{ color: 'var(--color-text-primary)', marginBottom: 24 }}>Profit & Loss Drivers</h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="card-elevated" style={{ padding: '24px', background: 'rgba(34, 197, 94, 0.08)', borderRadius: 20, border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-primary)', marginBottom: 16 }}>
                          <ArrowUpRight size={20} />
                          <span style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase' }}>Positive Drivers</span>
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                             <span className="text-body">Poultry (Layers)</span>
                             <span style={{ fontWeight: 950, color: 'var(--color-text-primary)' }}>+$12.4k</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                             <span className="text-body">Crops (Corn)</span>
                             <span style={{ fontWeight: 950, color: 'var(--color-text-primary)' }}>+$8.2k</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                             <span className="text-body">Input Efficiency</span>
                             <span style={{ fontWeight: 950, color: 'var(--color-text-primary)' }}>+4.1%</span>
                          </div>
                       </div>
                    </div>
                    <div className="card-elevated" style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 20, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-danger)', marginBottom: 16 }}>
                          <ArrowDownRight size={20} />
                          <span style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase' }}>Negative Drivers</span>
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                             <span className="text-body">Broiler Mortality</span>
                             <span style={{ fontWeight: 950, color: 'var(--color-danger)' }}>-$4.2k</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                             <span className="text-body">Feed Cost Drift</span>
                             <span style={{ fontWeight: 950, color: 'var(--color-danger)' }}>-$2.8k</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                             <span className="text-body">Maintenance Spike</span>
                             <span style={{ fontWeight: 950, color: 'var(--color-danger)' }}>-$1.5k</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           </div>
        </main>
      </div>

    </div>
  );
}

import React from 'react';
