"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from "@/components/Sidebar";
import NotificationCenter from "@/components/NotificationCenter";
import ThemeToggle from "@/components/ThemeToggle";
import { useUIStore } from '@/store/useUIStore';
import { 
  Landmark, Building2, Tractor, Wallet, 
  TrendingUp, TrendingDown, ShieldCheck, 
  Zap, Sparkles, DollarSign, Activity, 
  PieChart as LucidePieChart, ArrowUpRight, 
  ArrowDownRight, RefreshCw, Calendar, Filter,
  Download, Layers, Briefcase, Share2, MoreVertical, Plus,
  ChevronRight, ArrowRightLeft, ShieldAlert,
  ArrowRight, FileText, ChevronDown, Clock, Search,
  Warehouse, HardHat, Scale, History
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart as RePieChart, Pie, Legend
} from 'recharts';
import { toast, Toaster } from 'react-hot-toast';

import { THEME_COLORS as COLORS, TC } from '@/lib/theme-colors';

const CHART_COLORS = ['#39C86A', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

import { exportToCSV } from '@/lib/exportUtils';
import { useAppStore } from '@/store/useAppStore';

export default function CapitalPage() {
  const { sidebarCollapsed } = useUIStore();
  const [mountedTime, setMountedTime] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', value: '', category: 'Machinery', condition: 'Prime' });
  
  // Static for now but could be moved to store
  const [assets, setAssets] = useState([
    { id: '1', name: 'Real Estate', value: 850000, color: '#39C86A', cond: 'Prime', roi: '1.2x', status: 'Core' },
    { id: '2', name: 'Machinery', value: 320000, color: '#3b82f6', cond: 'Good', roi: '0.8x', status: 'Productive' },
    { id: '3', name: 'Livestock', value: 145000, color: '#f59e0b', cond: 'Optimal', roi: '2.4x', status: 'High Growth' },
    { id: '4', name: 'Inventory', value: 68000, color: '#ef4444', cond: 'New', roi: '1.5x', status: 'Strategic' },
  ]);

  useEffect(() => {
    setMountedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const handleExport = () => {
    const dataToExport = assets.map(a => ({
      Asset: a.name,
      Valuation: a.value,
      Condition: a.cond,
      ROI: a.roi,
      Status: a.status
    }));
    exportToCSV(dataToExport, 'Capital_Asset_Registry');
  };

  const handleAppraisal = () => {
    const id = toast.loading('Initiating multi-vector asset appraisal...');
    setTimeout(() => {
      toast.success('Appraisal Complete: Net Asset Value verified at $1.38M.', { id, icon: '💎', style: { background: '#101010', color: '#fff' } });
    }, 2000);
  };

  const handleAddAsset = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = toast.loading('Indexing asset into secure registry...');
    setTimeout(() => {
      toast.success(`${formData.name} successfully registered.`, { id, style: { background: '#101010', color: '#fff' } });
      setIsModalOpen(false);
      
      const newAsset = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        value: Number(formData.value),
        color: COLORS.info,
        cond: 'New',
        roi: '1.0x',
        status: 'Strategic'
      };
      setAssets([...assets, newAsset]);

      // Audit
      useAppStore.getState().logEmployeeSubmission(
        'Capital & Assets',
        'creation',
        'asset',
        newAsset.id,
        { name: formData.name, value: formData.value }
      );
    }, 1500);
  };

  const handleRoadmapClick = (title: string) => {
    toast(`Strategic modeling for ${title} is now active.`, {
      icon: '🗺️',
      style: { background: '#101010', color: '#fff', border: '1px solid #333' }
    });
  };

   const totalCapital = assets.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-body)' }}>
      <Toaster position="top-right" />
      <Sidebar />

      <div style={{ marginLeft: sidebarCollapsed ? 64 : 250, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease' }}>
        
        <header style={{ height: 72, background: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid var(--border-soft)` }}>
          <div>
             <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Capital & Asset Control</h1>
             <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Strategic equity positioning & infrastructure valuation</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={14} /> Asset Registry Synced: {mountedTime}
            </div>
            <ThemeToggle />
            <NotificationCenter />
            <button className="btn-primary" onClick={handleAppraisal} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
               <Landmark size={16} /> Asset Appraisal
            </button>
          </div>
        </header>

        <main style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          
          {/* 1. CAPITAL HERO */}
          <div className="grid-12" style={{ gap: 24, marginBottom: 32 }}>
              <div className="col-8 card" style={{ padding: '32px', background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-elevated) 100%)', border: '1px solid var(--border-soft)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                       <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Total Capital Employed</div>
                       <div style={{ fontSize: 48, fontWeight: 950, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 16 }}>
                          ${totalCapital.toLocaleString()}
                          <div style={{ fontSize: 14, fontWeight: 700, padding: '4px 12px', background: 'var(--bg-card-elevated)', borderRadius: 20, color: 'var(--text-muted)', border: '1px solid var(--border-soft)' }}>
                             Equity Position: 74%
                          </div>
                       </div>
                       <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 12 }}>Capital Health: <span style={{ color: 'var(--status-success)', fontWeight: 700 }}>Excellent (Low Leverage)</span></div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Net Asset Value (NAV)</div>
                       <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)' }}>$1,383,000</div>
                       <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Appraised: Q2 2026</div>
                    </div>
                 </div>
                
                <div style={{ display: 'flex', gap: 64, marginTop: 40 }}>
                   <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Fixed Assets</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)' }}>$1,170,000</div>
                   </div>
                   <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Current Assets</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)' }}>$213,000</div>
                   </div>
                   <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Debt-to-Equity</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--status-info)' }}>0.35x</div>
                   </div>
                </div>
             </div>

             <div className="col-4 card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                   <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(57, 200, 106, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={20} color={COLORS.success} />
                   </div>
                   <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>Capital Strategy</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>AI-driven equity optimization</div>
                   </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                         <span style={{ fontWeight: 800, color: 'var(--status-success)' }}>Equity Signal:</span> Your strong equity position allows for favorable tractor financing in Q3.
                      </div>
                   </div>
                   <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                         <span style={{ fontWeight: 800, color: 'var(--status-info)' }}>Depreciation:</span> Q2 machinery depreciation is 4% below forecast; maintenance ROI is high.
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="grid-12" style={{ gap: 24, marginBottom: 32 }}>
             {/* 2. ASSET PORTFOLIO */}
             <div className="col-8 card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                   <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Asset Portfolio Audit</h3>
                   <div style={{ display: 'flex', gap: 12 }}>
                      <button className="btn-ghost-small" onClick={handleExport}><Download size={14} /> Export Archive</button>
                      <button className="btn-ghost-small" onClick={handleAddAsset}><Plus size={14} /> Add Asset</button>
                   </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-soft)' }}>
                         <th style={{ padding: '16px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Asset Category</th>
                         <th style={{ padding: '16px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Valuation</th>
                         <th style={{ padding: '16px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Condition</th>
                         <th style={{ padding: '16px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ROI Index</th>
                         <th style={{ padding: '16px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                      </tr>
                   </thead>
                    <tbody>
                       {assets.map((row, i) => (
                          <tr key={row.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                             <td style={{ padding: '16px' }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{row.name}</div>
                             </td>
                             <td style={{ padding: '16px', fontSize: 14, fontWeight: 700 }}>${row.value.toLocaleString()}</td>
                             <td style={{ padding: '16px', fontSize: 13, color: 'var(--text-muted)' }}>{row.cond}</td>
                             <td style={{ padding: '16px', fontSize: 13, fontWeight: 700, color: 'var(--status-success)' }}>{row.roi}</td>
                             <td style={{ padding: '16px' }}>
                                <span style={{ fontSize: 10, fontWeight: 950, padding: '4px 10px', borderRadius: 6, background: row.status === 'Warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(57, 200, 106, 0.1)', color: row.status === 'Warning' ? COLORS.warning : COLORS.success }}>
                                   {row.status.toUpperCase()}
                                </span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                </table>
             </div>

             {/* 3. ALLOCATION PIE */}
             <div className="col-4 card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 32 }}>Capital Allocation</h3>
                <div style={{ height: 280 }}>
                   <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                         <Pie
                             data={assets}
                             cx="50%"
                             cy="50%"
                             innerRadius={60}
                             outerRadius={80}
                             paddingAngle={8}
                             dataKey="value"
                          >
                             {assets.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                             ))}
                          </Pie>
                         <RechartsTooltip />
                      </RePieChart>
                   </ResponsiveContainer>
                </div>
                 <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {assets.slice(0, 4).map((s, i) => (
                       <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                             <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                             <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.name}</span>
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{((s.value / totalCapital) * 100).toFixed(0)}%</span>
                       </div>
                    ))}
                 </div>
             </div>
          </div>

          <div className="grid-12" style={{ gap: 24, marginBottom: 32 }}>
             {/* 4. DEPRECIATION TRACKING */}
             <div className="col-6 card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                   <Scale size={20} color={COLORS.info} />
                   <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Capital Structure</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Equity (Owner Capital)</span>
                      <span style={{ fontWeight: 800, color: 'var(--status-success)' }}>$1,023,000</span>
                   </div>
                   <div style={{ height: 8, background: 'var(--bg-card-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '74%', background: COLORS.success }} />
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--text-muted)' }}>External Debt (Loans)</span>
                      <span style={{ fontWeight: 800, color: 'var(--status-critical)' }}>$360,000</span>
                   </div>
                   <div style={{ height: 8, background: 'var(--bg-card-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '26%', background: COLORS.danger }} />
                   </div>
                </div>
             </div>

             {/* 5. CAPEX ROADMAP */}
             <div className="col-6 card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                   <Briefcase size={20} color={COLORS.warning} />
                   <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Strategic CapEx Roadmap</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   <div onClick={() => handleRoadmapClick('Tractor Fleet Expansion')} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Tractor size={20} color={COLORS.warning} />
                      </div>
                      <div style={{ flex: 1 }}>
                         <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Tractor Fleet Expansion</div>
                         <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Planned: Q3 2026 • $120,000</div>
                      </div>
                      <ChevronRight size={16} color={COLORS.muted} />
                   </div>
                   <div onClick={() => handleRoadmapClick('Greenhouse Infrastructure')} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(57, 200, 106, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Warehouse size={20} color={COLORS.success} />
                      </div>
                      <div style={{ flex: 1 }}>
                         <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Greenhouse Infrastructure</div>
                         <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Planned: Q4 2026 • $45,000</div>
                      </div>
                      <ChevronRight size={16} color={COLORS.muted} />
                   </div>
                </div>
             </div>
          </div>

        </main>
      </div>

      <style jsx>{`
        .card {
          background: var(--bg-card);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-soft);
          border-radius: 24px;
        }
        .btn-primary {
          background: var(--status-success);
          color: var(--text-inverse);
          border: none;
          border-radius: 12px;
          padding: 10px 20px;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        .btn-primary:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }
        .btn-ghost-small {
          background: var(--bg-card-elevated);
          color: var(--text-muted);
          border: 1px solid var(--border-soft);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-ghost-small:hover {
          background: var(--border-soft);
          color: var(--text-primary);
        }
          .saas-input {
            background: #141414;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 0 16px;
            color: #fff;
            font-size: 13px;
            outline: none;
          }
          .saas-input:focus {
            border-color: var(--status-success);
          }
      `}</style>
    </div>
  );
}

