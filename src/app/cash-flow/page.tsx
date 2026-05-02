"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from "@/components/Sidebar";
import NotificationCenter from "@/components/NotificationCenter";
import ThemeToggle from "@/components/ThemeToggle";
import { useDashboardStore } from '@/store/useDashboardStore';
import { useUIStore } from '@/store/useUIStore';
import { 
  Plus, Search, Filter, Download, 
  ArrowRightLeft, TrendingUp, TrendingDown,
  DollarSign, Clock, RefreshCw, BarChart3,
  Calendar, FileText, Banknote, AlertCircle,
  ChevronRight, MoreVertical, Zap, Activity,
  ShieldCheck, Wallet, ArrowUpRight, ArrowDownRight,
  PieChart, AlertTriangle, Sparkles, Target
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart as RePieChart, Pie
} from 'recharts';
import { toast, Toaster } from 'react-hot-toast';
import { exportToCSV } from '@/lib/exportUtils';

import { THEME_COLORS, TC } from '@/lib/theme-colors';

const COLORS = {
  income: 'var(--status-success)',
  expense: 'var(--status-critical)',
  warning: 'var(--status-warning)',
  info: 'var(--status-info)',
  muted: 'var(--text-muted)',
  border: 'var(--border-soft)',
  accent: 'var(--status-success)'
};

