"use client";

import { useState, useMemo } from 'react';
import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationCenter from "@/components/NotificationCenter";
import { useUIStore } from '@/store/useUIStore';
import { useAppStore } from '@/store/useAppStore';
import { useVendorStore } from '@/store/useVendorStore';
import { 
  Truck, Search, Plus, Filter, Sparkles, 
  AlertTriangle, CheckCircle2, TrendingUp, 
  TrendingDown, Star, Clock, MoreVertical,
  Mail, Phone, MapPin, User, ChevronRight,
  ShieldAlert, Activity, DollarSign, Zap, X,
  Globe, Briefcase, Info
} from "lucide-react";
import { SAMPLE_SEGMENTS } from '@/lib/sample-data';
import { toast, Toaster } from 'react-hot-toast';

import { THEME_COLORS as COLORS, TC } from '@/lib/theme-colors';

export default function VendorIntelligencePage() {
  const { sidebarCollapsed } = useUIStore();
  const { theme, currentUser } = useAppStore();
  const { vendors, addVendor } = useVendorStore();
  const isLight = theme === 'light';
  
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    category: '',
    contact_name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    reliability: '5.0',
    risk: 'Low'
  });

  const filtered = useMemo(() => {
    return vendors.filter(v => 
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      (v.contact_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (v.notes ?? '').toLowerCase().includes(search.toLowerCase())
    );
  }, [vendors, search]);

  const metrics = useMemo(() => {
    const totalSpend = vendors.reduce((s, v) => s + (v as any).total_spend || 0, 0);
    const sorted = [...vendors].sort((a, b) => ((b as any).total_spend || 0) - ((a as any).total_spend || 0));
    const topVendor = sorted[0] || { name: 'N/A' };
    const highRiskCount = vendors.filter(v => (v as any).risk === 'High').length;
    return { totalSpend, topVendor, highRiskCount };
  }, [vendors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await addVendor({
      name: form.name,
      contact_name: form.contact_name,
      phone: form.phone,
      email: form.email,
      address: form.address,
      notes: form.notes,
      // @ts-ignore
      category: form.category,
      reliability: form.reliability,
      risk: form.risk
    });

    if (result) {
      toast.success('New vendor registered successfully', {
        style: { background: '#101010', color: '#fff', border: '1px solid var(--status-success)' }
      });
      setShowModal(false);
      setForm({
        name: '',
        category: '',
        contact_name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
        reliability: '5.0',
        risk: 'Low'
      });
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-body)' }}>
      <Toaster position="top-right" />
      <Sidebar />

      <div style={{ marginLeft: sidebarCollapsed ? 64 : 250, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease' }}>
        <header style={{ height: 72, background: 'var(--bg-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid var(--border-soft)` }}>
          <div>
             <h1 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Vendor Intelligence Command Center</h1>
             <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>Supply chain auditing & performance analytics</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ThemeToggle />
            <NotificationCenter />
            <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Vendor</button>
          </div>
        </header>

        <main style={{ padding: '24px 32px', flex: 1, overflowY: 'auto' }}>
           
           {/* TOP SNAPSHOT BAR */}
           <div className="grid-12" style={{ gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Total Vendor Spend', val: `$${metrics.totalSpend.toLocaleString()}`, color: COLORS.info, icon: <DollarSign size={14}/> },
                { label: 'Active Vendors', val: vendors.length, color: COLORS.success, icon: <Truck size={14}/> },
                { label: 'Avg Cost Trend', val: '-4.2%', color: COLORS.success, icon: <TrendingDown size={14}/> },
                { label: 'Top Vendor', val: metrics.topVendor.name, color: COLORS.warning, icon: <Star size={14}/> },
                { label: 'High Risk Vendors', val: metrics.highRiskCount, color: COLORS.danger, icon: <ShieldAlert size={14}/> },
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
                   <div style={{ fontSize: 18, fontWeight: 950, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.val}</div>
                </div>
              ))}
           </div>

           <div className="grid-12" style={{ gap: 24, alignItems: 'flex-start' }}>
              
              {/* MAIN CONTENT (LEFT) */}
              <div className="col-9">
                 <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card-elevated)', padding: '10px 16px', borderRadius: 12, border: '1px solid var(--border-soft)' }}>
                       <Search size={16} color='var(--text-muted)' />
                       <input 
                         placeholder="Search vendors by name, service, or contact..." 
                         value={search}
                         onChange={e => setSearch(e.target.value)}
                         style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 13, width: '100%' }}
                       />
                    </div>
                    <button className="btn-filter"><Filter size={14}/> Filters</button>
                 </div>

                 <div className="grid-12" style={{ gap: 16 }}>
                    {filtered.map(v => (
                       <div key={v.id} className="col-4 vendor-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                             <div>
                                <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>{v.name}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>{(v as any).category || 'Supply Chain Entity'}</div>
                             </div>
                             {(v as any).risk === 'High' && <span className="risk-badge">HIGH RISK</span>}
                          </div>

                          <div className="card-stats">
                             <div className="stat">
                                <div className="stat-label">Total Spend</div>
                                <div className="stat-val">${((v as any).total_spend || 0).toLocaleString()}</div>
                             </div>
                             <div className="stat">
                                <div className="stat-label">Reliability</div>
                                <div className="stat-val" style={{ color: COLORS.success, display: 'flex', alignItems: 'center', gap: 4 }}>
                                   {(v as any).reliability || '5.0'} <Star size={10} fill={COLORS.success} />
                                </div>
                             </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                             <div className="contact-info"><Mail size={12}/> {v.email || 'N/A'}</div>
                             <div className="contact-info"><Phone size={12}/> {v.phone || 'N/A'}</div>
                             <div className="contact-info"><MapPin size={12}/> {v.address || 'Location N/A'}</div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: `1px solid var(--border-soft)` }}>
                             <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Trend: <span style={{ color: (v as any).cost_trend === 'up' ? COLORS.danger : COLORS.success }}>{((v as any).cost_trend || 'stable').toUpperCase()}</span></div>
                             <button className="btn-view">Details <ChevronRight size={12}/></button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* SIDE PERFORMANCE PANEL (RIGHT) */}
              <div className="col-3" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                 
                 <div className="glass-card" style={{ padding: '24px', borderLeft: `3px solid ${COLORS.success}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                       <Sparkles size={16} color={COLORS.success} />
                       <h3 style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Vendor Intelligence</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                       {[
                         { title: 'Cost Optimization', desc: 'Sourcing fuel from Vendor B could save $450/mo vs Vendor A.' },
                         { title: 'Reliability Warning', desc: 'Vendor X maintenance quality has dropped 12% this quarter.' },
                         { title: 'Usage Alert', desc: 'Vendor Y usage is approaching annual bulk discount threshold.' },
                       ].map((insight, i) => (
                         <div key={i} style={{ borderBottom: i < 2 ? `1px solid var(--border-soft)` : 'none', paddingBottom: i < 2 ? 16 : 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{insight.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{insight.desc}</div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Performance Matrix</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                       {[
                         { label: 'Best Value', val: 'AgriSupply Co', color: COLORS.success },
                         { label: 'Most Expensive', val: 'Global Parts', color: COLORS.danger },
                         { label: 'Most Reliable', val: 'John Deere Serv', color: COLORS.info },
                         { label: 'Most Used', val: 'Estate Fuel Ltd', color: COLORS.warning },
                       ].map((p, i) => (
                          <div key={i} style={{ background: 'var(--bg-card-elevated)', padding: '12px', borderRadius: 12, border: '1px solid var(--border-soft)' }}>
                             <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4 }}>{p.label}</div>
                             <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-primary)' }}>{p.val}</div>
                          </div>
                       ))}
                    </div>
                 </div>

              </div>
           </div>

        </main>
      </div>

      {/* ADD VENDOR MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: 600, padding: '48px', position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 24 }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 32, right: 32, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>Register New Vendor</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 40 }}>Add a new entity to your farm's supply chain intelligence network.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="form-group">
                  <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Vendor Name</label>
                  <input 
                    className="form-input" 
                    placeholder="e.g. Island Agri-Chemicals"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Category / Service</label>
                  <input 
                    className="form-input" 
                    placeholder="e.g. Fertilizers"
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="form-group">
                  <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Contact Person</label>
                  <input 
                    className="form-input" 
                    placeholder="e.g. Sarah Williams"
                    value={form.contact_name}
                    onChange={e => setForm({...form, contact_name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Phone Number</label>
                  <input 
                    className="form-input" 
                    placeholder="+1-868-..."
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="form-group">
                  <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Email Address</label>
                  <input 
                    type="email"
                    className="form-input" 
                    placeholder="contact@vendor.com"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Location / Address</label>
                  <input 
                    className="form-input" 
                    placeholder="e.g. San Fernando, TT"
                    value={form.address}
                    onChange={e => setForm({...form, address: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="form-group">
                  <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Reliability Assessment</label>
                  <select 
                    className="form-input"
                    value={form.reliability}
                    onChange={e => setForm({...form, reliability: e.target.value})}
                  >
                    <option value="5.0">5.0 - Excellent</option>
                    <option value="4.0">4.0 - Good</option>
                    <option value="3.0">3.0 - Fair</option>
                    <option value="2.0">2.0 - Poor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Risk Level</label>
                  <select 
                    className="form-input"
                    value={form.risk}
                    onChange={e => setForm({...form, risk: e.target.value})}
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Internal Notes</label>
                <textarea 
                  className="form-input" 
                  placeholder="Payment terms, delivery schedules, etc."
                  style={{ minHeight: 100, resize: 'none', padding: 16 }}
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                />
              </div>

              <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '14px', justifyContent: 'center' }}>
                   Confirm Registration
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
        .glass-card {
          background: var(--bg-card);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-soft);
          border-radius: 20px;
        }
        .vendor-card {
           background: var(--bg-card);
           backdrop-filter: blur(12px);
           border: 1px solid var(--border-soft);
           border-radius: 20px;
           padding: 24px;
           transition: all 0.2s ease;
        }
        .vendor-card:hover {
           border-color: var(--status-success);
           transform: translateY(-2px);
        }
        .risk-badge {
           font-size: 8px;
           font-weight: 950;
           padding: 4px 8px;
           background: var(--status-critical-glow);
           color: var(--status-critical);
           border-radius: 6px;
           letter-spacing: 0.05em;
        }
        .card-stats {
           display: grid;
           grid-template-columns: 1fr 1fr;
           gap: 12px;
           margin-bottom: 20px;
        }
        .stat {
           padding: 12px;
           background: var(--bg-card-elevated);
           border-radius: 12px;
        }
        .stat-label { font-size: 9px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; }
        .stat-val { font-size: 14px; font-weight: 900; color: var(--text-primary); }
        .contact-info { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--text-muted); }
        .btn-view { background: none; border: none; color: var(--status-success); font-size: 11px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px; }
        .btn-primary { background: var(--status-success); color: var(--text-inverse); border: none; border-radius: 10px; padding: 10px 20px; font-weight: 800; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .btn-secondary { background: var(--bg-card-elevated); color: var(--text-primary); border: 1px solid var(--border-soft); border-radius: 12px; padding: 10px 20px; font-weight: 700; font-size: 14px; cursor: pointer; }
        .btn-filter { background: var(--bg-card-elevated); border: 1px solid var(--border-soft); border-radius: 12px; padding: 10px 16px; color: var(--text-primary); font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        
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
      `}</style>
    </div>
  );
}

