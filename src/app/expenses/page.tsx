import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { SAMPLE_SEGMENTS, SAMPLE_CATEGORIES, SAMPLE_VENDORS } from '@/lib/sample-data'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useDashboardStore } from '@/store/useDashboardStore'
import { useAppStore } from '@/store/useAppStore'
import { useWorkflowStore } from '@/store/useWorkflowStore'
import { toast, Toaster } from 'react-hot-toast'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TTD', maximumFractionDigits: 0 }).format(n)

const fmtShort = (n: number) => {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`
  return `$${n}`
}

const PAYMENT_METHODS = ['cash', 'bank_transfer', 'check', 'credit_card', 'other']

export default function ExpensesPage() {
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('highlight')
  const { transactions, addTransaction, getTotalExpenses } = useDashboardStore()
  const { currentUser, emitSystemEvent, switchRole } = useAppStore()
  const { addApprovalRequest } = useWorkflowStore()
  
  const [search, setSearch] = useState('')
  const [segFilter, setSegFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (highlightId) {
      const el = document.getElementById(`row-${highlightId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight-flash');
      }
    }
  }, [highlightId, transactions]);
  
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0], 
    description: '', 
    amount: '', 
    category_id: '', 
    segment_id: '',
    vendor_id: '', 
    payment_method: 'cash', 
    is_recurring: false,
    recurring_frequency: 'monthly', 
    notes: ''
  })

  const expenses = useMemo(() => transactions.filter(t => t.type === 'expense'), [transactions])

  const filtered = expenses.filter(e => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase())
    const matchSeg = segFilter === 'all' || (e as any).segment_id === segFilter
    return matchSearch && matchSeg
  })

  const totalFiltered = filtered.filter(e => e.status === 'approved').reduce((s, e) => s + e.amount, 0)

  // Segment rollup for chart
  const segRollup = SAMPLE_SEGMENTS.map(seg => ({
    name: seg.icon + ' ' + seg.name.split('/')[0].trim(),
    amount: expenses.filter(e => (e as any).segment_id === seg.id && e.status === 'approved').reduce((s, e) => s + e.amount, 0),
    color: seg.color,
  })).filter(s => s.amount > 0).sort((a, b) => b.amount - a.amount).slice(0, 8)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = parseFloat(form.amount) || 0
    const isDataEntry = currentUser.role === 'data-entry'
    const status = isDataEntry ? 'pending' : 'approved'

    // 1. Add to Dashboard Store
    const newRecord = await addTransaction({
      ...form,
      type: 'expense',
      amount: amountNum,
      status: status,
      created_by: currentUser.id,
    } as any)

    // 2. If Data Entry, create Approval Request
    if (isDataEntry && newRecord) {
       addApprovalRequest({
          entity_type: 'expense',
          entity_id: newRecord.id,
          requester_id: currentUser.id,
          priority: amountNum > 1000 ? 'high' : 'medium',
          status: 'pending'
       })
       toast.success('Submitted for approval', { icon: '⏳', style: { background: '#101010', color: '#fff' } })
    } else if (!isDataEntry) {
       toast.success('Expense recorded and approved', { icon: '✅', style: { background: '#101010', color: '#fff' } })
    }

    setShowModal(false)
    setForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category_id: '', segment_id: '', vendor_id: '', payment_method: 'cash', is_recurring: false, recurring_frequency: 'monthly', notes: '' })
  }

  return (
    <div className="app-shell">
      <Toaster position="top-right" />
      <Sidebar />
      <div className="main-content">
        <Topbar
          title="Expenses"
          subtitle="Track all operating costs across segments"
          actions={
            <div style={{ display: 'flex', gap: 12 }}>
               {/* Role Switcher for Testing (Phase 3 Requirement) */}
               <select 
                className="form-select" 
                style={{ width: 120, fontSize: 10, padding: 4, height: 32, background: 'rgba(255,255,255,0.05)' }}
                value={currentUser.role}
                onChange={(e) => switchRole(e.target.value as any)}
               >
                 <option value="admin">Peter (Admin)</option>
                 <option value="data-entry">Mary (Entry)</option>
               </select>
               <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                 + Add Expense
               </button>
            </div>
          }
        />

        <div className="page-container">
          {/* KPIs */}
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="kpi-card" style={{ '--kpi-color': '#ef4444' } as any}>
              <div className="kpi-label">Total Expenses</div>
              <div className="kpi-value">{fmt(getTotalExpenses())}</div>
              <div className="kpi-sub">{expenses.filter(e => e.status === 'approved').length} verified</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#f97316' } as any}>
              <div className="kpi-label">Filtered Total</div>
              <div className="kpi-value">{fmt(totalFiltered)}</div>
              <div className="kpi-sub">{filtered.length} matching</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#06b6d4' } as any}>
              <div className="kpi-label">Recurring</div>
              <div className="kpi-value">{expenses.filter(e => e.is_recurring && e.status === 'approved').length}</div>
              <div className="kpi-sub">auto-tracked bills</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#8b5cf6' } as any}>
              <div className="kpi-label">Avg Transaction</div>
              <div className="kpi-value">{fmt(totalFiltered / (filtered.filter(e => e.status === 'approved').length || 1))}</div>
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
                {filtered.length} results · {fmt(totalFiltered)}
              </span>
            </div>

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Segment</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Recurring</th>
                    <th>Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(exp => {
                    const seg = SAMPLE_SEGMENTS.find(s => s.id === (exp as any).segment_id)
                    const isPending = exp.status === 'pending'
                    return (
                      <tr id={`row-${exp.id}`} key={exp.id} style={{ opacity: isPending ? 0.7 : 1 }}>
                        <td style={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'nowrap' }}>{exp.date}</td>
                        <td className="primary" style={{ maxWidth: 220 }}>{exp.description}</td>
                        <td>
                          <span className="segment-dot">
                            <span>{seg?.icon}</span>
                            <span style={{ color: seg?.color, fontSize: 12 }}>{seg?.name?.split('/')[0].trim()}</span>
                          </span>
                        </td>
                        <td>
                           <span className={`badge ${isPending ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: 9 }}>
                              {isPending ? 'PENDING' : 'APPROVED'}
                           </span>
                        </td>
                        <td>
                          <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                            {(exp as any).payment_method?.replace(/_/g, ' ') ?? '—'}
                          </span>
                        </td>
                        <td>
                          {(exp as any).is_recurring
                            ? <span className="badge badge-info">🔄 {(exp as any).recurring_frequency}</span>
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
      <style>{styles}</style>
    </div>
  )
}

const styles = `
  @keyframes highlight-flash {
    0% { background-color: rgba(34, 197, 94, 0.4); }
    100% { background-color: transparent; }
  }
  .highlight-flash {
    animation: highlight-flash 3s ease-out;
  }
`;
