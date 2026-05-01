'use client'
import { useState, useMemo, useEffect } from 'react'
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
  Paperclip, Info
} from 'lucide-react'
import React from 'react'
import { useDashboardStore } from '@/store/useDashboardStore'
import { useLivestockStore } from '@/store/useLivestockStore'
import { useCropStore } from '@/store/useCropStore'
import { useInfrastructureStore } from '@/store/useInfrastructureStore'
import { useVendorStore } from '@/store/useVendorStore'
import { useAppStore } from '@/store/useAppStore'
import { exportToCSV } from '@/lib/export-utils'
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
]

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('pl')
  const [dateFrom, setDateFrom] = useState('2024-01-01')
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])
  const [isGenerating, setIsGenerating] = useState(false)

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

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="app-shell">
      <Toaster position="top-right" />
      <Sidebar />
      <div className="main-content">
        <Topbar
          title="Reports & Analytics"
          subtitle="Business intelligence and financial reporting"
          actions={
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={handlePrint}>🖨️ Print Report</button>
              <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}><Download size={14} /> Export CSV</button>
              <button className="btn btn-primary btn-sm" onClick={handleExportPDF}><FileText size={14} /> Export PDF</button>
            </div>
          }
        />
        <div className="page-container">
          {/* Report Type Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
            {REPORT_TYPES.map(r => (
              <div
                key={r.id}
                onClick={() => setActiveReport(r.id)}
                style={{
                  background: activeReport === r.id ? 'var(--status-success-glow)' : 'var(--bg-card)',
                  border: `1px solid ${activeReport === r.id ? 'var(--status-success)' : 'var(--border-soft)'}`,
                  borderRadius: 12,
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 4, color: activeReport === r.id ? 'var(--status-success)' : 'var(--text-muted)' }}>{r.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 13, color: activeReport === r.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{r.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{r.desc}</div>
              </div>
            ))}
          </div>

          {/* Date Range Selector */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-body" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ background: 'var(--status-success-glow)', width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-soft)' }}>
                     <Calendar size={20} color="var(--status-success)" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                     <span className="label-small">Report Period</span>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="date" className="saas-input" style={{ width: 150, height: 36 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                        <ArrowRight size={14} color="var(--text-muted)" />
                        <input type="date" className="saas-input" style={{ width: 150, height: 36 }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
                     </div>
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  style={{ height: 44, padding: '0 24px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}
                >
                   {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Activity size={18} />}
                   <span style={{ fontWeight: 850 }}>{isGenerating ? 'Recalculating...' : 'Generate Tactical Report'}</span>
                </button>
                
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div className="label-small" style={{ marginBottom: 4 }}>Source Integration</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--status-success)', boxShadow: '0 0 10px var(--status-success)' }} />
                    Live Approved Data Hub
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* REPORT CONTENT AREA */}
          <div className="animate-fade-in" key={activeReport}>
             {/* P&L Report Content */}
             {activeReport === 'pl' && (
               <>
                 <div className="grid-12" style={{ marginBottom: 24 }}>
                   {[
                     { label: 'Total Revenue', val: filteredData.income, color: 'var(--status-success)', icon: <DollarSign size={20}/> },
                     { label: 'Operating Expenses', val: filteredData.expenses, color: 'var(--status-critical)', icon: <TrendingDown size={20}/> },
                     { label: 'Net Income', val: filteredData.income - filteredData.expenses - filteredData.payroll, color: 'var(--status-info)', icon: <TrendingUp size={20}/> },
                   ].map(item => (
                     <div key={item.label} className="col-4 card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                       <div style={{ width: 48, height: 48, borderRadius: 14, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>{item.icon}</div>
                       <div>
                          <div className="label-small" style={{ marginBottom: 2 }}>{item.label}</div>
                          <div className="metric-main" style={{ color: 'var(--text-primary)', fontSize: 24 }}>{fmt(item.val)}</div>
                       </div>
                     </div>
                   ))}
                 </div>

                 <div className="card" style={{ marginBottom: 24 }}>
                    <div className="card-header"><div className="card-title">Approved Transaction Stream</div></div>
                    <div className="card-body" style={{ padding: 0 }}>
                       <table className="saas-table">
                          <thead>
                             <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th style={{ width: 40 }}></th>
                             </tr>
                          </thead>
                          <tbody>
                             {filteredData.txs.map(t => (
                               <tr key={t.id}>
                                  <td style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{t.date}</td>
                                  <td><span className="badge badge-info" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--status-info)' }}>{t.category.toUpperCase()}</span></td>
                                  <td className="text-body" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t.description}</td>
                                  <td style={{ fontWeight: 800, color: t.type === 'income' ? 'var(--status-success)' : 'var(--status-critical)' }}>
                                     {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                                  </td>
                                  <td>
                                     {t.attachment_url && <Paperclip size={14} color="var(--status-success)" />}
                                  </td>
                               </tr>
                             ))}
                             {filteredData.txs.length === 0 && (
                               <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No approved records found for this period.</td></tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </div>
               </>
             )}

             {/* Placeholder for other reports to keep layout consistent but functional */}
             {activeReport !== 'pl' && (
               <div className="card" style={{ padding: 80, textAlign: 'center' }}>
                  <div style={{ background: 'var(--status-info-glow)', width: 64, height: 64, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--status-info)' }}>
                     {REPORT_TYPES.find(r => r.id === activeReport)?.icon}
                  </div>
                  <h3 className="section-title" style={{ marginBottom: 8 }}>{REPORT_TYPES.find(r => r.id === activeReport)?.label} Analytics Hub</h3>
                  <p className="text-body" style={{ maxWidth: 400, margin: '0 auto 24px' }}>
                     Consolidating {activeReport} data from approved ledgers, operational logs, and system audits for the selected period.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                     <button className="btn btn-secondary" onClick={handleExportCSV}><Download size={14}/> Download Audit Ledger</button>
                     <button className="btn btn-primary" onClick={handleGenerateReport}>Sync Intelligence</button>
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @media print {
          .sidebar, .topbar, .btn, .pulse-dot { display: none !important; }
          .main-content { margin-left: 0 !important; }
          .card { border: 1px solid #ddd !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  )
}

function RefreshCw({ size, className }: { size?: number, className?: string }) {
  return <Clock size={size} className={className} />
}
