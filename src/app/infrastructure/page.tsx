"use client";

import { useState, useEffect, useMemo } from 'react';
import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationCenter from "@/components/NotificationCenter";
import { useUIStore } from '@/store/useUIStore';
import { useAppStore } from '@/store/useAppStore';
import { useInfrastructureStore } from '@/store/useInfrastructureStore';
import { useVendorStore } from '@/store/useVendorStore';
import { 
  Building2, Tractor, Wrench, Fuel, Sparkles, Plus, 
  Search, Download, LayoutGrid, Timer, AlertTriangle,
  CheckCircle2, Activity, Gauge, Battery, Zap,
  TrendingUp, TrendingDown, History, Info, ArrowUpRight,
  Settings, PenTool as Tool, Truck, Package, MoreVertical,
  AlertCircle, ShieldAlert, CheckCircle, Clock, X, Bell,
  Calendar, DollarSign, User as UserIcon
} from "lucide-react";
import { toast, Toaster } from 'react-hot-toast';

import { THEME_COLORS as COLORS, TC } from '@/lib/theme-colors';

export default function InfrastructureOpsPage() {
  const { sidebarCollapsed } = useUIStore();
  const { theme, currentUser } = useAppStore();
  const { assets, maintenanceLogs, addMaintenanceLog } = useInfrastructureStore();
  const { vendors } = useVendorStore();
  
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState('maintenance');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [form, setForm] = useState({
    asset_name: '',
    maintenance_type: 'Service' as const,
    date: new Date().toISOString().split('T')[0],
    status: 'Scheduled' as const,
    vendor_id: '',
    cost: '',
    next_due_date: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendors.find(v => v.id === form.vendor_id);
    
    await addMaintenanceLog({
      asset_name: form.asset_name,
      maintenance_type: form.maintenance_type,
      date: form.date,
      status: form.status,
      vendor_id: form.vendor_id,
      vendor_name: vendor?.name,
      cost: form.cost ? parseFloat(form.cost) : undefined,
      next_due_date: form.next_due_date || undefined,
      notes: form.notes
    });

    const isAdmin = currentUser.role === 'admin';
    if (isAdmin) {
      toast.success('Maintenance recorded and system alerts updated', {
        style: { background: '#101010', color: '#fff', border: '1px solid var(--status-success)' }
      });
    } else {
      toast.success('Maintenance log submitted for approval', {
        style: { background: '#101010', color: '#fff', border: '1px solid var(--border-soft)' }
      });
    }

    setShowModal(false);
    setForm({
      asset_name: '',
      maintenance_type: 'Service',
      date: new Date().toISOString().split('T')[0],
      status: 'Scheduled',
      vendor_id: '',
      cost: '',
      next_due_date: '',
      notes: ''
    });
  };

  const metrics = useMemo(() => {
    const avgHealth = assets.reduce((s, a) => s + a.health_score, 0) / assets.length;
    const criticalCount = assets.filter(a => a.status === 'Critical').length;
    const mtdCost = maintenanceLogs
      .filter(l => l.approval_status === 'approved' && l.date.startsWith('2024-04')) // Mock MTD
      .reduce((s, l) => s + (l.cost || 0), 0);
    
    return { avgHealth, criticalCount, mtdCost };
  }, [assets, maintenanceLogs]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-body)' }}>
      <Toaster position="top-right" />
      <Sidebar />

      <div style={{ marginLeft: sidebarCollapsed ? 64 : 250, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease' }}>
        <header style={{ height: 72, background: 'var(--bg-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border-soft)' }}>
          <div>
             <h1 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Infrastructure & Operations</h1>
             <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>Strategic asset management and operational command hub</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ThemeToggle />
            <NotificationCenter />
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--status-success)', color: 'var(--text-inverse)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13 }}>{currentUser.name.charAt(0)}</div>
          </div>
        </header>

        <main style={{ padding: '24px 32px', flex: 1, overflowY: 'auto' }}>
           
           {/* TOP HERO BAR (FULL WIDTH) */}
           <div className="grid-12" style={{ gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Equipment Health', val: `${Math.round(metrics.avgHealth)}%`, icon: <Activity size={14}/>, color: 'var(--status-success)' },
                { label: 'Active Issues', val: metrics.criticalCount.toString().padStart(2, '0'), icon: <AlertTriangle size={14}/>, color: 'var(--status-critical)' },
                { label: 'Maint. Cost (MTD)', val: `$${metrics.mtdCost.toLocaleString()}`, icon: <TrendingDown size={14}/>, color: 'var(--status-info)' },
                { label: 'Supply Status', val: 'Optimal', icon: <Package size={14}/>, color: 'var(--status-success)' },
                { label: 'Vendor Risk', val: 'Low', icon: <ShieldAlert size={14}/>, color: 'var(--status-success)' },
              ].map((card, i) => (
                <div key={i} className="col-2-4 card-compact" style={{ 
                    borderLeft: `2px solid ${card.color}`, 
                    background: isLight ? `color-mix(in srgb, ${card.color}, transparent 92%)` : 'var(--bg-card)',
                    boxShadow: isLight ? `0 4px 12px color-mix(in srgb, ${card.color}, transparent 90%)` : `inset 4px 0 10px ${card.color}10`,
                    transition: 'all 0.2s ease'
                 }}>
                   <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {card.icon} {card.label}
                   </div>
                   <div style={{ fontSize: 18, fontWeight: 950, color: 'var(--text-primary)' }}>{card.val}</div>
                </div>
              ))}
           </div>

           <div className="grid-12" style={{ gap: 24, alignItems: 'flex-start' }}>
              
              {/* MAIN CONTENT (LEFT — 70%) */}
              <div className="col-8">
                 <div className="glass-container">
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-soft)', padding: '0 24px' }}>
                       {[
                         { id: 'maintenance', label: 'Maintenance', icon: Tool },
                         { id: 'feed',        label: 'Feed & Supplies', icon: Package },
                         { id: 'vendors',     label: 'Vendors',   icon: Truck },
                         { id: 'alerts',      label: 'Alerts',    icon: Bell },
                       ].map(tab => {
                          const Icon = tab.icon;
                          const isActive = activeTab === tab.id;
                          return (
                            <button 
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              style={{
                                padding: '16px 0',
                                marginRight: 32,
                                background: 'none',
                                border: 'none',
                                borderBottom: isActive ? `2px solid ${COLORS.success}` : '2px solid transparent',
                                color: isActive ? COLORS.success : COLORS.muted,
                                fontSize: 12,
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                transition: 'all 0.2s'
                              }}
                            >
                               <Icon size={14} /> {tab.label}
                            </button>
                          )
                       })}
                    </div>

                    <div style={{ padding: '24px' }}>
                       {activeTab === 'maintenance' && (
                         <div className="animate-fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                               <h4 style={{ fontSize: 14, fontWeight: 800, margin: 0 }}>Active Fleet Maintenance</h4>
                               <button className="btn-small" onClick={() => setShowModal(true)}><Plus size={12}/> New Log</button>
                            </div>
                            <table className="ops-table">
                               <thead>
                                  <tr>
                                     <th>Asset</th>
                                     <th>Type</th>
                                     <th>Assigned/Vendor</th>
                                     <th>Status</th>
                                     <th>Date</th>
                                  </tr>
                               </thead>
                               <tbody>
                                  {maintenanceLogs.map(log => (
                                    <tr key={log.id}>
                                       <td>
                                          <div style={{ fontWeight: 700 }}>{log.asset_name}</div>
                                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{log.approval_status.toUpperCase()}</div>
                                       </td>
                                       <td>{log.maintenance_type}</td>
                                       <td>{log.vendor_name || 'Internal'}</td>
                                       <td>
                                          <span className={log.status === 'Completed' ? "badge-success" : "badge-warning"}>
                                             {log.status.toUpperCase()}
                                          </span>
                                       </td>
                                       <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.date}</td>
                                    </tr>
                                  ))}
                               </tbody>
                            </table>
                         </div>
                       )}

                       {activeTab === 'feed' && (
                         <div className="animate-fade-in">
                            <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 20 }}>Inventory & Supply Chains</h4>
                            <div className="grid-12" style={{ gap: 12 }}>
                               {[
                                 { name: 'Poultry Feed', qty: '4,200 kg', level: 85, color: COLORS.success },
                                 { name: 'Diesel Fuel', qty: '850 L', level: 32, color: COLORS.warning },
                                 { name: 'Water Treatment', qty: '12 units', level: 92, color: COLORS.success },
                               ].map((s, i) => (
                                 <div key={i} className="col-4" style={{ padding: '16px', background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', borderRadius: 12 }}>
                                    <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 4 }}>{s.name}</div>
                                    <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>{s.qty}</div>
                                    <div style={{ height: 4, background: 'var(--bg-card-elevated)', borderRadius: 2 }}>
                                       <div style={{ width: `${s.level}%`, height: '100%', background: s.color, borderRadius: 2 }} />
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* SIDE PANEL (RIGHT — 30%) */}
              <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                 
                 {/* LIVE ALERTS */}
                 <div className="glass-container" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                       <h3 style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <AlertCircle size={16} color={COLORS.danger} /> Live Alerts
                       </h3>
                       <span style={{ fontSize: 9, fontWeight: 900, color: COLORS.danger }}>3 ACTIVE</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                       <div className="alert-item">
                          <Clock size={14} color={COLORS.danger} />
                          <div>
                             <div style={{ fontSize: 12, fontWeight: 800 }}>Overdue Maintenance</div>
                             <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Combine S2 is 24h past service.</div>
                          </div>
                       </div>
                       <div className="alert-item">
                          <Package size={14} color={COLORS.warning} />
                          <div>
                             <div style={{ fontSize: 12, fontWeight: 800 }}>Low Supplies</div>
                             <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Diesel fuel at 32% capacity.</div>
                          </div>
                       </div>
                       <div className="alert-item">
                          <Truck size={14} color={COLORS.warning} />
                          <div>
                             <div style={{ fontSize: 12, fontWeight: 800 }}>Vendor Delay</div>
                             <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Seed delivery delayed by 48h.</div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* AI OPERATIONS INSIGHTS */}
                 <div className="glass-container" style={{ padding: '24px', borderLeft: `3px solid ${COLORS.success}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                       <Sparkles size={16} color={COLORS.success} />
                       <h3 style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>AI Operations Insights</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                       {[
                         { issue: 'Inefficient Irrigation', impact: '22% Waste', action: 'Shift load to 11AM-3PM' },
                         { issue: 'Tractor Bearing Wear', impact: '$4.5k Risk', action: 'Pre-emptive replacement' },
                         { issue: 'Feed Supply Lag', impact: 'Yield Drop', action: 'Audit regional logistics' },
                       ].map((insight, i) => (
                         <div key={i} style={{ borderBottom: i < 2 ? '1px solid var(--border-soft)' : 'none', paddingBottom: i < 2 ? 16 : 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{insight.issue}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                               <span style={{ fontSize: 10, color: 'var(--status-critical)', fontWeight: 700 }}>{insight.impact} IMPACT</span>
                               <ArrowUpRight size={12} color={COLORS.success} />
                            </div>
                            <div style={{ fontSize: 11, color: COLORS.muted }}>Action: <span style={{ color: 'var(--status-success)' }}>{insight.action}</span></div>
                         </div>
                       ))}
                    </div>
                 </div>

              </div>
           </div>

        </main>
      </div>

      {/* NEW MAINTENANCE LOG MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: 600, padding: '48px', position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 24 }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 32, right: 32, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>Log Maintenance</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 40 }}>Record technical intervention or schedule upcoming services.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="form-group">
                  <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Asset / Equipment</label>
                  <select 
                    className="form-input"
                    value={form.asset_name}
                    onChange={e => setForm({...form, asset_name: e.target.value})}
                    required
                  >
                    <option value="">Select Asset</option>
                    {assets.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Maintenance Type</label>
                  <select 
                    className="form-input"
                    value={form.maintenance_type}
                    onChange={e => setForm({...form, maintenance_type: e.target.value as any})}
                    required
                  >
                    <option value="Service">Routine Service</option>
                    <option value="Repair">Emergency Repair</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Replacement">Replacement</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="form-group">
                  <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Service Date</label>
                  <input 
                    type="date"
                    className="form-input" 
                    value={form.date}
                    onChange={e => setForm({...form, date: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Current Status</label>
                  <select 
                    className="form-input"
                    value={form.status}
                    onChange={e => setForm({...form, status: e.target.value as any})}
                    required
                  >
                    <option value="Completed">Completed</option>
                    <option value="Scheduled">Scheduled / Pending</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="form-group">
                  <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Assigned Vendor</label>
                  <select 
                    className="form-input"
                    value={form.vendor_id}
                    onChange={e => setForm({...form, vendor_id: e.target.value})}
                  >
                    <option value="">Internal Staff</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Estimated Cost (TTD)</label>
                  <input 
                    type="number"
                    className="form-input" 
                    placeholder="0.00"
                    value={form.cost}
                    onChange={e => setForm({...form, cost: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Next Service Due Date</label>
                <input 
                  type="date"
                  className="form-input" 
                  value={form.next_due_date}
                  onChange={e => setForm({...form, next_due_date: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Technical Notes</label>
                <textarea 
                  className="form-input" 
                  placeholder="Describe parts used, issues found, or specialized labor..."
                  style={{ minHeight: 100, resize: 'none', padding: 16 }}
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                />
              </div>

              <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '14px', justifyContent: 'center' }}>
                   {currentUser.role === 'admin' ? 'Record Maintenance' : 'Submit for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .col-2-4 { width: calc(20% - 10px); }
        .card-compact {
          background: var(--bg-card);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-soft);
          border-radius: 12px;
          padding: 12px 16px;
        }
        .glass-container {
          background: var(--bg-card);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-soft);
          border-radius: 20px;
          overflow: hidden;
        }
        .ops-table {
           width: 100%;
           border-collapse: collapse;
        }
        .ops-table th {
           text-align: left;
           font-size: 10px;
           color: var(--text-muted);
           text-transform: uppercase;
           padding: 12px;
           border-bottom: 1px solid var(--border-soft);
        }
        .ops-table td {
           padding: 16px 12px;
           font-size: 13px;
           color: var(--text-primary);
           border-bottom: 1px solid var(--border-soft);
        }
        .alert-item {
           display: flex;
           gap: 12px;
           align-items: center;
           padding: 12px;
           background: var(--bg-card-elevated);
           border-radius: 12px;
           border: 1px solid var(--border-soft);
        }
        .btn-small {
           background: var(--status-success);
           color: var(--text-inverse);
           border: none;
           padding: 4px 12px;
           border-radius: 8px;
           font-size: 11px;
           font-weight: 800;
           cursor: pointer;
           display: flex;
           align-items: center;
           gap: 6px;
        }
        .badge-success { font-size: 9px; font-weight: 900; background: var(--status-success-glow); color: var(--status-success); padding: 4px 8px; border-radius: 4px; }
        .badge-warning { font-size: 9px; font-weight: 900; background: var(--status-warning-glow); color: var(--status-warning); padding: 4px 8px; border-radius: 4px; }
        .badge-danger { font-size: 9px; font-weight: 900; background: var(--status-critical-glow); color: var(--status-critical); padding: 4px 8px; border-radius: 4px; }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .form-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-soft);
          border-radius: 12px;
          padding: 14px 18px;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }
        .form-input:focus {
          border-color: var(--status-success);
          background: rgba(255,255,255,0.05);
        }
        .label-small {
          font-size: 9px;
          font-weight: 950;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .btn-primary { background: var(--status-success); color: var(--text-inverse); border: none; border-radius: 10px; padding: 10px 20px; font-weight: 800; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .btn-secondary { background: var(--bg-card-elevated); color: var(--text-primary); border: 1px solid var(--border-soft); border-radius: 12px; padding: 10px 20px; font-weight: 700; font-size: 14px; cursor: pointer; }
      `}</style>
    </div>
  );
}

