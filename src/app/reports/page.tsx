'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { SAMPLE_EXPENSES, SAMPLE_LOANS, SAMPLE_PAYROLL, SAMPLE_LABOR, SAMPLE_BUDGETS, MONTHLY_TREND, SAMPLE_SEGMENTS } from '@/lib/sample-data'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts'
import { 
  Calendar, ArrowRight, BarChart3, Banknote, Landmark, 
  Users, Sprout, FileText, Download, Printer, TrendingUp, 
  TrendingDown, DollarSign, PieChart as LucidePieChart, Activity,
  Layers, Package, ChevronRight, Calculator, Clock
} from 'lucide-react'
import React from 'react'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TTD', maximumFractionDigits: 0 }).format(n)

const REPORT_TYPES = [
  { id: 'pl', label: 'Profit & Loss', icon: <BarChart3 size={20} />, desc: 'Revenue vs expenses summary' },
  { id: 'cashflow', label: 'Cash Flow', icon: <Banknote size={20} />, desc: 'Monthly in/out analysis' },
  { id: 'loans', label: 'Loan Summary', icon: <Landmark size={20} />, desc: 'Repayment status & schedules' },
  { id: 'labor', label: 'Labor Efficiency', icon: <Users size={20} />, desc: 'Hours & cost by worker/task' },
  { id: 'segment', label: 'Segment P&L', icon: <Layers size={20} />, desc: 'By business division' },
  { id: 'crop', label: 'Crop Cost Report', icon: <Sprout size={20} />, desc: 'Inputs per crop type' },
]

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('pl')
  const [dateFrom, setDateFrom] = useState('2024-11-01')
  const [dateTo, setDateTo] = useState('2024-12-31')

  const totalExpenses = SAMPLE_EXPENSES.reduce((s, e) => s + e.amount, 0)
  const totalPayroll = SAMPLE_PAYROLL.reduce((s, p) => s + p.net_pay, 0)
  const totalLaborCost = SAMPLE_LABOR.reduce((s, l) => s + l.total_cost, 0)
  const totalLoanBalance = SAMPLE_LOANS.reduce((s, l) => s + l.remaining_balance, 0)
  const totalRepaid = SAMPLE_LOANS.reduce((s, l) => s + l.total_repaid, 0)
  const estimatedRevenue = 66000

  const segExpenses = SAMPLE_SEGMENTS.map(seg => ({
    name: seg.icon + ' ' + seg.name.split('/')[0].trim(),
    color: seg.color,
    amount: SAMPLE_EXPENSES.filter(e => e.segment_id === seg.id).reduce((s, e) => s + e.amount, 0),
  })).filter(s => s.amount > 0)

  const laborByWorker = Object.entries(
    SAMPLE_LABOR.reduce((acc, l) => {
      if (!acc[l.worker_name]) acc[l.worker_name] = { hours: 0, cost: 0 }
      acc[l.worker_name].hours += l.hours_worked
      acc[l.worker_name].cost += l.total_cost
      return acc
    }, {} as Record<string, { hours: number; cost: number }>)
  ).map(([name, data]) => ({ name: name.split(' ')[0], ...data }))

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const reportContent = document.querySelector('.page-container')?.innerHTML || '';
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(s => s.outerHTML)
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Braes Creek Report - ${REPORT_TYPES.find(r => r.id === activeReport)?.label}</title>
          ${styles}
          <style>
            body { background: white !important; color: black !important; padding: 40px !important; }
            .card { background: white !important; border: 1px solid #eee !important; box-shadow: none !important; margin-bottom: 20px !important; break-inside: avoid; }
            .kpi-card { background: #f9f9f9 !important; border: 1px solid #eee !important; }
            .btn, .sidebar, .topbar, .pulse-dot { display: none !important; }
            canvas, .recharts-responsive-container { max-width: 100% !important; height: auto !important; }
            @media print {
              .card { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div style="margin-bottom: 30px; border-bottom: 2px solid #22c55e; padding-bottom: 15px;">
            <h1 style="margin: 0; color: #166534;">Braes Creek Financial Intelligence</h1>
            <p style="margin: 5px 0 0; color: #666;">Tactical Report: ${REPORT_TYPES.find(r => r.id === activeReport)?.label} | Generated: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="page-container">
            ${reportContent}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar
          title="Reports & Analytics"
          subtitle="Business intelligence and financial reporting"
          actions={
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={handlePrint}>🖨️ Print Report</button>
              <button className="btn btn-secondary btn-sm">📥 Export CSV</button>
              <button className="btn btn-primary btn-sm">📈 Export PDF</button>
            </div>
          }
        />
        <div className="page-container">
          {/* Report Type Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
            {REPORT_TYPES.map(r => (
              <div
                key={r.id}
                onClick={() => setActiveReport(r.id)}
                style={{
                  background: activeReport === r.id ? 'rgba(22,163,74,0.1)' : 'var(--bg-card)',
                  border: `1px solid ${activeReport === r.id ? 'rgba(22,163,74,0.4)' : 'var(--border-subtle)'}`,
                  borderRadius: 12,
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 4 }}>{r.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: activeReport === r.id ? 'var(--status-success)' : 'var(--text-primary)' }}>{r.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{r.desc}</div>
              </div>
            ))}
          </div>

          {/* Date Range */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-body" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ 
                    background: 'var(--status-success-glow)', 
                    width: 42, 
                    height: 42, 
                    borderRadius: 12, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '1px solid var(--status-success-glow)'
                  }}>
                     <Calendar size={20} color="var(--status-success)" strokeWidth={2.5} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                     <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Intelligence Period</span>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="date" className="form-input" style={{ width: 140, height: 34, fontSize: 12 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                        <ArrowRight size={14} color="var(--color-text-muted)" />
                        <input type="date" className="form-input" style={{ width: 140, height: 34, fontSize: 12 }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
                     </div>
                  </div>
                </div>

                <button className="btn btn-primary" style={{ height: 44, padding: '0 24px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                   <Activity size={18} /> <span style={{ fontWeight: 850 }}>Generate Tactical Report</span>
                </button>
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                   <span className="pulse-dot" style={{ display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }}></span>
                   Live Data Hub: Dec 31, 2024
                </span>
              </div>
            </div>
          </div>

          {/* P&L Report */}
          {activeReport === 'pl' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                {[
                  { label: 'Est. Revenue', val: estimatedRevenue, color: '#22c55e', icon: <DollarSign size={18}/> },
                  { label: 'Total Expenses', val: totalExpenses + totalPayroll, color: '#ef4444', icon: <TrendingDown size={18}/> },
                  { label: 'Net Income', val: estimatedRevenue - totalExpenses - totalPayroll, color: '#3b82f6', icon: <TrendingUp size={18}/> },
                ].map(item => (
                  <div key={item.label} className="kpi-card" style={{ '--kpi-color': item.color, display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px' } as any}>
                    <div className="kpi-icon" style={{ width: 44, height: 44, borderRadius: 12, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>{item.icon}</div>
                    <div>
                       <div className="kpi-label" style={{ marginBottom: 2 }}>{item.label}</div>
                       <div className="kpi-value" style={{ color: item.color, fontSize: 24, fontWeight: 900 }}>{fmt(item.val)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card section-gap">
                <div className="card-header"><div className="card-title">Revenue vs Expenses Trend</div></div>
                <div className="card-body" style={{ paddingTop: 0 }}>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={MONTHLY_TREND} margin={{ top: 4, right: 0, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="eGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: any) => fmt(v)} contentStyle={{ background: '#1f1f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
                      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#22c55e" strokeWidth={2.5} fill="url(#rGrad)" dot={{ fill: '#22c55e', r: 3 }} />
                      <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2.5} fill="url(#eGrad)" dot={{ fill: '#ef4444', r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* P&L Table */}
              <div className="card">
                <div className="card-header"><div className="card-title">Profit & Loss Statement</div></div>
                <div className="card-body">
                  <table className="data-table">
                    <thead><tr><th>Category</th><th>Amount (TTD)</th><th>% of Expenses</th></tr></thead>
                    <tbody>
                      <tr><td colSpan={3} style={{ background: 'var(--status-success-glow)', color: 'var(--status-success)', fontWeight: 800, fontSize: 12, padding: '8px 16px' }}>REVENUE</td></tr>
                      <tr><td className="primary">Estimated Sales & Operations</td><td className="amount income">{fmt(estimatedRevenue)}</td><td>—</td></tr>
                      <tr><td colSpan={3} style={{ height: 1, background: 'var(--border-subtle)' }} /></tr>
                      <tr><td colSpan={3} style={{ background: 'var(--status-critical-glow)', color: 'var(--status-critical)', fontWeight: 800, fontSize: 12, padding: '8px 16px' }}>OPERATING EXPENSES</td></tr>
                      {segExpenses.map(s => (
                        <tr key={s.name}>
                          <td><span className="segment-dot"><div className="dot" style={{ background: s.color }} /><span>{s.name}</span></span></td>
                          <td className="amount expense">{fmt(s.amount)}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{((s.amount / totalExpenses) * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                      <tr style={{ background: 'var(--bg-card-elevated)', borderTop: '1px solid var(--border-soft)' }}>
                        <td style={{ fontWeight: 700 }}>Total Payroll</td>
                        <td className="amount expense">{fmt(totalPayroll)}</td><td>—</td>
                      </tr>
                      <tr style={{ background: 'var(--bg-card-elevated)' }}>
                        <td style={{ fontWeight: 700 }}>Total Labor</td>
                        <td className="amount expense">{fmt(totalLaborCost)}</td><td>—</td>
                      </tr>
                      <tr><td colSpan={3} style={{ height: 1, background: 'var(--border-soft)' }} /></tr>
                      <tr style={{ background: 'var(--status-ai-glow)' }}>
                        <td style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 14 }}>NET INCOME</td>
                        <td style={{ fontWeight: 900, fontSize: 16, fontFamily: 'Outfit, sans-serif', color: estimatedRevenue - totalExpenses - totalPayroll > 0 ? 'var(--status-success)' : 'var(--status-critical)' }}>
                          {fmt(estimatedRevenue - totalExpenses - totalPayroll)}
                        </td>
                        <td />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Cash Flow */}
          {activeReport === 'cashflow' && (
            <div className="card">
              <div className="card-header"><div className="card-title">Monthly Cash Flow Overview</div></div>
              <div className="card-body" style={{ paddingTop: 0 }}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={MONTHLY_TREND} margin={{ top: 4, right: 0, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: any) => fmt(v)} contentStyle={{ background: '#1f1f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
                    <Bar dataKey="revenue" name="Cash In" fill="#22c55e" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                    <Bar dataKey="expenses" name="Cash Out" fill="#ef4444" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16 }}>
                  {MONTHLY_TREND.slice(-4).map(m => {
                    const net = m.revenue - m.expenses
                    return (
                      <div key={m.month} style={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', padding: '12px', borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{m.month}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: net > 0 ? 'var(--status-success)' : 'var(--status-critical)' }}>
                          {net > 0 ? '+' : ''}{fmt(net)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Loan Summary Report */}
          {activeReport === 'loans' && (
            <div className="card">
              <div className="card-header"><div className="card-title">Loan Portfolio Summary</div></div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                  {[
                    { label: 'Total Principal', val: fmt(SAMPLE_LOANS.reduce((s, l) => s + l.principal_amount, 0)), color: '#3b82f6' },
                    { label: 'Total Repaid', val: fmt(totalRepaid), color: '#22c55e' },
                    { label: 'Balance Outstanding', val: fmt(totalLoanBalance), color: '#ef4444' },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', padding: 16, borderRadius: 10, borderLeft: `4px solid ${item.color}` }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{item.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: item.color, fontFamily: 'Outfit, sans-serif', marginTop: 4 }}>{item.val}</div>
                    </div>
                  ))}
                </div>
                <table className="data-table">
                  <thead><tr><th>Lender</th><th>Principal</th><th>Rate</th><th>Repaid</th><th>Balance</th><th>Status</th><th>Due</th></tr></thead>
                  <tbody>
                    {SAMPLE_LOANS.map(l => (
                      <tr key={l.id}>
                        <td className="primary">{l.lender_name}</td>
                        <td className="amount">{fmt(l.principal_amount)}</td>
                        <td>{l.interest_rate}%</td>
                        <td style={{ color: '#4ade80', fontWeight: 600 }}>{fmt(l.total_repaid)}</td>
                        <td style={{ color: '#f87171', fontWeight: 600 }}>{fmt(l.remaining_balance)}</td>
                        <td><span className={`badge badge-${l.status === 'active' ? 'info' : l.status === 'paid_off' ? 'success' : l.status === 'overdue' ? 'danger' : 'warning'}`}>{l.status}</span></td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{l.due_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Labor Efficiency */}
          {activeReport === 'labor' && (
            <div className="card">
              <div className="card-header"><div className="card-title">Labor Efficiency Report</div></div>
              <div className="card-body" style={{ paddingTop: 0 }}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={laborByWorker} margin={{ top: 4, right: 0, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: any, name: string) => [name === 'hours' ? `${v}h` : fmt(v), name === 'hours' ? 'Hours' : 'Cost']} contentStyle={{ background: '#1f1f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                    <Legend />
                    <Bar dataKey="hours" name="Hours" fill="#06b6d4" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                    <Bar dataKey="cost" name="Cost (÷10)" fill="#8b5cf6" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
                  </BarChart>
                </ResponsiveContainer>
                <table className="data-table" style={{ marginTop: 12 }}>
                  <thead><tr><th>Worker</th><th>Entries</th><th>Total Hrs</th><th>Avg Rate</th><th>Total Cost</th><th>Cost/Hr</th></tr></thead>
                  <tbody>
                    {Object.entries(SAMPLE_LABOR.reduce((acc, l) => {
                      if (!acc[l.worker_name]) acc[l.worker_name] = { entries: 0, hours: 0, cost: 0, rateSum: 0 }
                      acc[l.worker_name].entries++
                      acc[l.worker_name].hours += l.hours_worked
                      acc[l.worker_name].cost += l.total_cost
                      acc[l.worker_name].rateSum += l.hourly_rate
                      return acc
                    }, {} as Record<string, any>)).map(([name, d]) => (
                      <tr key={name}>
                        <td className="primary">{name}</td>
                        <td>{d.entries}</td>
                        <td style={{ fontWeight: 600 }}>{d.hours}h</td>
                        <td>{fmt(d.rateSum / d.entries)}/hr</td>
                        <td className="amount">{fmt(d.cost)}</td>
                        <td style={{ color: '#4ade80', fontWeight: 600 }}>{fmt(d.cost / d.hours)}/hr</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Segment P&L */}
          {activeReport === 'segment' && (
            <div style={{ display: 'grid', gap: 16 }}>
              {segExpenses.filter(s => s.amount > 0).map(seg => (
                <div key={seg.name} className="card" style={{ borderLeft: `4px solid ${seg.color}` }}>
                  <div className="card-body">
                    <div className="flex-between">
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{seg.name}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#f87171', fontFamily: 'Outfit, sans-serif' }}>{fmt(seg.amount)}</div>
                    </div>
                    <div className="progress-bar" style={{ marginTop: 10 }}>
                      <div className="progress-fill" style={{ width: `${(seg.amount / totalExpenses * 100).toFixed(0)}%`, background: seg.color }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      {((seg.amount / totalExpenses) * 100).toFixed(1)}% of total expenses
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Crop Cost Report */}
          {activeReport === 'crop' && (
            <div className="card">
              <div className="card-header"><div className="card-title">Crop Cost Breakdown</div></div>
              <div className="card-body">
                <div className="alert alert-info" style={{ marginBottom: 16 }}>
                  💡 Showing crop production input costs across all active crops for the selected period.
                </div>
                {[
                  { name: 'Cassava', icon: '🌿', cost: 8500, acres: 3, labor: 2400, materials: 2900, other: 3200 },
                  { name: 'Sweet Potato', icon: '🍠', cost: 3200, acres: 1.5, labor: 900, materials: 1200, other: 1100 },
                  { name: 'Tomato', icon: '🍅', cost: 4800, acres: 0.75, labor: 1500, materials: 2100, other: 1200 },
                  { name: 'Cucumber', icon: '🥒', cost: 1600, acres: 0.5, labor: 600, materials: 700, other: 300 },
                  { name: 'Bell Pepper', icon: '🫑', cost: 2100, acres: 0.5, labor: 800, materials: 900, other: 400 },
                  { name: 'Sorrel', icon: '🌺', cost: 850, acres: 0.25, labor: 300, materials: 350, other: 200 },
                  { name: 'Scotch Bonnet', icon: '🌶️', cost: 1200, acres: 0.25, labor: 400, materials: 500, other: 300 },
                ].map(crop => (
                  <div key={crop.name} style={{ borderBottom: '1px solid var(--border-subtle)', padding: '14px 0' }}>
                    <div className="flex-between" style={{ marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{crop.icon} {crop.name}</div>
                      <span style={{ fontWeight: 800, fontSize: 15, color: '#f87171', fontFamily: 'Outfit, sans-serif' }}>{fmt(crop.cost)}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, fontSize: 12 }}>
                      <div style={{ color: 'var(--text-muted)' }}>Acres: <strong style={{ color: 'var(--text-secondary)' }}>{crop.acres}</strong></div>
                      <div style={{ color: 'var(--text-muted)' }}>Labor: <strong style={{ color: '#06b6d4' }}>{fmt(crop.labor)}</strong></div>
                      <div style={{ color: 'var(--text-muted)' }}>Materials: <strong style={{ color: '#f59e0b' }}>{fmt(crop.materials)}</strong></div>
                      <div style={{ color: 'var(--text-muted)' }}>Cost/Acre: <strong style={{ color: '#4ade80' }}>{fmt(crop.cost / crop.acres)}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
