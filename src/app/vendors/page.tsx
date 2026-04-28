'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { SAMPLE_VENDORS, SAMPLE_SEGMENTS } from '@/lib/sample-data'
import { Vendor } from '@/lib/types'

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>(SAMPLE_VENDORS)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', contact_name: '', phone: '', email: '', address: '', segment_id: '', notes: '' })

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    (v.contact_name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newVendor: Vendor = {
      id: `v-${Date.now()}`,
      ...form,
      segment_id: form.segment_id || undefined,
      created_at: new Date().toISOString(),
    }
    setVendors(prev => [newVendor, ...prev])
    setShowModal(false)
    setForm({ name: '', contact_name: '', phone: '', email: '', address: '', segment_id: '', notes: '' })
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar
          title="Vendors & Suppliers"
          subtitle="Manage all business suppliers and service providers"
          actions={<button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Add Vendor</button>}
        />
        <div className="page-container">
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="kpi-card" style={{ '--kpi-color': '#3b82f6' } as any}>
              <div className="kpi-label">Total Vendors</div>
              <div className="kpi-value">{vendors.length}</div>
              <div className="kpi-sub">registered suppliers</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#10b981' } as any}>
              <div className="kpi-label">With Contact</div>
              <div className="kpi-value">{vendors.filter(v => v.contact_name).length}</div>
              <div className="kpi-sub">have named contacts</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#f59e0b' } as any}>
              <div className="kpi-label">Segments Covered</div>
              <div className="kpi-value">{new Set(vendors.map(v => v.segment_id)).size}</div>
              <div className="kpi-sub">business areas served</div>
            </div>
          </div>

          <div className="card">
            <div className="filter-bar">
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input className="search-input" placeholder="Search vendors…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} vendors</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, padding: 20 }}>
              {filtered.map(v => {
                const seg = SAMPLE_SEGMENTS.find(s => s.id === v.segment_id)
                return (
                  <div key={v.id} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12,
                    padding: 16,
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                  >
                    <div className="flex-between" style={{ marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>🏪 {v.name}</div>
                      {seg && <span className="badge badge-neutral">{seg.icon} {seg.name.split('/')[0].trim()}</span>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
                      {v.contact_name && <div>👤 {v.contact_name}</div>}
                      {v.phone && <div>📞 {v.phone}</div>}
                      {v.email && <div>✉️ {v.email}</div>}
                      {v.address && <div>📍 {v.address}</div>}
                      {v.notes && <div style={{ marginTop: 6, color: 'var(--text-muted)', fontStyle: 'italic' }}>📝 {v.notes}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>✏️ Edit</button>
                      <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>📊 History</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Add Vendor / Supplier</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Business Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Contact Person</label>
                    <input className="form-input" value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Primary Segment</label>
                    <select className="form-select" value={form.segment_id} onChange={e => setForm(p => ({ ...p, segment_id: e.target.value }))}>
                      <option value="">None</option>
                      {SAMPLE_SEGMENTS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Address</label>
                  <input className="form-input" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
