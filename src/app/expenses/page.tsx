'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { SAMPLE_EXPENSES, SAMPLE_SEGMENTS, SAMPLE_CATEGORIES, SAMPLE_VENDORS } from '@/lib/sample-data'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TTD', maximumFractionDigits: 0 }).format(n)

const fmtShort = (n: number) => {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`
  return `$${n}`
}

const PAYMENT_METHODS = ['cash', 'bank_transfer', 'check', 'credit_card', 'other']

export default function ExpensesPage() {
  const [search, setSearch] = useState('')
  const [segFilter, setSegFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [expenses, setExpenses] = useState(SAMPLE_EXPENSES)
  const [form, setForm] = useState({
    date: '', description: '', amount: '', category_id: '', segment_id: '',
    vendor_id: '', payment_method: 'cash', is_recurring: false,
    recurring_frequency: 'monthly', notes: ''
  })

  const filtered = expenses.filter(e => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase())
    const matchSeg = segFilter === 'all' || e.segment_id === segFilter
    return matchSearch && matchSeg
  })

  const total = filtered.reduce((s, e) => s + e.amount, 0)

  // Segment rollup for chart
  const segRollup = SAMPLE_SEGMENTS.map(seg => ({
    name: seg.icon + ' ' + seg.name.split('/')[0].trim(),
    amount: expenses.filter(e => e.segment_id === seg.id).reduce((s, e) => s + e.amount, 0),
    color: seg.color,
  })).filter(s => s.amount > 0).sort((a, b) => b.amount - a.amount).slice(0, 8)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newExp = {
      id: `exp-${Date.now()}`,
      ...form,
      amount: parseFloat(form.amount) || 0,
      is_recurring: form.is_recurring,
      created_by: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setExpenses(prev => [newExp as any, ...prev])
    setShowModal(false)
    setForm({ date: '', description: '', amount: '', category_id: '', segment_id: '', vendor_id: '', payment_method: 'cash', is_recurring: false, recurring_frequency: 'monthly', notes: '' })
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar
          title="Expenses"
          subtitle="Track all operating costs across segments"
          actions={
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              + Add Expense
            </button>
          }
        />

        <div className="page-container">
          {/* KPIs */}
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="kpi-card" style={{ '--kpi-color': '#ef4444' } as any}>
              <div className="kpi-label">Total Expenses</div>
              <div className="kpi-value">{fmt(expenses.reduce((s, e) => s + e.amount, 0))}</div>
              <div className="kpi-sub">{expenses.length} transactions</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#f97316' } as any}>
              <div className="kpi-label">Filtered Total</div>
              <div className="kpi-value">{fmt(total)}</div>
              <div className="kpi-sub">{filtered.length} matching</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#06b6d4' } as any}>
              <div className="kpi-label">Recurring</div>
              <div className="kpi-value">{expenses.filter(e => e.is_recurring).length}</div>
              <div className="kpi-sub">auto-tracked bills</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#8b5cf6' } as any}>
              <div className="kpi-label">Avg Transaction</div>
              <div className="kpi-value">{fmt(total / (filtered.length || 1))}</div>
              <div className="kpi-sub">per expense</div>
            </div>
          </div>

          {/* Chart */}
          <div className="card section-gap">
            <div className="card-header">
              <div className="card-title">Spending by Business Segment</div>
            </div>
            <div className="card-body" style={{ paddingTop: 0 }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={segRollup} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} width={140} />
                  <Tooltip formatter={(v: any) => fmt(v)} contentStyle={{ background: '#1f1f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                    {segRollup.map((s, i) => <Cell key={i} fill={s.color} fillOpacity={0.9} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Filters + Table */}
          <div className="card">
            <div className="filter-bar">
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                  className="search-input"
                  placeholder="Search expenses…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '7px 28px 7px 10px', fontSize: 12 }}
                value={segFilter}
                onChange={e => setSegFilter(e.target.value)}
              >
                <option value="all">All Segments</option>
                {SAMPLE_SEGMENTS.map(s => (
                  <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                ))}
              </select>
              <button className="btn btn-secondary btn-sm">📥 Export CSV</button>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
                {filtered.length} results · {fmt(total)}
              </span>
            </div>

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Segment</th>
                    <th>Category</th>
                    <th>Vendor</th>
                    <th>Payment</th>
                    <th>Recurring</th>
                    <th>Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(exp => {
                    const seg = SAMPLE_SEGMENTS.find(s => s.id === exp.segment_id)
                    const cat = SAMPLE_CATEGORIES.find(c => c.id === exp.category_id)
                    const vendor = SAMPLE_VENDORS.find(v => v.id === exp.vendor_id)
                    return (
                      <tr key={exp.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'nowrap' }}>{exp.date}</td>
                        <td className="primary" style={{ maxWidth: 220 }}>{exp.description}</td>
                        <td>
                          <span className="segment-dot">
                            <span>{seg?.icon}</span>
                            <span style={{ color: seg?.color, fontSize: 12 }}>{seg?.name?.split('/')[0].trim()}</span>
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cat?.name ?? '—'}</td>
                        <td style={{ fontSize: 12 }}>{vendor?.name ?? '—'}</td>
                        <td>
                          <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                            {exp.payment_method.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>
                          {exp.is_recurring
                            ? <span className="badge badge-info">🔄 {exp.recurring_frequency}</span>
                            : <span className="badge badge-neutral">One-time</span>}
                        </td>
                        <td className="amount expense">{fmt(exp.amount)}</td>
                        <td>
                          <button className="btn btn-ghost btn-sm">✏️</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Add New Expense</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input type="date" className="form-input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount (TTD) *</label>
                    <input type="number" className="form-input" placeholder="0.00" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Description *</label>
                  <input type="text" className="form-input" placeholder="What was this expense for?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
                </div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Business Segment *</label>
                    <select className="form-select" value={form.segment_id} onChange={e => setForm(p => ({ ...p, segment_id: e.target.value }))} required>
                      <option value="">Select segment…</option>
                      {SAMPLE_SEGMENTS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}>
                      <option value="">Select category…</option>
                      {SAMPLE_CATEGORIES.filter(c => !form.segment_id || c.segment_id === form.segment_id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Vendor / Supplier</label>
                    <select className="form-select" value={form.vendor_id} onChange={e => setForm(p => ({ ...p, vendor_id: e.target.value }))}>
                      <option value="">None</option>
                      {SAMPLE_VENDORS.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select className="form-select" value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))}>
                      {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" id="recurring" checked={form.is_recurring} onChange={e => setForm(p => ({ ...p, is_recurring: e.target.checked }))} style={{ width: 16, height: 16, accentColor: 'var(--brand-primary)' }} />
                    <label htmlFor="recurring" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>Recurring Expense?</label>
                  </div>
                  {form.is_recurring && (
                    <div className="form-group">
                      <label className="form-label">Frequency</label>
                      <select className="form-select" value={form.recurring_frequency} onChange={e => setForm(p => ({ ...p, recurring_frequency: e.target.value }))}>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" placeholder="Additional notes…" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
