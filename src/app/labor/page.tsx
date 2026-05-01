"use client";

import { useState, useMemo, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationCenter from "@/components/NotificationCenter";
import { useUIStore } from '@/store/useUIStore';
import { useAppStore } from '@/store/useAppStore';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { SAMPLE_LABOR, SAMPLE_SEGMENTS } from '@/lib/sample-data';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Users, Clock, DollarSign, Activity, 
  TrendingUp, TrendingDown, Sparkles, 
  Zap, AlertTriangle, CheckCircle2, 
  ChevronRight, ChevronDown, Filter, 
  Search, Download, Plus, Star, BarChart3,
  History, Briefcase, UserCheck, ShieldAlert,
  ArrowRight, Info, MessageSquare, Send,
  Target, Scale, LayoutGrid, Timer, X
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area, Cell
} from 'recharts';

import { THEME_COLORS as COLORS, TC } from '@/lib/theme-colors';

const TABS = [
  { id: 'entries', label: 'Labor Entries', icon: History },
  { id: 'performance', label: 'Worker Performance', icon: UserCheck },
  { id: 'efficiency',  label: 'Task Efficiency',  icon: Target },
  { id: 'payroll',     label: 'Payroll Impact',    icon: DollarSign },
  { id: 'ai',          label: 'AI Recommendations', icon: Sparkles },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TTD', maximumFractionDigits: 0 }).format(n);

export default function WorkforceIntelligencePage() {
  const { sidebarCollapsed } = useUIStore();
  const { currentUser, emitSystemEvent } = useAppStore();
  const { transactions, addTransaction } = useDashboardStore();
  const { addApprovalRequest } = useWorkflowStore();

  const [activeTab, setActiveTab] = useState('entries');
  const [labor, setLabor] = useState(SAMPLE_LABOR);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [segFilter, setSegFilter] = useState('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    worker_name: '',
    task: '',
    hours: '',
    rate: '',
    date: new Date().toISOString().split('T')[0],
    segment_id: SAMPLE_SEGMENTS[0].id,
    notes: ''
  });

  const filtered = useMemo(() => {
    // Merge live transactions of type 'Payroll' (which we use for labor costs)
    const liveLabor = transactions
      .filter(t => t.category === 'Payroll' || t.description.toLowerCase().includes('labor'))
      .map(t => ({
        id: t.id,
        worker_name: t.description.split(' - ')[0] || 'Worker',
        task: t.description.split(' - ')[1] || 'General Labor',
        hours_worked: 0, // Store doesn't have hours yet, we just show amount
        total_cost: t.amount,
        date: t.date,
        segment_id: (t as any).segment_id || 'seg-gen',
        status: t.status
      }));

    const combined = [...liveLabor, ...labor];

    return combined.filter(l => {
      const matchSearch = l.worker_name.toLowerCase().includes(search.toLowerCase()) || l.task.toLowerCase().includes(search.toLowerCase());
      const matchSeg = segFilter === 'all' || l.segment_id === segFilter;
      return matchSearch && matchSeg;
    });
  }, [labor, transactions, search, segFilter]);

  const totalHours = filtered.reduce((s, l) => s + (l.hours_worked || 0), 0);
  const totalCost = filtered.reduce((s, l) => s + l.total_cost, 0);
  const activeWorkers = new Set(filtered.map(l => l.worker_name)).size;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hours = parseFloat(form.hours);
    const rate = parseFloat(form.rate);
    const total = hours * rate;

    const isAdmin = currentUser.role === 'admin';
    const status = isAdmin ? 'approved' : 'pending';

    const newRecord = await addTransaction({
      type: 'expense',
      category: 'Payroll',
      amount: total,
      description: `${form.worker_name} - ${form.task}`,
      date: form.date,
      status: status,
      // @ts-ignore
      segment_id: form.segment_id,
      notes: form.notes
    });

    if (newRecord) {
      if (!isAdmin) {
        addApprovalRequest({
          entity_type: 'labor',
          entity_id: newRecord.id,
          requester_id: currentUser.id,
          priority: total > 1500 ? 'high' : 'medium',
          status: 'pending'
        });
        toast.success('Labor entry submitted for approval', {
          style: { background: '#101010', color: '#fff', border: '1px solid var(--border-soft)' }
        });
      } else {
        toast.success('Labor recorded and finalized', {
          style: { background: '#101010', color: '#fff', border: '1px solid var(--status-success)' }
        });
      }

      // Close modal and reset
      setShowModal(false);
      setForm({
        worker_name: '',
        task: '',
        hours: '',
        rate: '',
        date: new Date().toISOString().split('T')[0],
        segment_id: SAMPLE_SEGMENTS[0].id,
        notes: ''
      });
    }
  };

  const aiRecommendations = useMemo(() => [
    { type: 'Immediate Action', text: "Labor cost for tomato operations is rising faster than output.", severity: 'HIGH', color: '#f97316' },
    { type: 'Efficiency Opportunity', text: "Devon Smith shows strong task completion efficiency.", severity: 'LOW', color: COLORS.success },
    { type: 'Risk Warning', text: "Average cost per hour is above target.", severity: 'CRITICAL', color: COLORS.danger }
  ], []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-body)' }}>
      <Toaster position="top-right" />
      <Sidebar />

      <div style={{ marginLeft: sidebarCollapsed ? 64 : 250, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease' }}>
        <header style={{ height: 72, background: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid var(--border-soft)` }}>
          <div>
             <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Workforce Intelligence</h1>
             <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Monitor labor cost, productivity, and workforce efficiency</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ThemeToggle />
            <NotificationCenter />
            <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
               <Plus size={16} /> Log Labor
            </button>
          </div>
        </header>

        <div style={{ padding: '0 32px', background: 'var(--bg-body)', borderBottom: `1px solid var(--border-soft)`, display: 'flex', gap: 32, position: 'sticky', top: 72, zIndex: 40 }}>
           {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '20px 0',
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? `2px solid var(--status-success)` : '2px solid transparent',
                    color: isActive ? 'var(--status-success)' : 'var(--text-muted)',
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

        <main style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
           
           {activeTab === 'entries' && (
             <div className="animate-fade-in">
                <div className="grid-12" style={{ gap: 16, marginBottom: 32 }}>
                   <div className="col-4 card" style={{ padding: '20px' }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 8 }}>Total Labor Cost</div>
                      <div style={{ fontSize: 24, fontWeight: 950, color: 'var(--text-primary)' }}>{fmt(totalCost)}</div>
                   </div>
                   <div className="col-4 card" style={{ padding: '20px' }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 8 }}>Hours Worked</div>
                      <div style={{ fontSize: 24, fontWeight: 950, color: 'var(--text-primary)' }}>{totalHours.toFixed(1)}h</div>
                   </div>
                   <div className="col-4 card" style={{ padding: '20px' }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 8 }}>Active Workers</div>
                      <div style={{ fontSize: 24, fontWeight: 950, color: 'var(--text-primary)' }}>{activeWorkers}</div>
                   </div>
                </div>

                <div className="card" style={{ padding: '32px' }}>
                   <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '8px 16px', width: 300 }}>
                         <Search size={14} color={COLORS.muted} />
                         <input placeholder="Search records..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 12, width: '100%' }} />
                      </div>
                   </div>
                   <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                         <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '16px', fontSize: 11, color: COLORS.muted, textTransform: 'uppercase' }}>Worker</th>
                            <th style={{ padding: '16px', fontSize: 11, color: COLORS.muted, textTransform: 'uppercase' }}>Task</th>
                            <th style={{ padding: '16px', fontSize: 11, color: COLORS.muted, textTransform: 'uppercase' }}>Hours</th>
                            <th style={{ padding: '16px', fontSize: 11, color: COLORS.muted, textTransform: 'uppercase' }}>Total</th>
                            <th style={{ padding: '16px', fontSize: 11, color: COLORS.muted, textTransform: 'uppercase' }}>Status</th>
                         </tr>
                      </thead>
                      <tbody>
                         {filtered.map((entry, idx) => (
                            <tr key={entry.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                               <td style={{ padding: '16px', fontSize: 14, fontWeight: 800 }}>{entry.worker_name}</td>
                               <td style={{ padding: '16px', fontSize: 13 }}>{entry.task}</td>
                               <td style={{ padding: '16px', fontSize: 13 }}>{entry.hours_worked ? `${entry.hours_worked}h` : '--'}</td>
                               <td style={{ padding: '16px', fontSize: 14, fontWeight: 800 }}>{fmt(entry.total_cost)}</td>
                               <td style={{ padding: '16px' }}>
                                 <span style={{ 
                                   fontSize: 9, fontWeight: 900, padding: '4px 8px', borderRadius: 4,
                                   background: entry.status === 'approved' ? 'var(--status-success-glow)' : 'var(--status-warning-glow)',
                                   color: entry.status === 'approved' ? 'var(--status-success)' : 'var(--status-warning)'
                                 }}>
                                   {(entry.status || 'approved').toUpperCase()}
                                 </span>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
           )}

           {activeTab === 'performance' && (
             <div className="animate-fade-in card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24 }}>Top Performing Workforce</h3>
                <div className="grid-12" style={{ gap: 16 }}>
                   <div className="col-4" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                         <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>D</div>
                         <span style={{ fontSize: 15, fontWeight: 800 }}>Devon Smith</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--status-success)', marginTop: 8 }}>Efficiency: 96%</div>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'ai' && (
             <div className="animate-fade-in card" style={{ padding: '32px', border: '1px solid rgba(139, 92, 246, 0.2)', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(5, 5, 5, 1) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                   <Sparkles size={18} color="#a78bfa" />
                   <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>AI Workforce Recommendations</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   {aiRecommendations.map((rec, i) => (
                      <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 10, fontWeight: 900, color: COLORS.muted, textTransform: 'uppercase' }}>{rec.type}</span>
                            <span style={{ fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 4, background: `${rec.color}15`, color: rec.color }}>{rec.severity}</span>
                         </div>
                         <p style={{ fontSize: 12, color: 'var(--text-primary)', margin: 0 }}>{rec.text}</p>
                      </div>
                   ))}
                </div>
             </div>
           )}

        </main>
      </div>

      {/* LOG LABOR MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: 540, padding: '40px', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>Log Workforce Labor</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 32 }}>Capture employee hours and task completion records.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="form-group">
                  <label className="label-small" style={{ display: 'block', marginBottom: 8 }}>Worker Name</label>
                  <input 
                    className="form-input" 
                    placeholder="e.g. Devon Smith"
                    value={form.worker_name}
                    onChange={e => setForm({...form, worker_name: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="label-small" style={{ display: 'block', marginBottom: 8 }}>Work Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={form.date}
                    onChange={e => setForm({...form, date: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label-small" style={{ display: 'block', marginBottom: 8 }}>Task Description</label>
                <input 
                  className="form-input" 
                  placeholder="e.g. Tomato Harvesting - Plot B"
                  value={form.task}
                  onChange={e => setForm({...form, task: e.target.value})}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="label-small" style={{ display: 'block', marginBottom: 8 }}>Hours</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="8"
                    value={form.hours}
                    onChange={e => setForm({...form, hours: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="label-small" style={{ display: 'block', marginBottom: 8 }}>Rate (TTD/hr)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="35"
                    value={form.rate}
                    onChange={e => setForm({...form, rate: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="label-small" style={{ display: 'block', marginBottom: 8 }}>Segment</label>
                  <select 
                    className="form-input"
                    value={form.segment_id}
                    onChange={e => setForm({...form, segment_id: e.target.value})}
                  >
                    {SAMPLE_SEGMENTS.map(s => <option key={s.id} value={s.id}>{s.name.split('/')[0]}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="label-small" style={{ display: 'block', marginBottom: 8 }}>Notes (Optional)</label>
                <textarea 
                  className="form-input" 
                  placeholder="Additional operational context..."
                  style={{ minHeight: 80, resize: 'none', padding: 12 }}
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                />
              </div>

              <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  {currentUser.role === 'admin' ? 'Record Labor' : 'Submit for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .card {
          background: var(--bg-card);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-soft);
          border-radius: 24px;
        }
        .form-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-soft);
          border-radius: 12px;
          padding: 10px 16px;
          color: var(--text-primary);
          font-size: 13px;
          outline: none;
          transition: all 0.2s;
        }
        .form-input:focus {
          border-color: var(--status-success);
          background: rgba(255,255,255,0.05);
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
        }
        .btn-secondary {
          background: var(--bg-card-elevated);
          color: var(--text-primary);
          border: 1px solid var(--border-soft);
          border-radius: 12px;
          padding: 10px 20px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
        }
        .label-small {
          font-size: 9px;
          font-weight: 900;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

import React from 'react';

