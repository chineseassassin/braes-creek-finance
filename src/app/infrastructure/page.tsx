'use client'
import { useState, useMemo } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { SAMPLE_INFRASTRUCTURE } from '@/lib/sample-data'
import { toast, Toaster } from 'react-hot-toast'
import { 
  Building2, Activity, ShieldCheck, AlertTriangle, 
  Settings, CheckCircle2, Info, ChevronRight, 
  MapPin, Calendar, Clock, DollarSign, Download, X
} from 'lucide-react'
import { exportToCSV } from '@/lib/exportUtils'
import { useAppStore } from '@/store/useAppStore'
import type { InfrastructureAsset } from '@/lib/types'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TTD', maximumFractionDigits: 0 }).format(n)

const STATUS_COLORS: Record<string, string> = {
  operational: '#22c55e',
  maintenance: '#f59e0b',
  critical: '#ef4444',
  decommissioned: '#71717a'
}

export default function InfrastructurePage() {
  const [filter, setFilter] = useState('all')
  const [allAssets, setAllAssets] = useState(SAMPLE_INFRASTRUCTURE)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'Pump',
    location: '',
    replacement_value: '',
    status: 'operational',
    health_index: '95'
  })
  
  const assets = useMemo(() => {
    return filter === 'all' ? allAssets : allAssets.filter(a => a.status === filter)
  }, [filter, allAssets])

  const totalValue = allAssets.reduce((s, a) => s + a.replacement_value, 0)
  const criticalCount = allAssets.filter(a => a.status === 'critical').length
  const maintenanceCount = allAssets.filter(a => a.status === 'maintenance').length

  const handleExport = () => {
    const data = assets.map(a => ({
      Asset: a.name,
      Type: a.type,
      Location: a.location,
      Status: a.status.toUpperCase(),
      LastInspected: a.last_inspection,
      Value: a.replacement_value,
      Health: `${a.health_index}%`
    }));
    exportToCSV(data, 'Infrastructure_Assets_Audit');
  };

  const handleRegisterAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim() || !formData.replacement_value) {
      toast.error('All fields are required.');
      return;
    }

    const newAsset: InfrastructureAsset = {
      id: `infra-${Date.now()}`,
      name: formData.name,
      type: formData.type as InfrastructureAsset['type'],
      location: formData.location,
      status: formData.status as InfrastructureAsset['status'],
      replacement_value: Number(formData.replacement_value),
      last_inspection: new Date().toISOString().split('T')[0],
      health_index: Number(formData.health_index),
      workflow_status: 'approved',
      created_by: 'user-1',
      created_at: new Date().toISOString()
    };

    setAllAssets([newAsset, ...allAssets]);
    
    // Audit Submission Log
    useAppStore.getState().logEmployeeSubmission(
      'Infrastructure & Assets',
      'creation',
      'asset',
      newAsset.id,
      { name: formData.name, value: formData.replacement_value }
    );

    toast.success(`${formData.name} successfully registered.`);
    setIsModalOpen(false);
    setFormData({
      name: '',
      type: 'Pump',
      location: '',
      replacement_value: '',
      status: 'operational',
      health_index: '95'
    });
  };

  return (
    <div className="app-shell">
      <Toaster position="top-right" />
      <Sidebar />
      <div className="main-content">
        <Topbar
          title="Infrastructure & Assets"
          subtitle="Fixed assets, facility health, and capital infrastructure"
          actions={
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={handleExport}><Download size={14} /> Export Ledger</button>
              <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>+ Register Asset</button>
            </div>
          }
        />
        <div className="page-container">
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="kpi-card" style={{ '--kpi-color': '#6366f1' } as any}>
              <div className="kpi-label">Asset Replacement Value</div>
              <div className="kpi-value">{fmt(totalValue)}</div>
              <div className="kpi-sub">{allAssets.length} registered assets</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#22c55e' } as any}>
              <div className="kpi-label">Operational Health</div>
              <div className="kpi-value">94.2%</div>
              <div className="kpi-sub">fleet & facility average</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#f59e0b' } as any}>
              <div className="kpi-label">Maintenance Pending</div>
              <div className="kpi-value">{maintenanceCount}</div>
              <div className="kpi-sub">scheduled service items</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#ef4444' } as any}>
              <div className="kpi-label">Critical Failures</div>
              <div className="kpi-value">{criticalCount}</div>
              <div className="kpi-sub">immediate action required</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }} className="no-scrollbar">
            {['all', 'operational', 'maintenance', 'critical', 'decommissioned'].map(status => (
              <button
                key={status}
                className={`btn ${filter === status ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setFilter(status)}
                style={{ textTransform: 'capitalize' }}
              >
                {status}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {assets.map(asset => (
              <div key={asset.id} className="card infrastructure-card" style={{ borderTop: `4px solid ${STATUS_COLORS[asset.status]}` }}>
                <div className="card-body">
                  <div className="flex-between" style={{ marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)' }}>{asset.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>{asset.type}</div>
                    </div>
                    <span style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 10, fontWeight: 900,
                      background: `${STATUS_COLORS[asset.status]}15`,
                      color: STATUS_COLORS[asset.status],
                      textTransform: 'uppercase',
                      border: `1px solid ${STATUS_COLORS[asset.status]}30`
                    }}>{asset.status}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                    <div style={{ background: 'var(--bg-card-elevated)', padding: '12px', borderRadius: 12, border: '1px solid var(--border-soft)' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Replacement Value</div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>{fmt(asset.replacement_value)}</div>
                    </div>
                    <div style={{ background: 'var(--bg-card-elevated)', padding: '12px', borderRadius: 12, border: '1px solid var(--border-soft)' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Health Index</div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: asset.health_index > 80 ? 'var(--status-success)' : (asset.health_index > 50 ? 'var(--status-warning)' : 'var(--status-critical)') }}>{asset.health_index}%</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    <div className="info-row"><MapPin size={13}/> {asset.location}</div>
                    <div className="info-row"><Calendar size={13}/> Last Inspection: {asset.last_inspection}</div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, paddingTop: 16, borderTop: '1px solid var(--border-soft)' }}>
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => toast.success(`Diagnostic report for ${asset.name}`)}>Audit</button>
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => toast.success(`Maintenance schedule updated for ${asset.name}`)}>Service</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Glassmorphic Register Asset Modal Overlay */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Register Estate Asset</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterAsset} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label className="modal-label">Asset Name</label>
                <input 
                  type="text" 
                  className="modal-input" 
                  placeholder="e.g., John Deere Tractor 5075E" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="modal-label">Asset Type</label>
                  <select 
                    className="modal-select"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Pump">Pump</option>
                    <option value="Generator">Generator</option>
                    <option value="Storage">Storage</option>
                    <option value="Tractor">Tractor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="modal-label">Replacement Value (TTD)</label>
                  <input 
                    type="number" 
                    className="modal-input" 
                    placeholder="e.g., 45000" 
                    value={formData.replacement_value}
                    onChange={e => setFormData({ ...formData, replacement_value: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="modal-label">Location / Sector</label>
                <input 
                  type="text" 
                  className="modal-input" 
                  placeholder="e.g., Utility Shed, Section A" 
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="modal-label">Status</label>
                  <select 
                    className="modal-select"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="operational">Operational</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="critical">Critical</option>
                    <option value="decommissioned">Decommissioned</option>
                  </select>
                </div>

                <div>
                  <label className="modal-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Health Index</span>
                    <span style={{ color: Number(formData.health_index) > 80 ? 'var(--status-success)' : (Number(formData.health_index) > 50 ? 'var(--status-warning)' : 'var(--status-critical)') }}>{formData.health_index}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100"
                    className="modal-range" 
                    value={formData.health_index}
                    onChange={e => setFormData({ ...formData, health_index: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Register Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .infrastructure-card {
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .infrastructure-card:hover {
          transform: translateY(-4px);
        }
        .info-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.25s ease-out;
        }
        .modal-card {
          width: 500px;
          background: #0b1220;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.02);
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .modal-title {
          font-size: 20px;
          fontWeight: 950;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin: 0;
        }
        .modal-close-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.2s;
        }
        .modal-close-btn:hover {
          color: var(--text-primary);
        }
        .modal-label {
          display: block;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 8px;
          letter-spacing: 0.05em;
        }
        .modal-input, .modal-select {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 12px 16px;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        .modal-input:focus, .modal-select:focus {
          border-color: #16dff3;
          box-shadow: 0 0 10px rgba(22, 223, 243, 0.2);
          background: rgba(255, 255, 255, 0.05);
        }
        .modal-range {
          width: 100%;
          accent-color: #16dff3;
          margin-top: 14px;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
