'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { SAMPLE_FEED_PURCHASES, SAMPLE_MAINTENANCE, SAMPLE_SEGMENTS } from '@/lib/sample-data'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TTD', maximumFractionDigits: 0 }).format(n)

const MAINTENANCE_COLORS: Record<string, string> = {
  routine: '#22c55e', repair: '#f59e0b', replacement: '#ef4444'
}

export default function FeedSuppliesPage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'maintenance'>('feed')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    date: '', feed_type: '', quantity_kg: '', unit_cost: '', supplier: '', segment_id: '', notes: ''
  })

  const totalFeedCost = SAMPLE_FEED_PURCHASES.reduce((s, f) => s + f.total_cost, 0)
  const totalFeedKg = SAMPLE_FEED_PURCHASES.reduce((s, f) => s + f.quantity_kg, 0)
  const totalMaintCost = SAMPLE_MAINTENANCE.reduce((s, m) => s + m.cost, 0)

  const feedByType = Object.entries(
    SAMPLE_FEED_PURCHASES.reduce((acc, f) => {
      acc[f.feed_type] = (acc[f.feed_type] || 0) + f.total_cost
      return acc
    }, {} as Record<string, number>)
  ).map(([name, cost]) => ({ name: name.replace(' ', '\n'), cost }))

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar
          title="Feed & Supplies"
          subtitle="Feed purchases, inventory, and equipment maintenance"
          actions={<button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Log Purchase</button>}
        />
        <div className="page-container">
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="kpi-card" style={{ '--kpi-color': '#10b981' } as any}>
              <div className="kpi-label">Total Feed Cost</div>
              <div className="kpi-value">{fmt(totalFeedCost)}</div>
              <div className="kpi-sub">{SAMPLE_FEED_PURCHASES.length} purchases</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#06b6d4' } as any}>
              <div className="kpi-label">Total Feed (kg)</div>
              <div className="kpi-value">{totalFeedKg.toLocaleString()}</div>
              <div className="kpi-sub">kilograms purchased</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#f59e0b' } as any}>
              <div className="kpi-label">Avg Cost/kg</div>
              <div className="kpi-value">{fmt(totalFeedCost / totalFeedKg)}</div>
              <div className="kpi-sub">blended rate</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#d97706' } as any}>
              <div className="kpi-label">Maintenance Spend</div>
              <div className="kpi-value">{fmt(totalMaintCost)}</div>
              <div className="kpi-sub">{SAMPLE_MAINTENANCE.length} work orders</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['feed', 'maintenance'] as const).map(tab => (
              <button
                key={tab}
                className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'feed' ? '🌾 Feed Purchases' : '🔧 Maintenance Log'}
              </button>
            ))}
          </div>

          {activeTab === 'feed' && (
            <>
              <div className="card section-gap">
                <div className="card-header"><div className="card-title">Feed Cost by Type</div></div>
                <div className="card-body" style={{ paddingTop: 0 }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={feedByType} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: any) => fmt(v)} contentStyle={{ background: '#1f1f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="cost" name="Cost" fill="#10b981" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div className="card-title">Feed Purchase Log</div>
                  <button className="btn btn-secondary btn-sm">📥 Export</button>
                </div>
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Feed Type</th>
                        <th>Quantity (kg)</th>
                        <th>Unit Cost</th>
                        <th>Total</th>
                        <th>Supplier</th>
                        <th>Segment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SAMPLE_FEED_PURCHASES.map(f => {
                        const seg = SAMPLE_SEGMENTS.find(s => s.id === f.segment_id)
                        return (
                          <tr key={f.id}>
                            <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{f.date}</td>
                            <td className="primary">🌾 {f.feed_type}</td>
                            <td style={{ fontWeight: 600 }}>{f.quantity_kg.toLocaleString()} kg</td>
                            <td>{fmt(f.unit_cost)}/kg</td>
                            <td className="amount expense">{fmt(f.total_cost)}</td>
                            <td style={{ fontSize: 12 }}>{f.supplier}</td>
                            <td>
                              <span className="segment-dot">
                                <span>{seg?.icon}</span>
                                <span style={{ color: seg?.color, fontSize: 12 }}>{seg?.name?.split('/')[0].trim()}</span>
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'maintenance' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">Equipment Maintenance Log</div>
                <button className="btn btn-secondary btn-sm">+ Add Record</button>
              </div>
              <div style={{ display: 'grid', gap: 12, padding: 20 }}>
                {SAMPLE_MAINTENANCE.map(m => (
                  <div key={m.id} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12,
                    padding: 16,
                    borderLeft: `4px solid ${MAINTENANCE_COLORS[m.maintenance_type]}`
                  }}>
                    <div className="flex-between" style={{ marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>🔧 {m.equipment_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{m.description}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                          background: `${MAINTENANCE_COLORS[m.maintenance_type]}20`,
                          color: MAINTENANCE_COLORS[m.maintenance_type],
                          textTransform: 'capitalize'
                        }}>{m.maintenance_type}</span>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#f87171', marginTop: 4, fontFamily: 'Outfit, sans-serif' }}>{fmt(m.cost)}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--text-muted)' }}>
                      <span>📅 Date: {m.date}</span>
                      {m.next_service_date && <span>🔄 Next service: <strong style={{ color: '#fbbf24' }}>{m.next_service_date}</strong></span>}
                      {m.notes && <span>📝 {m.notes}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div className="modal-title">Log Feed Purchase</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid" style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input type="date" className="form-input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Feed Type *</label>
                  <input className="form-input" placeholder="e.g. Broiler Starter" value={form.feed_type} onChange={e => setForm(p => ({ ...p, feed_type: e.target.value }))} required />
                </div>
              </div>
              <div className="form-grid" style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">Quantity (kg) *</label>
                  <input type="number" className="form-input" value={form.quantity_kg} onChange={e => setForm(p => ({ ...p, quantity_kg: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit Cost (TTD/kg) *</label>
                  <input type="number" className="form-input" step="0.01" value={form.unit_cost} onChange={e => setForm(p => ({ ...p, unit_cost: e.target.value }))} required />
                </div>
              </div>
              {form.quantity_kg && form.unit_cost && (
                <div className="alert alert-info" style={{ marginBottom: 12 }}>
                  🌾 Total Cost: <strong>{fmt(parseFloat(form.quantity_kg) * parseFloat(form.unit_cost))}</strong>
                </div>
              )}
              <div className="form-grid" style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">Supplier</label>
                  <input className="form-input" value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Business Segment</label>
                  <select className="form-select" value={form.segment_id} onChange={e => setForm(p => ({ ...p, segment_id: e.target.value }))}>
                    <option value="">Select…</option>
                    {SAMPLE_SEGMENTS.filter(s => ['seg-1','seg-2','seg-3','seg-4','seg-5'].includes(s.id)).map(s => (
                      <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary">Save Purchase</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
