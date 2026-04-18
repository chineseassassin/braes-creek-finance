'use client';
import { useAppStore } from '@/lib/store';
import { formatCurrency, BUSINESS_SEGMENTS } from '@/lib/data';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { useState, useEffect } from 'react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4'];

export default function PLPage() {
  const { expenses, sales, laborEntries, payroll, loans, addAuditLog, currentUser } = useAppStore();
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
  const estimatedInterest = loans.reduce((s, l) => s + ((l.remaining_balance || 0) * ((l.interest_rate || 0) / 100) / 12), 0);
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

  const handleGenerateAudit = () => {
    const reportDate = new Date().toLocaleString();
    const content = `
BRAES CREEK ESTATE - FINANCIAL AUDIT PACKET
Report Generated: ${reportDate}
---------------------------------------------

EXECUTIVE SUMMARY
Total Net Revenue: ${formatCurrency(revenue)}
Total COGS & Operating Costs: ${formatCurrency(combinedCosts)}
Operational Net Profit: ${formatCurrency(netProfit)}
Net Margin: ${netMargin.toFixed(1)}%

DIVISION PERFORMANCE breakdown
${segmentPerformance.map(s => `- ${s.name}: Revenue ${formatCurrency(s.sales)} | Costs ${formatCurrency(s.costs)} | Profit ${formatCurrency(s.profit)} (${s.margin.toFixed(1)}%)`).join('\n')}

DEBT OBLIGATIONS
Total Loan Balance: ${formatCurrency(loans.reduce((s, l) => s + (l.remaining_balance || 0), 0))}
Estimated Monthly Interest: ${formatCurrency(estimatedInterest)}

CERTIFICATION
This packet serves as an internal audit snapshot of the farm's financial state as of ${reportDate}.
All data derived from real-time operational records.
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Braes_Creek_Financial_Audit_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    // Log it
    addAuditLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      user_name: currentUser.name,
      action: 'CREATE',
      table_name: 'Financial Reports',
      record_id: 'P&L-AUDIT',
      details: 'Generated a comprehensive financial audit packet'
    });

    alert('✅ Audit Packet Generated and Logged successfully.');
  };

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
           <button className="btn btn-primary" onClick={handleGenerateAudit}>📤 Generate Audit Packet</button>
        </div>
      </div>

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

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title">📈 Profit vs. Cost Trend</div>
          <div className="chart-container" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border-light))" opacity={0.5} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--text-muted))' }} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="costs" name="Costs" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-title">🥧 Division Performance Contribution</div>
          <div className="chart-container" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segmentPerformance}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="sales"
                  nameKey="name"
                >
                  {segmentPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid-1">
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
                  <tr><td colSpan={5} className="text-center" style={{ padding: 40, color: 'hsl(var(--text-muted))' }}>No performance data available yet. Record some sales or expenses.</td></tr>
                ) : segmentPerformance.map(seg => (
                  <tr key={seg.name}>
                    <td><span style={{ marginRight: 8 }}>{seg.icon}</span> <strong>{seg.name}</strong></td>
                    <td className="text-right">{formatCurrency(seg.sales)}</td>
                    <td className="text-right" style={{ color: 'hsl(var(--text-muted))' }}>{formatCurrency(seg.costs)}</td>
                    <td className="text-right" style={{ fontWeight: 800, color: seg.profit >= 0 ? 'hsl(var(--accent-green))' : 'hsl(var(--accent-red))' }}>{formatCurrency(seg.profit)}</td>
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
    </div>
  );
}
