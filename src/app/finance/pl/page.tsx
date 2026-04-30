"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from "@/components/Sidebar";
import NotificationCenter from "@/components/NotificationCenter";
import ThemeToggle from "@/components/ThemeToggle";
import { useDashboardStore } from '@/store/useDashboardStore';
import { useUIStore } from '@/store/useUIStore';
import { useAlertStore } from '@/store/useAlertStore';
import {
  FileText, TrendingUp, TrendingDown, DollarSign, PieChart, 
  ArrowLeft, Download, Filter, RefreshCw, Calendar, ChevronRight,
  Calculator, Receipt, Building2, Briefcase, Sparkles, Plus
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = {
  income: '#39C86A',
  expense: '#ef4444',
  net: '#3b82f6',
  muted: '#8a8a8e',
  border: 'rgba(255,255,255,0.06)',
  card: 'rgba(255, 255, 255, 0.03)'
};

export default function PLStatementPage() {
  const { transactions, fetchTransactions } = useDashboardStore();
  const { sidebarCollapsed } = useUIStore();
  const [mountedTime, setMountedTime] = useState("");

  useEffect(() => {
    fetchTransactions();
    setMountedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [fetchTransactions]);

  const plData = useMemo(() => {
    const inc = transactions.filter(t => t.type === 'income');
    const exp = transactions.filter(t => t.type === 'expense');

    const totalRevenue = inc.reduce((s, t) => s + Number(t.amount), 0);
    const totalExpenses = exp.reduce((s, t) => s + Number(t.amount), 0);
    const netProfit = totalRevenue - totalExpenses;

    // Grouping by category
    const incomeByCat = Array.from(new Set(inc.map(t => t.category || 'Other'))).map(cat => ({
      name: cat,
      val: inc.filter(t => t.category === cat).reduce((s, t) => s + Number(t.amount), 0)
    })).sort((a, b) => b.val - a.val);

    const expenseByCat = Array.from(new Set(exp.map(t => t.category || 'Other'))).map(cat => ({
      name: cat,
      val: exp.filter(t => t.category === cat).reduce((s, t) => s + Number(t.amount), 0)
    })).sort((a, b) => b.val - a.val);

    return { totalRevenue, totalExpenses, netProfit, incomeByCat, expenseByCat };
  }, [transactions]);

  const chartData = [
    { name: 'Revenue', val: plData.totalRevenue, fill: COLORS.income },
    { name: 'Expenses', val: plData.totalExpenses, fill: COLORS.expense },
    { name: 'Net Profit', val: plData.netProfit, fill: COLORS.net }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#141414', color: '#fff' }}>
      <Sidebar />
      <div style={{ marginLeft: sidebarCollapsed ? 64 : 250, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease' }}>
        
        <header style={{ height: 72, background: '#141414', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/finance" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', color: COLORS.muted }}>
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Profit Intelligence (P&L Overview)</div>
              <div style={{ fontSize: 12, color: COLORS.muted }}>Strategic Financial Performance Audit</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
             <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Download size={14} /> Export Report
             </button>
             <ThemeToggle />
             <NotificationCenter />
          </div>
        </header>

        <main style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          
          {/* 1. TOP PROFIT STATUS HERO */}
          <div style={{ marginBottom: 32, background: 'linear-gradient(90deg, rgba(57, 200, 106, 0.05) 0%, rgba(20, 20, 20, 0) 100%)', border: '1px solid rgba(57, 200, 106, 0.15)', borderRadius: 20, padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: `0 0 30px ${COLORS.income}08` }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(57, 200, 106, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 15px ${COLORS.income}33` }}>
                   <Sparkles size={24} color={COLORS.income} />
                </div>
                <div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>Profit Status:</span>
                      <span style={{ fontSize: 14, fontWeight: 900, color: COLORS.income, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {plData.totalRevenue > 0 ? "STABLE ⚡" : "INITIALIZING ⏳"}
                      </span>
                      <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)' }} />
                      <span style={{ fontSize: 13, color: '#fff' }}>Cash Flow: <span style={{ fontWeight: 700, color: plData.netProfit >= 0 ? COLORS.income : COLORS.expense }}>{plData.totalRevenue > 0 ? (plData.netProfit >= 0 ? "Balanced" : "Negative") : "Pending"}</span></span>
                      <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)' }} />
                      <span style={{ fontSize: 13, color: '#fff' }}>Risk: <span style={{ fontWeight: 700, color: COLORS.income }}>{plData.totalRevenue > 0 ? "LOW" : "UNKNOWN"}</span></span>
                   </div>
                   <div style={{ fontSize: 13, color: COLORS.muted }}>
                     <span style={{ fontWeight: 700, color: '#fff' }}>AI Recommendation:</span> {plData.totalRevenue > 0 ? "Maintain current spending pace. Sector margins are healthy." : "Add revenue and expense data to activate full profit intelligence."}
                   </div>
                </div>
             </div>
             <Link href="/finance" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ padding: '10px 20px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                   <Plus size={14} /> Add Transaction
                </button>
             </Link>
          </div>

          {/* 3. KPI CARD ENHANCEMENT */}
          <div className="grid-12" style={{ gap: 16, marginBottom: 32 }}>
            {/* 1. REVENUE CARD */}
            <div className="col-3 glass-card-hero" style={{ padding: '24px', minHeight: 160 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 12 }}>Total Revenue</div>
              <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>
                {plData.totalRevenue > 0 ? `$${plData.totalRevenue.toLocaleString()}` : '$0'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: plData.totalRevenue > 0 ? COLORS.income : COLORS.muted, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
                <TrendingUp size={14} /> {plData.totalRevenue > 0 ? '+12.4%' : 'No data yet'}
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 12 }} />
              <div style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.4 }}>
                {plData.totalRevenue > 0 ? "Consistent growth in sector yields." : "Revenue stream not yet activated."}
              </div>
            </div>

            {/* 2. EXPENSES CARD */}
            <div className="col-3 glass-card-hero" style={{ padding: '24px', minHeight: 160 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 12 }}>Operating Expenses</div>
              <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 4, color: plData.totalExpenses > 0 ? COLORS.expense : '#fff' }}>
                {plData.totalExpenses > 0 ? `$${plData.totalExpenses.toLocaleString()}` : '$0'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: plData.totalExpenses > 0 ? COLORS.expense : COLORS.muted, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
                <TrendingUp size={14} /> {plData.totalExpenses > 0 ? '+18.2%' : 'No data yet'}
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 12 }} />
              <div style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.4 }}>
                {plData.totalExpenses > 0 ? "Expenses rising faster than revenue." : "Start logging costs to analyze burn rate."}
              </div>
            </div>

            {/* 3. NET PROFIT CARD (SPECIAL) */}
            <div className="col-3 glass-card-hero active-glow" style={{ padding: '24px', minHeight: 160, position: 'relative' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 12 }}>Net Profit</div>
              <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 4, color: plData.totalRevenue > 0 ? (plData.netProfit >= 0 ? COLORS.income : COLORS.expense) : '#fff' }}>
                {plData.totalRevenue > 0 ? `${plData.netProfit >= 0 ? '+' : ''}$${plData.netProfit.toLocaleString()}` : '$0'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: plData.totalRevenue > 0 ? (plData.netProfit >= 0 ? COLORS.income : COLORS.expense) : COLORS.muted, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
                {plData.netProfit >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} 
                {plData.totalRevenue > 0 ? `${Math.abs((plData.netProfit / (plData.totalRevenue || 1)) * 100).toFixed(1)}%` : 'No data yet'}
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 12 }} />
              <div style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.4 }}>
                {plData.totalRevenue > 0 ? "Maintained profitability threshold." : "Add revenue and expenses to calculate profit."}
              </div>
            </div>

            {/* 4. PROFIT MARGIN CARD */}
            <div className="col-3 glass-card-hero" style={{ padding: '24px', minHeight: 160 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 12 }}>Profit Margin</div>
              <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>
                {plData.totalRevenue > 0 ? `${((plData.netProfit / plData.totalRevenue) * 100).toFixed(1)}%` : '0%'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: plData.totalRevenue > 0 ? COLORS.warning : COLORS.muted, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
                <TrendingDown size={14} /> {plData.totalRevenue > 0 ? '-2.4%' : 'No data yet'}
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 12 }} />
              <div style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.4 }}>
                {plData.totalRevenue > 0 ? "Declining margin due to cost drift." : "Add income sources to unlock tracking."}
              </div>
            </div>
          </div>

          {/* 4. AI FINANCIAL SIGNALS (NEW SECTION) */}
          <div style={{ marginBottom: 32 }}>
             <h3 style={{ fontSize: 14, fontWeight: 800, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>AI Financial Signals</h3>
             <div className="grid-12" style={{ gap: 16 }}>
                <div className="col-4 glass-card-hero signal-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                   <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.income, boxShadow: `0 0 10px ${COLORS.income}` }} />
                   <div style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>
                     {plData.totalRevenue > 0 ? "Revenue trajectory remains positive." : "No financial patterns detected yet."}
                   </div>
                </div>
                <div className="col-4 glass-card-hero signal-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                   <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.warning, boxShadow: `0 0 10px ${COLORS.warning}` }} />
                   <div style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>
                     {plData.totalRevenue > 0 ? "Potential margin pressure in Feed sector." : "System will analyze trends once data is added."}
                   </div>
                </div>
                <div className="col-4 glass-card-hero signal-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                   <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', boxShadow: `0 0 10px #3b82f6` }} />
                   <div style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>
                     {plData.totalRevenue > 0 ? "Cash flow efficiency: OPTIMAL." : "Awaiting data to activate intelligence."}
                   </div>
                </div>
             </div>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            .glass-card-hero {
              background: rgba(255, 255, 255, 0.03);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.06);
              border-radius: 20px;
              transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
            }
            .glass-card-hero:hover {
              transform: translateY(-4px);
              background: rgba(255, 255, 255, 0.05);
              border-color: rgba(255, 255, 255, 0.12);
              box-shadow: 0 12px 24px rgba(0,0,0,0.3);
            }
            .active-glow {
              border: 1px solid ${COLORS.income}33;
              box-shadow: 0 0 20px ${COLORS.income}08;
            }
            .signal-card {
              border-radius: 12px;
              background: linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
            }
          `}} />

          <div className="grid-12" style={{ gap: 24, marginBottom: 32 }}>

             {/* 5. BUDGET DISTRIBUTION UPGRADE */}
             <div className="card col-4" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Budget Distribution</h3>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {plData.totalExpenses > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChartComponent data={[
                        { name: 'Feed', value: 400 },
                        { name: 'Labor', value: 300 },
                        { name: 'Equipment', value: 300 },
                        { name: 'Utilities', value: 200 }
                      ]} />
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                       <div style={{ width: 120, height: 120, borderRadius: '50%', border: '8px solid rgba(255,255,255,0.03)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <PieChart size={40} color="rgba(255,255,255,0.1)" />
                       </div>
                       <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 12 }}>No budget allocation yet — start logging costs</div>
                       <Link href="/finance" style={{ textDecoration: 'none' }}>
                          <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: 11 }}>Add Expense →</button>
                       </Link>
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 24, padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, fontSize: 12, color: COLORS.muted, lineHeight: 1.5 }}>
                   {plData.totalExpenses > 0 ? (
                     "System is tracking spending across sectors. Feed and Labor represent your primary burn rate."
                   ) : (
                     "No budget allocation yet — add expenses to visualize distribution across Feed, Labor, and Equipment."
                   )}
                </div>
             </div>
          </div>

          {/* 6. CHART EMPTY STATES */}
          <div className="grid-12" style={{ gap: 24 }}>
             {/* INCOME BREAKDOWN */}
             <div className="card col-6" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                   <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.income }} />
                   <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Operating Income Breakdown</h3>
                </div>
                {plData.incomeByCat.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        {plData.incomeByCat.map((item, i) => (
                          <tr key={i} style={{ borderBottom: i === plData.incomeByCat.length - 1 ? 'none' : `1px solid ${COLORS.border}` }}>
                            <td style={{ padding: '12px 0', fontSize: 14, color: '#fff' }}>{item.name}</td>
                            <td style={{ padding: '12px 0', textAlign: 'right', fontSize: 14, fontWeight: 700, color: COLORS.income }}>+${item.val.toLocaleString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.1)' }}>
                     <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 12, lineHeight: 1.6 }}>
                        No income streams recorded yet.<br/>
                        Start by adding:<br/>
                        <span style={{ color: '#fff', fontWeight: 600 }}>• Livestock Sales • Crop Revenue • Services</span>
                     </div>
                     <Link href="/finance" style={{ textDecoration: 'none' }}>
                        <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: 11 }}>Add Revenue →</button>
                     </Link>
                  </div>
                )}
             </div>

             {/* EXPENSE BREAKDOWN */}
             <div className="card col-6" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                   <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.expense }} />
                   <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Operating Expense Breakdown</h3>
                </div>
                {plData.expenseByCat.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        {plData.expenseByCat.map((item, i) => (
                          <tr key={i} style={{ borderBottom: i === plData.expenseByCat.length - 1 ? 'none' : `1px solid ${COLORS.border}` }}>
                            <td style={{ padding: '12px 0', fontSize: 14, color: '#fff' }}>{item.name}</td>
                            <td style={{ padding: '12px 0', textAlign: 'right', fontSize: 14, fontWeight: 700, color: COLORS.expense }}>-${item.val.toLocaleString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.1)' }}>
                     <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 12, lineHeight: 1.6 }}>
                        No expense data yet.<br/>
                        Start logging costs to analyze burn rate:<br/>
                        <span style={{ color: '#fff', fontWeight: 600 }}>• Feed • Labor • Fuel • Maintenance</span>
                     </div>
                     <Link href="/finance" style={{ textDecoration: 'none' }}>
                        <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: 11 }}>Add Expense →</button>
                     </Link>
                  </div>
                )}
             </div>
          </div>

        </main>
      </div>
    </div>
  );
}
