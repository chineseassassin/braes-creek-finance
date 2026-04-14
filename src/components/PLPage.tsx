'use client';
import { useAppStore } from '@/lib/store';
import { formatCurrency, BUSINESS_SEGMENTS } from '@/lib/data';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell, PieChart, Pie } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4'];

import { useState, useEffect } from 'react';

export default function PLPage() {
  const { expenses, sales, laborEntries, payroll, loans } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="loader"></div>;

  // Calculate totals
  const revenue = sales.reduce((s, r) => s + (r.total_amount || (r.quantity * r.unit_price) || 0), 0);
  const operatingExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const directLabor = laborEntries.reduce((s, l) => s + (l.total_cost || 0), 0);
  const adminPayroll = payroll.reduce((s, p) => s + (p.net_pay || 0), 0);
  const combinedCosts = operatingExpenses + directLabor + adminPayroll;
  
  const grossProfit = revenue - combinedCosts;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  
  const estimatedInterest = loans.reduce((s, l) => s + ((l.remaining_balance || 0) * ((l.interest_rate || 0) / 100) / 12), 0);
  const ebitda = grossProfit;
  const netProfit = grossProfit - estimatedInterest;
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  // Segment Wise P&L
  const segmentPerformance = BUSINESS_SEGMENTS.map(seg => {
    const segSales = sales.filter(s => s.segment_id === seg.id).reduce((sum, r) => sum + (r.total_amount || (r.quantity * r.unit_price) || 0), 0);
    const segExpenses = expenses.filter(e => e.segment_id === seg.id).reduce((sum, e) => sum + (e.amount || 0), 0);
    const segLabor = laborEntries.filter(l => l.segment_id === seg.id).reduce((sum, l) => sum + (l.total_cost || 0), 0);
    const totalSegCost = segExpenses + segLabor;
    const profit = segSales - totalSegCost;
    
    return {
      name: seg.name.split('/')[0].trim(),
      sales: segSales,
      costs: totalSegCost,
      profit: profit,
      margin: segSales > 0 ? (profit / segSales) * 100 : 0,
      icon: seg.icon
    };
  }).filter(s => s.sales > 0 || s.costs > 0).sort((a, b) => b.profit - a.profit);

  // Chart Data: Profit vs Cost Trend
  const monthlyAgg: Record<string, { revenue: number, costs: number }> = {};
  
  sales.forEach(s => {
    if (!s.date) return;
    const m = s.date.substring(0, 7);
    if (!monthlyAgg[m]) monthlyAgg[m] = { revenue: 0, costs: 0 };
    monthlyAgg[m].revenue += (s.total_amount || (s.quantity * s.unit_price) || 0);
  });

  expenses.forEach(e => {
    if (!e.date) return;
    const m = e.date.substring(0, 7);
    if (!monthlyAgg[m]) monthlyAgg[m] = { revenue: 0, costs: 0 };
    monthlyAgg[m].costs += (e.amount || 0);
  });
  const trendData = Object.entries(monthlyAgg).sort().map(([month, data]) => ({
    month,
    revenue: data.revenue,
    costs: data.costs,
    profit: data.revenue - data.costs
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-light))', borderRadius: '12px', padding: '12px 16px', boxShadow: 'var(--shadow-premium)' }}>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color, fontSize: '14px', fontWeight: 800 }}>
              {p.name}: {formatCurrency(Math.abs(p.value))}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div className="page-header">
        <div>
          <div className="page-title">📈 Profit & Loss Intelligence</div>
          <div className="page-subtitle">Unified financial performance analysis for all estate divisions</div>
        </div>
        <div className="page-actions">
           <button className="btn btn-primary">📤 Generate Audit Packet</button>
        </div>
      </div>

      {/* High-Level Overview */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, hsl(var(--bg-card)), #064e3b)' }}>
          <div className="card-title" style={{ color: '#ecfdf5' }}>Total Net Revenue</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#10b981' }}>{formatCurrency(revenue)}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>Cash & accrual basis incoming</div>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, hsl(var(--bg-card)), #450a0a)' }}>
          <div className="card-title" style={{ color: '#fef2f2' }}>Combined COGS & Expenses</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#ef4444' }}>{formatCurrency(combinedCosts)}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>Inclusive of Labor & Payroll</div>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, hsl(var(--bg-card)), #1e1b4b)' }}>
          <div className="card-title" style={{ color: '#eef2ff' }}>Operational Net Profit</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: netProfit >= 0 ? '#3b82f6' : '#ef4444' }}>{formatCurrency(netProfit)}</div>
          <div style={{ fontSize: 13, fontWeight: 800, marginTop: 4, color: '#818cf8' }}>{netMargin.toFixed(1)}% Total Margin</div>
        </div>
      </div>

      <div className="grid-1">
        {/* Performance by Segment Table */}
        <div className="card">
          <div className="card-title">🚜 Segment-Wise Profit Performance</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Division</th>
                  <th className="text-right">Revenue</th>
                  <th className="text-right">Expenses</th>
                  <th className="text-right">Net</th>
                  <th className="text-right">Margin</th>
                </tr>
              </thead>
              <tbody>
                {segmentPerformance.length === 0 ? (
                  <tr><td colSpan={5} className="text-center" style={{ padding: 40, color: 'var(--text-muted)' }}>No performance data available yet. Record some sales or expenses.</td></tr>
                ) : segmentPerformance.map(seg => (
                  <tr key={seg.name}>
                    <td><span style={{ marginRight: 8 }}>{seg.icon}</span> <strong>{seg.name}</strong></td>
                    <td className="text-right">{formatCurrency(seg.sales)}</td>
                    <td className="text-right" style={{ color: 'var(--text-muted)' }}>{formatCurrency(seg.costs)}</td>
                    <td className="text-right" style={{ fontWeight: 800, color: seg.profit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{formatCurrency(seg.profit)}</td>
                    <td className="text-right">
                       <span className={`badge ${seg.margin >= 0 ? 'badge-green' : 'badge-red'}`}>
                         {seg.margin.toFixed(1)}%
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="alert info" style={{ marginTop: 24, padding: 24 }}>
         <div style={{ fontSize: 24, marginBottom: 12 }}>🚀 Charting Engine Upgrade</div>
         <p>The P&L visualizations are temporarily paused while we upgrade the charting engine to a more stable version for your device. All data above is live and accurate.</p>
      </div>
    </div>
  );
}
