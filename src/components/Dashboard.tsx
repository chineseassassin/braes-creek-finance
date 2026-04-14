'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { formatCurrency, getMonthlySpend, getExpensesBySegment, getTotalExpenses, getTotalLoansOutstanding, getTotalRepaid, getTotalLaborCost } from '@/lib/data';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4'];

function KpiCard({ label, value, icon, color, sub, change }: {
  label: string; value: string; icon: string; color: string; sub?: string; change?: { pct: number; label: string };
}) {
  return (
    <div className={`kpi-card ${color}`}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
      {change && (
        <div className="kpi-change" style={{ marginTop: 8, display: 'inline-flex' }}>
          <span className={`kpi-change ${change.pct >= 0 ? 'down' : 'up'}`}>
            {change.pct >= 0 ? '▲' : '▼'} {Math.abs(change.pct)}% {change.label}
          </span>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { 
    expenses, loans, laborEntries, payroll, maintenanceRecords, sales, 
    cropTypes, livestockUnits, currentUser, farmLocation, setFarmLocation,
    temperature, weatherIcon, fetchWeather 
  } = useAppStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditingLoc, setIsEditingLoc] = useState(false);
  const [locInput, setLocInput] = useState(farmLocation);

  // Auto-fetch weather on mount and when location changes
  useEffect(() => {
    if (fetchWeather && farmLocation) {
      fetchWeather(farmLocation);
    }
  }, [farmLocation, fetchWeather]);

  const handleDownload = () => {
    setIsDownloading(true);
    
    // Generate CSV data from global expenses
    const headers = ['Transaction ID', 'Date', 'Amount', 'Vendor', 'Category', 'Business Segment'];
    const csvContent = [
      headers.join(','),
      ...expenses.map(e => [
        e.id, 
        e.date, 
        e.amount, 
        `"${e.vendor_name || ''}"`, 
        `"${e.category_name}"`, 
        `"${e.segment_name}"`
      ].join(','))
    ].join('\n');

    // Trigger browser download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Braes_Creek_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // UX delay
    setTimeout(() => setIsDownloading(false), 800);
  };

  const scrollToAnalytics = () => {
    document.getElementById('analytics-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const totalExpenses = getTotalExpenses(expenses);
  const totalOutstanding = getTotalLoansOutstanding(loans);
  const totalRepaid = getTotalRepaid(loans);
  const totalLabor = getTotalLaborCost(laborEntries);
  const totalPayroll = payroll.reduce((s, p) => s + p.net_pay, 0);
  const overdueLoans = loans.filter(l => l.status === 'overdue');
  const overdueMaintenace = maintenanceRecords.filter(m => m.status === 'overdue');

  const monthlyData = getMonthlySpend(expenses);
  const segmentData = Object.entries(getExpensesBySegment(expenses))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name: name.replace(' / ', '/').split(' ').slice(0, 2).join(' '), value }));

  const budgetComparison = [
    { name: 'Feed', budget: 0, actual: 0 },
    { name: 'Payroll', budget: 0, actual: 0 },
    { name: 'Crops', budget: 0, actual: 0 },
    { name: 'Utilities', budget: 0, actual: 0 },
    { name: 'Transport', budget: 0, actual: 0 },
    { name: 'Maint.', budget: 0, actual: 0 },
  ];

  const recentExpenses = [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  const CustomTooltip = ({ active, payload, label }: Record<string, any>) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-light))', borderRadius: '12px', padding: '12px 16px', boxShadow: 'var(--shadow-premium)' }}>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color, fontSize: '14px', fontWeight: 800 }}>
              {p.name}: {formatCurrency(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (

    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Welcome Section */}
      <div className="card" style={{ 
        marginBottom: 32, 
        padding: 32, 
        background: 'linear-gradient(135deg, hsl(var(--bg-card)), hsl(var(--bg-secondary)))', 
        border: '1px solid hsl(var(--accent-blue) / 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'hsl(var(--text-primary))', marginBottom: 8 }}>
            Welcome back, {currentUser.name.split(' ')[0]}! 👋
          </h2>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: 14, maxWidth: 460 }}>
            Here is what is happening with Braes Creek Estate today. You have {overdueLoans.length + overdueMaintenace.length} items requiring immediate attention.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button 
              className={`btn btn-primary ${isDownloading ? 'animate-pulse' : ''}`} 
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? 'Generating...' : 'Download Report'}
            </button>
            <button className="btn btn-outline" onClick={scrollToAnalytics}>View Analytics</button>
          </div>
        </div>
        
        <div style={{ 
          position: 'absolute', 
          right: -20, 
          bottom: -20, 
          fontSize: 160, 
          opacity: 0.05, 
          transform: 'rotate(-15deg)',
          pointerEvents: 'none'
        }}>🚜</div>

        {/* Quick Stats on the right of the welcome card */}
        <div style={{ display: 'flex', gap: 32, padding: '0 24px', borderLeft: '1px solid hsl(var(--border))' }} className="desktop-only">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>{weatherIcon}</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{temperature}</div>
            {isEditingLoc ? (
              <input 
                autoFocus
                className="form-input" 
                style={{ fontSize: 10, width: 80, height: 20, padding: 2, textAlign: 'center' }}
                value={locInput}
                onChange={p => setLocInput(p.target.value)}
                onBlur={() => { setFarmLocation(locInput); setIsEditingLoc(false); }}
                onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              />
            ) : (
              <div 
                style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', cursor: 'pointer', borderBottom: '1px dashed hsl(var(--border))' }}
                onClick={() => setIsEditingLoc(true)}
                title="Click to change country/state"
              >
                {farmLocation || 'Set Location'}
              </div>
            )}
          </div>
          <div style={{ width: '1px', background: 'hsl(var(--border))', margin: '8px 0' }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', marginBottom: 4 }}>Farm Health</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-teal)' }}>98% Safe</div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {overdueLoans.length > 0 && (
          <div className="alert alert-danger" style={{ margin: 0 }}>
            <span>🚨</span>
            <div>
              <strong>Overdue Loans Detected</strong>
              <p style={{ fontSize: 12, opacity: 0.8 }}>{overdueLoans.length} lenders are awaiting repayment. Please review the loan module.</p>
            </div>
          </div>
        )}
        {overdueMaintenace.length > 0 && (
          <div className="alert alert-warning" style={{ margin: 0 }}>
            <span>🔧</span>
            <div>
              <strong>Equipment Maintenance Overdue</strong>
              <p style={{ fontSize: 12, opacity: 0.8 }}>{overdueMaintenace.length} vital assets require service to prevent downtime.</p>
            </div>
          </div>
        )}
        
        {/* Smart Inventory Alert Example */}
        <div className="alert" style={{ margin: 0, background: 'linear-gradient(90deg, hsl(var(--accent-blue) / 0.1), transparent)', borderLeft: '4px solid var(--accent-blue)' }}>
          <span>💡</span>
          <div>
            <strong>Reorder Suggestion: Broiler Feed</strong>
            <p style={{ fontSize: 12, opacity: 0.8 }}>Based on your recent labor logs, you will likely run out of feed in 4 days. Would you like to check current prices?</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <KpiCard label="Gross Revenue (YTD)" value={formatCurrency(sales.reduce((s: any, r: any) => s + (r.total_amount || 0), 0))} icon="💰" color="blue" sub={`${sales.length} sales recorded`} />
        <KpiCard label="Expense Vol (YTD)" value={formatCurrency(totalExpenses)} icon="💸" color="red" sub={`${expenses.length} txns recorded`} />
        <KpiCard label="Loan Liability" value={formatCurrency(totalOutstanding)} icon="🏦" color="amber" sub={`${loans.filter(l => l.status !== 'paid_off').length} active loans`} />
        <KpiCard label="Livestock Inventory" value={`${livestockUnits.reduce((s, l) => s + l.quantity, 0).toLocaleString()}`} icon="🐄" color="teal" sub="Current head count" />
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
        }
      `}</style>


      {/* Charts Row 1 */}
      <div id="analytics-section" className="grid-2" style={{ marginBottom: 16 }}>
        {/* Monthly Spend Trend */}
        <div className="card">
          <div className="card-title">📈 Monthly Spend Trend</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" name="Expenses" stroke="#3b82f6" fill="url(#areaGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses by Segment */}
        <div className="card">
          <div className="card-title">🍩 Expenses by Business Segment</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={segmentData} cx="40%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={false}>
                  {segmentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', right: 0, top: '50%', transform: 'translateY(-50%)', position: 'absolute', maxWidth: '40%' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid-2" style={{ marginBottom: 16 }}>
        {/* Budget vs Actual */}
        <div className="card">
          <div className="card-title">🎯 Budget vs Actual (Q1 2025)</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetComparison} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="budget" name="Budget" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loan Summary */}
        <div className="card">
          <div className="card-title">🏦 Loan Portfolio Summary</div>
          <div>
            {loans.map(loan => (
              <div key={loan.id} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{loan.lender_name}</span>
                    <span style={{ marginLeft: '8px' }} className={`badge ${loan.status === 'paid_off' ? 'badge-green' : loan.status === 'overdue' ? 'badge-red' : loan.status === 'partial' ? 'badge-amber' : 'badge-blue'}`}>
                      {loan.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: loan.status === 'overdue' ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                    {formatCurrency(loan.remaining_balance)}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(100, (loan.amount_repaid / loan.principal) * 100)}%`,
                      background: loan.status === 'paid_off' ? 'var(--accent-green)' : loan.status === 'overdue' ? 'var(--accent-red)' : 'var(--accent-blue)',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Repaid: {formatCurrency(loan.amount_repaid)}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Principal: {formatCurrency(loan.principal)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-title">🧾 Recent Transactions</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Vendor</th>
                <th>Category</th>
                <th>Segment</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentExpenses.map(exp => (
                <tr key={exp.id}>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{exp.date}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.description}</td>
                  <td>{exp.vendor_name}</td>
                  <td><span className="badge badge-gray">{exp.category_name}</span></td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{exp.segment_name}</td>
                  <td className="text-right font-bold" style={{ color: 'var(--accent-red)', whiteSpace: 'nowrap' }}>{formatCurrency(exp.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
