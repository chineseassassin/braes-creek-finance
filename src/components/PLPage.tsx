'use client';
import { useAppStore } from '@/lib/store';
import { formatCurrency, BUSINESS_SEGMENTS } from '@/lib/data';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell, PieChart, Pie } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4'];

export default function PLPage() {
  const { expenses, sales, laborEntries, payroll, loans } = useAppStore();

  // Calculate totals
  const revenue = sales.reduce((s, r) => s + (r.total_amount || 0), 0);
  const operatingExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const directLabor = laborEntries.reduce((s, l) => s + l.total_cost, 0);
  const adminPayroll = payroll.reduce((s, p) => s + p.net_pay, 0);
  const combinedCosts = operatingExpenses + directLabor + adminPayroll;
  
  const grossProfit = revenue - combinedCosts;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  
  const estimatedInterest = loans.reduce((s, l) => s + (l.remaining_balance * (l.interest_rate / 100) / 12), 0);
  const ebitda = grossProfit; // Simple estimation
  const netProfit = grossProfit - estimatedInterest;
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  // Segment Wise P&L
  const segmentPerformance = BUSINESS_SEGMENTS.map(seg => {
    const segSales = sales.filter(s => s.segment_id === seg.id).reduce((sum, r) => sum + (r.total_amount || 0), 0);
    const segExpenses = expenses.filter(e => e.segment_id === seg.id).reduce((sum, e) => sum + e.amount, 0);
    const segLabor = laborEntries.filter(l => l.segment_id === seg.id).reduce((sum, l) => sum + l.total_cost, 0);
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
    const m = s.date.substring(0, 7);
    if (!monthlyAgg[m]) monthlyAgg[m] = { revenue: 0, costs: 0 };
    monthlyAgg[m].revenue += (s.total_amount || 0);
  });
  expenses.forEach(e => {
    const m = e.date.substring(0, 7);
    if (!monthlyAgg[m]) monthlyAgg[m] = { revenue: 0, costs: 0 };
    monthlyAgg[m].costs += e.amount;
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
           <button className="btn btn-outline btn-sm">📅 Select Period</button>
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

      {/* Profitability Trend */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">🌊 Comprehensive Profit & Loss Trend</div>
        <div className="chart-container" style={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} align="right" iconType="circle" />
              <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#10b981" fillOpacity={1} fill="url(#profitGrad)" strokeWidth={3} />
              <Area type="monotone" dataKey="costs" name="Total Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#costGrad)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2">
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
                {segmentPerformance.map(seg => (
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

        {/* Cost Distribution Pie */}
        <div className="card">
          <div className="card-title">🥧 Operational Cost Distribution</div>
          <div className="chart-container" style={{ height: 300 }}>
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={[
                     { name: 'Operating Expenses', value: operatingExpenses },
                     { name: 'Direct Labor', value: directLabor },
                     { name: 'Admin Payroll', value: adminPayroll },
                     { name: 'Interest Cost', value: estimatedInterest }
                   ]}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={100}
                   paddingAngle={5}
                   dataKey="value"
                   label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                   labelLine={false}
                 >
                   {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                 </Pie>
                 <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
               </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="divider" />
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Financial Health Check</div>
            <div style={{ display: 'flex', gap: 20 }}>
               <div>
                 <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Burn Rate</div>
                 <div style={{ fontSize: 16, fontWeight: 900 }}>{formatCurrency(combinedCosts / 4)}/wk</div>
               </div>
               <div>
                 <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Breakeven Revenue</div>
                 <div style={{ fontSize: 16, fontWeight: 900 }}>{formatCurrency(combinedCosts)}</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
