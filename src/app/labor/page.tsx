'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { SAMPLE_LABOR, SAMPLE_SEGMENTS } from '@/lib/sample-data'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TTD', maximumFractionDigits: 0 }).format(n)

export default function LaborPage() {
  const [labor, setLabor] = useState(SAMPLE_LABOR)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [segFilter, setSegFilter] = useState('all')
  const [form, setForm] = useState({
    worker_name: '', task: '', date: '', start_time: '', end_time: '',
    hourly_rate: '', segment_id: '', notes: ''
  })

  const filtered = labor.filter(l => {
    const matchSearch =
      l.worker_name.toLowerCase().includes(search.toLowerCase()) ||
      l.task.toLowerCase().includes(search.toLowerCase())
    const matchSeg = segFilter === 'all' || l.segment_id === segFilter
    return matchSearch && matchSeg
  })

  const totalHours = filtered.reduce((s, l) => s + l.hours_worked, 0)
  const totalCost = filtered.reduce((s, l) => s + l.total_cost, 0)

  // By worker chart
  const workerData = Object.entries(
    labor.reduce((acc, l) => {
      if (!acc[l.worker_name]) acc[l.worker_name] = { hours: 0, cost: 0 }
      acc[l.worker_name].hours += l.hours_worked
      acc[l.worker_name].cost += l.total_cost
      return acc
    }, {} as Record<string, { hours: number; cost: number }>)
  ).map(([name, d]) => ({ name: name.split(' ')[0], hours: d.hours, cost: d.cost }))

  // By segment
  const segData = Object.entries(
    labor.reduce((acc, l) => {
      const seg = SAMPLE_SEGMENTS.find(s => s.id === l.segment_id)
      const key = seg?.name?.split('/')[0].trim() ?? 'Other'
      acc[key] = (acc[key] || 0) + l.total_cost
      return acc
    }, {} as Record<string, number>)
  ).map(([name, cost]) => ({ name, cost }))

  const calcHours = (start: string, end: string) => {
    if (!start || !end) return 0
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    return Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const hours = calcHours(form.start_time, form.end_time)
    const rate = parseFloat(form.hourly_rate) || 0
    const newEntry = {
      id: `lab-${Date.now()}`,
      ...form,
      hours_worked: hours,
      hourly_rate: rate,
      total_cost: hours * rate,
      created_by: 'user-1',
      created_at: new Date().toISOString(),
    }
    setLabor(prev => [newEntry as any, ...prev])
    setShowModal(false)
    setForm({ worker_name: '', task: '', date: '', start_time: '', end_time: '', hourly_rate: '', segment_id: '', notes: '' })
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar
          title="Labor Tracking"
          subtitle="Worker hours, tasks, and labor costs by department"
          actions={<button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Log Labor</button>}
        />
        <div className="page-container">

          {/* KPIs */}
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="kpi-card" style={{ '--kpi-color': '#06b6d4' } as any}>
              <div className="kpi-label">Total Hours</div>
              <div className="kpi-value">{totalHours.toFixed(1)}</div>
              <div className="kpi-sub">across {filtered.length} entries</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#8b5cf6' } as any}>
              <div className="kpi-label">Total Labor Cost</div>
              <div className="kpi-value">{fmt(totalCost)}</div>
              <div className="kpi-sub">filtered period</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#10b981' } as any}>
              <div className="kpi-label">Avg Hourly Rate</div>
              <div className="kpi-value">{fmt(totalCost / (totalHours || 1))}</div>
              <div className="kpi-sub">effective rate</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#f59e0b' } as any}>
              <div className="kpi-label">Workers Logged</div>
              <div className="kpi-value">{new Set(labor.map(l => l.worker_name)).size}</div>
              <div className="kpi-sub">unique workers</div>
            </div>
          </div>

          {/* Charts */}
          <div className="chart-grid">
            <div className="card">
              <div className="card-header"><div className="card-title">Labor Hours by Worker</div></div>
              <div className="card-body" style={{ paddingTop: 0 }}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={workerData} margin={{ top: 4, right: 0, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1f1f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="hours" name="Hours" fill="#06b6d4" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">Labor Cost by Segment</div></div>
              <div className="card-body" style={{ paddingTop: 0 }}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={segData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
                    <Tooltip formatter={(v: any) => fmt(v)} contentStyle={{ background: '#1f1f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="cost" name="Cost" fill="#8b5cf6" radius={[0, 4, 4, 0]} fillOpacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card">
            <div className="filter-bar">
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input className="search-input" placeholder="Search worker or task…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="form-select" style={{ width: 'auto', padding: '7px 28px 7px 10px', fontSize: 12 }} value={segFilter} onChange={e => setSegFilter(e.target.value)}>
                <option value="all">All Segments</option>
                {SAMPLE_SEGMENTS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
              </select>
              <button className="btn btn-secondary btn-sm">📥 Export</button>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} entries · {totalHours}h · {fmt(totalCost)}</span>
            </div>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Worker</th>
                    <th>Task</th>
                    <th>Segment</th>
                    <th>Time</th>
                    <th>Hours</th>
                    <th>Rate/hr</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(entry => {
                    const seg = SAMPLE_SEGMENTS.find(s => s.id === entry.segment_id)
                    return (
                      <tr key={entry.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{entry.date}</td>
                        <td className="primary">{entry.worker_name}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 200 }}>{entry.task}</td>
                        <td>
                          <span className="segment-dot">
                            <span>{seg?.icon}</span>
                            <span style={{ color: seg?.color, fontSize: 12 }}>{seg?.name?.split('/')[0].trim()}</span>
                          </span>
                        </td>
                        <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{entry.start_time}–{entry.end_time}</td>
                        <td style={{ fontWeight: 600 }}>{entry.hours_worked}h</td>
                        <td>{fmt(entry.hourly_rate)}</td>
                        <td className="amount">{fmt(entry.total_cost)}</td>
                        <td><button className="btn btn-ghost btn-sm">✏️</button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Log Labor Entry</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Worker Name *</label>
                    <input className="form-input" placeholder="Full name" value={form.worker_name} onChange={e => setForm(p => ({ ...p, worker_name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input type="date" className="form-input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Task / Description *</label>
                  <input className="form-input" placeholder="What work was done?" value={form.task} onChange={e => setForm(p => ({ ...p, task: e.target.value }))} required />
                </div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Start Time *</label>
                    <input type="time" className="form-input" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time *</label>
                    <input type="time" className="form-input" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Hourly Rate (TTD) *</label>
                    <input type="number" className="form-input" placeholder="0.00" value={form.hourly_rate} onChange={e => setForm(p => ({ ...p, hourly_rate: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Business Segment *</label>
                    <select className="form-select" value={form.segment_id} onChange={e => setForm(p => ({ ...p, segment_id: e.target.value }))} required>
                      <option value="">Select segment…</option>
                      {SAMPLE_SEGMENTS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                    </select>
                  </div>
                </div>
                {form.start_time && form.end_time && (
                  <div className="alert alert-info" style={{ marginBottom: 12 }}>
                    ⏱️ Calculated: <strong>{calcHours(form.start_time, form.end_time).toFixed(1)} hours</strong>
                    {form.hourly_rate && <> · Cost: <strong>{fmt(calcHours(form.start_time, form.end_time) * parseFloat(form.hourly_rate))}</strong></>}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
