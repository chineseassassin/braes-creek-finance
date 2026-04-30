"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from "@/components/Sidebar";
import NotificationCenter from "@/components/NotificationCenter";
import ThemeToggle from "@/components/ThemeToggle";
import { useDashboardStore } from '@/store/useDashboardStore';
import { useUIStore } from '@/store/useUIStore';
import { useAlertStore } from '@/store/useAlertStore';
import {
  MoreVertical, Edit2, Copy, Trash2, X, Download, Tag, CheckSquare, Square, Activity,
  Sparkles, TrendingUp, TrendingDown, Target, Info, ShieldCheck, Zap,
  Search, Plus, Calendar, RefreshCw, PieChart as PieIcon, Filter, BarChart3, CreditCard, AlertCircle,
  FileText
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, LineChart, Line
} from 'recharts';

// Mock Data for charts
const flowData = [
  { n: 'W1', in: 4000, out: 2400, profit: 1600 },
  { n: 'W2', in: 3000, out: 1398, profit: 1602 },
  { n: 'W3', in: 2000, out: 9800, profit: -7800 },
  { n: 'W4', in: 2780, out: 3908, profit: -1128 },
  { n: 'W5', in: 1890, out: 4800, profit: -2910 },
  { n: 'W6', in: 2390, out: 3800, profit: -1410 },
  { n: 'W7', in: 3490, out: 4300, profit: -810 },
];

const expCategoryData = [
  { name: 'Feed', value: 4000 },
  { name: 'Labor', value: 3000 },
  { name: 'Equip', value: 2000 },
  { name: 'Vet', value: 2780 },
  { name: 'Other', value: 1890 },
];

const COLORS = ['#39C86A', '#6EE7B7', '#059669', '#10B981', '#047857'];

// Mock initial local transactions if store is empty
const defaultMocks = [
  { id: '1', date: new Date().toISOString().split('T')[0], type: 'income', category: 'Crops', description: 'Grain sale', amount: 8400 },
  { id: '2', date: new Date().toISOString().split('T')[0], type: 'expense', category: 'Feed', description: 'Monthly feed supply', amount: 2100 },
  { id: '3', date: '2023-10-15', type: 'expense', category: 'Labor', description: 'Contractor payment', amount: 1500 },
  { id: '4', date: '2023-10-10', type: 'income', category: 'Livestock', description: 'Auction proceeds', amount: 12500 },
];

