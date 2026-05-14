'use client'
import { useState, useMemo } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { useLivestockStore } from '@/store/useLivestockStore'
import { useAppStore } from '@/store/useAppStore'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { toast, Toaster } from 'react-hot-toast'
import { Activity, Plus, Package, DollarSign, TrendingUp, TrendingDown, ClipboardList, Info, AlertTriangle, Download } from 'lucide-react'
import { exportToCSV } from '@/lib/exportUtils'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TTD', maximumFractionDigits: 0 }).format(n)

const ANIMAL_ICONS: Record<string, string> = {
  broiler: '🐔', layer: '🥚', goat: '🐐', pig: '🐷', cattle: '🐄', other: '🐾'
}
const ANIMAL_COLORS: Record<string, string> = {
  broiler: '#f97316', layer: '#eab308', goat: '#84cc16', pig: '#f43f5e', cattle: '#8b5cf6', other: '#64748b'
}

export default function LivestockPage() {
  const { units: livestock, addUnit, updateUnit, isLoading } = useLivestockStore()
  const { currentUser } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null)
  const [form, setForm] = useState({
    animal_type: 'broiler', batch_name: '', quantity: '', mortality_count: '0', 
    feed_cost: '', medicine_cost: '', production_output: '',
    acquisition_date: new Date().toISOString().split('T')[0],
    acquisition_cost: '', current_value: '', status: 'active', notes: ''
  })

  // Filter approved for metrics
  const approvedUnits = useMemo(() => livestock.filter(u => u.workflow_status === 'approved'), [livestock])
  
  const totalValue = approvedUnits.filter(l => l.status === 'active').reduce((s, l) => s + (l.current_value ?? 0), 0)
  const totalAcqCost = approvedUnits.reduce((s, l) => s + l.acquisition_cost, 0)
  const totalHead = approvedUnits.filter(l => l.status === 'active').reduce((s, l) => s + l.quantity, 0)

  const typeData = useMemo(() => {
    const counts: Record<string, any> = {}
    approvedUnits.forEach(l => {
      const type = l.animal_type
      if (!counts[type]) counts[type] = { name: type.charAt(0).toUpperCase() + type.slice(1), type, quantity: 0, value: 0, color: ANIMAL_COLORS[type] }
      counts[type].quantity += l.quantity
      counts[type].value += (l.current_value ?? 0)
    })
    return Object.values(counts)
  }, [approvedUnits])

  const valuePie = typeData.map(t => ({ name: t.name, value: t.value, color: t.color }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      ...form,
      quantity: parseInt(form.quantity) || 0,
      mortality_count: parseInt(form.mortality_count) || 0,
      feed_cost: parseFloat(form.feed_cost) || 0,
      medicine_cost: parseFloat(form.medicine_cost) || 0,
      acquisition_cost: parseFloat(form.acquisition_cost) || 0,
      current_value: parseFloat(form.current_value) || 0,
    }

    if (editingUnitId) {
      await updateUnit(editingUnitId, payload as any)
      toast.success('Livestock record updated')
    } else {
      const result = await addUnit(payload as any)
      if (result) {
         if (currentUser.role === 'admin') {
            toast.success('Livestock record saved & approved')
         } else {
            toast.success('Submitted for approval')
         }
      }
    }
    setShowModal(false)
    setEditingUnitId(null)
    setForm({
      animal_type: 'broiler', batch_name: '', quantity: '', mortality_count: '0', 
      feed_cost: '', medicine_cost: '', production_output: '',
      acquisition_date: new Date().toISOString().split('T')[0],
      acquisition_cost: '', current_value: '', status: 'active', notes: ''
    })
  }

  const handleExport = () => {
    const data = livestock.map(l => ({
      Batch: l.batch_name || l.animal_type,
      Type: l.animal_type,
      Quantity: l.quantity,
      Mortality: l.mortality_count || 0,
      MarketValue: l.current_value || 0,
      InputCosts: (l.feed_cost || 0) + (l.medicine_cost || 0),
      Status: l.status.toUpperCase(),
      Approval: (l.workflow_status || 'approved').toUpperCase()
    }));
    exportToCSV(data, 'Livestock_Asset_Inventory');
  };

  return (
    <div className="app-shell">
      <Toaster position="top-right" />
      <Sidebar />
      <div className="main-content">
        <Topbar
          title="Livestock Operations"
          subtitle="Animal inventory, values, and performance tracking"
          actions={
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={handleExport}><Download size={14} /> Export Inventory</button>
              <button className="btn btn-primary btn-sm" onClick={() => {
                setEditingUnitId(null);
                setForm({
                  animal_type: 'broiler', batch_name: '', quantity: '', mortality_count: '0', 
                  feed_cost: '', medicine_cost: '', production_output: '',
                  acquisition_date: new Date().toISOString().split('T')[0],
                  acquisition_cost: '', current_value: '', status: 'active', notes: ''
                });
                setShowModal(true);
              }}>+ Add Livestock</button>
            </div>
          }
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
              <div className="kpi-label">P&L (Unrealized)</div>
              <div className="kpi-value" style={{ color: 'var(--status-success)', textShadow: 'var(--status-success-glow)' }}>{fmt(totalValue - totalAcqCost)}</div>
              <div className="kpi-sub">{totalAcqCost > 0 ? (((totalValue - totalAcqCost) / totalAcqCost) * 100).toFixed(1) : 0}% appreciation</div>
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
                    <Tooltip 
                      formatter={(v: any) => fmt(v)} 
                      contentStyle={{ background: '#1f1f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} 
                      itemStyle={{ color: 'var(--text-primary)' }}
                      labelStyle={{ color: 'var(--text-primary)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', justifyContent: 'center', marginTop: 8 }}>
                  {valuePie.map((v, i) => (
                    <div key={i} className="segment-dot">
                      <div className="dot" style={{ background: v.color }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ANIMAL_ICONS[v.name.toLowerCase()] ?? '•'} {v.name}: {fmt(v.value)}</span>
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
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-primary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-primary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ background: '#1f1f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} 
                      itemStyle={{ color: 'var(--text-primary)' }}
                      labelStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Bar dataKey="quantity" name="Head Count" radius={[4, 4, 0, 0]}>
                      {typeData.map((e, i) => <Cell key={i} fill={e.color} fillOpacity={0.85} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {livestock.map(unit => {
              const gain = (unit.current_value ?? 0) - unit.acquisition_cost
              const gainPct = unit.acquisition_cost > 0 ? (gain / unit.acquisition_cost) * 100 : 0
              const isPending = unit.workflow_status === 'pending'

              return (
                <div key={unit.id} className="card" style={{ borderTop: `3px solid ${ANIMAL_COLORS[unit.animal_type]}`, opacity: isPending ? 0.8 : 1 }}>
                  <div className="card-body">
                    <div className="flex-between" style={{ marginBottom: 12 }}>
                      <div className="flex-center">
                        <span style={{ fontSize: 28 }}>{ANIMAL_ICONS[unit.animal_type]}</span>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>
                            {unit.batch_name || (unit.animal_type.charAt(0).toUpperCase() + unit.animal_type.slice(1))}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{unit.animal_type.toUpperCase()}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                         <span className={`badge ${unit.status === 'active' ? 'badge-success' : unit.status === 'sold' ? 'badge-info' : 'badge-danger'}`}>
                           {unit.status}
                         </span>
                         {isPending && <span className="badge-warning" style={{ fontSize: 9 }}>PENDING APPROVAL</span>}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                       <div style={{ background: 'var(--bg-card-elevated)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Quantity</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{unit.quantity} head</div>
                          {(unit.mortality_count || 0) > 0 && <div style={{ fontSize: 10, color: 'var(--status-critical)' }}>💀 {unit.mortality_count} mortality</div>}
                       </div>
                       <div style={{ background: 'var(--bg-card-elevated)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Market Value</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--status-success)', marginTop: 2 }}>{fmt(unit.current_value ?? 0)}</div>
                       </div>
                       <div style={{ background: 'var(--bg-card-elevated)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Input Costs</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>Feed: {fmt(unit.feed_cost || 0)}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>Med: {fmt(unit.medicine_cost || 0)}</div>
                       </div>
                       <div style={{ background: 'var(--bg-card-elevated)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Output</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--status-info)', marginTop: 2 }}>{unit.production_output || 'No output data'}</div>
                       </div>
                    </div>

                    {!isPending && (
                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: gain >= 0 ? 'var(--status-success-glow)' : 'var(--status-critical-glow)', borderRadius: 8, marginBottom: 10, border: `1px solid ${gain >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                         <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Unrealized Gain</span>
                         <span style={{ fontWeight: 800, color: gain >= 0 ? 'var(--status-success)' : 'var(--status-critical)', fontSize: 13 }}>
                           {gain >= 0 ? '+' : ''}{fmt(gain)} ({gainPct.toFixed(1)}%)
                         </span>
                       </div>
                    )}

                    {unit.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>📝 {unit.notes}</div>}

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => {
                         setForm({
                            animal_type: unit.animal_type || 'broiler', batch_name: unit.batch_name || '', quantity: unit.quantity?.toString() || '0', mortality_count: unit.mortality_count?.toString() || '0', 
                            feed_cost: unit.feed_cost?.toString() || '', medicine_cost: unit.medicine_cost?.toString() || '', production_output: unit.production_output || '',
                            acquisition_date: unit.acquisition_date || new Date().toISOString().split('T')[0],
                            acquisition_cost: unit.acquisition_cost?.toString() || '0', current_value: unit.current_value?.toString() || '', status: unit.status || 'active', notes: unit.notes || ''
                         });
                         setEditingUnitId(unit.id);
                         setShowModal(true);
                      }}>✏️ Edit</button>
                      <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => toast.success(`Viewing history for ${unit.batch_name || unit.animal_type}`)}>📋 History</button>
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
          <div className="modal" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <div className="modal-title">{editingUnitId ? 'Edit Livestock Batch' : 'Add Livestock Batch / Group'}</div>
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
                    <label className="form-label">Batch / Group Name</label>
                    <input className="form-input" placeholder="e.g. Broiler Batch #42" value={form.batch_name} onChange={e => setForm(p => ({ ...p, batch_name: e.target.value }))} />
                  </div>
                </div>

                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Quantity (Head Count) *</label>
                    <input type="number" className="form-input" placeholder="0" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mortality Count</label>
                    <input type="number" className="form-input" placeholder="0" value={form.mortality_count} onChange={e => setForm(p => ({ ...p, mortality_count: e.target.value }))} />
                  </div>
                </div>

                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Feed Cost (TTD)</label>
                    <input type="number" className="form-input" placeholder="0.00" value={form.feed_cost} onChange={e => setForm(p => ({ ...p, feed_cost: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Medicine / Vitamins (TTD)</label>
                    <input type="number" className="form-input" placeholder="0.00" value={form.medicine_cost} onChange={e => setForm(p => ({ ...p, medicine_cost: e.target.value }))} />
                  </div>
                </div>

                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Acquisition Cost (Total) *</label>
                    <input type="number" className="form-input" placeholder="0.00" value={form.acquisition_cost} onChange={e => setForm(p => ({ ...p, acquisition_cost: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Market Value</label>
                    <input type="number" className="form-input" placeholder="0.00" value={form.current_value} onChange={e => setForm(p => ({ ...p, current_value: e.target.value }))} />
                  </div>
                </div>

                <div className="form-grid" style={{ marginBottom: 16 }}>
                   <div className="form-group">
                     <label className="form-label">Acquisition Date *</label>
                     <input type="date" className="form-input" value={form.acquisition_date} onChange={e => setForm(p => ({ ...p, acquisition_date: e.target.value }))} required />
                   </div>
                   <div className="form-group">
                     <label className="form-label">Production Output</label>
                     <input className="form-input" placeholder="e.g. 500 eggs" value={form.production_output} onChange={e => setForm(p => ({ ...p, production_output: e.target.value }))} />
                   </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" placeholder="Health notes, supplier details, etc." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                   {isLoading ? 'Saving...' : editingUnitId ? 'Save Changes' : 'Record Livestock Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
