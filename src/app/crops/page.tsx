'use client'
import { useState, useMemo } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { useCropStore } from '@/store/useCropStore'
import { useAppStore } from '@/store/useAppStore'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import { toast, Toaster } from 'react-hot-toast'
import { 
  Sprout, Calendar, TrendingUp, TrendingDown, 
  Map, Activity, ClipboardList, Info, AlertTriangle,
  Clock, CheckCircle2, ChevronRight, Download
} from 'lucide-react'
import React from 'react'
import { exportToCSV } from '@/lib/exportUtils'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TTD', maximumFractionDigits: 0 }).format(n)

export default function CropsPage() {
  const { crops, addCrop, updateCrop, isLoading } = useCropStore()
  const { currentUser } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [showProjectionModal, setShowProjectionModal] = useState(false)
  const [projectionCrop, setProjectionCrop] = useState<any>(null)
  const [editingCropId, setEditingCropId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', variety: '', area_acres: '', planting_date: new Date().toISOString().split('T')[0],
    expected_harvest: '', expected_yield: '', actual_yield: '',
    input_costs: '', labor_cost: '', status: 'growing', notes: ''
  })

  // Filter approved for metrics
  const approvedCrops = useMemo(() => crops.filter(c => c.workflow_status === 'approved'), [crops])
  
  const totalAcres = approvedCrops.reduce((s, c) => s + c.area_acres, 0)
  const totalInputCost = approvedCrops.reduce((s, c) => s + (c.input_costs + c.labor_cost), 0)
  const activeCount = approvedCrops.filter(c => c.status === 'growing' || c.status === 'harvest_ready').length

  const costByCrop = approvedCrops.map(c => ({
    name: c.name,
    cost: c.input_costs + c.labor_cost,
    acres: c.area_acres
  }))

  const getProjections = (crop: any) => {
    if (!crop) return null;
    
    // Calculate based on real data or fallback to realistic demo
    const cost = crop.input_costs + crop.labor_cost;
    const estCost = cost > 0 ? cost * 1.15 : 12500; // adding 15% estimated additional costs
    
    // Parse expected yield if possible, else demo based on acres
    let yieldNum = 0;
    if (crop.expected_yield) {
      const parsed = parseFloat(crop.expected_yield.replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed) && parsed > 0) yieldNum = parsed;
    }
    if (yieldNum === 0) yieldNum = crop.area_acres * 4500; // 4500 lbs/acre avg demo

    const pricePerLb = 4.50; // Demo market price assumption
    const estRevenue = yieldNum * pricePerLb;
    const estProfit = estRevenue - estCost;
    
    const breakEven = estCost / pricePerLb;

    const riskLevel = estProfit < 0 ? 'High' : (estProfit < estCost * 0.2 ? 'Medium' : 'Low');

    const recommendedAction = riskLevel === 'High' 
        ? "Review input costs immediately; highly unlikely to break even at current market prices without yield optimization."
        : "Maintain current operational schedule. Ensure precision irrigation and timely harvesting to protect expected yield and profit margin.";

    return {
      yieldText: `${yieldNum.toLocaleString()} lbs (Estimated)`,
      estRevenue,
      estCost,
      estProfit,
      breakEven: `${Math.ceil(breakEven).toLocaleString()} lbs`,
      riskLevel,
      recommendedAction,
      isDemo: true
    };
  };

  const proj = getProjections(projectionCrop);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      area_acres: parseFloat(form.area_acres) || 0,
      input_costs: parseFloat(form.input_costs) || 0,
      labor_cost: parseFloat(form.labor_cost) || 0,
    }

    if (editingCropId) {
      await updateCrop(editingCropId, payload as any)
      toast.success('Crop cycle updated')
    } else {
      const result = await addCrop(payload as any)
      if (result) {
        if (currentUser.role === 'admin') {
          toast.success('Crop record saved & approved')
        } else {
          toast.success('Submitted for approval')
        }
      }
    }
    setShowModal(false)
    setEditingCropId(null)
    setForm({
      name: '', variety: '', area_acres: '', planting_date: new Date().toISOString().split('T')[0],
      expected_harvest: '', expected_yield: '', actual_yield: '',
      input_costs: '', labor_cost: '', status: 'growing', notes: ''
    })
  }

  const handleExport = () => {
    const data = crops.map(c => ({
      Crop: c.name,
      Variety: c.variety || 'N/A',
      Acres: c.area_acres,
      Status: c.status.toUpperCase(),
      PlantingDate: c.planting_date,
      ExpectedHarvest: c.expected_harvest,
      InputCosts: c.input_costs,
      LaborCost: c.labor_cost,
      TotalInvestment: c.input_costs + c.labor_cost
    }));
    exportToCSV(data, 'Crop_Production_Cycles');
  };

  return (
    <div className="app-shell">
      <Toaster position="top-right" />
      <Sidebar />
      <div className="main-content">
        <Topbar
          title="Crop Management"
          subtitle="Field production, yield tracking, and resource efficiency"
          actions={
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={handleExport}><Download size={14} /> Export Report</button>
              <button className="btn btn-primary btn-sm" onClick={() => {
                setEditingCropId(null);
                setForm({
                  name: '', variety: '', area_acres: '', planting_date: new Date().toISOString().split('T')[0],
                  expected_harvest: '', expected_yield: '', actual_yield: '',
                  input_costs: '', labor_cost: '', status: 'growing', notes: ''
                });
                setShowModal(true);
              }}>+ Add Crop Cycle</button>
            </div>
          }
        />
        <div className="page-container">
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="kpi-card no-hover" style={{ '--kpi-color': 'var(--status-success)' } as any}>
              <div className="kpi-label">Active Crop Cycles</div>
              <div className="kpi-value" style={{ color: 'var(--status-success)', textShadow: 'var(--status-success-glow)' }}>{activeCount}</div>
              <div className="kpi-sub">growing or harvest ready</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': 'var(--status-info)' } as any}>
              <div className="kpi-label">Total Area Planted</div>
              <div className="kpi-value" style={{ color: 'var(--status-info)', textShadow: 'var(--status-info-glow)' }}>{totalAcres.toFixed(1)} <span style={{ fontSize: 14, fontWeight: 700 }}>Acres</span></div>
              <div className="kpi-sub">across all field segments</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': 'var(--status-warning)' } as any}>
              <div className="kpi-label">Total Input Costs</div>
              <div className="kpi-value" style={{ color: 'var(--status-warning)', textShadow: 'var(--status-warning-glow)' }}>{fmt(totalInputCost)}</div>
              <div className="kpi-sub">materials + labor to date</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': 'var(--status-ai)' } as any}>
              <div className="kpi-label">Avg. Cost / Acre</div>
              <div className="kpi-value" style={{ color: 'var(--status-ai)', textShadow: 'var(--status-ai-glow)' }}>{totalAcres > 0 ? fmt(totalInputCost / totalAcres) : '$0'}</div>
              <div className="kpi-sub">production efficiency</div>
            </div>
          </div>

          <div className="chart-grid">
            <div className="card">
              <div className="card-header"><div className="card-title">Investment by Crop Type</div></div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={costByCrop} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-primary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-primary)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip 
                      formatter={(v: any) => fmt(v)} 
                      contentStyle={{ background: '#1f1f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                      itemStyle={{ color: 'var(--text-primary)' }}
                      labelStyle={{ color: 'var(--text-primary)' }}
                      cursor={false}
                    />
                    <Bar dataKey="cost" fill="var(--status-success)" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card no-hover">
              <div className="card-header"><div className="card-title">Production Status</div></div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['growing', 'harvest_ready', 'harvested', 'planned'].map(status => {
                  const count = approvedCrops.filter(c => c.status === status).length
                  const pct = approvedCrops.length > 0 ? (count / approvedCrops.length) * 100 : 0
                  return (
                    <div key={status} style={{ background: 'var(--bg-card-elevated)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border-soft)' }}>
                       <div className="flex-between" style={{ marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {status.replace('_', ' ')}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>{count} batches</span>
                       </div>
                       <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${pct}%`, background: status === 'harvest_ready' ? 'var(--status-success)' : status === 'growing' ? 'var(--status-info)' : 'var(--text-muted)' }} />
                       </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
            {crops.map(crop => {
               const isPending = crop.workflow_status === 'pending'
               return (
                 <div key={crop.id} className="card" style={{ opacity: isPending ? 0.8 : 1, borderLeft: `4px solid ${crop.status === 'harvest_ready' ? 'var(--status-success)' : 'var(--status-info)'}` }}>
                   <div className="card-body">
                      <div className="flex-between" style={{ marginBottom: 16 }}>
                         <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-card-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                               {crop.name === 'Cassava' ? '🌿' : crop.name === 'Tomato' ? '🍅' : '🌱'}
                            </div>
                            <div>
                               <div style={{ fontWeight: 850, fontSize: 16, color: 'var(--text-primary)' }}>{crop.name}</div>
                               <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{crop.variety || 'Standard Variety'}</div>
                            </div>
                         </div>
                         <div style={{ textAlign: 'right' }}>
                            <span className={`badge ${crop.status === 'harvest_ready' ? 'badge-healthy' : crop.status === 'harvested' ? 'badge-info' : 'badge-warning'}`}>
                               {crop.status.replace('_', ' ')}
                            </span>
                            {isPending && <div className="label-small" style={{ color: 'var(--status-warning)', marginTop: 4 }}>PENDING APPROVAL</div>}
                         </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                         <div style={{ background: 'var(--bg-card-elevated)', padding: 12, borderRadius: 10, border: '1px solid var(--border-soft)' }}>
                            <div className="label-small">Area Planted</div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{crop.area_acres} Acres</div>
                         </div>
                         <div style={{ background: 'var(--bg-card-elevated)', padding: 12, borderRadius: 10, border: '1px solid var(--border-soft)' }}>
                            <div className="label-small">Expected Yield</div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--status-success)', marginTop: 2 }}>{crop.expected_yield || 'TBD'}</div>
                         </div>
                         <div style={{ background: 'var(--bg-card-elevated)', padding: 12, borderRadius: 10, border: '1px solid var(--border-soft)' }}>
                            <div className="label-small">Total Investment</div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{fmt(crop.input_costs + crop.labor_cost)}</div>
                         </div>
                         <div style={{ background: 'var(--bg-card-elevated)', padding: 12, borderRadius: 10, border: '1px solid var(--border-soft)' }}>
                            <div className="label-small">Expected Harvest</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{crop.expected_harvest}</div>
                         </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-card-elevated)', borderRadius: 8, marginBottom: 16 }}>
                         <Clock size={14} color="var(--text-muted)" />
                         <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Planted on {crop.planting_date}</span>
                      </div>

                      {crop.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>📝 {crop.notes}</div>}

                      <div style={{ display: 'flex', gap: 8 }}>
                         <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => {
                            setForm({
                               name: crop.name, variety: crop.variety || '', area_acres: crop.area_acres.toString(), planting_date: crop.planting_date || '',
                               expected_harvest: crop.expected_harvest || '', expected_yield: crop.expected_yield || '', actual_yield: crop.actual_yield || '',
                               input_costs: crop.input_costs.toString(), labor_cost: crop.labor_cost.toString(), status: crop.status || 'growing', notes: crop.notes || ''
                            });
                            setEditingCropId(crop.id);
                            setShowModal(true);
                         }}>✏️ Edit Cycle</button>
                         <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => {
                             setProjectionCrop(crop);
                             setShowProjectionModal(true);
                             toast.success(`Viewing projections for ${crop.name}`);
                          }}>📊 Projections</button>
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
              <div className="modal-title">{editingCropId ? 'Edit Crop Cycle' : 'Initialize New Crop Cycle'}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Crop Name / Type *</label>
                    <input className="form-input" placeholder="e.g. Cassava, Sweet Potato" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Variety</label>
                    <input className="form-input" placeholder="e.g. Local White, Red Skin" value={form.variety} onChange={e => setForm(p => ({ ...p, variety: e.target.value }))} />
                  </div>
                </div>

                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Area Planted (Acres) *</label>
                    <input type="number" step="0.01" className="form-input" placeholder="0.00" value={form.area_acres} onChange={e => setForm(p => ({ ...p, area_acres: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expected Yield</label>
                    <input className="form-input" placeholder="e.g. 5000 lbs" value={form.expected_yield} onChange={e => setForm(p => ({ ...p, expected_yield: e.target.value }))} />
                  </div>
                </div>

                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Planting Date *</label>
                    <input type="date" className="form-input" value={form.planting_date} onChange={e => setForm(p => ({ ...p, planting_date: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expected Harvest Date *</label>
                    <input type="date" className="form-input" value={form.expected_harvest} onChange={e => setForm(p => ({ ...p, expected_harvest: e.target.value }))} required />
                  </div>
                </div>

                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Input Costs (Materials/Seed) *</label>
                    <input type="number" className="form-input" placeholder="0.00" value={form.input_costs} onChange={e => setForm(p => ({ ...p, input_costs: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Initial Labor Cost *</label>
                    <input type="number" className="form-input" placeholder="0.00" value={form.labor_cost} onChange={e => setForm(p => ({ ...p, labor_cost: e.target.value }))} required />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 16 }}>
                   <label className="form-label">Cycle Status</label>
                   <select className="form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}>
                      <option value="planned">Planned</option>
                      <option value="growing">Growing</option>
                      <option value="harvest_ready">Harvest Ready</option>
                   </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" placeholder="Soil prep, fertilizer schedule, etc." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                   {isLoading ? 'Saving...' : editingCropId ? 'Save Changes' : 'Initialize Crop Cycle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROJECTIONS MODAL */}
      {showProjectionModal && projectionCrop && proj && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowProjectionModal(false)}>
          <div className="modal" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <div className="modal-title">Crop Production Projections</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowProjectionModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
               <div style={{ marginBottom: 20 }}>
                 <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{projectionCrop.name} <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>({projectionCrop.area_acres} Acres)</span></h3>
                 {proj.isDemo && <span className="badge" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', marginTop: 8, fontWeight: 800 }}>DEMO DATA / AI ESTIMATE</span>}
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                 <div style={{ background: 'var(--bg-card-elevated)', padding: 16, borderRadius: 12, border: '1px solid var(--border-soft)' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>Projected Yield</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--status-success)' }}>{proj.yieldText}</div>
                 </div>
                 <div style={{ background: 'var(--bg-card-elevated)', padding: 16, borderRadius: 12, border: '1px solid var(--border-soft)' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>Break-even Yield</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--status-info)' }}>{proj.breakEven}</div>
                 </div>
                 <div style={{ background: 'var(--bg-card-elevated)', padding: 16, borderRadius: 12, border: '1px solid var(--border-soft)' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>Estimated Input Cost</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--status-warning)' }}>{fmt(proj.estCost)}</div>
                 </div>
                 <div style={{ background: 'var(--bg-card-elevated)', padding: 16, borderRadius: 12, border: '1px solid var(--border-soft)' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>Estimated Revenue</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--status-success)' }}>{fmt(proj.estRevenue)}</div>
                 </div>
               </div>

               <div style={{ background: proj.estProfit >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${proj.estProfit >= 0 ? 'var(--status-success)' : 'var(--status-critical)'}`, padding: 20, borderRadius: 12, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                    <div style={{ fontSize: 13, color: proj.estProfit >= 0 ? 'var(--status-success)' : 'var(--status-critical)', fontWeight: 800, textTransform: 'uppercase' }}>Estimated Profit</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: proj.estProfit >= 0 ? 'var(--status-success)' : 'var(--status-critical)' }}>{fmt(proj.estProfit)}</div>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>Risk Level</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: proj.riskLevel === 'Low' ? 'var(--status-success)' : proj.riskLevel === 'Medium' ? 'var(--status-warning)' : 'var(--status-critical)' }}>{proj.riskLevel}</div>
                 </div>
               </div>

               <div style={{ background: 'var(--bg-card-elevated)', padding: 16, borderRadius: 12, border: '1px solid var(--border-soft)' }}>
                 <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Activity size={14} /> Recommended Action
                 </div>
                 <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 500 }}>
                    {proj.recommendedAction}
                 </div>
               </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-soft)', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end' }}>
               <button className="btn btn-primary" onClick={() => setShowProjectionModal(false)}>Close Projections</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
