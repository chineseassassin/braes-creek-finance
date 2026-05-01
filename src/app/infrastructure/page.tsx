'use client'
import { useState, useMemo, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { useInfrastructureStore } from '@/store/useInfrastructureStore'
import { useVendorStore } from '@/store/useVendorStore'
import { useAppStore } from '@/store/useAppStore'
import { 
  Wrench, Shield, AlertTriangle, CheckCircle2, 
  Calendar, MapPin, DollarSign, Clock, 
  MoreVertical, Plus, Info, Activity, 
  Truck, Settings, ChevronRight, X
} from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import React from 'react'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TTD', maximumFractionDigits: 0 }).format(n)

const ASSET_TYPES = ['Tractor', 'Pump', 'Generator', 'Irrigation', 'Storage', 'Building', 'Vehicle', 'Other']

export default function InfrastructurePage() {
  const { assets, maintenanceLogs, addAsset, addMaintenanceLog, updateAssetStatus, isLoading } = useInfrastructureStore()
  const { vendors } = useVendorStore()
  const { currentUser } = useAppStore()

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false)
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false)
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)

  const [assetForm, setAssetForm] = useState({
    name: '', type: 'Tractor' as any, location: '', status: 'active' as any,
    purchase_value: '', purchase_date: new Date().toISOString().split('T')[0],
    vendor_name: '', notes: ''
  })

  const [maintForm, setMaintForm] = useState({
    date: new Date().toISOString().split('T')[0],
    maintenance_type: 'routine' as any,
    description: '',
    cost: '',
    vendor_name: '',
    next_service_date: '',
    status: 'scheduled' as any
  })

  // Metrics
  const approvedAssets = useMemo(() => assets.filter(a => a.workflow_status === 'approved'), [assets])
  const activeAssets = approvedAssets.filter(a => a.status === 'active').length
  const criticalAssets = approvedAssets.filter(a => a.status === 'down' || a.status === 'needs_service').length
  const totalValue = approvedAssets.reduce((s, a) => s + a.purchase_value, 0)

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...assetForm,
      purchase_value: parseFloat(assetForm.purchase_value) || 0
    }
    const result = await addAsset(payload)
    if (result) {
      toast.success(currentUser.role === 'admin' ? 'Asset added & approved' : 'Asset submitted for approval')
      setIsAssetModalOpen(false)
      setAssetForm({ name: '', type: 'Tractor', location: '', status: 'active', purchase_value: '', purchase_date: new Date().toISOString().split('T')[0], vendor_name: '', notes: '' })
    }
  }

  const handleAddMaint = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAssetId) return
    const payload = {
      ...maintForm,
      asset_id: selectedAssetId,
      cost: parseFloat(maintForm.cost) || 0
    }
    const result = await addMaintenanceLog(payload)
    if (result) {
      toast.success(currentUser.role === 'admin' ? 'Maintenance recorded' : 'Submitted for approval')
      setIsMaintModalOpen(false)
      setMaintForm({ date: new Date().toISOString().split('T')[0], maintenance_type: 'routine', description: '', cost: '', vendor_name: '', next_service_date: '', status: 'scheduled' })
    }
  }

  const handleToggleStatus = async (assetId: string, currentStatus: string) => {
     const newStatus = currentStatus === 'active' ? 'needs_service' : 'active'
     await updateAssetStatus(assetId, newStatus)
     toast.success(`Asset marked as ${newStatus.replace('_', ' ')}`)
  }

  return (
    <div className="app-shell">
      <Toaster position="top-right" />
      <Sidebar />
      <div className="main-content">
        <Topbar
          title="Infrastructure & Operations"
          subtitle="Equipment maintenance, asset tracking, and facility control"
          actions={<button className="btn btn-primary btn-sm" onClick={() => setIsAssetModalOpen(true)}>+ Add Asset</button>}
        />
        <div className="page-container">
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="kpi-card no-hover" style={{ '--kpi-color': 'var(--status-success)' } as any}>
              <div className="kpi-label">Active Equipment</div>
              <div className="kpi-value" style={{ color: 'var(--status-success)', textShadow: 'var(--status-success-glow)' }}>{activeAssets}</div>
              <div className="kpi-sub">fully operational</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': 'var(--status-critical)' } as any}>
              <div className="kpi-label">Service Required</div>
              <div className="kpi-value" style={{ color: 'var(--status-critical)', textShadow: 'var(--status-critical-glow)' }}>{criticalAssets}</div>
              <div className="kpi-sub">critical or overdue</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': 'var(--status-info)' } as any}>
              <div className="kpi-label">Asset Valuation</div>
              <div className="kpi-value" style={{ color: 'var(--status-info)', textShadow: 'var(--status-info-glow)' }}>{fmt(totalValue)}</div>
              <div className="kpi-sub">total purchase value</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': 'var(--status-ai)' } as any}>
              <div className="kpi-label">MTD Maint. Cost</div>
              <div className="kpi-value" style={{ color: 'var(--status-ai)', textShadow: 'var(--status-ai-glow)' }}>{fmt(maintenanceLogs.filter(l => l.workflow_status === 'approved').reduce((s, l) => s + l.cost, 0))}</div>
              <div className="kpi-sub">running repairs cost</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
            {assets.map(asset => {
              const isPending = asset.workflow_status === 'pending'
              const assetLogs = maintenanceLogs.filter(l => l.asset_id === asset.id)
              const lastMaint = assetLogs.length > 0 ? assetLogs[0] : null

              return (
                <div key={asset.id} className="card" style={{ opacity: isPending ? 0.8 : 1, borderTop: `3px solid ${asset.status === 'active' ? 'var(--status-success)' : asset.status === 'down' ? 'var(--status-critical)' : 'var(--status-warning)'}` }}>
                  <div className="card-body">
                    <div className="flex-between" style={{ marginBottom: 16 }}>
                      <div className="flex-center">
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-card-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <Wrench size={20} color={asset.status === 'active' ? 'var(--status-success)' : 'var(--text-muted)'} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 850, fontSize: 16, color: 'var(--text-primary)' }}>{asset.name}</div>
                          <div className="label-small" style={{ fontSize: 9 }}>{asset.type.toUpperCase()} • {asset.location}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                         <span className={`badge ${asset.status === 'active' ? 'badge-healthy' : asset.status === 'down' ? 'badge-critical' : 'badge-warning'}`}>
                           {asset.status.replace('_', ' ')}
                         </span>
                         {isPending && <div className="label-small" style={{ color: 'var(--status-warning)', marginTop: 4 }}>PENDING</div>}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                       <div style={{ background: 'var(--bg-card-elevated)', padding: 10, borderRadius: 10, border: '1px solid var(--border-soft)' }}>
                          <div className="label-small">Purchase Value</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{fmt(asset.purchase_value)}</div>
                       </div>
                       <div style={{ background: 'var(--bg-card-elevated)', padding: 10, borderRadius: 10, border: '1px solid var(--border-soft)' }}>
                          <div className="label-small">Commissioned</div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{asset.purchase_date}</div>
                       </div>
                    </div>

                    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border-soft)', marginBottom: 16 }}>
                       <div className="flex-between" style={{ marginBottom: 8 }}>
                          <span className="label-small">Latest Maintenance</span>
                          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--status-info)' }}>{lastMaint?.date || 'No logs recorded'}</span>
                       </div>
                       <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          {lastMaint ? `${lastMaint.maintenance_type.toUpperCase()}: ${lastMaint.description}` : 'Pending initial inspection'}
                       </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                       <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => { setSelectedAssetId(asset.id); setIsMaintModalOpen(true); }}>
                          <Plus size={14} /> Log Maintenance
                       </button>
                       <button className="btn btn-secondary btn-sm" onClick={() => handleToggleStatus(asset.id, asset.status)}>
                          {asset.status === 'active' ? 'Mark Down' : 'Repair Done'}
                       </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ASSET MODAL */}
      {isAssetModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsAssetModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <div className="modal-title">Commission New Asset</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsAssetModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddAsset}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: 16 }}>
                   <label className="form-label">Asset Name *</label>
                   <input className="form-input" placeholder="e.g. Irrigation Pump B2" value={assetForm.name} onChange={e => setAssetForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Asset Type *</label>
                    <select className="form-select" value={assetForm.type} onChange={e => setAssetForm(p => ({ ...p, type: e.target.value as any }))}>
                      {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Deployment Location</label>
                    <input className="form-input" placeholder="e.g. West Fields" value={assetForm.location} onChange={e => setAssetForm(p => ({ ...p, location: e.target.value }))} />
                  </div>
                </div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Purchase Value (TTD) *</label>
                    <input type="number" className="form-input" placeholder="0.00" value={assetForm.purchase_value} onChange={e => setAssetForm(p => ({ ...p, purchase_value: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Purchase Date *</label>
                    <input type="date" className="form-input" value={assetForm.purchase_date} onChange={e => setAssetForm(p => ({ ...p, purchase_date: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-group">
                   <label className="form-label">Vendor / Supplier</label>
                   <input className="form-input" placeholder="e.g. Machinery Ltd" value={assetForm.vendor_name} onChange={e => setAssetForm(p => ({ ...p, vendor_name: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAssetModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Authorize Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MAINTENANCE MODAL */}
      {isMaintModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsMaintModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div className="modal-title">Log Maintenance Activity</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsMaintModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddMaint}>
              <div className="modal-body">
                <div style={{ background: 'var(--bg-card-elevated)', padding: 12, borderRadius: 10, marginBottom: 20, textAlign: 'center' }}>
                   <span className="label-small">Asset ID:</span> <strong style={{ color: 'var(--text-primary)' }}>{selectedAssetId}</strong>
                </div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Log Date *</label>
                    <input type="date" className="form-input" value={maintForm.date} onChange={e => setMaintForm(p => ({ ...p, date: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Log Type *</label>
                    <select className="form-select" value={maintForm.maintenance_type} onChange={e => setMaintForm(p => ({ ...p, maintenance_type: e.target.value as any }))}>
                      <option value="routine">Routine</option>
                      <option value="repair">Repair</option>
                      <option value="inspection">Inspection</option>
                      <option value="replacement">Replacement</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Task Description *</label>
                  <textarea className="form-textarea" placeholder="Oil change, parts replaced, etc." value={maintForm.description} onChange={e => setMaintForm(p => ({ ...p, description: e.target.value }))} required />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Service Cost (TTD) *</label>
                    <input type="number" className="form-input" placeholder="0.00" value={maintForm.cost} onChange={e => setMaintForm(p => ({ ...p, cost: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Next Service Date</label>
                    <input type="date" className="form-input" value={maintForm.next_service_date} onChange={e => setMaintForm(p => ({ ...p, next_service_date: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsMaintModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Record Maintenance</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
