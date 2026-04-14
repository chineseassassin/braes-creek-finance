'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { BUSINESS_SEGMENTS, Loan, LoanPayment, formatCurrency } from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';

function StatusBadge({ status }: { status: Loan['status'] }) {
  const map = {
    active: 'badge-blue',
    paid_off: 'badge-green',
    overdue: 'badge-red',
    partial: 'badge-amber',
  };
  return <span className={`badge ${map[status]}`}>{status.replace('_', ' ')}</span>;
}

function AddLoanModal({ onClose }: { onClose: () => void }) {
  const { addLoan, currentUser, addAuditLog } = useAppStore();
  const [form, setForm] = useState({
    lender_name: '', loan_date: new Date().toISOString().split('T')[0],
    principal: '', interest_rate: '', repayment_terms: '',
    due_date: '', purpose: '', segment_id: '', notes: '', status: 'active',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const principal = parseFloat(form.principal);
    const seg = BUSINESS_SEGMENTS.find(s => s.id === form.segment_id);
    const loan: Loan = {
      id: `loan-${uuidv4().slice(0, 8)}`,
      lender_name: form.lender_name,
      loan_date: form.loan_date,
      principal,
      interest_rate: parseFloat(form.interest_rate),
      repayment_terms: form.repayment_terms,
      due_date: form.due_date,
      amount_repaid: 0,
      remaining_balance: principal,
      purpose: form.purpose,
      segment_id: form.segment_id,
      segment_name: seg?.name || '',
      status: form.status as Loan['status'],
      notes: form.notes,
      created_by: currentUser.name,
      created_at: new Date().toISOString(),
    };
    addLoan(loan);
    addAuditLog({ id: uuidv4(), user_name: currentUser.name, action: 'CREATE', table_name: 'loans', record_id: loan.id, details: `New loan from ${loan.lender_name}: ${formatCurrency(loan.principal)}`, timestamp: new Date().toISOString() });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">🏦 Add Loan</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Lender Name</label>
              <input className="form-input" value={form.lender_name} onChange={e => setForm(f => ({ ...f, lender_name: e.target.value }))} required placeholder="e.g. Development Bank of Jamaica" />
            </div>
            <div className="form-group">
              <label className="form-label">Loan Date</label>
              <input type="date" className="form-input" value={form.loan_date} onChange={e => setForm(f => ({ ...f, loan_date: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Principal Amount (JMD)</label>
              <input type="number" className="form-input" value={form.principal} onChange={e => setForm(f => ({ ...f, principal: e.target.value }))} required min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Interest Rate (%)</label>
              <input type="number" className="form-input" value={form.interest_rate} onChange={e => setForm(f => ({ ...f, interest_rate: e.target.value }))} required min="0" step="0.01" />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" className="form-input" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="partial">Partial</option>
                <option value="overdue">Overdue</option>
                <option value="paid_off">Paid Off</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label className="form-label">Repayment Terms</label>
              <input className="form-input" value={form.repayment_terms} onChange={e => setForm(f => ({ ...f, repayment_terms: e.target.value }))} placeholder="e.g. Monthly over 24 months" />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Loan Purpose</label>
              <input className="form-input" value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} placeholder="What are the funds for?" required />
            </div>
            <div className="form-group">
              <label className="form-label">Linked Business Segment</label>
              <select className="form-select" value={form.segment_id} onChange={e => setForm(f => ({ ...f, segment_id: e.target.value }))}>
                <option value="">General / Unassigned</option>
                {BUSINESS_SEGMENTS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
              </select>
            </div>
            <div className="form-group full-width">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">💾 Save Loan</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddPaymentModal({ loan, onClose }: { loan: Loan; onClose: () => void }) {
  const { addLoanPayment, currentUser } = useAppStore();
  const [form, setForm] = useState({ payment_date: new Date().toISOString().split('T')[0], amount: '', notes: '' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payment: LoanPayment = {
      id: `lp-${uuidv4().slice(0, 8)}`,
      loan_id: loan.id,
      payment_date: form.payment_date,
      amount: parseFloat(form.amount),
      notes: form.notes,
      created_by: currentUser.name,
    };
    addLoanPayment(payment);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div className="modal-title">💳 Record Payment</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Loan</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{loan.lender_name}</p>
          <p style={{ fontSize: 12, color: 'var(--accent-red)', marginTop: 4 }}>Outstanding: {formatCurrency(loan.remaining_balance)}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Payment Date</label>
              <input type="date" className="form-input" value={form.payment_date} onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Amount (JMD)</label>
              <input type="number" className="form-input" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required min="0" max={loan.remaining_balance} />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Notes</label>
              <input className="form-input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. Month 6 payment" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-success">✓ Record Payment</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoansPage() {
  const { loans, loanPayments } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [viewPayments, setViewPayments] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  const totalPrincipal = loans.reduce((s, l) => s + l.principal, 0);
  const totalOutstanding = loans.filter(l => l.status !== 'paid_off').reduce((s, l) => s + l.remaining_balance, 0);
  const totalRepaid = loans.reduce((s, l) => s + l.amount_repaid, 0);
  const overdueLoans = loans.filter(l => l.status === 'overdue');

  let filteredLoans = loans.filter(l => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!l.lender_name.toLowerCase().includes(q) && !l.purpose.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  filteredLoans.sort((a, b) => {
    if (sortBy === 'date_desc') return b.loan_date.localeCompare(a.loan_date);
    if (sortBy === 'date_asc') return a.loan_date.localeCompare(b.loan_date);
    if (sortBy === 'balance_desc') return b.remaining_balance - a.remaining_balance;
    if (sortBy === 'balance_asc') return a.remaining_balance - b.remaining_balance;
    return 0;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">🏦 Loan Tracking</div>
          <div className="page-subtitle">Monitor all loans received, repayments, and outstanding balances</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm">📤 Export</button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Loan</button>
        </div>
      </div>

      {overdueLoans.length > 0 && (
        <div className="alert alert-danger">
          ⚠️ <strong>{overdueLoans.length} overdue loan(s)</strong>: {overdueLoans.map(l => l.lender_name).join(', ')} – payments are past due!
        </div>
      )}

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi-card blue">
          <div className="kpi-icon">🏦</div>
          <div className="kpi-label">Total Borrowed</div>
          <div className="kpi-value">{formatCurrency(totalPrincipal)}</div>
          <div className="kpi-sub">{loans.length} loans</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-icon">⏳</div>
          <div className="kpi-label">Outstanding Balance</div>
          <div className="kpi-value">{formatCurrency(totalOutstanding)}</div>
          <div className="kpi-sub">{loans.filter(l => l.status !== 'paid_off').length} active</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-icon">✅</div>
          <div className="kpi-label">Total Repaid</div>
          <div className="kpi-value">{formatCurrency(totalRepaid)}</div>
          <div className="kpi-sub">{loanPayments.length} payments made</div>
        </div>
        <div className="kpi-card amber">
          <div className="kpi-icon">⚠️</div>
          <div className="kpi-label">Overdue Loans</div>
          <div className="kpi-value">{overdueLoans.length}</div>
          <div className="kpi-sub">{overdueLoans.reduce((s, l) => s + l.remaining_balance, 0) > 0 ? formatCurrency(overdueLoans.reduce((s, l) => s + l.remaining_balance, 0)) : 'None'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search lenders or purpose..." 
          className="form-input" 
          style={{ flex: 1, minWidth: 200, background: 'hsl(var(--bg-secondary) / 0.5)' }} 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto', minWidth: 150, background: 'hsl(var(--bg-secondary) / 0.5)' }}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="overdue">Overdue</option>
          <option value="partial">Partial</option>
          <option value="paid_off">Paid Off</option>
        </select>
        <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 'auto', minWidth: 180, background: 'hsl(var(--bg-secondary) / 0.5)' }}>
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
          <option value="balance_desc">Highest Balance</option>
          <option value="balance_asc">Lowest Balance</option>
        </select>
      </div>

      {/* Loan Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredLoans.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'hsl(var(--text-muted))' }}>No loans match your search criteria.</div>
        ) : (
          filteredLoans.map(loan => {
            const pct = Math.min(100, (loan.amount_repaid / loan.principal) * 100);
            const payments = loanPayments.filter(p => p.loan_id === loan.id);
            return (
            <div className="card" key={loan.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{loan.lender_name}</h3>
                    <StatusBadge status={loan.status} />
                    {loan.segment_name && <span className="badge badge-purple">{loan.segment_name}</span>}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: 500 }}>{loan.purpose}</p>
                  {loan.notes && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>{loan.notes}</p>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setViewPayments(viewPayments === loan.id ? null : loan.id)}>
                    {viewPayments === loan.id ? 'Hide' : 'View'} Payments ({payments.length})
                  </button>
                  {loan.status !== 'paid_off' && (
                    <button className="btn btn-success btn-sm" onClick={() => setSelectedLoan(loan)}>+ Record Payment</button>
                  )}
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Principal', value: formatCurrency(loan.principal), color: 'var(--text-primary)' },
                  { label: 'Interest Rate', value: `${loan.interest_rate}% p.a.`, color: 'var(--accent-amber)' },
                  { label: 'Amount Repaid', value: formatCurrency(loan.amount_repaid), color: 'var(--accent-green)' },
                  { label: 'Remaining', value: formatCurrency(loan.remaining_balance), color: loan.status === 'overdue' ? 'var(--accent-red)' : 'var(--text-primary)' },
                  { label: 'Due Date', value: loan.due_date, color: 'var(--text-muted)' },
                  { label: 'Loan Date', value: loan.loan_date, color: 'var(--text-muted)' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Repayment Progress</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{pct.toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${pct}%`,
                    background: loan.status === 'paid_off' ? 'var(--accent-green)' : loan.status === 'overdue' ? 'var(--accent-red)' : 'var(--accent-blue)',
                  }} />
                </div>
              </div>

              {/* Payment history */}
              {viewPayments === loan.id && payments.length > 0 && (
                <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Payment History</p>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Recorded By</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.id}>
                          <td>{p.payment_date}</td>
                          <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{formatCurrency(p.amount)}</td>
                          <td>{p.created_by}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{p.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        }))}
      </div>

      {showAdd && <AddLoanModal onClose={() => setShowAdd(false)} />}
      {selectedLoan && <AddPaymentModal loan={selectedLoan} onClose={() => setSelectedLoan(null)} />}
    </div>
  );
}
