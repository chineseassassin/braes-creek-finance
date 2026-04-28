'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { SAMPLE_CROPS } from '@/lib/sample-data'
import { CropType } from '@/lib/types'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TTD', maximumFractionDigits: 0 }).format(n)

const CROP_ICONS: Record<string, string> = {
  'Cassava': '🌿', 'Sweet Potato': '🍠', 'Tomato': '🍅', 'Cucumber': '🥒',
  'Bell Pepper': '🫑', 'Sorrel': '🌺', 'Scotch Bonnet Pepper': '🌶️'
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  upcoming: { bg: 'rgba(59,130,246,0.1)', text: '#93c5fd', label: '📅 Upcoming' },
  growing: { bg: 'rgba(34,197,94,0.1)', text: '#4ade80', label: '🌱 Growing' },
  ready: { bg: 'rgba(245,158,11,0.1)', text: '#fbbf24', label: '✅ Ready to Harvest' },
  harvested: { bg: 'rgba(100,116,139,0.1)', text: '#94a3b8', label: '📦 Harvested' },
}

function getCropStatus(crop: CropType): string {
  const today = new Date()
  const plant = crop.planting_date ? new Date(crop.planting_date) : null
  const harvest = crop.expected_harvest ? new Date(crop.expected_harvest) : null
  if (!plant) return 'upcoming'
  if (harvest && today > harvest) return 'harvested'
  if (harvest) {
    const daysLeft = Math.ceil((harvest.getTime() - today.getTime()) / 86400000)
    if (daysLeft < 30) return 'ready'
  }
  return 'growing'
}

const CROP_COSTS: Record<string, number> = {
  'crop-1': 8500, 'crop-2': 3200, 'crop-3': 4800,
  'crop-4': 1600, 'crop-5': 2100, 'crop-6': 850, 'crop-7': 1200,
}

