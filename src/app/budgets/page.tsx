'use client'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { SAMPLE_BUDGETS, SAMPLE_SEGMENTS } from '@/lib/sample-data'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TTD', maximumFractionDigits: 0 }).format(n)

export default function BudgetsPage() {
  const budgetData = SAMPLE_BUDGETS.map(b => {
    const seg = SAMPLE_SEGMENTS.find(s => s.id === b.segment_id)
    const utilization = (b.actual_amount / b.budgeted_amount) * 100
    const over = b.actual_amount > b.budgeted_amount
    return {
      ...b,
      segmentName: seg?.name?.split('/')[0].trim() ?? 'Other',
      segmentIcon: seg?.icon ?? '•',
      segmentColor: seg?.color ?? '#888',
      utilization,
      over,
      variance: b.budgeted_amount - b.actual_amount,
    }
  })

  const totalBudgeted = SAMPLE_BUDGETS.reduce((s, b) => s + b.budgeted_amount, 0)
  const totalActual = SAMPLE_BUDGETS.reduce((s, b) => s + b.actual_amount, 0)
  const overBudget = SAMPLE_BUDGETS.filter(b => b.actual_amount > b.budgeted_amount)
  const avgUtil = (totalActual / totalBudgeted) * 100

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar
          title="Budgets"
          subtitle="Budget vs actual tracking by segment and period"
          actions={<button className="btn btn-primary btn-sm">+ Create Budget</button>}
        />
        <div className="page-container">
          {overBudget.length > 0 && (
            <div className="alert alert-warning" style={{ marginBottom: 16 }}>
              ⚠️ <strong>{overBudget.length} segment(s)</strong> are over budget: {overBudget.map(b => {
                const seg = SAMPLE_SEGMENTS.find(s => s.id === b.segment_id)
                return seg?.name?.split('/')[0].trim()
              }).join(', ')}
            </div>
          )}

          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="kpi-card" style={{ '--kpi-color': '#3b82f6' } as any}>
              <div className="kpi-label">Total Budgeted</div>
              <div className="kpi-value">{fmt(totalBudgeted)}</div>
              <div className="kpi-sub">Q4 2024 plan</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#f59e0b' } as any}>
              <div className="kpi-label">Total Actual</div>
              <div className="kpi-value">{fmt(totalActual)}</div>
              <div className="kpi-sub">spent so far</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': totalActual > totalBudgeted ? '#ef4444' : '#22c55e' } as any}>
              <div className="kpi-label">Variance</div>
              <div className="kpi-value" style={{ color: totalActual > totalBudgeted ? '#f87171' : '#4ade80' }}>
                {totalActual > totalBudgeted ? '-' : '+'}{fmt(Math.abs(totalBudgeted - totalActual))}
              </div>
              <div className="kpi-sub">{totalActual > totalBudgeted ? 'over budget' : 'under budget'}</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': avgUtil > 100 ? '#ef4444' : '#10b981' } as any}>
              <div className="kpi-label">Avg Utilization</div>
              <div className="kpi-value" style={{ color: avgUtil > 100 ? '#f87171' : '#4ade80' }}>{avgUtil.toFixed(1)}%</div>
              <div className="kpi-sub">{SAMPLE_BUDGETS.length} active budgets</div>
            </div>
          </div>

          <div className="card section-gap">
            <div className="card-header"><div className="card-title">Budget vs Actual by Segment</div></div>
            <div className="card-body" style={{ paddingTop: 0 }}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={budgetData} margin={{ top: 4, right: 0, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="segmentName" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: any) => fmt(v)} contentStyle={{ background: '#1f1f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="budgeted_amount" name="Budgeted" fill="#3b82f6" radius={[4, 4, 0, 0]} fillOpacity={0.5} />
                  <Bar dataKey="actual_amount" name="Actual" radius={[4, 4, 0, 0]}>
                    {budgetData.map((d, i) => <Cell key={i} fill={d.over ? '#ef4444' : '#22c55e'} fillOpacity={0.85} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Budget Detail by Segment</div>
              <button className="btn btn-secondary btn-sm">📥 Export</button>
            </div>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Budget Name</th>
                    <th>Segment</th>
                    <th>Period</th>
                    <th>Budgeted</th>
                    <th>Actual</th>
                    <th>Variance</th>
                    <th>Utilization</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetData.map(b => (
                    <tr key={b.id}>
                      <td className="primary">{b.name}</td>
                      <td>
                        <span className="segment-dot">
                          <span>{b.segmentIcon}</span>
                          <span style={{ color: b.segmentColor, fontSize: 12 }}>{b.segmentName}</span>
                        </span>
                      </td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.period_start} → {b.period_end}</td>
                      <td className="amount">{fmt(b.budgeted_amount)}</td>
                      <td className="amount">{fmt(b.actual_amount)}</td>
                      <td style={{ fontWeight: 700, color: b.over ? '#f87171' : '#4ade80' }}>
                        {b.over ? '-' : '+'}{fmt(Math.abs(b.variance))}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
                          <div className="progress-bar" style={{ flex: 1 }}>
                            <div className="progress-fill" style={{
                              width: `${Math.min(b.utilization, 100)}%`,
                              background: b.over ? '#ef4444' : '#22c55e'
                            }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: b.over ? '#f87171' : '#4ade80', minWidth: 36 }}>
                            {b.utilization.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${b.over ? 'badge-danger' : 'badge-success'}`}>
                          {b.over ? '⚠️ Over' : '✓ On Track'}
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
    </div>
  )
}
