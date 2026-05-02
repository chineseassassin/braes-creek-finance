'use client'
import { useState, useMemo } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { SAMPLE_INFRASTRUCTURE, SAMPLE_SEGMENTS } from '@/lib/sample-data'
import { toast, Toaster } from 'react-hot-toast'
import { 
  Building2, Activity, ShieldCheck, AlertTriangle, 
  Settings, CheckCircle2, Info, ChevronRight, 
  MapPin, Calendar, Clock, DollarSign, Download
} from 'lucide-react'
import { exportToCSV } from '@/lib/exportUtils'

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
  
  const assets = useMemo(() => {
    return filter === 'all' ? SAMPLE_INFRASTRUCTURE : SAMPLE_INFRASTRUCTURE.filter(a => a.status === filter)
  }, [filter])

  const totalValue = SAMPLE_INFRASTRUCTURE.reduce((s, a) => s + a.replacement_value, 0)
  const criticalCount = SAMPLE_INFRASTRUCTURE.filter(a => a.status === 'critical').length
  const maintenanceCount = SAMPLE_INFRASTRUCTURE.filter(a => a.status === 'maintenance').length

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
              <button className="btn btn-primary btn-sm">+ Register Asset</button>
            </div>
          }
        />
        <div className="page-container">
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="kpi-card" style={{ '--kpi-color': '#6366f1' } as any}>
              <div className="kpi-label">Asset Replacement Value</div>
              <div className="kpi-value">{fmt(totalValue)}</div>
              <div className="kpi-sub">{SAMPLE_INFRASTRUCTURE.length} registered assets</div>
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
      `}</style>
    </div>
  )
}