export default function FinancePage() {
  const { transactions: storeTransactions, fetchTransactions } = useDashboardStore();
  const { sidebarCollapsed } = useUIStore();
  
  const [mountedTime, setMountedTime] = useState("");
  const [timeFilter, setTimeFilter] = useState("This Month");
  
  // Local transaction state to allow instant additions without backend dependency
  const [localTx, setLocalTx] = useState<any[]>([]);
  const { getFinancialHealthScore, getRiskBrief, evaluateSystemHealth, fetchAlerts } = useAlertStore();

  useEffect(() => {
    fetchTransactions();
    fetchAlerts();
    setMountedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [fetchTransactions, fetchAlerts]);

  // SYSTEM LOGIC: Evaluate health when transactions change
  useEffect(() => {
    if (localTx.length > 0) {
      evaluateSystemHealth(localTx);
    }
  }, [localTx, evaluateSystemHealth]);

  const healthScore = getFinancialHealthScore(localTx);
  const healthColor = healthScore > 80 ? '#39C86A' : (healthScore > 50 ? '#f59e0b' : '#ef4444');
  const aiBrief = getRiskBrief();

  useEffect(() => {
    if (storeTransactions && storeTransactions.length > 0) {
      setLocalTx(storeTransactions);
    } else {
      setLocalTx(defaultMocks);
    }
  }, [storeTransactions]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income'|'expense'>('expense');
  const [formData, setFormData] = useState({ amount: '', category: 'Feed', description: '', date: new Date().toISOString().split('T')[0] });

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Derived filtered data
  const filteredTx = useMemo(() => {
    return localTx.filter(t => {
      const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === "All" || t.type === filterType.toLowerCase();
      // timeFilter logic mock
      let matchTime = true;
      if (timeFilter === 'Last 7 Days') {
        // mock logic
      }
      return matchSearch && matchType && matchTime;
    });
  }, [localTx, searchTerm, filterType, timeFilter]);

  // Derived Totals based on Filters
  const totalInc = filteredTx.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExp = filteredTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const netProfit = totalInc - totalExp;

  const hasData = localTx.length > 0;
  const margin = totalInc > 0 ? ((netProfit / totalInc) * 100).toFixed(1) : "0.0";

  // Handlers
  const handleQuickAdd = (e: any) => {
    e.preventDefault();
    const newTx = {
      id: Math.random().toString(),
      type: modalType,
      amount: Number(formData.amount),
      category: formData.category,
      description: formData.description || 'Quick Add Entry',
      date: formData.date
    };
    setLocalTx([newTx, ...localTx]);
    setIsModalOpen(false);
    setFormData({ amount: '', category: 'Feed', description: '', date: new Date().toISOString().split('T')[0] });
  };

  const toggleRowSelect = (id: string) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const handleBulkDelete = () => {
    setLocalTx(localTx.filter(t => !selectedRows.includes(t.id)));
    setSelectedRows([]);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = filteredTx.map(t => [t.date, t.type, t.category, t.description, t.amount].join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "financial_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#141414' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlide {
          from { opacity: 0; transform: translate(-50%, -45%) scale(0.96); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        .animate-stagger-1 { animation: fadeInUp 0.4s ease-out 0.1s forwards; opacity: 0; }
        .animate-stagger-2 { animation: fadeInUp 0.4s ease-out 0.2s forwards; opacity: 0; }
        .animate-stagger-3 { animation: fadeInUp 0.4s ease-out 0.3s forwards; opacity: 0; }
        .animate-stagger-4 { animation: fadeInUp 0.4s ease-out 0.4s forwards; opacity: 0; }
        
        .ledger-row { transition: all 0.2s; border-bottom: 1px solid rgba(255,255,255,0.02); cursor: pointer; }
        .ledger-row:hover, .ledger-row.selected { background: rgba(255,255,255,0.03); }
        .ledger-row:hover { transform: translateX(4px); }
        .ledger-row .row-actions { opacity: 0; transition: opacity 0.2s; display: flex; gap: 8px; justify-content: flex-end; }
        .ledger-row:hover .row-actions { opacity: 1; }

        .insight-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 240px;
          transition: all 0.3s ease;
        }
        .insight-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .health-score-ring {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-input {
          width: 100%; background: #141414; border: 1px solid #333; color: #fff; padding: 12px 16px; border-radius: 8px; font-size: 14px; outline: none; transition: border 0.2s;
        }
        .form-input:focus { border-color: #39C86A; }

        @media (max-width: 1024px) {
          .finance-grid { display: flex !important; flex-direction: column !important; gap: 20px !important; }
          .finance-grid > div { width: 100% !important; margin: 0 !important; }
          .finance-stats-bar { flex-direction: column !important; align-items: flex-start !important; gap: 20px !important; }
          .finance-stats-metrics { width: 100%; justify-content: space-between; }
        }
      `}} />

      <Sidebar />
      <div style={{ marginLeft: sidebarCollapsed ? 64 : 250, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease' }}>
        
        {/* TOP HEADER */}
        <header style={{ height: 72, background: '#141414', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#222222', borderRadius: 24, padding: '10px 18px', width: 280 }}>
            <Search size={16} color="#8a8a8e" />
            <input placeholder="Global search..." style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 13, width: '100%' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {hasData && (
              <Link href="/finance/analytics" style={{ textDecoration: 'none' }}>
                <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, color: '#39C86A' }}>
                  <BarChart3 size={14} /> Profit Intelligence Hub
                </button>
              </Link>
            )}
            {hasData && (
              <Link href="/finance/pl" style={{ textDecoration: 'none' }}>
                <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, color: '#39C86A' }}>
                  <FileText size={14} /> P&L Statement
                </button>
              </Link>
            )}
            {hasData && (
              <div style={{ fontSize: 12, color: '#8a8a8e', display: 'flex', alignItems: 'center', gap: 6 }}>
                <RefreshCw size={14} /> Synced: {mountedTime}
              </div>
            )}
            <ThemeToggle />
            <NotificationCenter />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#222222', padding: '6px 16px 6px 12px', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
               <div className="health-score-ring">
                  <svg width="40" height="40">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="#333" strokeWidth="3" />
                    <circle cx="20" cy="20" r="18" fill="none" stroke={healthColor} strokeWidth="3" strokeDasharray="113.1" strokeDashoffset={113.1 * (1 - healthScore/100)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
                  </svg>
                  <span style={{ position: 'absolute', fontSize: 10, fontWeight: 800, color: '#fff' }}>{healthScore}%</span>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 11, color: '#8a8a8e', fontWeight: 600 }}>FINANCIAL HEALTH</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: healthColor }}>{healthScore > 80 ? 'STABLE' : (healthScore > 50 ? 'CAUTION' : 'AT RISK')}</div>
               </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#222222', padding: '6px 16px 6px 6px', borderRadius: 24 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#39C86A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#141414', fontWeight: 700, fontSize: 14 }}>P</div>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Peter</div>
            </div>
          </div>
        </header>

        <main style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          
          {/* 1. TOP CONTROL BAR */}
          <div className="card animate-stagger-1 finance-stats-bar" style={{ padding: '16px 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {['Last 7 Days', 'This Month', 'Quarter To Date'].map(f => (
                 <button key={f} onClick={() => setTimeFilter(f)} className={`btn-ghost ${timeFilter === f ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: 12, whiteSpace: 'nowrap' }}>
                   {f}
                 </button>
              ))}
              <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><Calendar size={12}/> Custom</button>
            </div>
            
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setModalType('income'); setIsModalOpen(true); }} className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12, color: '#39C86A' }}>+ Income</button>
              <button onClick={() => { setModalType('expense'); setIsModalOpen(true); }} className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12, color: '#ef4444' }}>+ Expense</button>
              <button onClick={() => { setModalType('expense'); setIsModalOpen(true); }} className="btn-primary" style={{ padding: '6px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={14}/> Transaction</button>
            </div>
          </div>

          {/* 4. TRANSACTION TABLE SECTION */}
          <div className="animate-stagger-2">
            {/* TOTALS BAR (Primary Overview) */}
            <div className="card col-12" style={{ padding: '24px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #222' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(57, 200, 106, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <Activity size={20} color="#39C86A" />
                   </div>
                   <div>
                     <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Financial Ledger Activity</div>
                     <div style={{ fontSize: 12, color: '#8a8a8e', marginTop: 2 }}>High-performance input and real-time analysis</div>
                   </div>
                 </div>
                 
                 <div className="finance-stats-metrics" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#8a8a8e', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#39C86A'}}/> Filtered Income</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>${totalInc.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#8a8a8e', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444'}}/> Filtered Expenses</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>${totalExp.toLocaleString()}</div>
                    </div>
                    <div style={{ background: netProfit >= 0 ? 'rgba(57, 200, 106, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '10px 16px', borderRadius: 8, border: `1px solid ${netProfit >= 0 ? 'rgba(57,200,106,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                      <div style={{ fontSize: 11, color: netProfit >= 0 ? '#39C86A' : '#ef4444', marginBottom: 4, fontWeight: 600 }}>Net Position</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: netProfit >= 0 ? '#39C86A' : '#ef4444' }}>${netProfit.toLocaleString()}</div>
                    </div>
                  </div>
              </div>

              {/* AI FINANCIAL INSIGHTS STRIP */}
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
                 <div className="insight-card" style={{ minWidth: 400, borderLeft: `3px solid ${healthColor}` }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${healthColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Sparkles size={16} color={healthColor} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#8a8a8e', fontWeight: 600 }}>SYSTEM BRIEFING</div>
                      <div style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>{aiBrief}</div>
                    </div>
                 </div>
                 <div className="insight-card">
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <TrendingDown size={16} color="#ef4444" />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#8a8a8e', fontWeight: 600 }}>EXPENDITURE</div>
                      <div style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>Feed costs increased 18%</div>
                    </div>
                 </div>
                 <div className="insight-card">
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Zap size={16} color="#3b82f6" />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#8a8a8e', fontWeight: 600 }}>EFFICIENCY</div>
                      <div style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>High yield on grain sales</div>
                    </div>
                 </div>
                 <div className="insight-card">
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <ShieldCheck size={16} color="#f59e0b" />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#8a8a8e', fontWeight: 600 }}>RESERVE</div>
                      <div style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>Liquidity buffer is optimal</div>
                    </div>
                 </div>
              </div>
            </div>

            {/* TRANSACTION TABLE SUB-CARD */}
            <div className="card col-12" style={{ padding: '24px', marginBottom: 24, position: 'relative' }}>
              {/* SMART FILTER FEEDBACK */}
              {(searchTerm || filterType !== "All" || timeFilter !== "This Month") && (
                <div style={{ position: 'absolute', top: -10, left: 24, background: '#39C86A', color: '#141414', fontSize: 10, fontWeight: 800, padding: '2px 10px', borderRadius: 4, zIndex: 10 }}>
                  FILTERED INTELLIGENCE ACTIVE
                </div>
              )}
              
              {/* TOTAL OVERVIEW BAR */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #222' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(57, 200, 106, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <Activity size={20} color="#39C86A" />
                   </div>
                   <div>
                     <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Financial Ledger</div>
                     <div style={{ fontSize: 12, color: '#8a8a8e', marginTop: 2 }}>Real-time transactional audit trail</div>
                   </div>
                 </div>
                 
                 <div className="finance-stats-metrics" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#8a8a8e', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#39C86A'}}/> Period Revenue</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>${totalInc.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#8a8a8e', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444'}}/> Period Outflow</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>${totalExp.toLocaleString()}</div>
                    </div>
                    <div style={{ background: netProfit >= 0 ? 'rgba(57, 200, 106, 0.05)' : 'rgba(239, 68, 68, 0.05)', padding: '10px 20px', borderRadius: 12, border: `1px solid ${netProfit >= 0 ? 'rgba(57,200,106,0.1)' : 'rgba(239,68,68,0.1)'}` }}>
                      <div style={{ fontSize: 10, color: netProfit >= 0 ? '#39C86A' : '#ef4444', marginBottom: 4, fontWeight: 800 }}>SURPLUS / DEFICIT</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: netProfit >= 0 ? '#39C86A' : '#ef4444' }}>${netProfit.toLocaleString()}</div>
                    </div>
                  </div>
              </div>

              {/* FILTER SYSTEM */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#141414', padding: '8px 16px', borderRadius: 8, border: '1px solid #333', width: 320 }}>
                        <Search size={14} color="#8a8a8e" />
                        <input placeholder="Search records, descriptions, tags..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 13, width: '100%' }} />
                      </div>
                      <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ background: '#141414', color: '#fff', border: '1px solid #333', borderRadius: 8, padding: '0 16px', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
                        <option value="All">All Transactions</option>
                        <option value="Income">Revenue Only</option>
                        <option value="Expense">Expenses Only</option>
                      </select>
                      <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}><Filter size={14}/> Intelligence Filter</button>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button onClick={handleExportCSV} className="btn-ghost" style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}><Download size={14}/> Export Intelligence</button>
                    </div>
                  </div>
                </div>
              </div>
            
            {!hasData || filteredTx.length === 0 ? (
               <div style={{ padding: '80px 20px', textAlign: 'center', border: '1px dashed #333', borderRadius: 8, background: '#1a1a1a' }}>
                 <div style={{ fontSize: 16, color: '#fff', fontWeight: 600, marginBottom: 8 }}>No transactions recorded yet</div>
                 <div style={{ fontSize: 13, color: '#8a8a8e', marginBottom: 20 }}>Adjust your filters or add a new transaction to begin analysis.</div>
                 <button onClick={() => { setModalType('expense'); setIsModalOpen(true); }} className="btn-primary" style={{ padding: '8px 20px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8 }}><Plus size={16}/> Add Transaction</button>
               </div>
            ) : (
              <div style={{ border: '1px solid #222', borderRadius: 8, overflow: 'hidden' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#1a1a1a' }}>
                    <tr>
                      <th style={{ width: 40, padding: '12px 16px', textAlign: 'center' }}>
                         <button onClick={() => setSelectedRows(selectedRows.length === filteredTx.length ? [] : filteredTx.map(t=>t.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a8a8e' }}>
                           {selectedRows.length === filteredTx.length ? <CheckSquare size={16} color="#39C86A" /> : <Square size={16} />}
                         </button>
                      </th>
                      <th style={{ cursor: 'pointer', padding: '12px 0', textAlign: 'left', color: '#8a8a8e', fontWeight: 600, fontSize: 11 }}>DATE <span style={{ opacity: 0.5 }}>↓</span></th>
                      <th style={{ cursor: 'pointer', padding: '12px 0', textAlign: 'left', color: '#8a8a8e', fontWeight: 600, fontSize: 11 }}>TYPE</th>
                      <th style={{ cursor: 'pointer', padding: '12px 0', textAlign: 'left', color: '#8a8a8e', fontWeight: 600, fontSize: 11 }}>CATEGORY</th>
                      <th style={{ cursor: 'pointer', padding: '12px 0', textAlign: 'left', color: '#8a8a8e', fontWeight: 600, fontSize: 11 }}>DESCRIPTION</th>
                      <th style={{ textAlign: 'right', cursor: 'pointer', padding: '12px 16px', color: '#8a8a8e', fontWeight: 600, fontSize: 11 }}>AMOUNT <span style={{ opacity: 0.5 }}>↕</span></th>
                      <th style={{ width: 100 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTx.map((t, i) => (
                      <tr key={t.id} className={`ledger-row ${selectedRows.includes(t.id) ? 'selected' : ''}`}>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <button onClick={() => toggleRowSelect(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a8a8e' }}>
                            {selectedRows.includes(t.id) ? <CheckSquare size={16} color="#39C86A" /> : <Square size={16} opacity={0.3} />}
                          </button>
                        </td>
                        <td style={{ padding: '12px 0', fontSize: 12, color: '#fff' }}>{t.date}</td>
                        <td style={{ padding: '12px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                             <span className={t.type === 'income' ? 'badge-green badge' : 'badge-red badge'} style={{ fontSize: 9, padding: '2px 8px', fontWeight: 800 }}>
                                {t.type.toUpperCase()}
                             </span>
                             {Number(t.amount) > 5000 && <AlertCircle size={12} color="#ef4444" title="High value transaction" />}
                          </div>
                        </td>
                        <td style={{ padding: '12px 0', fontSize: 12, color: '#8a8a8e' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                             <Tag size={12} color={t.type === 'income' ? '#39C86A' : '#8a8a8e'} /> 
                             <span style={{ color: t.type === 'income' ? '#39C86A' : '#fff' }}>{t.category || 'Standard'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 0', fontSize: 13, fontWeight: 600, color: '#fff' }}>
                           {t.description || 'Transaction entry'}
                           <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                              <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: '#8a8a8e' }}>{t.id.includes('.') ? 'One-time' : 'Recurring'}</span>
                              {t.amount > 3000 && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>Critical</span>}
                           </div>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: 14, color: t.type === 'income' ? '#39C86A' : '#fff' }}>
                          {t.type === 'income' ? '+' : '-'}${Number(t.amount).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 16px', width: 100 }}>
                           <div className="row-actions">
                             <button style={{ background: 'none', border: 'none', color: '#8a8a8e', cursor: 'pointer', padding: 4 }} title="Edit"><Edit2 size={14}/></button>
                             <button style={{ background: 'none', border: 'none', color: '#8a8a8e', cursor: 'pointer', padding: 4 }} title="Duplicate"><Copy size={14}/></button>
                             <button onClick={() => setLocalTx(localTx.filter(x => x.id !== t.id))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }} title="Delete"><Trash2 size={14}/></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            </div>
          </div>

          {/* 2 & 3. CHARTS SECTION */}
          <div className="animate-stagger-3" style={{ marginBottom: 24 }}>
            <div className="card" style={{ padding: '24px', marginBottom: 24, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                   <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Activity size={16} color="#39C86A" /> Cash Flow Dynamics
                   </div>
                   <div style={{ fontSize: 12, color: '#8a8a8e', marginTop: 4 }}>Real-time mapping of capital velocity</div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ fontSize: 11, color: '#8a8a8e', display: 'flex', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 8, height: 8, background: '#39C86A', borderRadius: 2 }}/> Inflow</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 8, height: 8, background: '#ef4444', borderRadius: 2 }}/> Outflow</div>
                  </div>
                  <select className="btn-ghost" style={{ fontSize: 10, padding: '4px 10px' }}>
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
              </div>
              <div style={{ height: 280 }}>
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={flowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="n" fontSize={11} stroke="#444" axisLine={false} tickLine={false} dy={10} />
                      <YAxis fontSize={11} stroke="#444" axisLine={false} tickLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
                        itemStyle={{ fontSize: 12, fontWeight: 700, padding: '2px 0' }}
                        cursor={{ stroke: '#333', strokeWidth: 1 }}
                      />
                      <Line type="monotone" dataKey="in" stroke="#39C86A" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6, fill: '#39C86A', stroke: '#141414', strokeWidth: 2 }} animationDuration={1500} />
                      <Line type="monotone" dataKey="out" stroke="#ef4444" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6, fill: '#ef4444', stroke: '#141414', strokeWidth: 2 }} animationDuration={1500} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                     <BarChart3 size={48} color="#8a8a8e" />
                     <div style={{ fontSize: 14, color: '#8a8a8e', marginTop: 16 }}>Add transactions to unlock dynamics</div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid-12 finance-grid">
              {/* Expense Categories (Secondary) */}
              <div className="card col-6" style={{ padding: '24px' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Expense Allocation</div>
                <div style={{ height: 220 }}>
                  {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={expCategoryData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }} barSize={12}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={true} vertical={false} />
                        <XAxis type="number" fontSize={11} stroke="#444" axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" fontSize={11} stroke="#444" axisLine={false} tickLine={false} dx={-10} />
                        <RechartsTooltip cursor={{ fill: '#222' }} contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12 }} />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                          {expCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                       <PieIcon size={48} color="#8a8a8e" />
                       <div style={{ fontSize: 13, color: '#8a8a8e', marginTop: 12 }}>Record outflow to map sectors</div>
                    </div>
                  )}
                </div>
              </div>

               {/* Profit Trend (Secondary) */}
               <div className="card col-6" style={{ padding: '24px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                       <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Profitability Velocity</div>
                       <div style={{ fontSize: 12, color: '#8a8a8e', marginTop: 4 }}>Trajectory vs last period</div>
                    </div>
                    <div style={{ background: 'rgba(57, 200, 106, 0.1)', color: '#39C86A', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 20 }}>
                       +14.2% YOY
                    </div>
                 </div>
                 <div style={{ height: 220 }}>
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={flowData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                       <defs>
                         <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#39C86A" stopOpacity={0.4}/>
                           <stop offset="95%" stopColor="#39C86A" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                       <XAxis dataKey="n" fontSize={11} stroke="#444" axisLine={false} tickLine={false} dy={10} />
                       <YAxis fontSize={11} stroke="#444" axisLine={false} tickLine={false} />
                       <RechartsTooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12 }} />
                       <Area type="monotone" dataKey="profit" stroke="#39C86A" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" animationDuration={2000} />
                     </AreaChart>
                   </ResponsiveContainer>
                 </div>
               </div>
            </div>
          </div>

          {/* 5. CASH + FORECAST */}
          <div className="grid-12 finance-grid animate-stagger-4">
            <div className="card col-6" style={{ padding: '24px' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                 <ShieldCheck size={16} color="#39C86A" /> Cash Position Intelligence
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ background: '#141414', padding: '20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#8a8a8e', marginBottom: 4, fontWeight: 700 }}>OPERATING ACCOUNT (27%)</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>$42,850</div>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(57, 200, 106, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <CreditCard color="#39C86A" size={20} />
                    </div>
                  </div>
                  <div style={{ height: 6, background: '#222', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '27%', background: '#39C86A', borderRadius: 10, boxShadow: '0 0 10px rgba(57, 200, 106, 0.4)' }} />
                  </div>
                </div>
                <div style={{ background: '#141414', padding: '20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#8a8a8e', marginBottom: 4, fontWeight: 700 }}>RESERVE CAPITAL (73%)</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>$115,000</div>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <ShieldCheck color="#3b82f6" size={20} />
                    </div>
                  </div>
                  <div style={{ height: 6, background: '#222', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '73%', background: '#3b82f6', borderRadius: 10, boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="card col-6" style={{ padding: '24px' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Liquidity Forecast</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8a8a8e', fontSize: 13 }}>30-Day Expected Inflow</span>
                  <span style={{ color: '#39C86A', fontWeight: 600 }}>${(totalInc * 0.4).toFixed(0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8a8a8e', fontSize: 13 }}>30-Day Expected Outflow</span>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>-${(totalExp * 0.3).toFixed(0)}</span>
                </div>
                <div style={{ height: 1, background: '#333', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Projected Buffer</span>
                  <span style={{ color: '#39C86A', fontWeight: 700, fontSize: 18 }}>${(totalInc * 0.4 - totalExp * 0.3).toFixed(0)}</span>
                </div>
                <div style={{ background: 'rgba(57, 200, 106, 0.05)', padding: '10px 14px', borderRadius: 8, marginTop: 8, fontSize: 11, color: '#8a8a8e' }}>
                  <span style={{ color: '#39C86A', fontWeight: 600 }}>AI Note:</span> Liquidity remains extremely safe for the upcoming quarter based on current burn rate.
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* QUICK ADD MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', animation: 'modalOverlay 0.2s ease-out' }} onClick={() => setIsModalOpen(false)} />
          <div className="card" style={{ position: 'relative', width: 440, padding: 32, animation: 'modalSlide 0.2s ease-out forwards', background: '#1a1a1a', border: '1px solid #333', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#8a8a8e', cursor: 'pointer' }}><X size={20}/></button>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
               <div style={{ width: 12, height: 12, borderRadius: '50%', background: modalType === 'income' ? '#39C86A' : '#ef4444' }} />
               Add {modalType === 'income' ? 'Revenue' : 'Expense'}
            </div>
            <form onSubmit={handleQuickAdd} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#8a8a8e', marginBottom: 8 }}>Amount</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 16, top: 16, color: '#fff', fontSize: 24, fontWeight: 600 }}>$</span>
                  <input autoFocus required type="number" step="0.01" min="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} style={{ width: '100%', background: '#141414', border: '1px solid #333', color: '#fff', padding: '16px 16px 16px 36px', borderRadius: 8, fontSize: 24, fontWeight: 600, outline: 'none', transition: 'border 0.2s' }} placeholder="0.00" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#8a8a8e', marginBottom: 8 }}>Category</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="form-input">
                    <option>Feed</option>
                    <option>Labor</option>
                    <option>Equipment</option>
                    <option>Livestock</option>
                    <option>Crops</option>
                    <option>General</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#8a8a8e', marginBottom: 8 }}>Date</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="form-input" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#8a8a8e', marginBottom: 8 }}>Description (Optional)</label>
                <input type="text" placeholder="e.g. Tractor repair parts" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="form-input" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost" style={{ padding: '10px 20px' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '10px 24px', background: modalType === 'income' ? '#39C86A' : '#ef4444', color: modalType === 'income' ? '#141414' : '#fff' }}>Save Transaction</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
