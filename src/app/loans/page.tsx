"use client";

import { useState, useMemo } from 'react';
import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationCenter from "@/components/NotificationCenter";
import { useUIStore } from '@/store/useUIStore';
import { useAppStore } from '@/store/useAppStore';
import { useLoanStore } from '@/store/useLoanStore';
import { 
  Plus, Search, Filter, TrendingUp, TrendingDown, 
  ShieldCheck, AlertTriangle, Clock, MoreVertical,
  Activity, Zap, Info, ChevronRight, Scale,
  Wallet, Landmark, Receipt, Sparkles, X, Download
} from "lucide-react";
import { toast, Toaster } from 'react-hot-toast';
import { exportToCSV } from '@/lib/exportUtils';

import { THEME_COLORS as COLORS, TC } from '@/lib/theme-colors';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TTD', maximumFractionDigits: 0 }).format(n);

export default function DebtLoanCommandCenter() {
  const { sidebarCollapsed } = useUIStore();
  const { theme, currentUser } = useAppStore();
  const { loans, addLoan } = useLoanStore();
  const isLight = theme === 'light';
  
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  // Form State for New Loan
  const [form, setForm] = useState({
    lender_name: '',
    loan_type: 'Bank' as any,
    amount: '',
    interest_rate: '',
    term_months: '',
    due_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const filtered = useMemo(() => {
    return loans.filter(l => 
      l.lender_name.toLowerCase().includes(search.toLowerCase()) ||
      (l.loan_type || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [loans, search]);

  const stats = useMemo(() => {
    const totalPrincipal = loans.reduce((s, l) => s + l.amount, 0);
    const totalRemaining = loans.reduce((s, l) => s + l.remaining_balance, 0);
    const avgRate = loans.length > 0 ? loans.reduce((s, l) => s + l.interest_rate, 0) / loans.length : 0;
    const nextPayment = loans.reduce((s, l) => s + (l as any).monthly_payment || 0, 0);
    return { totalPrincipal, totalRemaining, avgRate, nextPayment };
  }, [loans]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await addLoan({
      lender_name: form.lender_name,
      loan_type: form.loan_type,
      amount: parseFloat(form.amount),
      remaining_balance: parseFloat(form.amount), // Initial remaining
      interest_rate: parseFloat(form.interest_rate),
      term_months: parseInt(form.term_months),
      due_date: form.due_date,
      status: 'active',
      notes: form.notes
    });

    if (result || true) { // addLoan returns void in the store, but we can assume success if no throw
      toast.success('Debt obligation registered successfully', {
        style: { background: '#101010', color: '#fff', border: '1px solid var(--status-success)' }
      });
      setShowModal(false);
      setForm({
        lender_name: '',
        loan_type: 'Bank',
        amount: '',
        interest_rate: '',
        term_months: '',
        due_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
  };

  const handleExport = () => {
    const data = filtered.map(l => ({
      Creditor: l.lender_name,
      Type: l.loan_type,
      Principal: l.amount,
      Rate: `${l.interest_rate}%`,
      Remaining: l.remaining_balance,
      StartDate: l.due_date,
      Term: `${l.term_months} Months`,
      Status: l.status.toUpperCase()
    }));
    exportToCSV(data, 'Debt_Obligations_Report');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-body)' }}>
      <Sidebar />

      <div style={{ marginLeft: sidebarCollapsed ? 64 : 250, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease' }}>
        <header style={{ height: 72, background: 'var(--bg-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid var(--border-soft)` }}>
          <div>
             <h1 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Debt & Loan Command Center</h1>
             <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>Liability monitoring & capital leverage analytics</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ThemeToggle />
            <NotificationCenter />
            <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Register Obligation</button>
          </div>
        </header>

        <main style={{ padding: '24px 32px', flex: 1, overflowY: 'auto' }}>
           
           <div className="grid-12" style={{ gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Total Principal', val: fmt(stats.totalPrincipal), color: COLORS.info, icon: <Landmark size={14}/> },
                { label: 'Remaining Liability', val: fmt(stats.totalRemaining), color: COLORS.danger, icon: <Wallet size={14}/> },
                { label: 'Blended Cost of Capital', val: `${stats.avgRate.toFixed(1)}%`, color: COLORS.success, icon: <Activity size={14}/> },
                { label: 'Monthly Repayment Total', val: fmt(stats.nextPayment), color: COLORS.warning, icon: <Receipt size={14}/> },
                { label: 'Leverage Health', val: 'Optimal', color: COLORS.success, icon: <ShieldCheck size={14}/> },
              ].map((card, i) => (
                <div key={i} className="col-2-4 card-compact" style={{ 
                   borderLeft: `2px solid ${card.color}`,
                   background: isLight ? `color-mix(in srgb, ${card.color}, transparent 92%)` : 'var(--bg-card)',
                   boxShadow: isLight ? `0 4px 12px color-mix(in srgb, ${card.color}, transparent 90%)` : `inset 4px 0 10px ${card.color}10`,
                }}>
                   <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {card.icon} {card.label}
                   </div>
                   <div style={{ fontSize: 18, fontWeight: 950, color: 'var(--text-primary)' }}>{card.val}</div>
                </div>
              ))}
           </div>

           <div className="grid-12" style={{ gap: 24 }}>
              <div className="col-9">
                 <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '10px 16px' }}>
                       <Search size={16} color='var(--text-muted)' />
                       <input 
                         placeholder="Search liabilities by creditor or type..." 
                         value={search}
                         onChange={e => setSearch(e.target.value)}
                         style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 13, width: '100%' }}
                       />
                    </div>
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={handleExport}>
                       <Download size={16} /> Export Reports
                    </button>
                 </div>

                 <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="saas-table">
                       <thead>
                          <tr>
                             <th>Creditor & Category</th>
                             <th>Principal Balance</th>
                             <th>Interest Rate</th>
                             <th>Remaining Balance</th>
                             <th>Maturity Progress</th>
                             <th>Status</th>
                          </tr>
                       </thead>
                       <tbody>
                          {filtered.map(l => (
                             <tr key={l.id} className="loan-row">
                                <td>
                                   <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>{l.lender_name}</div>
                                   <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>{l.loan_type} / Fixed Rate</div>
                                </td>
                                <td style={{ fontWeight: 800 }}>{fmt(l.amount)}</td>
                                <td style={{ color: COLORS.info, fontWeight: 900 }}>{l.interest_rate}%</td>
                                <td style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{fmt(l.remaining_balance)}</td>
                                <td style={{ width: 140 }}>
                                   <div style={{ height: 4, width: '100%', background: 'var(--border-soft)', borderRadius: 4, overflow: 'hidden' }}>
                                      <div style={{ height: '100%', width: `${((l.amount - l.remaining_balance) / l.amount) * 100}%`, background: COLORS.success }} />
                                   </div>
                                   <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>{(((l.amount - l.remaining_balance) / l.amount) * 100).toFixed(0)}% Repaid</div>
                                </td>
                                <td><span className="status-pill active">ACTIVE</span></td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>

              <div className="col-3">
                 <div className="glass-card" style={{ padding: '24px', borderLeft: `3px solid ${COLORS.ai}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                       <Sparkles size={16} color={COLORS.ai} />
                       <h3 style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Leverage Intelligence</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                       {[
                         { title: 'Refinancing Opportunity', desc: 'Current interest rates for Agri-Loans have dropped to 6.2%.' },
                         { title: 'Liquidity Alert', desc: 'Large principal repayment due in 15 days for Creditor B.' },
                         { title: 'Leverage Capacity', desc: 'Debt-to-Asset ratio is 0.32. Capacity for expansion credit.' },
                       ].map((insight, i) => (
                         <div key={i}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{insight.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{insight.desc}</div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </main>
      </div>

      {/* NEW LOAN MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: 540, padding: '48px', position: 'relative' }}>
             <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 32, right: 32, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
               <X size={24} />
             </button>
             <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>Register Debt Obligation</h2>
             <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 40 }}>Establish a new credit facility for farm capital requirements.</p>

             <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                   <div className="form-group">
                      <label className="label-small">Creditor Name</label>
                      <input className="form-input" placeholder="e.g. Republic Bank" value={form.lender_name} onChange={e => setForm({...form, lender_name: e.target.value})} required />
                   </div>
                   <div className="form-group">
                      <label className="label-small">Facility Type</label>
                      <select className="form-input" value={form.loan_type} onChange={e => setForm({...form, loan_type: e.target.value as any})}>
                         <option value="Bank">Bank Loan</option>
                         <option value="Supplier">Supplier Credit</option>
                         <option value="Private">Private Lending</option>
                         <option value="Government">Government Grant/Loan</option>
                      </select>
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                   <div className="form-group">
                      <label className="label-small">Principal Amount (TTD)</label>
                      <input type="number" className="form-input" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                   </div>
                   <div className="form-group">
                      <label className="label-small">Interest Rate (%)</label>
                      <input type="number" step="0.01" className="form-input" placeholder="8.5" value={form.interest_rate} onChange={e => setForm({...form, interest_rate: e.target.value})} required />
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                   <div className="form-group">
                      <label className="label-small">Term (Months)</label>
                      <input type="number" className="form-input" placeholder="36" value={form.term_months} onChange={e => setForm({...form, term_months: e.target.value})} required />
                   </div>
                   <div className="form-group">
                      <label className="label-small">Disbursement Date</label>
                      <input type="date" className="form-input" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} required />
                   </div>
                </div>

                <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                   <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                   <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Confirm Obligation</button>
                </div>
             </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .col-2-4 { width: calc(20% - 10px); }
        .card-compact {
           background: var(--bg-card);
           border: 1px solid var(--border-soft);
           border-radius: 12px;
           padding: 16px;
        }
        .glass-card {
           background: var(--bg-card);
           border: 1px solid var(--border-soft);
           border-radius: 20px;
        }
        .btn-primary {
           background: var(--status-success);
           color: var(--text-inverse);
           border: none;
           border-radius: 12px;
           padding: 12px 24px;
           font-weight: 900;
           font-size: 14px;
           cursor: pointer;
           display: flex;
           align-items: center;
           gap: 8px;
        }
        .btn-secondary {
           background: var(--bg-card-elevated);
           color: var(--text-primary);
           border: 1px solid var(--border-soft);
           border-radius: 12px;
           padding: 12px 20px;
           font-weight: 800;
           font-size: 13px;
           cursor: pointer;
        }
        .label-small {
           font-size: 9px;
           font-weight: 950;
           color: var(--text-muted);
           text-transform: uppercase;
           letter-spacing: 0.1em;
           margin-bottom: 10px;
           display: block;
        }
        .form-input {
           width: 100%;
           background: rgba(255,255,255,0.03);
           border: 1px solid var(--border-soft);
           border-radius: 12px;
           padding: 14px 18px;
           color: var(--text-primary);
           font-size: 14px;
           outline: none;
        }
        .form-input:focus {
           border-color: var(--status-success);
        }
        .status-pill {
           font-size: 9px;
           font-weight: 950;
           padding: 4px 10px;
           border-radius: 6px;
        }
        .status-pill.active {
           background: var(--status-success-glow);
           color: var(--status-success);
        }
      `}</style>
    </div>
  );
}
