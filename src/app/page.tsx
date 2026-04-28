'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { 
  SAMPLE_EXPENSES, 
  SAMPLE_LOANS, 
  SAMPLE_PAYROLL, 
  SAMPLE_SEGMENTS,
  SAMPLE_LABOR,
  MONTHLY_TREND
} from '@/lib/sample-data'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, AreaChart, Area, LineChart, Line 
} from 'recharts'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TTD', maximumFractionDigits: 0 }).format(n)

const fmtShort = (n: number) => {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
  return `$${n}`
}

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div style={{ background: '#09090b', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', fontFamily: 'monospace' }}>
        LOADING_DASHBOARD_PROTOCOL...
      </div>
    )
  }

  const totalExpenses = SAMPLE_EXPENSES.reduce((s, e) => s + e.amount, 0)
  const totalLoans = SAMPLE_LOANS.reduce((s, l) => s + l.remaining_balance, 0)
  const totalPayroll = SAMPLE_PAYROLL.reduce((s, p) => s + (p.net_pay || 0), 0)
  
  // Segment rollup for chart
  const segRollup = SAMPLE_SEGMENTS.map(seg => ({
    name: seg.icon + ' ' + seg.name.split('/')[0].trim(),
    amount: SAMPLE_EXPENSES.filter(e => e.segment_id === seg.id).reduce((s, e) => s + e.amount, 0),
    color: seg.color,
  })).filter(s => s.amount > 0).sort((a, b) => b.amount - a.amount).slice(0, 5)

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar 
          title="Dashboard" 
          subtitle="Enterprise Command & Financial Intelligence"
          actions={
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="badge badge-success">● SYSTEM_ONLINE</div>
              <div className="badge badge-neutral">V2.4.8</div>
            </div>
          }
        />

        <div className="page-container">
          {/* TOP LEVEL KPIs */}
          <div className="kpi-grid">
            <div className="kpi-card" style={{ '--kpi-color': '#22c55e' } as any}>
              <div className="kpi-label">Active Capital</div>
              <div className="kpi-value">{fmt(totalLoans)}</div>
              <div className="kpi-sub">{SAMPLE_LOANS.length} active facilities</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#ef4444' } as any}>
              <div className="kpi-label">Operational Burn</div>
              <div className="kpi-value">{fmt(totalExpenses)}</div>
              <div className="kpi-sub">Last 30 days</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#3b82f6' } as any}>
              <div className="kpi-label">Workforce Cost</div>
              <div className="kpi-value">{fmt(totalPayroll)}</div>
              <div className="kpi-sub">{SAMPLE_PAYROLL.length} personnel active</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#f59e0b' } as any}>
              <div className="kpi-label">Health Index</div>
              <div className="kpi-value">94.2%</div>
              <div className="kpi-sub">Efficiency rating</div>
            </div>
          </div>

          {/* MAIN BENTO GRID */}
          <div className="chart-grid-3">
            {/* LARGE CHART AREA */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Financial Performance Matrix</div>
                  <div className="card-subtitle">Revenue vs Expenses (Rolling 6 Months)</div>
                </div>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={MONTHLY_TREND}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} tickFormatter={fmtShort} />
                    <Tooltip 
                      contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* SIDEBAR WIDGETS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card" style={{ flex: 1 }}>
                <div className="card-header">
                  <div className="card-title">Segment Allocation</div>
                </div>
                <div className="card-body" style={{ paddingTop: 0 }}>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={segRollup} layout="vertical" margin={{ left: -20, right: 20 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 11}} width={100} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                      <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={20}>
                        {segRollup.map((s, i) => <Cell key={i} fill={s.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* LOWER GRID */}
          <div className="chart-grid">
            {/* RECENT LABOR */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Recent Labor Activity</div>
                <button className="btn btn-ghost btn-sm">View All &rarr;</button>
              </div>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Staff</th>
                      <th>Task</th>
                      <th>Status</th>
                      <th>Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_LABOR.slice(0, 5).map(l => (
                      <tr key={l.id}>
                        <td className="primary">{l.worker_name}</td>
                        <td>{l.task}</td>
                        <td><span className="badge badge-success">Verified</span></td>
                        <td>{l.hours_worked}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* QUICK ACTIONS / ALERTS */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Critical Signal Center</div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="alert alert-danger">
                    <span>⚠️</span>
                    <div>
                      <div style={{ fontWeight: 700 }}>Loan Payment Overdue</div>
                      <div style={{ opacity: 0.8, fontSize: '12px' }}>Personal Investor - R. Williams ($55,000)</div>
                    </div>
                  </div>
                  <div className="alert alert-warning">
                    <span>🔔</span>
                    <div>
                      <div style={{ fontWeight: 700 }}>Low Inventory Alert</div>
                      <div style={{ opacity: 0.8, fontSize: '12px' }}>Poultry Feed - Broilers (Under 100kg)</div>
                    </div>
                  </div>
                  <div className="alert alert-info">
                    <span>ℹ️</span>
                    <div>
                      <div style={{ fontWeight: 700 }}>Upcoming Maintenance</div>
                      <div style={{ opacity: 0.8, fontSize: '12px' }}>Massey Ferguson Tractor (3 days remaining)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}