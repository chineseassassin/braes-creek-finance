"use client";

import { useState, useMemo } from 'react';
import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationCenter from "@/components/NotificationCenter";
import { useUIStore } from '@/store/useUIStore';
import { 
  Truck, Search, Plus, Filter, Sparkles, 
  AlertTriangle, CheckCircle2, TrendingUp, 
  TrendingDown, Star, Clock, MoreVertical,
  Mail, Phone, MapPin, User, ChevronRight,
  ShieldAlert, Activity, DollarSign, Zap
} from "lucide-react";
import { SAMPLE_VENDORS, SAMPLE_SEGMENTS } from '@/lib/sample-data';

const COLORS = {
  success: '#39C86A',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  muted: '#8a8a8e',
  border: 'rgba(255, 255, 255, 0.08)',
  accent: '#39C86A',
  bg: 'var(--color-bg-body)',
  glass: 'rgba(255, 255, 255, 0.03)'
};

export default function VendorIntelligencePage() {
  const { sidebarCollapsed } = useUIStore();
  const [vendors, setVendors] = useState(SAMPLE_VENDORS.map(v => ({
    ...v,
    total_spend: Math.floor(Math.random() * 50000) + 5000,
    reliability: (Math.random() * 2 + 3).toFixed(1),
    cost_trend: Math.random() > 0.5 ? 'up' : 'down',
    last_transaction: '2026-04-25',
    avg_job_cost: Math.floor(Math.random() * 2000) + 500,
    risk: Math.random() > 0.8 ? 'High' : 'Low'
  })));
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() => {
    return vendors.filter(v => 
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      (v.contact_name ?? '').toLowerCase().includes(search.toLowerCase())
    );
  }, [vendors, search]);

  const metrics = useMemo(() => {
    const totalSpend = vendors.reduce((s, v) => s + v.total_spend, 0);
    const topVendor = [...vendors].sort((a, b) => b.total_spend - a.total_spend)[0];
    const highRiskCount = vendors.filter(v => v.risk === 'High').length;
    return { totalSpend, topVendor, highRiskCount };
  }, [vendors]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: COLORS.bg }}>
      <Sidebar />

      <div style={{ marginLeft: sidebarCollapsed ? 64 : 250, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease' }}>
        <header style={{ height: 72, background: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${COLORS.border}` }}>
          <div>
             <h1 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0 }}>Vendor Intelligence Command Center</h1>
             <p style={{ fontSize: 11, color: COLORS.muted, margin: 0 }}>Supply chain auditing & performance analytics</p>
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
                <div key={i} className="col-2-4 card-compact" style={{ borderLeft: `2px solid ${card.color}` }}>
                   <div style={{ fontSize: 9, fontWeight: 900, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {card.icon} {card.label}
                   </div>
                   <div style={{ fontSize: 18, fontWeight: 950, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.val}</div>
                </div>
              ))}
           </div>

           <div className="grid-12" style={{ gap: 24, alignItems: 'flex-start' }}>
              
              {/* MAIN CONTENT (LEFT) */}
              <div className="col-9">
                 <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                       <Search size={16} color={COLORS.muted} />
                       <input 
                         placeholder="Search vendors by name, service, or contact..." 
                         value={search}
                         onChange={e => setSearch(e.target.value)}
                         style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 13, width: '100%' }}
                       />
                    </div>
                    <button className="btn-filter"><Filter size={14}/> Filters</button>
                 </div>

                 <div className="grid-12" style={{ gap: 16 }}>
                    {filtered.map(v => (
                       <div key={v.id} className="col-4 vendor-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                             <div>
                                <div style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>{v.name}</div>
                                <div style={{ fontSize: 10, color: COLORS.muted, textTransform: 'uppercase', fontWeight: 800 }}>Supply Chain Entity</div>
                             </div>
                             {v.risk === 'High' && <span className="risk-badge">HIGH RISK</span>}
                          </div>

                          <div className="card-stats">
                             <div className="stat">
                                <div className="stat-label">Total Spend</div>
                                <div className="stat-val">${v.total_spend.toLocaleString()}</div>
                             </div>
                             <div className="stat">
                                <div className="stat-label">Reliability</div>
                                <div className="stat-val" style={{ color: COLORS.success, display: 'flex', alignItems: 'center', gap: 4 }}>
                                   {v.reliability} <Star size={10} fill={COLORS.success} />
                                </div>
                             </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                             <div className="contact-info"><Mail size={12}/> {v.email || 'N/A'}</div>
                             <div className="contact-info"><Phone size={12}/> {v.phone || 'N/A'}</div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: `1px solid ${COLORS.border}` }}>
                             <div style={{ fontSize: 10, color: COLORS.muted }}>Trend: <span style={{ color: v.cost_trend === 'up' ? COLORS.danger : COLORS.success }}>{v.cost_trend.toUpperCase()}</span></div>
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
                       <h3 style={{ fontSize: 14, fontWeight: 900, color: '#fff', margin: 0 }}>Vendor Intelligence</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                       {[
                         { title: 'Cost Optimization', desc: 'Sourcing fuel from Vendor B could save $450/mo vs Vendor A.' },
                         { title: 'Reliability Warning', desc: 'Vendor X maintenance quality has dropped 12% this quarter.' },
                         { title: 'Usage Alert', desc: 'Vendor Y usage is approaching annual bulk discount threshold.' },
                       ].map((insight, i) => (
                         <div key={i} style={{ borderBottom: i < 2 ? `1px solid ${COLORS.border}` : 'none', paddingBottom: i < 2 ? 16 : 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{insight.title}</div>
                            <div style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.4 }}>{insight.desc}</div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: 13, fontWeight: 900, color: '#fff', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Performance Matrix</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                       {[
                         { label: 'Best Value', val: 'AgriSupply Co', color: COLORS.success },
                         { label: 'Most Expensive', val: 'Global Parts', color: COLORS.danger },
                         { label: 'Most Reliable', val: 'John Deere Serv', color: COLORS.info },
                         { label: 'Most Used', val: 'Estate Fuel Ltd', color: COLORS.warning },
                       ].map((p, i) => (
                         <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: COLORS.muted, marginBottom: 4 }}>{p.label}</div>
                            <div style={{ fontSize: 12, fontWeight: 900, color: '#fff' }}>{p.val}</div>
                         </div>
                       ))}
                    </div>
                 </div>

              </div>
           </div>

        </main>
      </div>

      <style jsx>{`
        .col-2-4 { width: calc(20% - 10px); }
        .card-compact {
          background: ${COLORS.glass};
          backdrop-filter: blur(12px);
          border: 1px solid ${COLORS.border};
          border-radius: 12px;
          padding: 12px 16px;
        }
        .glass-card {
          background: ${COLORS.glass};
          backdrop-filter: blur(12px);
          border: 1px solid ${COLORS.border};
          border-radius: 20px;
        }
        .vendor-card {
           background: ${COLORS.glass};
           backdrop-filter: blur(12px);
           border: 1px solid ${COLORS.border};
           border-radius: 20px;
           padding: 24px;
           transition: all 0.2s ease;
        }
        .vendor-card:hover {
           border-color: rgba(57, 200, 106, 0.3);
           transform: translateY(-2px);
        }
        .risk-badge {
           font-size: 8px;
           font-weight: 950;
           padding: 4px 8px;
           background: rgba(239, 68, 68, 0.1);
           color: ${COLORS.danger};
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
           background: rgba(255,255,255,0.02);
           border-radius: 12px;
        }
        .stat-label { font-size: 9px; font-weight: 800; color: COLORS.muted; text-transform: uppercase; margin-bottom: 4px; }
        .stat-val { font-size: 14px; font-weight: 900; color: #fff; }
        .contact-info { display: flex; alignItems: center; gap: 8px; fontSize: 11px; color: ${COLORS.muted}; }
        .btn-view { background: none; border: none; color: ${COLORS.success}; font-size: 11px; font-weight: 800; cursor: pointer; display: flex; alignItems: center; gap: 4px; }
        .btn-primary { background: ${COLORS.success}; color: #050505; border: none; border-radius: 10px; padding: 10px 20px; font-weight: 800; font-size: 13px; cursor: pointer; display: flex; alignItems: center; gap: 8px; }
        .btn-filter { background: rgba(255,255,255,0.03); border: 1px solid ${COLORS.border}; border-radius: 12px; padding: 10px 16px; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; alignItems: center; gap: 8px; }
      `}</style>
    </div>
  );
}
