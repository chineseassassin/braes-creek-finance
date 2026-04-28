'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { SAMPLE_LOANS, SAMPLE_LOAN_PAYMENTS, SAMPLE_SEGMENTS } from '@/lib/sample-data'
import { Loan } from '@/lib/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TTD', maximumFractionDigits: 0 }).format(n)

const STATUS_COLORS: Record<string, string> = {
  active: '#3b82f6', paid_off: '#22c55e', overdue: '#ef4444', partial: '#f59e0b'
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>(SAMPLE_LOANS)
  const [showModal, setShowModal] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [form, setForm] = useState({
    lender_name: '', loan_date: '', principal_amount: '', interest_rate: '',
    repayment_terms: '', due_date: '', loan_purpose: '', segment_id: '', notes: '', status: 'active'
  })
  const [payForm, setPayForm] = useState({ payment_date: '', amount: '', principal_portion: '', interest_portion: '', notes: '' })

  const totalPrincipal = loans.reduce((s, l) => s + l.principal_amount, 0)
  const totalBalance = loans.reduce((s, l) => s + l.remaining_balance, 0)
  const totalRepaid = loans.reduce((s, l) => s + l.total_repaid, 0)
  const overdueLoans = loans.filter(l => l.status === 'overdue')

  const loanSummaryData = loans.map(l => ({
    name: l.lender_name.split(' ')[0],
    balance: l.remaining_balance,
    repaid: l.total_repaid,
    color: STATUS_COLORS[l.status],
  }))

  const statusPie = Object.entries(
    loans.reduce((acc, l) => { acc[l.status] = (acc[l.status] || 0) + l.remaining_balance; return acc }, {} as Record<string, number>)
  ).map(([status, value]) => ({ name: status, value, color: STATUS_COLORS[status] }))

  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault()
    const principal = parseFloat(form.principal_amount) || 0
    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      lender_name: form.lender_name,
      loan_date: form.loan_date,
      principal_amount: principal,
      interest_rate: parseFloat(form.interest_rate) || 0,
      repayment_terms: form.repayment_terms,
      due_date: form.due_date,
      total_repaid: 0,
      remaining_balance: principal,
      loan_purpose: form.loan_purpose,
      segment_id: form.segment_id || undefined,
      status: form.status as Loan['status'],
      notes: form.notes,
      created_by: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setLoans(prev => [newLoan, ...prev])
    setShowModal(false)
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar
          title="Loan Management"
          subtitle="Track all loans, repayments, and balances"
          actions={<button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Add Loan</button>}
        />
        <div className="page-container">

          {/* Overdue Alert */}
          {overdueLoans.length > 0 && (
            <div className="alert alert-danger" style={{ marginBottom: 16 }}>
              🚨 <strong>{overdueLoans.length} overdue loan(s)</strong> — immediate attention required.
            </div>
          )}

          {/* KPIs */}
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="kpi-card" style={{ '--kpi-color': '#3b82f6' } as any}>
              <div className="kpi-label">Total Principal</div>
              <div className="kpi-value">{fmt(totalPrincipal)}</div>
              <div className="kpi-sub">{loans.length} loans</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#ef4444' } as any}>
              <div className="kpi-label">Outstanding Balance</div>
              <div className="kpi-value">{fmt(totalBalance)}</div>
              <div className="kpi-sub">{((totalBalance / totalPrincipal) * 100).toFixed(0)}% remaining</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#22c55e' } as any}>
              <div className="kpi-label">Total Repaid</div>
              <div className="kpi-value">{fmt(totalRepaid)}</div>
              <div className="kpi-sub">{((totalRepaid / totalPrincipal) * 100).toFixed(0)}% of principal</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#ef4444' } as any}>
              <div className="kpi-label">Overdue Loans</div>
              <div className="kpi-value" style={{ color: overdueLoans.length > 0 ? '#ef4444' : '#22c55e' }}>{overdueLoans.length}</div>
              <div className="kpi-sub">require attention</div>
            </div>
          </div>

          {/* Charts */}
          <div className="chart-grid">
            <div className="card">
              <div className="card-header">
                <div className="card-title">Balance vs Repaid by Lender</div>
              </div>
              <div className="card-body" style={{ paddingTop: 0 }}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={loanSummaryData} margin={{ top: 4, right: 0, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: any) => fmt(v)} contentStyle={{ background: '#1f1f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="repaid" name="Repaid" stackId="a" fill="#22c55e" fillOpacity={0.8} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="balance" name="Balance" stackId="a" fill="#3b82f6" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <div className="card-title">Loan Status Distribution</div>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {statusPie.map((s, i) => <Cell key={i} fill={s.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => fmt(v)} contentStyle={{ background: '#1f1f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', justifyContent: 'center', marginTop: 4 }}>
                  {statusPie.map((s, i) => (
                    <div key={i} className="segment-dot">
                      <div className="dot" style={{ background: s.color }} />
                      <span style={{ fontSize: 12, color: '#a1a1aa', textTransform: 'capitalize' }}>{s.name.replace('_', ' ')}: {fmt(s.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Loan Cards */}
          <div style={{ display: 'grid', gap: 16 }}>
            {loans.map(loan => {
              const pct = (loan.total_repaid / loan.principal_amount) * 100
              const seg = SAMPLE_SEGMENTS.find(s => s.id === loan.segment_id)
              const daysUntilDue = Math.ceil((new Date(loan.due_date).getTime() - Date.now()) / 86400000)
              return (
                <div key={loan.id} className="card">
                  <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
                      <div>
                        <div className="flex-center" style={{ marginBottom: 8, gap: 10 }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: '#f4f4f5' }}>{loan.lender_name}</div>
                          <span className={`badge ${
                            loan.status === 'active' ? 'badge-info'
                            : loan.status === 'paid_off' ? 'badge-success'
                            : loan.status === 'overdue' ? 'badge-danger'
                            : 'badge-warning'
                          }`}>
                            {loan.status.replace('_', ' ')}
                          </span>
                          {seg && <span className="badge badge-neutral">{seg.icon} {seg.name}</span>}
                        </div>
                        <div style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 12 }}>
                          🎯 {loan.loan_purpose}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 14 }}>
                          {[
                            { label: 'Principal', val: fmt(loan.principal_amount) },
                            { label: 'Interest Rate', val: `${loan.interest_rate}% p.a.` },
                            { label: 'Repaid', val: fmt(loan.total_repaid), color: '#22c55e' },
                            { label: 'Balance', val: fmt(loan.remaining_balance), color: '#f87171' },
                          ].map(item => (
                            <div key={item.label}>
                              <div style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{item.label}</div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: item.color ?? '#f4f4f5', marginTop: 2, fontFamily: 'Outfit, sans-serif' }}>{item.val}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <div className="flex-between" style={{ marginBottom: 4, fontSize: 11, color: '#71717a' }}>
                            <span>Repayment Progress</span>
                            <span>{pct.toFixed(1)}% complete</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{
                              width: `${pct}%`,
                              background: loan.status === 'overdue' ? '#ef4444' : '#3b82f6'
                            }} />
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: '#52525b' }}>
                          📅 Terms: {loan.repayment_terms} &nbsp;·&nbsp;
                          Due: {loan.due_date} &nbsp;
                          ({daysUntilDue > 0 ? `${daysUntilDue} days remaining` : `${Math.abs(daysUntilDue)} days overdue`})
                        </div>
                        {loan.notes && <div style={{ fontSize: 12, color: '#52525b', marginTop: 4 }}>📝 {loan.notes}</div>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140 }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => { setSelectedLoan(loan); setShowPayModal(true) }}
                        >
                          + Record Payment
                        </button>
                        <button className="btn btn-secondary btn-sm">✏️ Edit</button>
                        <button className="btn btn-secondary btn-sm">📄 History</button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Recent Payments */}
          <div className="card" style={{ marginTop: 24 }}>
            <div className="card-header">
              <div className="card-title">Recent Loan Payments</div>
            </div>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Lender</th>
                    <th>Total Payment</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_LOAN_PAYMENTS.map(p => {
                    const loan = SAMPLE_LOANS.find(l => l.id === p.loan_id)
                    return (
                      <tr key={p.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.payment_date}</td>
                        <td className="primary">{loan?.lender_name}</td>
                        <td className="amount">{fmt(p.amount)}</td>
                        <td style={{ color: '#4ade80', fontWeight: 600 }}>{fmt(p.principal_portion)}</td>
                        <td style={{ color: '#fb923c', fontWeight: 600 }}>{fmt(p.interest_portion)}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.notes ?? '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Loan Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Add New Loan</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddLoan}>
              <div className="modal-body">
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Lender Name *</label>
                    <input className="form-input" placeholder="Bank or individual name" value={form.lender_name} onChange={e => setForm(p => ({ ...p, lender_name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Loan Date *</label>
                    <input type="date" className="form-input" value={form.loan_date} onChange={e => setForm(p => ({ ...p, loan_date: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Principal Amount (TTD) *</label>
                    <input type="number" className="form-input" placeholder="0.00" value={form.principal_amount} onChange={e => setForm(p => ({ ...p, principal_amount: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Interest Rate (% p.a.) *</label>
                    <input type="number" className="form-input" placeholder="0.00" step="0.1" value={form.interest_rate} onChange={e => setForm(p => ({ ...p, interest_rate: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Due Date *</label>
                    <input type="date" className="form-input" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                      <option value="active">Active</option>
                      <option value="partial">Partial</option>
                      <option value="overdue">Overdue</option>
                      <option value="paid_off">Paid Off</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Repayment Terms</label>
                  <input className="form-input" placeholder="e.g. 60 months, equal installments" value={form.repayment_terms} onChange={e => setForm(p => ({ ...p, repayment_terms: e.target.value }))} />
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Loan Purpose *</label>
                  <input className="form-input" placeholder="What were the funds used for?" value={form.loan_purpose} onChange={e => setForm(p => ({ ...p, loan_purpose: e.target.value }))} required />
                </div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Linked Business Segment</label>
                    <select className="form-select" value={form.segment_id} onChange={e => setForm(p => ({ ...p, segment_id: e.target.value }))}>
                      <option value="">None</option>
                      {SAMPLE_SEGMENTS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Loan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPayModal && selectedLoan && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPayModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div className="modal-title">Record Payment · {selectedLoan.lender_name}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPayModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                Balance: <strong>{fmt(selectedLoan.remaining_balance)}</strong>
              </div>
              <div className="form-grid" style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">Payment Date *</label>
                  <input type="date" className="form-input" value={payForm.payment_date} onChange={e => setPayForm(p => ({ ...p, payment_date: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Amount *</label>
                  <input type="number" className="form-input" placeholder="0.00" value={payForm.amount} onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))} required />
                </div>
              </div>
              <div className="form-grid" style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">Principal Portion</label>
                  <input type="number" className="form-input" placeholder="0.00" value={payForm.principal_portion} onChange={e => setPayForm(p => ({ ...p, principal_portion: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Interest Portion</label>
                  <input type="number" className="form-input" placeholder="0.00" value={payForm.interest_portion} onChange={e => setPayForm(p => ({ ...p, interest_portion: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" placeholder="Payment notes…" value={payForm.notes} onChange={e => setPayForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPayModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setShowPayModal(false)}>Record Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
