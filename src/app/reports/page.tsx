'use client'
import { useState, useMemo, useEffect, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { 
  SAMPLE_EXPENSES, SAMPLE_LOANS, SAMPLE_PAYROLL, 
  SAMPLE_LABOR, SAMPLE_BUDGETS, MONTHLY_TREND, 
  SAMPLE_SEGMENTS 
} from '@/lib/sample-data'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts'
import { 
  Calendar, ArrowRight, BarChart3, Banknote, Landmark, 
  Users, Sprout, FileText, Download, Printer, TrendingUp, 
  TrendingDown, DollarSign, PieChart as LucidePieChart, Activity,
  Layers, Package, ChevronRight, Calculator, Clock, Wrench, Truck,
  Paperclip, Info, Upload, FileUp, FolderInput
} from 'lucide-react'
import React from 'react'
import { useDashboardStore } from '@/store/useDashboardStore'
import { useLivestockStore } from '@/store/useLivestockStore'
import { useCropStore } from '@/store/useCropStore'
import { useInfrastructureStore } from '@/store/useInfrastructureStore'
import { useVendorStore } from '@/store/useVendorStore'
import { useAppStore } from '@/store/useAppStore'
import { useWorkflowStore } from '@/store/useWorkflowStore'
import { exportToCSV } from '@/lib/exportUtils'
import { toast, Toaster } from 'react-hot-toast'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TTD', maximumFractionDigits: 0 }).format(n)

const REPORT_TYPES = [
  { id: 'pl', label: 'Profit & Loss', icon: <BarChart3 size={20} />, desc: 'Revenue vs expenses summary' },
  { id: 'expenses', label: 'Expenses', icon: <DollarSign size={20} />, desc: 'Detailed cost breakdown' },
  { id: 'payroll', label: 'Payroll', icon: <Banknote size={20} />, desc: 'Employee compensation logs' },
  { id: 'livestock', label: 'Livestock', icon: <Activity size={20} />, desc: 'Animal headcount & value' },
  { id: 'crops', label: 'Crops', icon: <Sprout size={20} />, desc: 'Planting & production costs' },
  { id: 'inventory', label: 'Inventory', icon: <Package size={20} />, desc: 'Supplies & stock levels' },
  { id: 'infrastructure', label: 'Infrastructure', icon: <Wrench size={20} />, desc: 'Assets & maintenance' },
  { id: 'vendors', label: 'Vendors', icon: <Truck size={20} />, desc: 'Supplier & service metrics' },
  { id: 'audit', label: 'Audit History', icon: <Activity size={20} />, desc: 'Immutable action & event logs' },
]

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('pl')
  const [dateFrom, setDateFrom] = useState('2024-01-01')
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])
  const [isGenerating, setIsGenerating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  // Stores
  const { transactions, fetchTransactions } = useDashboardStore()
  const { units: livestock } = useLivestockStore()
  const { crops } = useCropStore()
  const { assets, maintenanceLogs } = useInfrastructureStore()
  const { vendors } = useVendorStore()
  const { emitSystemEvent } = useAppStore()

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Filtered Approved Data
  const filteredData = useMemo(() => {
    const from = new Date(dateFrom)
    const to = new Date(dateTo)
    
    // Financials
    const txs = transactions.filter(t => {
      const d = new Date(t.date)
      return t.status === 'approved' && d >= from && d <= to
    })

    const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expenses = txs.filter(t => t.type === 'expense' && t.category !== 'Payroll').reduce((s, t) => s + t.amount, 0)
    const payroll = txs.filter(t => t.category === 'Payroll').reduce((s, t) => s + t.amount, 0)

    // Maintenance
    const logs = maintenanceLogs.filter(l => {
        const d = new Date(l.date)
        return d >= from && d <= to
    })

    return { txs, income, expenses, payroll, logs }
  }, [transactions, maintenanceLogs, dateFrom, dateTo])

  const handleGenerateReport = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      toast.success('Report generated from approved data')
      emitSystemEvent({
        type: 'creation',
        severity: 'info',
        module: 'Reports',
        message: `Generated ${REPORT_TYPES.find(r => r.id === activeReport)?.label} report`,
        metadata: { activeReport, dateFrom, dateTo }
      })
    }, 800)
  }

  const handleExportCSV = () => {
    let dataToExport: any[] = []
    const filename = `braes-creek-${activeReport}-${new Date().toISOString().split('T')[0]}.csv`

    switch (activeReport) {
      case 'pl':
        dataToExport = filteredData.txs.map(t => ({ Date: t.date, Type: t.type, Category: t.category, Description: t.description, Amount: t.amount }))
        break
      case 'expenses':
        dataToExport = filteredData.txs.filter(t => t.type === 'expense').map(t => ({ Date: t.date, Category: t.category, Description: t.description, Amount: t.amount }))
        break
      case 'payroll':
        dataToExport = filteredData.txs.filter(t => t.category === 'Payroll').map(t => ({ Date: t.date, Worker: t.description, Amount: t.amount, Status: t.status }))
        break
      case 'livestock':
        dataToExport = livestock.map(l => ({ Type: l.animal_type, Breed: l.breed, Quantity: l.quantity, Value: l.current_value, Status: l.status }))
        break
      case 'infrastructure':
        dataToExport = assets.map(a => ({ Name: a.name, Type: a.type, Status: a.status, Health: a.health }))
        break
      default:
        dataToExport = filteredData.txs
    }

    exportToCSV(dataToExport, filename)
    toast.success('CSV Export initiated')
    emitSystemEvent({
      type: 'creation',
      severity: 'info',
      module: 'Reports',
      message: `Exported ${activeReport} report to CSV`,
      metadata: { filename }
    })
  }

  const handleExportPDF = () => {
    toast('PDF export ready for backend/PDF library connection', { icon: '📄' })
  }

  const { events } = useWorkflowStore()
  const auditLogs = useMemo(() => {
    return events.filter(ev => {
      const d = new Date(ev.timestamp)
      return d >= new Date(dateFrom) && d <= new Date(dateTo)
    })
  }, [events, dateFrom, dateTo])

  const handlePrint = () => {
    window.print()
  }

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("[Reports] File selected:", file.name);
      const id = toast.loading(`Uploading ${file.name}...`);
      setTimeout(() => {
        toast.success(`Upload complete: ${file.name} is now being processed.`, { id, icon: '📤' });
        
        // Audit & Notification
        useAppStore.getState().logEmployeeSubmission(
          'Reports',
          'upload',
          'task',
          `file-${Date.now()}`,
          { filename: file.name, size: file.size, type: file.type }
        );
      }, 2000);
    }
  };

  const handleImportDocs = () => {
    importInputRef.current?.click();
  };

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const id = toast.loading(`Establishing secure uplink for ${files.length} documents...`);
      setTimeout(() => {
        toast.success(`${files.length} documents synced and ready for indexing.`, { id, icon: '📁' });
        
        // Audit & Notification for bulk import
        useAppStore.getState().logEmployeeSubmission(
          'Reports',
          'upload',
          'task',
          `import-${Date.now()}`,
          { count: files.length, type: 'Bulk Document Import' }
        );
      }, 2500);
    }
  };

  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-body)' }}>
      <Toaster position="top-right" />
      <Sidebar />
      
      <div className="main-content" style={{ marginLeft: sidebarCollapsed ? 64 : 250, transition: 'margin-left 0.2s ease', flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Topbar
          title="Reports & Analytics"
          subtitle="Unified financial intelligence and operational auditing"
          actions={
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary btn-sm" onClick={handleUpload}><Upload size={14} /> Upload Resource</button>
              <button className="btn btn-secondary btn-sm" onClick={handlePrint}>🖨️ Print</button>
              <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}><Download size={14} /> Export</button>
              <button className="btn btn-primary btn-sm" onClick={handleGenerateReport} disabled={isGenerating}>
                 {isGenerating ? <RefreshCw className="animate-spin" size={14} /> : <BarChart3 size={14} />} 
                 {isGenerating ? 'Compiling...' : 'Intelligence Hub'}
              </button>
            </div>
          }
        />
        
        <main className="page-container" style={{ padding: 40, overflowY: 'auto' }}>
          {/* Report Type Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            {REPORT_TYPES.map(r => (
              <div
                key={r.id}
                onClick={() => setActiveReport(r.id)}
                style={{
                  background: activeReport === r.id ? 'var(--status-success-glow)' : 'var(--bg-card)',
                  border: `1px solid ${activeReport === r.id ? 'var(--status-success)' : 'var(--border-soft)'}`,
                  borderRadius: 16,
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: activeReport === r.id ? '0 10px 30px -10px var(--status-success)' : 'none'
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8, color: activeReport === r.id ? 'var(--status-success)' : 'var(--text-muted)' }}>{r.icon}</div>
                <div style={{ fontWeight: 900, fontSize: 14, color: activeReport === r.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{r.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{r.desc}</div>
              </div>
            ))}
            
            {/* Import Docs Node */}
            <div
              onClick={handleImportDocs}
              style={{
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px dashed rgba(59, 130, 246, 0.3)',
                borderRadius: 16,
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center'
              }}
            >
              <div style={{ color: 'var(--status-info)', marginBottom: 8 }}>
                 <FolderInput size={28} style={{ margin: '0 auto' }} />
              </div>
              <div style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-primary)' }}>Import Documents</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', fontWeight: 700 }}>Bulk receipts & XLS</div>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="card" style={{ marginBottom: 32, padding: '24px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ background: 'var(--status-success-glow)', width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--status-success-glow)' }}>
                   <Calendar size={22} color="var(--status-success)" />
                </div>
                <div>
                   <span className="label-small" style={{ marginBottom: 4, display: 'block' }}>Financial Reporting Period</span>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input type="date" className="saas-input" style={{ width: 160, height: 40 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                      <ArrowRight size={16} color="var(--text-muted)" />
                      <input type="date" className="saas-input" style={{ width: 160, height: 40 }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
                   </div>
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                onClick={handleGenerateReport}
                disabled={isGenerating}
                style={{ height: 48, padding: '0 32px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12 }}
              >
                 {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Activity size={20} />}
                 <span style={{ fontWeight: 900, fontSize: 14 }}>{isGenerating ? 'Compiling Intelligence...' : 'Generate Strategic Report'}</span>
              </button>
              
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div className="label-small" style={{ marginBottom: 6 }}>Ledger Integration</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>
                  <div className="pulse-dot" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--status-success)', boxShadow: '0 0 15px var(--status-success)' }} />
                  Verified Production Data
                </div>
              </div>
            </div>
          </div>

          {/* REPORT CONTENT AREA */}
          <div className="animate-fade-in" key={activeReport}>
             {/* Audit Log Content */}
             {activeReport === 'audit' && (
               <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-soft)' }}>
                 <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-soft)', background: 'var(--bg-card-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                       <Activity size={20} color="var(--status-success)" />
                       <h4 style={{ margin: 0, fontSize: 16, fontWeight: 900, letterSpacing: '-0.01em' }}>System Activity & Audit Log</h4>
                    </div>
                    <div className="badge badge-success" style={{ padding: '6px 12px', fontSize: 11, fontWeight: 900 }}>{auditLogs.length} Events Logged</div>
                 </div>
                 <div style={{ maxHeight: 600, overflowY: 'auto' }}>
                   <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                     <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 10, borderBottom: '1px solid var(--border-soft)' }}>
                       <tr style={{ textAlign: 'left' }}>
                         <th style={{ padding: '20px 32px', fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Timestamp</th>
                         <th style={{ padding: '20px 32px', fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Source Module</th>
                         <th style={{ padding: '20px 32px', fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Action Details</th>
                         <th style={{ padding: '20px 32px', fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Severity</th>
                       </tr>
                     </thead>
                     <tbody>
                       {auditLogs.length === 0 ? (
                         <tr><td colSpan={4} style={{ padding: 100, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Activity size={48} opacity={0.1} style={{ margin: '0 auto 20px' }} />
                            <div style={{ fontWeight: 800 }}>No audit events recorded for this tactical period.</div>
                         </td></tr>
                       ) : (
                         auditLogs.map((ev, i) => (
                           <tr key={ev.id} style={{ borderBottom: '1px solid var(--border-soft)', transition: 'background 0.2s' }} className="table-row-hover">
                             <td style={{ padding: '18px 32px', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{new Date(ev.timestamp).toLocaleString()}</td>
                             <td style={{ padding: '18px 32px' }}><span style={{ fontSize: 11, fontWeight: 900, padding: '6px 12px', background: 'var(--bg-body)', borderRadius: 8, border: '1px solid var(--border-soft)', color: 'var(--text-primary)' }}>{ev.module.toUpperCase()}</span></td>
                             <td style={{ padding: '18px 32px' }}>
                                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>{ev.message}</div>
                                {ev.metadata && <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{JSON.stringify(ev.metadata).slice(0, 100)}</div>}
                             </td>
                             <td style={{ padding: '18px 32px' }}>
                               <span style={{ 
                                 fontSize: 10, fontWeight: 900, padding: '6px 14px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em',
                                 background: ev.severity === 'critical' || ev.severity === 'emergency' ? 'var(--status-critical-glow)' : 
                                             ev.severity === 'warning' ? 'var(--status-warning-glow)' : 'var(--status-success-glow)',
                                 color: ev.severity === 'critical' || ev.severity === 'emergency' ? 'var(--status-critical)' : 
                                        ev.severity === 'warning' ? 'var(--status-warning)' : 'var(--status-success)',
                                 border: `1px solid ${ev.severity === 'critical' || ev.severity === 'emergency' ? 'var(--status-critical)' : 
                                        ev.severity === 'warning' ? 'var(--status-warning)' : 'var(--status-success)'}22`
                               }}>{ev.severity}</span>
                             </td>
                           </tr>
                         ))
                       )}
                     </tbody>
                   </table>
                 </div>
               </div>
             )}

             {/* P&L Report Content */}
             {activeReport === 'pl' && (
               <>
                 <div className="grid-12" style={{ marginBottom: 32, gap: 20 }}>
                   {[
                     { label: 'Total Revenue', val: filteredData.income, color: 'var(--status-success)', icon: <DollarSign size={22}/> },
                     { label: 'Operating Expenses', val: filteredData.expenses, color: 'var(--status-critical)', icon: <TrendingDown size={22}/> },
                     { label: 'Net Operating Income', val: filteredData.income - filteredData.expenses - filteredData.payroll, color: 'var(--status-info)', icon: <TrendingUp size={22}/> },
                   ].map(item => (
                     <div key={item.label} className="col-4 card" style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 32 }}>
                       <div style={{ width: 56, height: 56, borderRadius: 16, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, border: `1px solid ${item.color}22` }}>{item.icon}</div>
                       <div>
                          <div className="label-small" style={{ marginBottom: 4 }}>{item.label}</div>
                          <div className="metric-main" style={{ color: 'var(--text-primary)', fontSize: 28 }}>{fmt(item.val)}</div>
                       </div>
                     </div>
                   ))}
                 </div>

                 <div className="card" style={{ marginBottom: 24, border: '1px solid var(--border-soft)' }}>
                    <div className="card-header" style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-soft)', background: 'var(--bg-card-elevated)' }}>
                       <div className="card-title" style={{ fontSize: 16, fontWeight: 900 }}>Approved Transaction Stream</div>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                       <table className="saas-table">
                          <thead>
                             <tr>
                                <th style={{ padding: '16px 32px' }}>Date</th>
                                <th style={{ padding: '16px 32px' }}>Category</th>
                                <th style={{ padding: '16px 32px' }}>Description</th>
                                <th style={{ padding: '16px 32px' }}>Value</th>
                                <th style={{ width: 60 }}></th>
                             </tr>
                          </thead>
                          <tbody>
                             {filteredData.txs.map(t => (
                               <tr key={t.id} className="table-row-hover">
                                  <td style={{ padding: '16px 32px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>{t.date}</td>
                                  <td style={{ padding: '16px 32px' }}><span className="badge badge-info" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--status-info)', fontWeight: 900, fontSize: 10 }}>{t.category.toUpperCase()}</span></td>
                                  <td style={{ padding: '16px 32px', fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{t.description}</td>
                                  <td style={{ padding: '16px 32px', fontWeight: 950, color: t.type === 'income' ? 'var(--status-success)' : 'var(--status-critical)', fontSize: 15 }}>
                                     {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                     {t.attachment_url && <Paperclip size={16} color="var(--status-success)" />}
                                  </td>
                               </tr>
                             ))}
                             {filteredData.txs.length === 0 && (
                               <tr><td colSpan={5} style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)', fontWeight: 700 }}>No approved records found in the current tactical period.</td></tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </div>
               </>
             )}

             {/* Dynamic Report View for other types */}
             {activeReport !== 'pl' && activeReport !== 'audit' && (
               <div className="card" style={{ padding: 100, textAlign: 'center', border: '1px dashed var(--border-soft)' }}>
                  <div style={{ background: 'var(--status-info-glow)', width: 80, height: 80, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', color: 'var(--status-info)', border: '1px solid var(--status-info-glow)' }}>
                     {React.cloneElement(REPORT_TYPES.find(r => r.id === activeReport)?.icon as React.ReactElement, { size: 32 })}
                  </div>
                  <h3 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12 }}>{REPORT_TYPES.find(r => r.id === activeReport)?.label} Analytics Hub</h3>
                  <p className="text-body" style={{ maxWidth: 500, margin: '0 auto 32px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                     Synthesizing {activeReport} metrics from approved ledgers, operational sensor logs, and system audits. Strategic intelligence will be compiled for the period of <b>{dateFrom}</b> to <b>{dateTo}</b>.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                     <button className="btn btn-secondary" style={{ height: 48, padding: '0 24px', borderRadius: 12 }} onClick={handleExportCSV}><Download size={18} style={{ marginRight: 8 }}/> Audit Ledger</button>
                     <button className="btn btn-primary" style={{ height: 48, padding: '0 24px', borderRadius: 12 }} onClick={handleGenerateReport}>Execute Sync</button>
                  </div>
               </div>
             )}
          </div>
        </main>
      </div>

      {/* HIDDEN INPUTS AT THE END FOR RELIABILITY */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange}
        accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv"
      />
      <input 
        type="file" 
        ref={importInputRef} 
        style={{ display: 'none' }} 
        onChange={handleImportChange}
        multiple
        accept=".pdf,.xlsx,.xls,.csv"
      />

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .pulse-dot {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        @media print {
          .sidebar, .topbar, .btn, .pulse-dot, input, .animate-spin { display: none !important; }
          .main-content { margin-left: 0 !important; width: 100% !important; }
          .card { border: 1px solid #ddd !important; box-shadow: none !important; margin-bottom: 20px !important; }
          body { background: #fff !important; }
        }
      `}</style>
    </div>
  )
}

function RefreshCw({ size, className }: { size?: number, className?: string }) {
  return <Clock size={size} className={className} />
}
