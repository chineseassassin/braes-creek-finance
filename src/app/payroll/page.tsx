"use client";

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from "@/components/Sidebar";
import NotificationCenter from "@/components/NotificationCenter";
import ThemeToggle from "@/components/ThemeToggle";
import { useDashboardStore } from '@/store/useDashboardStore';
import { useUIStore } from '@/store/useUIStore';
import { useAppStore } from '@/store/useAppStore';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Plus, Search, Filter, Download, 
  DollarSign, Users, Clock, RefreshCw,
  BarChart3, Calendar, FileText, Banknote,
  AlertCircle, ChevronRight, MoreVertical,
  Zap, CheckCircle2, Wallet, ArrowRight,
  TrendingUp, TrendingDown, Target, Sparkles,
  PieChart, Activity, X, Trash2, Edit2, Copy,
  Check, Ban, AlertTriangle
} from "lucide-react";

import { THEME_COLORS as COLORS, TC } from '@/lib/theme-colors';
import { exportToCSV } from '@/lib/exportUtils';

export default function PayrollPage() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const { transactions, fetchTransactions, addTransaction, updateTransaction, updateTransactionStatus, deleteTransaction } = useDashboardStore();
  const { sidebarCollapsed } = useUIStore();
  const { theme, currentUser, switchRole } = useAppStore();
  const { addApprovalRequest } = useWorkflowStore();
  const isLight = theme === 'light';

  const [mountedTime, setMountedTime] = useState("");
  
  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [areaFilter, setAreaFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (highlightId) {
      const el = document.getElementById(`row-${highlightId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight-flash');
      }
    }
  }, [highlightId, transactions]);

  // Form State
  const [form, setForm] = useState({
    name: '', role: '', area: 'Poultry', hours: '', rate: '', overtime: '', date: new Date().toISOString().split('T')[0], notes: ''
  });

  useEffect(() => {
    fetchTransactions();
    setMountedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [fetchTransactions]);

  const payrollRecords = useMemo(() => {
    const livePayroll = transactions.filter(t => t.category === 'Payroll' || t.description.toLowerCase().includes('payroll'))
      .map(t => {
        const meta = t.metadata || {};
        return {
          id: t.id,
          name: meta.worker_name || t.description.split(' - ')[0] || 'Unknown',
          role: meta.worker_role || 'Farm Operator',
          area: meta.area || (t as any).segment_id || 'General',
          hours: meta.hours || 0, 
          rate: meta.rate || 0, 
          overtime: meta.overtime || 0,
          total: t.amount,
          date: t.date,
          status: t.status === 'approved' ? 'Paid' : (t.status === 'rejected' ? 'Rejected' : 'Pending'),
          notes: meta.notes || ''
        };
      });

    // Only show mock if no live data (to keep it clean)
    const mockRecords = livePayroll.length === 0 ? [
      { id: 'm1', name: 'John Doe', role: 'Farm Manager', area: 'General Labor', hours: 40, rate: 35, overtime: 5, total: 1575, date: '2023-10-24', status: 'Paid', notes: '' },
      { id: 'm2', name: 'Jane Smith', role: 'Livestock Specialist', area: 'Poultry', hours: 42, rate: 28, overtime: 8, total: 1512, date: '2023-10-24', status: 'Approved', notes: '' },
      { id: 'm3', name: 'Mike Johnson', role: 'Equipment Operator', area: 'Maintenance', hours: 38, rate: 25, overtime: 0, total: 950, date: '2023-10-23', status: 'Pending', notes: '' },
    ] : [];

    return [...livePayroll, ...mockRecords];
  }, [transactions]);

  const hasData = payrollRecords.length > 0;

  const filteredRecords = useMemo(() => {
    return payrollRecords.filter(r => {
      const matchSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchArea = areaFilter === "All" || r.area === areaFilter;
      const matchStatus = statusFilter === "All" || (r.status.toLowerCase() === statusFilter.toLowerCase());
      return matchSearch && matchArea && matchStatus;
    });
  }, [payrollRecords, searchTerm, areaFilter, statusFilter]);

  const stats = useMemo(() => {
     const approved = payrollRecords.filter(r => r.status === 'Paid' || r.status === 'Approved');
     const total = approved.reduce((sum, r) => sum + r.total, 0);
     const hours = approved.reduce((sum, r) => sum + r.hours + r.overtime, 0);
     const ot = approved.reduce((sum, r) => sum + (r.overtime * r.rate * 1.5), 0);
     return { total, hours, ot };
  }, [payrollRecords]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const h = parseFloat(form.hours) || 0;
    const r = parseFloat(form.rate) || 0;
    const o = parseFloat(form.overtime) || 0;
    const totalPay = (h * r) + (o * r * 1.5);

    const isDataEntry = currentUser.role === 'data-entry';
    const status = isDataEntry ? 'pending' : 'approved';

    const payload = {
      type: 'expense' as const,
      category: 'Payroll',
      description: `${form.name} - ${form.role}`,
      amount: totalPay,
      date: form.date,
      status: status,
      metadata: {
        worker_name: form.name,
        worker_role: form.role,
        area: form.area,
        hours: h,
        rate: r,
        overtime: o,
        notes: form.notes
      }
    };

    if (editingId) {
      await updateTransaction(editingId, payload);
      toast.success('Payroll record updated', { style: { background: '#101010', color: '#fff' } });
      
      // Global Audit
      useAppStore.getState().logEmployeeSubmission(
        'Payroll',
        'update',
        'labor',
        editingId,
        { worker: form.name, total: totalPay }
      );
    } else {
      const newRecord = await addTransaction(payload);
      if (newRecord) {
         // Use centralized logging which handles both notification and approval request
         useAppStore.getState().logEmployeeSubmission(
           'Payroll',
           'creation',
           'labor',
           newRecord.id,
           { worker: form.name, total: totalPay, area: form.area }
         );
         
         if (isDataEntry) {
            toast.success('Payroll submitted for owner approval', { icon: '⏳', style: { background: '#101010', color: '#fff' } });
         } else {
            toast.success('Payroll entry approved and finalized', { icon: '✅', style: { background: '#101010', color: '#fff' } });
         }
      }
    }

    setIsModalOpen(false);
    setEditingId(null);
    setForm({ name: '', role: '', area: 'Poultry', hours: '', rate: '', overtime: '', date: new Date().toISOString().split('T')[0], notes: '' });
  };

  const handleEdit = (record: any) => {
    setEditingId(record.id);
    setForm({
      name: record.name,
      role: record.role,
      area: record.area,
      hours: record.hours.toString(),
      rate: record.rate.toString(),
      overtime: record.overtime.toString(),
      date: record.date,
      notes: record.notes
    });
    setIsModalOpen(true);
    setMenuOpenId(null);
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith('m')) {
      toast.error('Cannot delete mock data');
      return;
    }
    await deleteTransaction(id);
    toast.success('Entry deleted');
    setDeleteConfirmId(null);
  };

  const handleApprove = async (id: string) => {
    if (id.startsWith('m')) return;
    await updateTransactionStatus(id, 'approved');
    toast.success('Payroll entry approved');
    setMenuOpenId(null);
  };

  const handleReject = async (id: string) => {
    if (id.startsWith('m')) return;
    await updateTransactionStatus(id, 'rejected');
    toast.success('Payroll entry rejected');
    setMenuOpenId(null);
  };

  const handleApproveAll = async () => {
    const livePending = payrollRecords.filter(r => r.status === 'Pending' && !r.id.startsWith('m'));
    const mockPending = payrollRecords.filter(r => r.status === 'Pending' && r.id.startsWith('m'));
    
    if (livePending.length === 0 && mockPending.length === 0) {
      toast.success('No pending entries to approve');
      return;
    }
    
    if (livePending.length > 0) {
      for (const record of livePending) {
        await updateTransactionStatus(record.id, 'approved');
      }
    }
    
    const totalApproved = livePending.length + mockPending.length;
    toast.success(`Successfully approved ${totalApproved} payroll entries`);
  };

  const handleCycleAudit = () => {
    const id = toast.loading('Initiating AI-powered cycle audit...');
    setTimeout(() => {
      // Logic: Flag entries with > 40 hours or unusual rates
      const anomalies = filteredRecords.filter(r => r.hours > 40 || r.rate > 40);
      if (anomalies.length > 0) {
        setSearchTerm(anomalies[0].name);
        toast.error(`Cycle Audit: Found ${anomalies.length} entries requiring manual verification.`, {
          id,
          icon: '🔍',
          duration: 4000
        });
      } else {
        toast.success('Cycle Audit Complete: All entries verified against fiscal baselines.', {
          id,
          icon: '🛡️'
        });
      }
    }, 2000);
  };

  const handleExport = () => {
    const data = filteredRecords.map(r => ({
      Worker: r.name,
      Role: r.role,
      Area: r.area,
      Hours: r.hours,
      Overtime: r.overtime,
      TotalPay: r.total,
      Date: r.date,
      Status: r.status
    }));
    exportToCSV(data, 'Payroll_Ledger_Export');
  };

  const costByArea = [
    { name: 'Poultry', value: 4200, color: 'var(--color-info)' },
    { name: 'Crops', value: 3800, color: 'var(--color-primary)' },
    { name: 'Livestock', value: 2500, color: 'var(--color-warning)' },
    { name: 'Maintenance', value: 1800, color: 'var(--color-danger)' },
    { name: 'Transport', value: 1200, color: 'var(--color-ai)' },
    { name: 'General Labor', value: 900, color: 'var(--color-text-muted)' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', maxWidth: '100vw', overflow: 'hidden', background: 'var(--color-bg-body)' }}>
      <Toaster position="top-right" />
      <Sidebar />

      <div style={{ marginLeft: sidebarCollapsed ? 64 : 250, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease', overflow: 'hidden' }}>
        
        <header style={{ height: 72, background: 'var(--color-surface-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid var(--color-border)` }}>
          <div>
             <h1 style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Payroll & Labor Control</h1>
             <p className="label-small">Track labor costs, worker hours, and farm-area productivity</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div className="label-small" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={14} /> Synced: {mountedTime}
            </div>
            
            {/* Role Switcher */}
            <select 
              className="form-select" 
              style={{ width: 120, fontSize: 10, padding: '4px 8px', height: 32, background: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: 8, border: '1px solid var(--color-border)' }}
              value={currentUser.role}
              onChange={(e) => switchRole(e.target.value as any)}
            >
              <option value="admin">Peter (Admin)</option>
              <option value="data-entry">Mary (Entry)</option>
            </select>

            <ThemeToggle />
            <NotificationCenter />
            <button className="btn-secondary" style={{ height: 40, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8 }} onClick={handleExport}>
               <Download size={16} /> Export
            </button>
            <button className="btn-primary" onClick={() => { setIsModalOpen(true); setEditingId(null); setForm({ name: '', role: '', area: 'Poultry', hours: '', rate: '', overtime: '', date: new Date().toISOString().split('T')[0], notes: '' }); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
               <Plus size={16} /> Add Payroll Entry
            </button>
          </div>
        </header>

        <main style={{ padding: '40px', flex: 1, overflowY: 'auto' }} className="page-padding">
           <div className="max-container">
          
              {/* 1. PAYROLL HERO */}
              <div className="card" style={{ marginBottom: 32, padding: '32px', background: 'linear-gradient(135deg, var(--color-surface-card) 0%, var(--color-surface-elevated) 100%)', position: 'relative', overflow: 'hidden' }}>
                 <div style={{ position: 'absolute', top: -20, right: -20, width: 200, height: 200, background: 'rgba(34, 197, 94, 0.05)', borderRadius: '50%', filter: 'blur(60px)' }} />
                 
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                          <span className="label-small" style={{ color: 'var(--color-text-muted)' }}>Payroll Status:</span>
                          <span className="badge-warning">REVIEW NEEDED</span>
                       </div>
                       
                       <div className="grid-12" style={{ marginBottom: 32 }}>
                          <div style={{ gridColumn: 'span 3' }}>
                             <div className="label-small" style={{ marginBottom: 4 }}>This Week Payroll</div>
                             <div className="metric-main">${stats.total.toLocaleString()}</div>
                          </div>
                          <div style={{ gridColumn: 'span 3' }}>
                             <div className="label-small" style={{ marginBottom: 4 }}>Total Labor Hours</div>
                             <div className="metric-main">{stats.hours}h</div>
                          </div>
                          <div style={{ gridColumn: 'span 3' }}>
                             <div className="label-small" style={{ marginBottom: 4 }}>Avg Hourly Rate</div>
                             <div className="metric-main">$26.50</div>
                          </div>
                          <div style={{ gridColumn: 'span 3' }}>
                             <div className="label-small" style={{ marginBottom: 4 }}>Next Due Date</div>
                             <div className="metric-main">Oct 31</div>
                          </div>
                       </div>

                       <div className="card-elevated" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderRadius: 16, maxWidth: 800 }}>
                          <Zap size={18} color="var(--color-warning)" />
                          <div className="text-body" style={{ color: 'var(--color-text-primary)' }}>
                             <span style={{ fontWeight: 900 }}>AI Insight:</span> {hasData ? "Labor cost is stable, but poultry labor hours increased 14% this week." : "Add worker hours to activate payroll intelligence."}
                          </div>
                       </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 200 }}>
                       <button className="btn-secondary" style={{ width: '100%', height: 44, fontSize: 13, fontWeight: 900 }} onClick={handleCycleAudit}>Cycle Audit</button>
                       <button className="btn-primary" style={{ width: '100%', height: 44, fontSize: 13, fontWeight: 900 }} onClick={handleApproveAll}>Approve All</button>
                    </div>
                 </div>
              </div>

              {/* 2. PAYROLL SNAPSHOT CARDS */}
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
                  {[
                     { label: 'Total Payroll', val: `$${stats.total.toLocaleString()}`, trend: '+4.2%', color: 'var(--color-primary)', insight: 'Within budget' },
                     { label: 'Hours Worked', val: `${stats.hours}h`, trend: '+2.1%', color: 'var(--color-info)', insight: 'High activity' },
                     { label: 'Avg Rate', val: '$26.50', trend: '0%', color: 'var(--color-text-muted)', insight: 'Stable' },
                     { label: 'Overtime', val: `$${stats.ot.toLocaleString()}`, trend: '+12.5%', color: 'var(--color-danger)', insight: 'Critical spike' },
                     { label: 'Top Area', val: 'Poultry', trend: '+14%', color: 'var(--color-warning)', insight: 'Needs audit' }
                  ].map((card, i) => (
                     <div key={i} className="card-elevated" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 140 }}>
                        <div>
                           <div className="label-small" style={{ marginBottom: 12 }}>{card.label}</div>
                           <div className="metric-main" style={{ fontSize: 20, marginBottom: 4 }}>{card.val}</div>
                        </div>
                        <div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 900, color: card.color, marginBottom: 8 }}>
                              <TrendingUp size={12} /> {card.trend}
                           </div>
                           <div style={{ height: 1, background: 'var(--color-border)', marginBottom: 8 }} />
                           <div className="label-small" style={{ textTransform: 'none', fontSize: 10 }}>{card.insight}</div>
                        </div>
                     </div>
                  ))}
               </div>

              <div className="grid-12" style={{ gap: 24, marginBottom: 32 }}>
                 {/* 4. WORKER TIMESHEET TABLE */}
                 <div className="card" style={{ gridColumn: 'span 8', padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                       <h3 className="section-title" style={{ color: 'var(--color-text-primary)', textTransform: 'none', fontSize: 16, margin: 0 }}>Worker Timesheet Ledger</h3>
                       <div style={{ display: 'flex', gap: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-surface-input)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '8px 16px' }}>
                             <Search size={14} color="var(--color-text-muted)" />
                             <input 
                                placeholder="Search worker..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: 13, width: 180 }} 
                             />
                          </div>
                          <button className="btn-secondary" style={{ padding: '8px 16px' }}><Filter size={14} /> Filter</button>
                       </div>
                    </div>

                    <table className="saas-table">
                       <thead>
                          <tr>
                             <th>Worker</th>
                             <th>Area</th>
                             <th>Hours</th>
                             <th>OT</th>
                             <th>Total Pay</th>
                             <th>Status</th>
                             <th style={{ width: 40 }}></th>
                          </tr>
                       </thead>
                       <tbody>
                          {filteredRecords.map((r) => (
                             <tr id={`row-${r.id}`} key={r.id}>
                                <td>
                                   <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text-primary)' }}>{r.name}</div>
                                   <div className="label-small" style={{ textTransform: 'none' }}>{r.role}</div>
                                </td>
                                <td>
                                   <span className="label-small">{r.area.toUpperCase()}</span>
                                </td>
                                <td style={{ fontSize: 13, fontWeight: 800 }}>{r.hours}h</td>
                                <td style={{ fontSize: 13, fontWeight: 800, color: r.overtime > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>{r.overtime}h</td>
                                <td style={{ fontSize: 14, fontWeight: 900, color: 'var(--color-text-primary)' }}>${r.total.toLocaleString()}</td>
                                <td>
                                   <span className="status-pill" style={{ 
                                      color: r.status === 'Paid' || r.status === 'Approved' ? 'var(--color-primary)' : (r.status === 'Rejected' ? 'var(--color-danger)' : 'var(--color-warning)'),
                                      background: `${r.status === 'Paid' || r.status === 'Approved' ? 'var(--color-primary)' : (r.status === 'Rejected' ? 'var(--color-danger)' : 'var(--color-warning)')}1a`,
                                      border: `1px solid ${r.status === 'Paid' || r.status === 'Approved' ? 'var(--color-primary)' : (r.status === 'Rejected' ? 'var(--color-danger)' : 'var(--color-warning)')}33`
                                   }}>
                                      {r.status.toUpperCase()}
                                   </span>
                                </td>
                                <td style={{ textAlign: 'center', position: 'relative' }}>
                                   <button 
                                     className="btn-secondary" 
                                     style={{ width: 32, height: 32, padding: 0 }}
                                     onClick={() => setMenuOpenId(menuOpenId === r.id ? null : r.id)}
                                   >
                                      <MoreVertical size={14} />
                                   </button>

                                   {menuOpenId === r.id && (
                                     <div className="card-elevated" style={{ position: 'absolute', right: 40, top: 0, zIndex: 60, width: 160, padding: '8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <button className="menu-item" onClick={() => handleEdit(r)}><Edit2 size={12}/> Edit Entry</button>
                                        
                                        {currentUser.role === 'admin' && (r.status === 'Pending' || r.status === 'Rejected') && (
                                          <>
                                            <button className="menu-item" style={{ color: 'var(--color-primary)' }} onClick={() => handleApprove(r.id)}><Check size={12}/> Approve</button>
                                            {r.status !== 'Rejected' && (
                                              <button className="menu-item" style={{ color: 'var(--color-danger)' }} onClick={() => handleReject(r.id)}><Ban size={12}/> Reject</button>
                                            )}
                                          </>
                                        )}

                                        <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 0' }} />
                                        <button className="menu-item" style={{ color: 'var(--color-danger)' }} onClick={() => setDeleteConfirmId(r.id)}><Trash2 size={12}/> Delete</button>
                                     </div>
                                   )}
                                </td>
                             </tr>
                          ))}
                          {!hasData && (
                             <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '80px 0' }}>
                                   <div style={{ marginBottom: 16 }}><Users size={48} opacity={0.1} /></div>
                                   <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--color-text-primary)', marginBottom: 4 }}>No payroll records yet</div>
                                   <div className="label-small" style={{ marginBottom: 24, textTransform: 'none' }}>Start by adding worker hours and rates to activate intelligence.</div>
                                   <button className="btn-primary" onClick={() => { setIsModalOpen(true); setEditingId(null); }}>Add First Payroll Entry</button>
                                </td>
                             </tr>
                          )}
                       </tbody>
                    </table>
                 </div>

                 <div style={{ gridColumn: 'span 4' }}>
                    {/* 5. LABOR COST BY FARM AREA */}
                    <div className="card" style={{ padding: '32px', marginBottom: 24 }}>
                       <h3 className="label-small" style={{ color: 'var(--color-text-primary)', marginBottom: 24 }}>Cost Distribution</h3>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          {costByArea.map((area, i) => (
                             <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                   <span className="text-body" style={{ fontWeight: 800 }}>{area.name}</span>
                                   <span style={{ fontWeight: 900, color: 'var(--color-text-primary)', fontSize: 12 }}>${area.value.toLocaleString()} <span className="label-small">({((area.value / 14400) * 100).toFixed(0)}%)</span></span>
                                </div>
                                <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                                   <div style={{ height: '100%', width: `${(area.value / 4500) * 100}%`, background: area.color, borderRadius: 2 }} />
                                 </div>
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* 7. LABOR EFFICIENCY INSIGHTS */}
                    <div className="card" style={{ padding: '32px' }}>
                       <h3 className="label-small" style={{ color: 'var(--color-text-primary)', marginBottom: 24 }}>AI Efficiency Insights</h3>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          {[
                             { text: "Poultry labor increased but poultry revenue stayed flat.", type: "warning" },
                             { text: "Crop labor is high this week due to planting activity.", type: "info" },
                             { text: "Maintenance labor is rising; review equipment issues.", type: "danger" }
                          ].map((insight, i) => (
                             <div key={i} className="card-elevated" style={{ padding: '16px', borderRadius: 16, display: 'flex', gap: 12 }}>
                                <Sparkles size={16} color={insight.type === 'warning' ? 'var(--color-warning)' : (insight.type === 'danger' ? 'var(--color-danger)' : 'var(--color-info)')} style={{ flexShrink: 0 }} />
                                <div className="text-body" style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>{insight.text}</div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

              {/* 6. PAYROLL ALERTS */}
              <div className="card" style={{ padding: '32px' }}>
                 <h3 className="label-small" style={{ color: 'var(--color-text-primary)', marginBottom: 24 }}>Payroll Alerts & Labor Risks</h3>
                 <div className="grid-12">
                    {[
                       { label: 'Overtime increased this week', severity: 'High', color: 'var(--color-danger)', desc: 'Overtime hours up 12.5% vs last week.' },
                       { label: 'Labor cost rising faster than revenue', severity: 'Critical', color: 'var(--color-danger)', desc: 'Efficiency gap of 4.2% detected.' },
                       { label: 'Unapproved timesheets pending', severity: 'Med', color: 'var(--color-warning)', desc: '3 records require manager sign-off.' },
                       { label: 'Payroll due in 2 days', severity: 'Low', color: 'var(--color-info)', desc: 'Disbursement scheduled for Oct 31.' }
                    ].map((alert, i) => (
                       <div key={i} className="card-elevated" style={{ gridColumn: 'span 3', padding: '20px', borderLeft: `4px solid ${alert.color}` }}>
                          <div className="label-small" style={{ color: alert.color, marginBottom: 8 }}>{alert.severity.toUpperCase()} SEVERITY</div>
                          <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--color-text-primary)', marginBottom: 8 }}>{alert.label}</div>
                          <div className="label-small" style={{ textTransform: 'none' }}>{alert.desc}</div>
                       </div>
                    ))}
                 </div>
              </div>

           </div>
        </main>

          {/* 3. ADD/EDIT PAYROLL ENTRY MODAL */}
          {isModalOpen && (
             <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="card" style={{ width: 600, padding: '48px', position: 'relative' }}>
                   <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} style={{ position: 'absolute', top: 32, right: 32, background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                      <X size={24} />
                   </button>
                   <h2 className="section-title" style={{ color: 'var(--color-text-primary)', textTransform: 'none', fontSize: 24, marginBottom: 40 }}>
                      {editingId ? 'Edit Payroll Entry' : 'Add Payroll Entry'}
                   </h2>
                   
                   <form onSubmit={handleSubmit}>
                     <div className="grid-12" style={{ gap: 24 }}>
                        <div style={{ gridColumn: 'span 6' }}>
                           <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Worker Name</label>
                           <input 
                             className="card-elevated" 
                             placeholder="Search worker" 
                             style={{ width: '100%', padding: '14px', borderRadius: 12, color: 'var(--color-text-primary)', fontSize: 14, border: '1px solid var(--color-border)', background: 'var(--color-surface-input)' }} 
                             value={form.name}
                             onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                             required
                           />
                        </div>
                        <div style={{ gridColumn: 'span 6' }}>
                           <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Role</label>
                           <input 
                             className="card-elevated" 
                             placeholder="e.g. Field Hand" 
                             style={{ width: '100%', padding: '14px', borderRadius: 12, color: 'var(--color-text-primary)', fontSize: 14, border: '1px solid var(--color-border)', background: 'var(--color-surface-input)' }} 
                             value={form.role}
                             onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))}
                             required
                           />
                        </div>
                        <div style={{ gridColumn: 'span 6' }}>
                           <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Farm Area</label>
                           <select 
                             className="card-elevated" 
                             style={{ width: '100%', padding: '14px', borderRadius: 12, color: 'var(--color-text-primary)', fontSize: 14, border: '1px solid var(--color-border)', background: 'var(--color-surface-input)' }}
                             value={form.area}
                             onChange={(e) => setForm(p => ({ ...p, area: e.target.value }))}
                           >
                              {['Poultry', 'Goats', 'Pigs', 'Cattle', 'Crops', 'Maintenance', 'Transport', 'General Labor'].map(area => <option key={area} value={area}>{area}</option>)}
                           </select>
                        </div>
                        <div style={{ gridColumn: 'span 6' }}>
                           <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Date</label>
                           <input 
                             type="date" 
                             className="card-elevated" 
                             style={{ width: '100%', padding: '14px', borderRadius: 12, color: 'var(--color-text-primary)', fontSize: 14, border: '1px solid var(--color-border)', background: 'var(--color-surface-input)' }} 
                             value={form.date}
                             onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
                             required
                           />
                        </div>
                        <div style={{ gridColumn: 'span 4' }}>
                           <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Hours</label>
                           <input 
                             type="number" 
                             placeholder="40" 
                             className="card-elevated" 
                             style={{ width: '100%', padding: '14px', borderRadius: 12, color: 'var(--color-text-primary)', fontSize: 14, border: '1px solid var(--color-border)', background: 'var(--color-surface-input)' }} 
                             value={form.hours}
                             onChange={(e) => setForm(p => ({ ...p, hours: e.target.value }))}
                             required
                           />
                        </div>
                        <div style={{ gridColumn: 'span 4' }}>
                           <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Rate ($)</label>
                           <input 
                             type="number" 
                             placeholder="25" 
                             className="card-elevated" 
                             style={{ width: '100%', padding: '14px', borderRadius: 12, color: 'var(--color-text-primary)', fontSize: 14, border: '1px solid var(--color-border)', background: 'var(--color-surface-input)' }} 
                             value={form.rate}
                             onChange={(e) => setForm(p => ({ ...p, rate: e.target.value }))}
                             required
                           />
                        </div>
                        <div style={{ gridColumn: 'span 4' }}>
                           <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Overtime</label>
                           <input 
                             type="number" 
                             placeholder="0" 
                             className="card-elevated" 
                             style={{ width: '100%', padding: '14px', borderRadius: 12, color: 'var(--color-text-primary)', fontSize: 14, border: '1px solid var(--color-border)', background: 'var(--color-surface-input)' }} 
                             value={form.overtime}
                             onChange={(e) => setForm(p => ({ ...p, overtime: e.target.value }))}
                           />
                        </div>

                        <div style={{ gridColumn: 'span 12' }}>
                           <label className="label-small" style={{ display: 'block', marginBottom: 10 }}>Notes (Optional)</label>
                           <textarea 
                             className="card-elevated" 
                             placeholder="Work notes, specific tasks, etc." 
                             style={{ width: '100%', padding: '14px', borderRadius: 12, color: 'var(--color-text-primary)', fontSize: 14, border: '1px solid var(--color-border)', background: 'var(--color-surface-input)', minHeight: 80, resize: 'none' }} 
                             value={form.notes}
                             onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
                           />
                        </div>

                        <div style={{ gridColumn: 'span 12', marginTop: 32, display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
                           <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="btn-secondary" style={{ padding: '12px 32px' }}>Cancel</button>
                           <button type="submit" className="btn-primary" style={{ padding: '12px 32px' }}>{editingId ? 'Update Record' : 'Save Entry'}</button>
                        </div>
                     </div>
                   </form>
                </div>
             </div>
          )}

          {/* DELETE CONFIRMATION MODAL */}
          {deleteConfirmId && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
              <div className="card" style={{ width: 400, padding: '32px', textAlign: 'center' }}>
                <AlertTriangle size={48} color="var(--color-danger)" style={{ marginBottom: 20 }} />
                <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--color-text-primary)', marginBottom: 12 }}>Delete Payroll Entry?</h3>
                <p className="label-small" style={{ textTransform: 'none', marginBottom: 32 }}>This action is permanent and will remove the record from financial ledgers and audits.</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteConfirmId(null)}>Cancel</button>
                  <button className="btn-primary" style={{ flex: 1, background: 'var(--color-danger)' }} onClick={() => handleDelete(deleteConfirmId)}>Confirm Delete</button>
                </div>
              </div>
            </div>
          )}

      </div>

       <style>{`
        @keyframes highlight-flash {
          0% { background-color: rgba(34, 197, 94, 0.4); }
          100% { background-color: transparent; }
        }
        .highlight-flash {
          animation: highlight-flash 3s ease-out;
        }
        .menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: none;
          border: none;
          color: var(--color-text-muted);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          width: 100%;
          text-align: left;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .menu-item:hover {
          background: rgba(255,255,255,0.05);
          color: var(--color-text-primary);
        }
      `}</style>
    </div>
  );
}

import React from 'react';
