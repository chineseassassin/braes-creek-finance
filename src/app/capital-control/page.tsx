"use client";

import { useState, useEffect, useMemo } from 'react';
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import RightPanel from "@/components/RightPanel";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationCenter from "@/components/NotificationCenter";
import { useUIStore } from '@/store/useUIStore';
import { supabase } from '@/lib/supabase';
import { 
  Plus, Search, Banknote, Calendar, AlertTriangle, 
  CheckCircle2, ChevronRight, User, Percent, 
  ArrowRight, ArrowUpRight, ShieldCheck, 
  RefreshCw, Filter, Sparkles, Zap, 
  TrendingUp, TrendingDown, ArrowRightLeft,
  X, Info, Activity, ShieldAlert, MoreVertical,
  Scale, Wallet, Clock, Building2, Landmark, LayoutGrid,
  Tractor, Landmark as BankIcon
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

const COLORS = {
  success: '#39C86A',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  muted: '#8a8a8e',
  border: 'rgba(255, 255, 255, 0.08)',
  accent: '#39C86A'
};

const TABS = [
  { id: 'overview', label: 'Capital Overview', icon: LayoutGrid },
  { id: 'loans',    label: 'Loans & Liabilities', icon: BankIcon },
  { id: 'cash',     label: 'Cash Position',      icon: Wallet },
  { id: 'assets',   label: 'Assets',             icon: Tractor },
  { id: 'risk',     label: 'Liquidity Risk',     icon: ShieldAlert },
  { id: 'ai',       label: 'AI Capital Insights', icon: Sparkles },
];

interface Loan {
  id: string;
  lender_name: string;
  amount: number;
  remaining_balance: number;
  interest_rate: number;
  due_date: string;
  status: 'active' | 'paid' | 'overdue';
  loan_type?: string;
  risk_level?: 'Low' | 'Medium' | 'High';
}

const repaymentTrend = [
  { date: 'Jan', paid: 4500 }, { date: 'Feb', paid: 5200 }, { date: 'Mar', paid: 4800 },
  { date: 'Apr', paid: 6100 }, { date: 'May', paid: 5500 }, { date: 'Jun', paid: 6700 },
];

export default function CapitalControlPage() {
  const { sidebarCollapsed } = useUIStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalType, setModalType] = useState<'loan' | 'lender' | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLoans = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('loans').select('*').order('due_date', { ascending: true });
    if (!error && data) setLoans(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchLoans(); }, []);

  const totalBorrowed = loans.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalBalance = loans.filter(l => l.status !== 'paid').reduce((acc, curr) => acc + Number(curr.remaining_balance), 0);
  const totalRepaid = totalBorrowed - totalBalance;
  const overdueCount = loans.filter(l => l.status === 'overdue').length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-body)' }}>
      <Sidebar />

      <div style={{ marginLeft: sidebarCollapsed ? 64 : 250, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease' }}>
        <header style={{ height: 72, background: 'var(--color-bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${COLORS.border}` }}>
          <div>
             <h1 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>Capital Control</h1>
             <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>Monitor capital, debt exposure, and financial leverage</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ThemeToggle />
            <NotificationCenter />
            <div style={{ display: 'flex', gap: 8 }}>
               <button className="btn-ghost" onClick={() => setModalType('lender')} style={{ fontSize: 12 }}><Building2 size={14} /> Add Lender</button>
               <button className="btn-primary" onClick={() => setModalType('loan')} style={{ fontSize: 12 }}><Plus size={16} /> Register Loan</button>
            </div>
          </div>
        </header>

        <div style={{ padding: '0 32px', background: 'var(--color-bg-body)', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', gap: 32, position: 'sticky', top: 72, zIndex: 40, overflowX: 'auto' }} className="no-scrollbar">
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
                    borderBottom: isActive ? `2px solid ${COLORS.success}` : '2px solid transparent',
                    color: isActive ? COLORS.success : COLORS.muted,
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                >
                   <Icon size={14} /> {tab.label}
                </button>
              )
           })}
        </div>

        <main style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
           
           {activeTab === 'overview' && (
             <div className="animate-fade-in">
                <div className="grid-12" style={{ gap: 16, marginBottom: 32 }}>
                   <div className="col-3 card" style={{ padding: '24px' }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 8 }}>Total Borrowed</div>
                      <div style={{ fontSize: 24, fontWeight: 950, color: '#fff' }}>${totalBorrowed.toLocaleString()}</div>
                   </div>
                   <div className="col-3 card" style={{ padding: '24px' }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 8 }}>Outstanding Balance</div>
                      <div style={{ fontSize: 24, fontWeight: 950, color: COLORS.danger }}>${totalBalance.toLocaleString()}</div>
                   </div>
                   <div className="col-3 card" style={{ padding: '24px' }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 8 }}>Total Repaid</div>
                      <div style={{ fontSize: 24, fontWeight: 950, color: COLORS.success }}>${totalRepaid.toLocaleString()}</div>
                   </div>
                   <div className="col-3 card" style={{ padding: '24px' }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 8 }}>Debt Pressure</div>
                      <div style={{ fontSize: 24, fontWeight: 950, color: overdueCount > 0 ? COLORS.danger : COLORS.success }}>{overdueCount > 0 ? 'CRITICAL' : 'STABLE'}</div>
                   </div>
                </div>

                <div className="card" style={{ padding: '32px' }}>
                   <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 24 }}>Repayment Velocity Matrix</h3>
                   <div style={{ height: 250 }}>
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={repaymentTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.muted, fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.muted, fontSize: 11 }} />
                            <RechartsTooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12 }} />
                            <Area type="monotone" dataKey="paid" stroke={COLORS.success} fill={COLORS.success} fillOpacity={0.05} />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'loans' && (
             <div className="animate-fade-in">
                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '8px 16px', width: 350 }}>
                      <Search size={14} color={COLORS.muted} />
                      <input placeholder="Search lenders..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 12, width: '100%' }} />
                   </div>
                </div>
                <div className="grid-12" style={{ gap: 24 }}>
                   {loans.map(loan => (
                      <div key={loan.id} className="col-6 card" style={{ padding: '24px' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                               <Landmark size={20} color={COLORS.success} />
                               <div>
                                  <div style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>{loan.lender_name}</div>
                                  <div style={{ fontSize: 11, color: COLORS.muted }}>{loan.loan_type || 'Infrastructure'}</div>
                               </div>
                            </div>
                            <span style={{ fontSize: 9, fontWeight: 900, padding: '4px 10px', borderRadius: 20, background: loan.status === 'overdue' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(57, 200, 106, 0.1)', color: loan.status === 'overdue' ? COLORS.danger : COLORS.success }}>{loan.status.toUpperCase()}</span>
                         </div>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ fontSize: 12, color: COLORS.muted }}>Principal</span>
                            <span style={{ fontSize: 14, fontWeight: 800 }}>${loan.amount.toLocaleString()}</span>
                         </div>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ fontSize: 12, color: COLORS.muted }}>Remaining</span>
                            <span style={{ fontSize: 14, fontWeight: 900, color: COLORS.danger }}>${loan.remaining_balance.toLocaleString()}</span>
                         </div>
                         <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 16 }}>Next Payment: <span style={{ color: '#fff' }}>{loan.due_date}</span></div>
                      </div>
                   ))}
                </div>
             </div>
           )}

           {activeTab === 'ai' && (
             <div className="animate-fade-in card" style={{ padding: '32px', border: '1px solid rgba(139, 92, 246, 0.2)', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(5, 5, 5, 1) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                   <Sparkles size={18} color="#a78bfa" />
                   <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0 }}>AI Capital Insights</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Refinancing Opportunity Detected</div>
                      <p style={{ fontSize: 12, color: COLORS.muted }}>Interest rates for infrastructure loans have drifted. Consolidating existing high-interest liabilities could save $2,400 monthly.</p>
                   </div>
                   <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Cash-Flow Coverage Alert</div>
                      <p style={{ fontSize: 12, color: COLORS.muted }}>Projected cash-flow for Q3 provides 1.8x coverage of debt obligations. Capital expansion is authorized.</p>
                   </div>
                </div>
             </div>
           )}

        </main>
      </div>

      <style jsx>{`
        .card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
        }
        .btn-primary {
          background: #39C86A;
          color: #050505;
          border: none;
          border-radius: 12px;
          padding: 10px 20px;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
        }
        .btn-ghost {
           background: rgba(255,255,255,0.05);
           border: 1px solid rgba(255,255,255,0.1);
           border-radius: 8px;
           padding: 6px 12px;
           color: #fff;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

import React from 'react';