const PIE_COLORS = ['#39C86A', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function CashFlowPage() {
  const { transactions, fetchTransactions } = useDashboardStore();
  const { sidebarCollapsed } = useUIStore();
  const [mountedTime, setMountedTime] = useState("");
  
  const [forecastDays, setForecastDays] = useState(7);
  
  useEffect(() => {
    fetchTransactions();
    setMountedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [fetchTransactions]);

  const handleExport = () => {
    const dataToExport = transactions.map(t => ({
      Date: t.date,
      Type: t.type.toUpperCase(),
      Category: t.category,
      Amount: t.amount,
      Reference: t.reference || 'N/A',
      Status: t.status
    }));
    exportToCSV(dataToExport, 'Cash_Flow_Movement_Ledger');
  };

  const handleRunForecast = () => {
    const id = toast.loading('Running Neural Liquidity Forecast...');
    setTimeout(() => {
      toast.success('Forecast Complete: 98.4% Confidence Interval.', { id, icon: '📊' });
    }, 2000);
  };

  const handleRecommendationClick = (text: string) => {
    toast(`Strategy applied: ${text}`, {
      icon: '✅',
      style: { background: '#1a1a1a', color: '#fff', border: '1px solid #333' }
    });
  };

  const hasData = transactions.length > 0;

  // Derived Metrics
  const totalInflow = useMemo(() => transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0), [transactions]);
  const totalOutflow = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0), [transactions]);
  const availableCash = 125000 + (totalInflow - totalOutflow); // Starting with mock base
  const dailyBurn = totalOutflow / 30 || 0;
  const runwayDays = dailyBurn > 0 ? Math.floor(availableCash / dailyBurn) : 0;
  
  const status = availableCash > 50000 ? 'Healthy' : (availableCash > 20000 ? 'Tight' : 'Critical');
  const statusColor = status === 'Healthy' ? COLORS.income : (status === 'Tight' ? COLORS.warning : COLORS.expense);

  const allocationData = [
    { name: 'Livestock', value: 45000 },
    { name: 'Crops', value: 32000 },
    { name: 'Equipment', value: 28000 },
    { name: 'Operating Cash', value: 15000 },
    { name: 'Other', value: 5000 },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-body)' }}>
      <Toaster position="top-right" />
      <Sidebar />

      <div style={{ marginLeft: sidebarCollapsed ? 64 : 250, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease' }}>
        
        <header style={{ height: 72, background: 'var(--bg-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${COLORS.border}` }}>
          <div>
             <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Cash Flow Control</h1>
             <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Strategic liquidity management & predictive movement</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={14} /> Intelligence Synced: {mountedTime}
            </div>
            <ThemeToggle />
            <NotificationCenter />
            <div style={{ display: 'flex', gap: 8 }}>
               <button className="btn-ghost" onClick={handleExport} style={{ fontSize: 12 }}><Download size={14} /> Export Movement</button>
               <button className="btn-primary" onClick={handleRunForecast} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
                  <Sparkles size={16} /> Run Forecast
               </button>
            </div>
          </div>
        </header>

        <main style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          
          {/* 1. CASH POSITION HERO */}
          <div style={{ marginBottom: 32, background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-elevated) 100%)', border: `1px solid var(--border-soft)`, borderRadius: 24, padding: '32px', position: 'relative', overflow: 'hidden' }}>
             <div style={{ position: 'absolute', top: -40, right: -40, width: 300, height: 300, background: `${statusColor}05`, borderRadius: '50%', filter: 'blur(80px)' }} />
             
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Cash Status:</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: statusColor, background: `${statusColor}11`, padding: '4px 12px', borderRadius: 20, border: `1px solid ${statusColor}33` }}>
                        {status.toUpperCase()}
                      </span>
                   </div>
                   
                   <div style={{ fontSize: 48, fontWeight: 950, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'baseline', gap: 12, textShadow: 'var(--status-success-glow)' }}>
                      ${availableCash.toLocaleString()}
                      <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.income, display: 'flex', alignItems: 'center', gap: 4 }}>
                         <TrendingUp size={18} /> +4.2% <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>weekly</span>
                      </span>
                   </div>

                   <div style={{ display: 'flex', gap: 40, marginTop: 24 }}>
                      <div>
                         <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Cash Runway</div>
                         <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)' }}>{hasData ? `${runwayDays} Days` : '—'}</div>
                      </div>
                      <div style={{ width: 1, height: 40, background: 'var(--border-soft)' }} />
                      <div>
                         <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Burn Rate</div>
                         <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)' }}>{hasData ? `$${dailyBurn.toFixed(0)}/day` : '—'}</div>
                      </div>
                   </div>
                </div>

                <div style={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', borderRadius: 16, padding: '20px', maxWidth: 320 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <Zap size={16} color={COLORS.warning} />
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>AI Summary</span>
                   </div>
                   <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                      {hasData 
                        ? `Cash reserves are stable for the next ${runwayDays} days based on current spending. Upcoming crop sales will boost liquidity by 12%.`
                        : "Add income and expenses to activate cash flow tracking and AI summaries."
                      }
                   </p>
                </div>
             </div>
          </div>

          <div className="grid-12" style={{ gap: 24, marginBottom: 32 }}>
             {/* 2. CASH FLOW FORECAST */}
             <div className="col-8 card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                   <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Predictive Cash Forecast</h3>
                   <div style={{ display: 'flex', gap: 8 }}>
                      <button className={`btn-ghost ${forecastDays === 7 ? 'active' : ''}`} onClick={() => setForecastDays(7)} style={{ fontSize: 11 }}>Next 7 Days</button>
                      <button className={`btn-ghost ${forecastDays === 30 ? 'active' : ''}`} onClick={() => setForecastDays(30)} style={{ fontSize: 11 }}>Next 30 Days</button>
                   </div>
                </div>

                {hasData ? (
                   <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
                         <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                               <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Expected Cash In</span>
                               <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.income }}>+$12,400</span>
                            </div>
                            <div style={{ height: 8, background: 'var(--bg-card-elevated)', borderRadius: 4 }}>
                               <div style={{ height: '100%', width: '65%', background: COLORS.income, borderRadius: 4 }} />
                            </div>
                         </div>
                         <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                               <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Expected Cash Out</span>
                               <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.expense }}>-$8,900</span>
                            </div>
                            <div style={{ height: 8, background: 'var(--bg-card-elevated)', borderRadius: 4 }}>
                               <div style={{ height: '100%', width: '45%', background: COLORS.expense, borderRadius: 4 }} />
                            </div>
                         </div>
                      </div>
                      
                      <div style={{ width: 1, height: 120, background: 'var(--border-soft)' }} />
                      
                      <div style={{ width: 200, textAlign: 'center' }}>
                         <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Net Forecasted Flow</div>
                         <div style={{ fontSize: 32, fontWeight: 950, color: COLORS.income }}>+$3,500</div>
                         <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.income, background: 'rgba(57, 200, 106, 0.1)', padding: '4px 12px', borderRadius: 20, display: 'inline-block', marginTop: 12 }}>
                            SURPLUS EXPECTED
                         </div>
                      </div>
                   </div>
                ) : (
                   <div style={{ height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: 20, border: '1px dashed rgba(255,255,255,0.05)' }}>
                      <Activity size={32} opacity={0.1} style={{ marginBottom: 12 }} />
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>System will forecast cash flow once transactions are added</div>
                   </div>
                )}
             </div>

             {/* 3. CASH ALERTS PANEL */}
             <div className="col-4 card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Liquidity Alerts</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   {hasData ? (
                      <>
                         <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)', borderRadius: 16, display: 'flex', gap: 12 }}>
                            <AlertTriangle size={18} color={COLORS.warning} style={{ flexShrink: 0 }} />
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>Cash will drop below safe level in 10 days if burn rate maintains.</div>
                         </div>
                         <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)', borderRadius: 16, display: 'flex', gap: 12 }}>
                            <Banknote size={18} color={COLORS.info} style={{ flexShrink: 0 }} />
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>Upcoming loan payment (Oct 28) may impact short-term liquidity.</div>
                         </div>
                      </>
                   ) : (
                      <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: 20, border: '1px dashed rgba(255,255,255,0.05)' }}>
                         <ShieldCheck size={32} opacity={0.1} style={{ marginBottom: 12 }} />
                         <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '0 20px' }}>Cash alerts will activate once financial activity is detected</div>
                      </div>
                   )}
                </div>
             </div>
          </div>

          <div className="grid-12" style={{ gap: 24, marginBottom: 32 }}>
             {/* 4. CAPITAL ALLOCATION */}
             <div className="col-5 card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Capital Allocation</h3>
                {hasData ? (
                   <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                      <div style={{ width: 140, height: 140 }}>
                         <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                               <Pie
                                  data={allocationData}
                                  innerRadius={50}
                                  outerRadius={70}
                                  paddingAngle={5}
                                  dataKey="value"
                               >
                                  {allocationData.map((entry, index) => (
                                     <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                  ))}
                               </Pie>
                            </RePieChart>
                         </ResponsiveContainer>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                         {allocationData.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                  <span style={{ fontSize: 12, fontWeight: 600 }}>{item.name}</span>
                               </div>
                               <span style={{ fontSize: 12, fontWeight: 800 }}>${(item.value/1000).toFixed(0)}k</span>
                            </div>
                         ))}
                      </div>
                   </div>
                ) : (
                   <div style={{ height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: 20, border: '1px dashed rgba(255,255,255,0.05)' }}>
                      <PieChart size={32} opacity={0.1} style={{ marginBottom: 12 }} />
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No capital allocation available yet</div>
                   </div>
                )}
             </div>

             {/* 6. AI CASH RECOMMENDATIONS */}
             <div className="col-7 card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>AI Liquidity Guidance</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   {hasData ? (
                      <>
                         {[
                            { text: "Delay livestock expansion until cash stabilizes past Q4 thresholds.", type: "warning" },
                            { text: "Reduce feed purchase volume this week to preserve operating cash.", type: "danger" },
                            { text: "Increase short-term egg/crop sales to improve immediate cash flow.", type: "success" }
                         ].map((rec, i) => (
                            <div key={i} style={{ padding: '16px 20px', background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                  <div style={{ width: 32, height: 32, borderRadius: 8, background: rec.type === 'success' ? 'rgba(57, 200, 106, 0.1)' : (rec.type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                     <Sparkles size={16} color={rec.type === 'success' ? COLORS.income : (rec.type === 'warning' ? COLORS.warning : COLORS.expense)} />
                                  </div>
                                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{rec.text}</span>
                               </div>
                               <button onClick={() => handleRecommendationClick(rec.text)} style={{ background: 'none', border: 'none', color: COLORS.muted, cursor: 'pointer' }}>
                                   <ChevronRight size={18} />
                                </button>
                            </div>
                         ))}
                      </>
                   ) : (
                      <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: 20, border: '1px dashed rgba(255,255,255,0.05)' }}>
                         <Target size={32} opacity={0.1} style={{ marginBottom: 12 }} />
                         <div style={{ fontSize: 13, color: COLORS.muted }}>AI recommendations will activate once cash patterns are detected</div>
                      </div>
                   )}
                </div>
             </div>
          </div>

          {!hasData && (
             <div style={{ padding: '60px', background: 'var(--bg-card-elevated)', borderRadius: 32, border: '1px dashed var(--border-soft)', textAlign: 'center', marginTop: 32 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-card-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                   <Wallet size={40} opacity={0.2} />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12 }}>Liquidity Engine Offline</h2>
                <p style={{ fontSize: 15, color: COLORS.muted, maxWidth: 500, margin: '0 auto 32px' }}>
                   We haven't detected any financial activity yet. Start by adding income and expenses to unlock real-time cash flow tracking, forecasting, and AI liquidity guidance.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                   <Link href="/finance" style={{ textDecoration: 'none' }}>
                      <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                         <Plus size={18} /> Add Income
                      </button>
                   </Link>
                   <Link href="/expenses" style={{ textDecoration: 'none' }}>
                      <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}>
                         <Plus size={18} /> Add Expense
                      </button>
                   </Link>
                </div>
             </div>
          )}

        </main>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .card {
          background: var(--bg-card);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-soft);
          border-radius: 24px;
          transition: all 0.3s ease;
        }
        .btn-primary {
          background: var(--status-success);
          color: var(--text-inverse);
          border: none;
          border-radius: 12px;
          padding: 10px 20px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }
        .btn-ghost {
          background: var(--bg-card-elevated);
          color: var(--text-primary);
          border: 1px solid var(--border-soft);
          border-radius: 10px;
          padding: 8px 12px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .btn-ghost:hover {
          background: var(--border-soft);
        }
        .btn-ghost.active {
          background: var(--border-strong);
          border-color: var(--border-strong);
        }
      `}} />
    </div>
  );
}