export default function CropsPage() {
  const [crops, setCrops] = useState<CropType[]>(SAMPLE_CROPS)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    name: '', variety: '', planting_date: '', expected_harvest: '',
    area_acres: '', season: '', notes: ''
  })

  const totalAcres = crops.reduce((s, c) => s + (c.area_acres ?? 0), 0)
  const activeCrops = crops.filter(c => getCropStatus(c) === 'growing').length
  const totalCosts = Object.values(CROP_COSTS).reduce((s, v) => s + v, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newCrop: CropType = {
      id: `crop-${Date.now()}`,
      name: form.name,
      variety: form.variety || undefined,
      planting_date: form.planting_date || undefined,
      expected_harvest: form.expected_harvest || undefined,
      area_acres: parseFloat(form.area_acres) || undefined,
      season: form.season || undefined,
      notes: form.notes || undefined,
      created_at: new Date().toISOString(),
    }
    setCrops(prev => [newCrop, ...prev])
    setShowModal(false)
    setForm({ name: '', variety: '', planting_date: '', expected_harvest: '', area_acres: '', season: '', notes: '' })
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar
          title="Crop Operations"
          subtitle="Planting schedules, harvest dates, and cost-per-crop tracking"
          actions={<button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Add Crop</button>}
        />
        <div className="page-container">
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="kpi-card" style={{ '--kpi-color': '#10b981' } as any}>
              <div className="kpi-label">Total Crops</div>
              <div className="kpi-value">{crops.length}</div>
              <div className="kpi-sub">varieties tracked</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#22c55e' } as any}>
              <div className="kpi-label">Active Growing</div>
              <div className="kpi-value">{activeCrops}</div>
              <div className="kpi-sub">currently in field</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#f59e0b' } as any}>
              <div className="kpi-label">Total Acreage</div>
              <div className="kpi-value">{totalAcres.toFixed(1)}</div>
              <div className="kpi-sub">acres under cultivation</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#ef4444' } as any}>
              <div className="kpi-label">Total Crop Costs</div>
              <div className="kpi-value">{fmt(totalCosts)}</div>
              <div className="kpi-sub">inputs & labor</div>
            </div>
          </div>

          {/* Crop Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, marginBottom: 24 }}>
            {crops.map(crop => {
              const status = getCropStatus(crop)
              const statusMeta = STATUS_COLORS[status]
              const icon = CROP_ICONS[crop.name] ?? '🌱'
              const cost = CROP_COSTS[crop.id] ?? 0
              const today = new Date()
              const harvest = crop.expected_harvest ? new Date(crop.expected_harvest) : null
              const daysLeft = harvest ? Math.ceil((harvest.getTime() - today.getTime()) / 86400000) : null
              const costPerAcre = crop.area_acres ? cost / crop.area_acres : 0

              return (
                <div key={crop.id} className="card" style={{ borderLeft: '4px solid #16a34a' }}>
                  <div className="card-body">
                    <div className="flex-between" style={{ marginBottom: 12 }}>
                      <div className="flex-center">
                        <span style={{ fontSize: 28 }}>{icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{crop.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{crop.variety ?? 'Standard variety'}</div>
                        </div>
                      </div>
                      <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: statusMeta.bg, color: statusMeta.text }}>
                        {statusMeta.label}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                      {[
                        { label: 'Area', val: crop.area_acres ? `${crop.area_acres} acres` : '—' },
                        { label: 'Season', val: crop.season ?? 'Year-round' },
                        { label: 'Planted', val: crop.planting_date ?? '—' },
                        { label: 'Harvest', val: crop.expected_harvest ?? '—' },
                      ].map(item => (
                        <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', padding: '7px 10px', borderRadius: 7 }}>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{item.label}</div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginTop: 1 }}>{item.val}</div>
                        </div>
                      ))}
                    </div>

                    {daysLeft !== null && (
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '7px 10px', borderRadius: 8,
                        background: daysLeft < 0 ? 'rgba(100,116,139,0.08)' : daysLeft < 30 ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.06)',
                        marginBottom: 10
                      }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {daysLeft < 0 ? 'Harvest passed' : daysLeft < 30 ? '⚠️ Harvest approaching' : '📅 Days to harvest'}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: 13, color: daysLeft < 0 ? '#94a3b8' : daysLeft < 30 ? '#fbbf24' : '#4ade80' }}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)}d ago` : `${daysLeft} days`}
                        </span>
                      </div>
                    )}

                    <div className="flex-between" style={{ marginBottom: 12, padding: '7px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Cost</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#f87171' }}>{fmt(cost)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Cost/Acre</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{costPerAcre > 0 ? fmt(costPerAcre) : '—'}</div>
                      </div>
                    </div>

                    {crop.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>📝 {crop.notes}</div>}

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>✏️ Edit</button>
                      <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>💸 Costs</button>
                      <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>📊 Yield</button>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Add New Crop CTA */}
            <div
              className="card"
              style={{ borderStyle: 'dashed', borderColor: 'rgba(22,163,74,0.3)', cursor: 'pointer', background: 'rgba(22,163,74,0.02)' }}
              onClick={() => setShowModal(true)}
            >
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                <div style={{ fontSize: 40, marginBottom: 10, opacity: 0.4 }}>🌱</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Add New Crop</div>
                <div style={{ fontSize: 12, color: '#52525b', textAlign: 'center' }}>Track any new crop type — expand easily anytime</div>
              </div>
            </div>
          </div>

          {/* Crop Summary Table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Crop Cost Summary</div>
              <button className="btn btn-secondary btn-sm">📥 Export</button>
            </div>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Crop</th>
                    <th>Variety</th>
                    <th>Acres</th>
                    <th>Planted</th>
                    <th>Harvest</th>
                    <th>Status</th>
                    <th>Cost</th>
                    <th>$/Acre</th>
                  </tr>
                </thead>
                <tbody>
                  {crops.map(crop => {
                    const status = getCropStatus(crop)
                    const statusMeta = STATUS_COLORS[status]
                    const cost = CROP_COSTS[crop.id] ?? 0
                    return (
                      <tr key={crop.id}>
                        <td className="primary">{CROP_ICONS[crop.name] ?? '🌱'} {crop.name}</td>
                        <td style={{ fontSize: 12 }}>{crop.variety ?? '—'}</td>
                        <td>{crop.area_acres ?? '—'}</td>
                        <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{crop.planting_date ?? '—'}</td>
                        <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{crop.expected_harvest ?? '—'}</td>
                        <td><span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: statusMeta.bg, color: statusMeta.text }}>{statusMeta.label}</span></td>
                        <td className="amount expense">{fmt(cost)}</td>
                        <td style={{ fontWeight: 600 }}>{crop.area_acres ? fmt(cost / crop.area_acres) : '—'}</td>
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
              <div className="modal-title">Add New Crop</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Crop Name *</label>
                    <input className="form-input" placeholder="e.g. Pumpkin" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Variety</label>
                    <input className="form-input" placeholder="e.g. Butternut" value={form.variety} onChange={e => setForm(p => ({ ...p, variety: e.target.value }))} />
                  </div>
                </div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Planting Date</label>
                    <input type="date" className="form-input" value={form.planting_date} onChange={e => setForm(p => ({ ...p, planting_date: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expected Harvest</label>
                    <input type="date" className="form-input" value={form.expected_harvest} onChange={e => setForm(p => ({ ...p, expected_harvest: e.target.value }))} />
                  </div>
                </div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Area (Acres)</label>
                    <input type="number" className="form-input" placeholder="0.0" step="0.1" value={form.area_acres} onChange={e => setForm(p => ({ ...p, area_acres: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Season</label>
                    <input className="form-input" placeholder="e.g. Dry, Wet, Year-round" value={form.season} onChange={e => setForm(p => ({ ...p, season: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Crop</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
