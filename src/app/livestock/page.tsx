'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { SAMPLE_LIVESTOCK } from '@/lib/sample-data'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TTD', maximumFractionDigits: 0 }).format(n)

const ANIMAL_ICONS: Record<string, string> = {
  broiler: '🐔', layer: '🥚', goat: '🐐', pig: '🐷', cattle: '🐄', other: '🐾'
}
const ANIMAL_COLORS: Record<string, string> = {
  broiler: '#f97316', layer: '#eab308', goat: '#84cc16', pig: '#f43f5e', cattle: '#8b5cf6', other: '#64748b'
}

export default function LivestockPage() {
  const [livestock, setLivestock] = useState(SAMPLE_LIVESTOCK)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    animal_type: 'broiler', breed: '', quantity: '', acquisition_date: '',
    acquisition_cost: '', current_value: '', status: 'active', notes: ''
  })

  const totalValue = livestock.filter(l => l.status === 'active').reduce((s, l) => s + (l.current_value ?? 0), 0)
  const totalAcqCost = livestock.reduce((s, l) => s + l.acquisition_cost, 0)
  const totalHead = livestock.filter(l => l.status === 'active').reduce((s, l) => s + l.quantity, 0)

  const typeData = livestock.map(l => ({
    name: l.animal_type.charAt(0).toUpperCase() + l.animal_type.slice(1),
    type: l.animal_type,
    quantity: l.quantity,
    value: l.current_value ?? 0,
    acqCost: l.acquisition_cost,
    color: ANIMAL_COLORS[l.animal_type],
  }))

  const valuePie = typeData.map(t => ({ name: t.name, value: t.value, color: t.color }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newUnit = {
      id: `ls-${Date.now()}`,
      ...form,
      quantity: parseInt(form.quantity) || 0,
      acquisition_cost: parseFloat(form.acquisition_cost) || 0,
      current_value: parseFloat(form.current_value) || 0,
      created_at: new Date().toISOString(),
    }
    setLivestock(prev => [newUnit as any, ...prev])
    setShowModal(false)
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar
          title="Livestock Operations"
          subtitle="Animal inventory, values, and performance tracking"
          actions={<button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Add Livestock</button>}
        />
        <div className="page-container">
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="kpi-card no-hover" style={{ '--kpi-color': 'var(--status-success)' } as any}>
              <div className="kpi-label">Total Head Count</div>
              <div className="kpi-value" style={{ color: 'var(--status-success)', textShadow: 'var(--status-success-glow)' }}>{totalHead.toLocaleString()}</div>
              <div className="kpi-sub">active animals</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': 'var(--status-ai)' } as any}>
              <div className="kpi-label">Current Value</div>
              <div className="kpi-value" style={{ color: 'var(--status-ai)', textShadow: 'var(--status-ai-glow)' }}>{fmt(totalValue)}</div>
              <div className="kpi-sub">estimated market value</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': 'var(--status-warning)' } as any}>
              <div className="kpi-label">Acquisition Cost</div>
              <div className="kpi-value" style={{ color: 'var(--status-warning)', textShadow: 'var(--status-warning-glow)' }}>{fmt(totalAcqCost)}</div>
              <div className="kpi-sub">total invested</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': 'var(--status-success)' } as any}>
              <div className="kpi-label">Unrealized Gain</div>
              <div className="kpi-value" style={{ color: 'var(--status-success)', textShadow: 'var(--status-success-glow)' }}>{fmt(totalValue - totalAcqCost)}</div>
              <div className="kpi-sub">{(((totalValue - totalAcqCost) / totalAcqCost) * 100).toFixed(1)}% appreciation</div>
            </div>
          </div>

          <div className="chart-grid">
            <div className="card">
              <div className="card-header"><div className="card-title">Value by Animal Type</div></div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={valuePie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {valuePie.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => fmt(v)} contentStyle={{ background: '#1f1f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', justifyContent: 'center', marginTop: 8 }}>
                  {valuePie.map((v, i) => (
                    <div key={i} className="segment-dot">
                      <div className="dot" style={{ background: v.color }} />
                      <span style={{ fontSize: 12, color: '#a1a1aa' }}>{ANIMAL_ICONS[v.name.toLowerCase()] ?? '•'} {v.name}: {fmt(v.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card no-hover">
              <div className="card-header"><div className="card-title">Head Count by Type</div></div>
              <div className="card-body" style={{ paddingTop: 0 }}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={typeData} margin={{ top: 4, right: 0, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ background: '#1f1f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} 
                    />
                    <Bar dataKey="quantity" name="Head Count" radius={[4, 4, 0, 0]}>
                      {typeData.map((e, i) => <Cell key={i} fill={e.color} fillOpacity={0.85} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Livestock Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {livestock.map(unit => {
              const gain = (unit.current_value ?? 0) - unit.acquisition_cost
              const gainPct = (gain / unit.acquisition_cost) * 100
              return (
                <div key={unit.id} className="card" style={{ borderTop: `3px solid ${ANIMAL_COLORS[unit.animal_type]}` }}>
                  <div className="card-body">
                    <div className="flex-between" style={{ marginBottom: 12 }}>
                      <div className="flex-center">
                        <span style={{ fontSize: 28 }}>{ANIMAL_ICONS[unit.animal_type]}</span>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>
                            {unit.animal_type.charAt(0).toUpperCase() + unit.animal_type.slice(1)}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{unit.breed ?? 'Mixed breed'}</div>
                        </div>
                      </div>
                      <span className={`badge ${unit.status === 'active' ? 'badge-success' : unit.status === 'sold' ? 'badge-info' : 'badge-danger'}`}>
                        {unit.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                      {[
                        { label: 'Quantity', val: `${unit.quantity} head` },
                        { label: 'Acquired', val: unit.acquisition_date },
                        { label: 'Acq. Cost', val: fmt(unit.acquisition_cost) },
                        { label: 'Curr. Value', val: fmt(unit.current_value ?? 0), color: '#4ade80' },
                      ].map(item => (
                        <div key={item.label} style={{ background: 'var(--bg-card-elevated)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{item.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: item.color === '#4ade80' ? 'var(--status-success)' : (item.color ?? 'var(--text-primary)'), marginTop: 2 }}>{item.val}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: gain >= 0 ? 'var(--status-success-glow)' : 'var(--status-critical-glow)', borderRadius: 8, marginBottom: 10, border: `1px solid ${gain >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Unrealized Gain</span>
                      <span style={{ fontWeight: 800, color: gain >= 0 ? 'var(--status-success)' : 'var(--status-critical)', fontSize: 13 }}>
                        {gain >= 0 ? '+' : ''}{fmt(gain)} ({gainPct.toFixed(1)}%)
                      </span>
                    </div>

                    {unit.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>📝 {unit.notes}</div>}

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>✏️ Edit</button>
                      <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>💰 Costs</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Add Livestock Unit</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Animal Type *</label>
                    <select className="form-select" value={form.animal_type} onChange={e => setForm(p => ({ ...p, animal_type: e.target.value }))}>
                      {Object.entries(ANIMAL_ICONS).map(([type, icon]) => (
                        <option key={type} value={type}>{icon} {type.charAt(0).toUpperCase() + type.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Breed / Variety</label>
                    <input className="form-input" placeholder="e.g. Ross 308, Boer" value={form.breed} onChange={e => setForm(p => ({ ...p, breed: e.target.value }))} />
                  </div>
                </div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Quantity *</label>
                    <input type="number" className="form-input" placeholder="0" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Acquisition Date *</label>
                    <input type="date" className="form-input" value={form.acquisition_date} onChange={e => setForm(p => ({ ...p, acquisition_date: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Acquisition Cost (TTD)</label>
                    <input type="number" className="form-input" placeholder="0.00" value={form.acquisition_cost} onChange={e => setForm(p => ({ ...p, acquisition_cost: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Value (TTD)</label>
                    <input type="number" className="form-input" placeholder="0.00" value={form.current_value} onChange={e => setForm(p => ({ ...p, current_value: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="active">Active</option>
                    <option value="sold">Sold</option>
                    <option value="deceased">Deceased</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Livestock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
