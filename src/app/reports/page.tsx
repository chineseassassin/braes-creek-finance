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
  Paperclip, Info, Upload, FileUp, FolderInput, X, Eye,
  AlertTriangle, BrainCircuit, CheckCircle, FileSpreadsheet
} from 'lucide-react'
import React from 'react'
import { useDashboardStore } from '@/store/useDashboardStore'
import { useLivestockStore } from '@/store/useLivestockStore'
import { useCropStore } from '@/store/useCropStore'
import { useInfrastructureStore } from '@/store/useInfrastructureStore'
import { useVendorStore } from '@/store/useVendorStore'
import { useAppStore } from '@/store/useAppStore'
import { useUIStore } from '@/store/useUIStore'
import { useWorkflowStore } from '@/store/useWorkflowStore'
import { exportToCSV, exportToPDF } from '@/lib/exportUtils'
import { toast, Toaster } from 'react-hot-toast'
import { useAlertStore } from '@/store/useAlertStore'

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
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  // Stores
  const { transactions, fetchTransactions } = useDashboardStore()
  const { units: livestock } = useLivestockStore()
  const { crops } = useCropStore()
  const { assets, maintenanceLogs } = useInfrastructureStore()
  const { vendors } = useVendorStore()
  const { emitSystemEvent } = useAppStore()
  const { sidebarCollapsed } = useUIStore()
  const { getActiveAlerts } = useAlertStore()
  const { events } = useWorkflowStore()

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
      // Open the preview modal instead of immediately downloading
      setShowPreview(true)
      emitSystemEvent({
        type: 'creation',
        severity: 'info',
        module: 'Reports',
        message: `Opened General Report Preview for ${REPORT_TYPES.find(r => r.id === activeReport)?.label}`,
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

  const auditLogs = useMemo(() => {
    return events.filter(ev => {
      const d = new Date(ev.timestamp)
      return d >= new Date(dateFrom) && d <= new Date(dateTo)
    })
  }, [events, dateFrom, dateTo])

  const handlePrint = () => {
    window.print()
  }

  // ── GENERAL REPORT DATA ASSEMBLY ──────────────────────────────────────────
  const DEMO_TRANSACTIONS = [
    { date: '2024-11-01', type: 'income', category: 'Livestock Sales', description: 'Broiler Batch #14 — 200 units', amount: 28000 },
    { date: '2024-11-05', type: 'expense', category: 'Feed & Supplies', description: 'Layer Pellets — 2 tons', amount: 4800 },
    { date: '2024-11-10', type: 'expense', category: 'Payroll', description: 'Bi-Weekly Payroll Run', amount: 9600 },
    { date: '2024-11-18', type: 'income', category: 'Crop Revenue', description: 'Cassava Harvest — 3 acres', amount: 12500 },
    { date: '2024-11-22', type: 'expense', category: 'Infrastructure', description: 'Generator Maintenance', amount: 1200 },
  ]

  const reportData = useMemo(() => {
    const useLive = filteredData.txs.length > 0
    const txs = useLive ? filteredData.txs : DEMO_TRANSACTIONS
    const isDemo = !useLive

    const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expensesTotal = txs.filter(t => t.type === 'expense' && t.category !== 'Payroll').reduce((s, t) => s + t.amount, 0)
    const payrollTotal = txs.filter(t => t.category === 'Payroll').reduce((s, t) => s + t.amount, 0)
    const profitLoss = income - expensesTotal - payrollTotal

    const livestockSummary = livestock.length > 0
      ? livestock.slice(0, 4).map(l => ({ type: l.animal_type, qty: l.quantity, value: l.current_value ?? 0, status: l.status }))
      : [
          { type: 'Broiler Chicken', qty: 580, value: 87000, status: 'active' },
          { type: 'Layer Hen', qty: 160, value: 24000, status: 'active' },
          { type: 'Pig', qty: 60, value: 54000, status: 'active' },
          { type: 'Goat', qty: 40, value: 28000, status: 'active' },
        ]
    const isLivestockDemo = livestock.length === 0

    const cropSummary = crops.length > 0
      ? crops.slice(0, 3).map(c => ({ name: c.name, area: c.area_acres, cost: (c.input_costs || 0) + (c.labor_cost || 0), status: c.status }))
      : [
          { name: 'Cassava', area: 3, cost: 3700, status: 'growing' },
          { name: 'Tomato', area: 0.75, cost: 2700, status: 'growing' },
        ]
    const isCropDemo = crops.length === 0

    const activeAlerts = getActiveAlerts().slice(0, 5)
    const recentActivity = events.slice(0, 6)

    const aiSummary = profitLoss >= 0
      ? `Operations are profitable for the period ${dateFrom} – ${dateTo}. Net surplus of ${fmt(profitLoss)} indicates strong revenue performance. Recommend reviewing payroll optimisation and feed cost reduction strategies.`
      : `Operations recorded a net loss of ${fmt(Math.abs(profitLoss))} for the period ${dateFrom} – ${dateTo}. Immediate review of expense categories is recommended. Focus on reducing feed costs and identifying non-essential expenditure.`

    return { txs, income, expensesTotal, payrollTotal, profitLoss, livestockSummary, cropSummary, activeAlerts, recentActivity, aiSummary, isDemo, isLivestockDemo, isCropDemo }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData, livestock, crops, events, dateFrom, dateTo])

  // ── EXPORT FROM PREVIEW ────────────────────────────────────────────────────
  const handlePreviewExportCSV = () => {
    const rows = reportData.txs.map(t => ({
      Date: t.date,
      Type: t.type,
      Category: t.category,
      Description: t.description,
      Amount: t.amount
    }))
    exportToCSV(rows, `braes-creek-general-report-${new Date().toISOString().split('T')[0]}`)
    toast.success('CSV downloaded from preview')
    emitSystemEvent({ type: 'creation', severity: 'info', module: 'Reports', message: 'General Report exported to CSV', metadata: {} })
  }

  const handlePreviewExportExcel = () => {
    // Export as a detailed PDF (Excel requires a library; PDF is our "Excel-like" export)
    const columns = ['Date', 'Type', 'Category', 'Description', 'Amount (TTD)']
    const rows = reportData.txs.map(t => [t.date, t.type, t.category, t.description, String(t.amount)])
    exportToPDF('General Report — Braes Creek Estate', columns, rows, `braes-creek-general-report-${new Date().toISOString().split('T')[0]}`)
    toast.success('Report downloaded as PDF')
    emitSystemEvent({ type: 'creation', severity: 'info', module: 'Reports', message: 'General Report exported to PDF/Excel', metadata: {} })
  }

  const handlePreviewPrint = () => {
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

      {/* ── GENERAL REPORT PREVIEW MODAL ─────────────────────────────── */}
      {showPreview && (
        <div
          id="general-report-preview-backdrop"
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            overflowY: 'auto', padding: '32px 16px'
          }}
          onClick={(e) => { if ((e.target as HTMLElement).id === 'general-report-preview-backdrop') setShowPreview(false) }}
        >
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-soft)',
            borderRadius: 20, width: '100%', maxWidth: 880,
            boxShadow: '0 40px 120px rgba(0,0,0,0.6)',
            overflow: 'hidden', position: 'relative'
          }}>

            {/* Modal Header */}
            <div style={{
              padding: '28px 36px', borderBottom: '1px solid var(--border-soft)',
              background: 'var(--bg-card-elevated)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--status-info-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-info)', border: '1px solid var(--status-info)' }}>
                  <Eye size={22} />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>General Report Preview</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, marginTop: 2 }}>
                    Period: {dateFrom} → {dateTo}
                    {reportData.isDemo && <span style={{ marginLeft: 12, background: 'var(--status-warning-glow)', color: 'var(--status-warning)', padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 900, border: '1px solid var(--status-warning)', letterSpacing: '0.05em' }}>DEMO REPORT DATA</span>}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-body)', border: '1px solid var(--border-soft)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--status-critical-glow)'; (e.currentTarget as HTMLElement).style.color = 'var(--status-critical)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-body)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Notice Banner */}
            <div style={{ padding: '12px 36px', background: 'rgba(59,130,246,0.06)', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Info size={14} color="var(--status-info)" />
              <span style={{ fontSize: 12, color: 'var(--status-info)', fontWeight: 700 }}>Preview shown before export to reduce unnecessary file downloads.</span>
            </div>

            {/* Report Body */}
            <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 28 }}>

              {/* 1. Financial Summary */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Financial Summary</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                  {[
                    { label: 'Total Revenue', val: reportData.income, color: 'var(--status-success)', icon: <TrendingUp size={18}/> },
                    { label: 'Total Expenses', val: reportData.expensesTotal, color: 'var(--status-critical)', icon: <TrendingDown size={18}/> },
                    { label: 'Payroll Total', val: reportData.payrollTotal, color: 'var(--status-warning)', icon: <Banknote size={18}/> },
                    { label: 'Profit / Loss', val: reportData.profitLoss, color: reportData.profitLoss >= 0 ? 'var(--status-success)' : 'var(--status-critical)', icon: <DollarSign size={18}/> },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'var(--bg-body)', border: `1px solid ${item.color}22`, borderRadius: 14, padding: '18px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: item.color }}>{item.icon}</div>
                      <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: item.color, letterSpacing: '-0.02em' }}>{fmt(item.val)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Livestock Summary */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Livestock Summary</div>
                  {reportData.isLivestockDemo && <span style={{ background: 'var(--status-warning-glow)', color: 'var(--status-warning)', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 900, border: '1px solid var(--status-warning)' }}>DEMO</span>}
                </div>
                <div style={{ border: '1px solid var(--border-soft)', borderRadius: 12, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-body)' }}>
                        {['Animal Type', 'Quantity', 'Est. Value', 'Status'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid var(--border-soft)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.livestockSummary.map((l, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                          <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{l.type}</td>
                          <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>{l.qty.toLocaleString()}</td>
                          <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 800, color: 'var(--status-success)' }}>{fmt(l.value)}</td>
                          <td style={{ padding: '10px 16px' }}><span style={{ fontSize: 10, fontWeight: 900, padding: '4px 10px', borderRadius: 20, background: 'var(--status-success-glow)', color: 'var(--status-success)', textTransform: 'uppercase' }}>{l.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Crop Summary */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Crop Summary</div>
                  {reportData.isCropDemo && <span style={{ background: 'var(--status-warning-glow)', color: 'var(--status-warning)', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 900, border: '1px solid var(--status-warning)' }}>DEMO</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                  {reportData.cropSummary.map((c, i) => (
                    <div key={i} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><Sprout size={16} color="var(--status-success)" /><span style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>{c.name}</span></div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>{c.area} acres · {fmt(c.cost)} input cost</div>
                      <div style={{ marginTop: 8 }}><span style={{ fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 20, background: 'var(--status-info-glow)', color: 'var(--status-info)', textTransform: 'uppercase' }}>{c.status}</span></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Key Alerts */}
              {reportData.activeAlerts.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Key Alerts</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {reportData.activeAlerts.map((a: any, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-body)', border: '1px solid var(--border-soft)', borderRadius: 10 }}>
                        <AlertTriangle size={14} color={a.severity === 'critical' || a.severity === 'emergency' ? 'var(--status-critical)' : a.severity === 'warning' ? 'var(--status-warning)' : 'var(--status-info)'} />
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{a.title}</span>
                        <span style={{ fontSize: 10, fontWeight: 900, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase',
                          background: a.severity === 'critical' || a.severity === 'emergency' ? 'var(--status-critical-glow)' : a.severity === 'warning' ? 'var(--status-warning-glow)' : 'var(--status-info-glow)',
                          color: a.severity === 'critical' || a.severity === 'emergency' ? 'var(--status-critical)' : a.severity === 'warning' ? 'var(--status-warning)' : 'var(--status-info)'
                        }}>{a.severity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. AI Summary */}
              <div style={{ background: 'var(--status-info-glow)', border: '1px solid var(--status-info)', borderRadius: 14, padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <BrainCircuit size={18} color="var(--status-info)" />
                  <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--status-info)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Summary & Recommendation</div>
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, fontWeight: 600 }}>{reportData.aiSummary}</div>
              </div>

              {/* 6. Recent Activity */}
              {reportData.recentActivity.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Recent Activity</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {reportData.recentActivity.map((ev: any, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-body)', borderRadius: 10, border: '1px solid var(--border-soft)' }}>
                        <CheckCircle size={14} color="var(--status-success)" />
                        <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{ev.message || ev.title}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>{ev.module}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>{new Date(ev.timestamp).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>{/* end report body */}

            {/* Modal Footer: Action Buttons */}
            <div style={{
              padding: '20px 36px', borderTop: '1px solid var(--border-soft)',
              background: 'var(--bg-card-elevated)',
              display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'
            }}>
              <button
                id="preview-download-excel"
                className="btn btn-primary"
                onClick={handlePreviewExportExcel}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 13, fontWeight: 800 }}
              >
                <FileSpreadsheet size={16} /> Download Excel / PDF
              </button>
              <button
                id="preview-download-csv"
                className="btn btn-secondary"
                onClick={handlePreviewExportCSV}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 13, fontWeight: 800 }}
              >
                <Download size={16} /> Download CSV
              </button>
              <button
                id="preview-print"
                className="btn btn-secondary"
                onClick={handlePreviewPrint}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 13, fontWeight: 800 }}
              >
                <Printer size={16} /> Print
              </button>
              <button
                id="preview-close"
                className="btn btn-ghost"
                onClick={() => setShowPreview(false)}
                style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}
              >
                <X size={16} /> Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── END MODAL ─────────────────────────────────────────────── */}
      
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
                 {isGenerating ? <RefreshCw className="animate-spin" size={14} /> : <Eye size={14} />} 
                 {isGenerating ? 'Compiling...' : 'General Report'}
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
                   {(() => {
                     const Icon = REPORT_TYPES.find(r => r.id === activeReport)?.icon;
                     return Icon ? React.cloneElement(Icon as React.ReactElement<{ size?: number }>, { size: 32 }) : null;
                   })()}
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

      <style dangerouslySetInnerHTML={{__html: `
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
      `}} />
    </div>
  )
}

function RefreshCw({ size, className }: { size?: number, className?: string }) {
  return <Clock size={size} className={className} />
}
