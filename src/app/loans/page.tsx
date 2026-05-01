"use client";

import { useState, useEffect, useMemo } from 'react';
import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationCenter from "@/components/NotificationCenter";
import { useUIStore } from '@/store/useUIStore';
import { supabase } from '@/lib/supabase';
import { 
  Plus, Search, Banknote, Calendar, AlertTriangle, 
  CheckCircle2, ChevronRight, User, Percent, 
  ArrowUpRight, ShieldCheck, Landmark, MoreVertical,
  Activity, ShieldAlert, Zap, Sparkles, Filter, 
  ArrowRight, Landmark as BankIcon, ChevronDown, ChevronUp,
  DollarSign, Clock, Info, ExternalLink, RefreshCw, AlertCircle,
  MessageSquare, Target, TrendingUp, TrendingDown, Skull, ArrowRightLeft
} from "lucide-react";
import React from 'react';
import { THEME_COLORS as COLORS, TC } from '@/lib/theme-colors';


interface Loan {
  id: string;
  lender_name: string;
  amount: number;
  remaining_balance: number;
  interest_rate: number;
  due_date: string;
  status: 'active' | 'paid' | 'overdue';
  loan_type?: string;
  monthly_payment?: number;
}

export default function LoansCommandCenter() {
  const { sidebarCollapsed } = useUIStore();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchLoans = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('loans').select('*').order('due_date', { ascending: true });
    if (!error && data) setLoans(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchLoans(); }, []);

  const metrics = useMemo(() => {
    const activeLoans = loans.filter(l => l.status !== 'paid');
    const totalDebt = activeLoans.reduce((acc, curr) => acc + Number(curr.remaining_balance), 0);
    const monthlyObligation = activeLoans.reduce((acc, curr) => acc + (curr.monthly_payment || 1200), 0);
    const overdueLoans = activeLoans.filter(l => l.status === 'overdue');
    const totalOverdue = overdueLoans.reduce((acc, curr) => acc + Number(curr.remaining_balance), 0);
    const riskScore = overdueLoans.length > 0 ? 85 : (totalDebt > 100000 ? 45 : 12);

    return { totalDebt, monthlyObligation, overdueLoans, totalOverdue, riskScore };
  }, [loans]);

  const sortedLoans = useMemo(() => {
    return [...loans]
      .filter(l => l.status !== 'paid')
      .sort((a, b) => {
        // Priority logic: Overdue first, then high interest
        if (a.status === 'overdue' && b.status !== 'overdue') return -1;
        if (b.status === 'overdue' && a.status !== 'overdue') return 1;
        return b.interest_rate - a.interest_rate;
      });
  }, [loans]);

  const getStatus = (loan: Loan) => {
    if (loan.status === 'overdue') return { label: 'Overdue', color: 'var(--status-critical)' };
    const dueDate = new Date(loan.due_date);
    const today = new Date();
    const diff = (dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
    if (diff < 0) return { label: 'Critical', color: 'var(--status-critical)' };
    if (diff < 7) return { label: 'Upcoming', color: 'var(--status-warning)' };
    return { label: 'Healthy', color: 'var(--status-success)' };
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-body)' }}>
      <Sidebar />

      <div style={{ marginLeft: sidebarCollapsed ? 64 : 250, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease', overflow: 'hidden' }}>
        <header style={{ height: 72, background: 'var(--color-bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${COLORS.border}` }}>
          <div>
             <h1 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Debt Command Center</h1>
             <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>Autonomous liability tracking and optimization engine</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ThemeToggle />
            <NotificationCenter />
            <button className="btn-primary" style={{ height: 40, padding: '0 20px' }}><Plus size={16} /> NEW FACILITY</button>
          </div>
        </header>

        <main style={{ padding: '32px 40px', flex: 1, overflowY: 'auto' }}>
           
           {/* 1. TOP RISK BANNER (IF APPLICABLE) */}
           {metrics.overdueLoans.length > 0 && (
             <div className="animate-alert-entrance" style={{ marginBottom: 32, padding: '16px 24px', background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)', border: '1px solid rgba(239, 68, 68, 0.6)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 0 40px rgba(239, 68, 68, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                   <div style={{ background: 'var(--status-critical)', color: 'var(--text-inverse)', padding: '6px 12px', borderRadius: 6, fontWeight: 950, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>CRITICAL BREACH</div>
                   <div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 2 }}>{metrics.overdueLoans.length} Loans Past Due</div>
                      <div style={{ fontSize: 13, color: 'var(--status-critical)', fontWeight: 700 }}>Accumulating late fees of $42/day. Immediate verification of {metrics.overdueLoans[0].lender_name} required.</div>
                   </div>
                </div>
                <button className="btn-resolve-hover" style={{ background: TC.danger, color: TC.textInverse, border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 900, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                   RESOLVE NOW <ArrowRight size={16} />
                </button>
             </div>
           )}

           {/* 2. AI DEBT COMMAND PANEL */}
           <div className="card-elevated" style={{ marginBottom: 40, padding: '32px 40px', background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at top right, rgba(34, 197, 94, 0.05), transparent 60%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                 <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--status-success-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--status-success-glow)' }}>
                    <BrainCircuit size={20} color='var(--status-success)' />
                 </div>
                 <div>
                    <h3 style={{ fontSize: 16, fontWeight: 950, color: 'var(--text-primary)', margin: 0 }}>Debt Intelligence Strategy</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Real-time audit of liability structures and market rates</p>
                 </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 48 }}>
                 <div style={{ borderRight: `1px solid ${COLORS.border}`, paddingRight: 48 }}>
                    <div className="label-small" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><MessageSquare size={12}/> <span>What is happening</span></div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                       {metrics.overdueLoans.length > 0 
                         ? `Credit rating at risk. ${metrics.overdueLoans.length} accounts are currently non-compliant with standard repayment terms.`
                         : "Capital structure is stable. Interest rates are locked and no immediate default threats detected."}
                    </div>
                 </div>
                 <div style={{ borderRight: `1px solid ${COLORS.border}`, paddingRight: 48 }}>
                    <div className="label-small" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Target size={12}/> <span>Why it matters</span></div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                       {metrics.overdueLoans.length > 0
                         ? "Late fees are eroding operating margins. Continuous delinquency will trigger asset seizure protocols on equipment liens."
                         : "Low debt-to-equity ratio provides $45k in untapped borrowing capacity for the upcoming planting season."}
                    </div>
                 </div>
                 <div>
                    <div className="label-small" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={12}/> <span>What to do next</span></div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                       {metrics.overdueLoans.length > 0
                         ? `Prioritize $${metrics.totalOverdue.toLocaleString()} injection into ${metrics.overdueLoans[0].lender_name} to stabilize credit score.`
                         : "Refinance Equipment Loan B with Tier 1 lender to reduce annual interest by an estimated $2,400."}
                    </div>
                 </div>
              </div>
           </div>

           {/* 3. UPCOMING PAYMENTS TIMELINE */}
           <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                 <h3 style={{ fontSize: 14, fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Obligation Timeline</h3>
                 <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700 }}>PROJECTED 30-DAY OUTLOOK</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                 {[
                   { label: 'DUE TODAY', count: metrics.overdueLoans.length, color: 'var(--status-critical)', desc: 'Immediate attention' },
                   { label: 'NEXT 3 DAYS', count: 1, color: COLORS.warning, desc: 'Awaiting funds' },
                   { label: 'NEXT 7 DAYS', count: 2, color: COLORS.info, desc: 'Projected cashflow' },
                   { label: 'NEXT 14 DAYS', count: 4, color: COLORS.muted, desc: 'Scheduled' },
                 ].map((step, i) => (
                    <div key={i} className="card-compact" style={{ padding: '20px 24px', border: `1px solid ${step.color}30`, background: `${step.color}05` }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <span style={{ fontSize: 10, fontWeight: 900, color: step.color }}>{step.label}</span>
                          <Clock size={14} color={step.color} />
                       </div>
                       <div style={{ fontSize: 24, fontWeight: 950, color: 'var(--text-primary)', marginBottom: 4 }}>{step.count} <span style={{ fontSize: 13, color: COLORS.muted, fontWeight: 600 }}>Payables</span></div>
                       <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600 }}>{step.desc}</div>
                    </div>
                 ))}
              </div>
           </div>

           {/* 4. KPI CARDS + PRIORITY PANEL */}
           <div className="grid-12" style={{ gap: 24, marginBottom: 40 }}>
              
              <div className="col-9">
                 <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '24px 32px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <h3 style={{ fontSize: 14, fontWeight: 900, margin: 0 }}>Strategic Liability Ledger</h3>
                       <div style={{ display: 'flex', gap: 12 }}>
                          <button className="btn-secondary"><Filter size={14} /> Filter</button>
                          <button className="btn-secondary"><RefreshCw size={14} /> Audit</button>
                       </div>
                    </div>
                    <table className="loan-table">
                       <thead>
                          <tr>
                             <th>Liability Source</th>
                             <th>Remaining Balance</th>
                             <th>Interest</th>
                             <th>Monthly</th>
                             <th>Status</th>
                             <th style={{ textAlign: 'right' }}>Actions</th>
                          </tr>
                       </thead>
                       <tbody>
                          {sortedLoans.map(loan => {
                             const status = getStatus(loan);
                             const isExpanded = expandedRow === loan.id;
                             return (
                               <React.Fragment key={loan.id}>
                                  <tr className={isExpanded ? 'active' : ''} style={{ borderLeft: loan.status === 'overdue' ? `4px solid ${COLORS.danger}` : '4px solid transparent' }}>
                                     <td>
                                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 14 }}>{loan.lender_name}</div>
                                        <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600 }}>Infrastructure Credit Line</div>
                                     </td>
                                     <td style={{ fontWeight: 800, fontSize: 15 }}>${loan.remaining_balance.toLocaleString()}</td>
                                     <td style={{ fontWeight: 700, color: loan.interest_rate > 10 ? 'var(--status-critical)' : 'var(--text-primary)' }}>{loan.interest_rate}%</td>
                                     <td style={{ color: COLORS.muted }}>${(loan.monthly_payment || 1200).toLocaleString()}</td>
                                     <td>
                                        <div style={{ 
                                          display: 'flex', alignItems: 'center', gap: 6, 
                                          background: `${status.color}15`, color: status.color, 
                                          padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 950,
                                          width: 'fit-content'
                                        }}>
                                           <div style={{ width: 6, height: 6, borderRadius: '50%', background: status.color }} />
                                           {status.label.toUpperCase()}
                                        </div>
                                     </td>
                                     <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                           <button className="btn-table" style={{ background: COLORS.success, color: '#050505', border: 'none', fontWeight: 900 }}>Pay Now</button>
                                           <button className="btn-table" onClick={() => setExpandedRow(isExpanded ? null : loan.id)}>
                                              {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                           </button>
                                        </div>
                                     </td>
                                  </tr>
                                  {isExpanded && (
                                    <tr>
                                       <td colSpan={6} style={{ background: 'var(--bg-card-elevated)', padding: '32px' }}>
                                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
                                             <div>
                                                <div className="label-small" style={{ marginBottom: 12 }}>AMORTIZATION</div>
                                                <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>24 Payments Remaining</div>
                                                <div style={{ fontSize: 12, color: COLORS.muted }}>Ends June 2026</div>
                                             </div>
                                             <div>
                                                <div className="label-small" style={{ marginBottom: 12 }}>COST AUDIT</div>
                                                <div style={{ fontSize: 13, color: 'var(--status-critical)', fontWeight: 800 }}>$12,400 Projected Interest</div>
                                                <div style={{ fontSize: 12, color: COLORS.muted }}>No early payoff penalty</div>
                                             </div>
                                             <div>
                                                <div className="label-small" style={{ marginBottom: 12 }}>CONSEQUENCE INSIGHT</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--status-critical)' }}>
                                                   <Skull size={14} />
                                                   <span style={{ fontSize: 12, fontWeight: 700 }}>Default Risk: Medium</span>
                                                </div>
                                                <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>Failure to pay within 15 days will trigger lien notification.</div>
                                             </div>
                                             <div style={{ background: 'var(--bg-card-elevated)', padding: 16, borderRadius: 12, border: '1px solid var(--border-soft)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                   <Sparkles size={14} color='var(--status-success)' />
                                                   <span style={{ fontSize: 10, fontWeight: 950, color: 'var(--status-success)' }}>STRATEGY</span>
                                                </div>
                                                <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4 }}>Transfer to Lower Rate Facility A to save $140/mo.</div>
                                             </div>
                                          </div>
                                       </td>
                                    </tr>
                                  )}
                               </React.Fragment>
                             )
                          })}
                       </tbody>
                    </table>
                 </div>
              </div>

              <div className="col-3">
                 <div className="card" style={{ padding: '24px', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                       <Target size={18} color={COLORS.success} />
                       <h3 style={{ fontSize: 14, fontWeight: 900, color: TC.textPrimary, margin: 0 }}>Smart Payment Priority</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                       {sortedLoans.slice(0, 4).map((loan, i) => (
                          <div key={loan.id} style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 16, borderBottom: i !== 3 ? `1px solid ${COLORS.border}` : 'none' }}>
                             <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-card-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: COLORS.muted }}>{i + 1}</div>
                             <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{loan.lender_name}</div>
                                <div style={{ fontSize: 11, color: loan.status === 'overdue' ? COLORS.danger : COLORS.muted, fontWeight: 600 }}>
                                   {loan.status === 'overdue' ? 'URGENT: OVERDUE' : `Due in ${Math.round((new Date(loan.due_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} Days`}
                                </div>
                             </div>
                             <ArrowRight size={14} color={COLORS.muted} />
                          </div>
                       ))}
                    </div>
                    <button style={{ width: '100%', marginTop: 24, background: 'rgba(255,255,255,0.05)', border: `1px solid ${COLORS.border}`, color: 'var(--text-primary)', padding: '12px', borderRadius: 8, fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>VIEW FULL STRATEGY</button>
                 </div>
              </div>

           </div>

        </main>
      </div>

      <style jsx>{`
        .card-elevated {
          background: var(--bg-card-elevated);
          border: 1px solid var(--border-soft);
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        .card-compact {
          background: var(--bg-card);
          border: 1px solid var(--border-soft);
          border-radius: 16px;
          transition: all 0.3s ease;
        }
        .card-compact:hover {
          background: rgba(255, 255, 255, 0.04);
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.15);
        }
        .card {
          background: var(--bg-card);
          border: 1px solid var(--border-soft);
          border-radius: 20px;
        }
        .loan-table { width: 100%; border-collapse: collapse; }
        .loan-table th { text-align: left; font-size: 10px; color: var(--text-muted); text-transform: uppercase; padding: 20px 32px; border-bottom: 1px solid var(--border-soft); letter-spacing: 0.1em; }
        .loan-table td { padding: 24px 32px; font-size: 14px; color: var(--text-primary); border-bottom: 1px solid var(--border-soft); vertical-align: middle; }
        .loan-table tr:hover { background: var(--bg-card-elevated); }
        .loan-table tr.active { background: var(--status-success-glow); }
        .btn-table { background: var(--bg-card-elevated); border: 1px solid var(--border-soft); border-radius: 8px; padding: 6px 12px; color: var(--text-primary); font-size: 11px; cursor: pointer; transition: all 0.2s; }
        .btn-table:hover { background: var(--border-soft); }
        .btn-primary { background: var(--status-success); color: var(--text-inverse); border: none; border-radius: 12px; padding: 8px 20px; font-weight: 950; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 0 20px var(--status-success-glow); }
        .btn-secondary { background: var(--button-secondary-bg); color: var(--button-secondary-text); border: 1px solid var(--border-soft); border-radius: 10px; padding: 6px 14px; font-weight: 800; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .label-small { font-size: 9px; font-weight: 950; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.15em; }
        .animate-alert-entrance {
          animation: slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .btn-resolve-hover:hover {
           box-shadow: 0 0 30px rgba(239, 68, 68, 0.4);
           transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}

import { BrainCircuit } from 'lucide-react';
