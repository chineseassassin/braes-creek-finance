'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { EXPENSE_CATEGORIES, BUSINESS_SEGMENTS, Expense, formatCurrency } from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';

function AddExpenseModal({ onClose }: { onClose: () => void }) {
  const { addExpense, vendors, currentUser, addAuditLog } = useAppStore();
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    vendor_id: '',
    vendor_name: '',
    category_id: '',
    category_name: '',
    segment_id: '',
    segment_name: '',
    amount: '',
    description: '',
    payment_method: 'Cash',
    recurring: false,
    recurrence_period: '',
    notes: '',
  });

  const selectedCategory = EXPENSE_CATEGORIES.find(c => c.id === form.category_id);

  function handleCategoryChange(catId: string) {
    const cat = EXPENSE_CATEGORIES.find(c => c.id === catId);
    const seg = cat ? BUSINESS_SEGMENTS.find(s => s.id === cat.segment_id) : null;
    setForm(f => ({
      ...f,
      category_id: catId,
      category_name: cat?.name || '',
      segment_id: seg?.id || '',
      segment_name: seg?.name || '',
    }));
  }

  function handleVendorChange(vId: string) {
    const v = vendors.find(v => v.id === vId);
    setForm(f => ({ ...f, vendor_id: vId, vendor_name: v?.name || '' }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) return;

    const expense: Expense = {
      id: '', 
      date: form.date,
      vendor_id: form.vendor_id,
      vendor_name: form.vendor_name || form.vendor_id,
      category_id: form.category_id,
      category_name: form.category_name,
      segment_id: form.segment_id,
      segment_name: form.segment_name,
      amount: parseFloat(form.amount),
      description: form.description,
      payment_method: form.payment_method,
      recurring: form.recurring,
      recurrence_period: form.recurring ? form.recurrence_period : undefined,
      notes: form.notes,
      created_by: currentUser.name,
      created_at: new Date().toISOString(),
    };

    await addExpense(expense);
    addAuditLog({
      id: uuidv4(),
      user_name: currentUser.name,
      action: 'CREATE',
      table_name: 'expenses',
      record_id: 'pending',
      details: `Added expense: ${expense.description || expense.category_name} – ${formatCurrency(expense.amount)}`,
      timestamp: new Date().toISOString(),
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">💸 Add Expense</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Amount (JMD)</label>
              <input type="number" className="form-input" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required min="0" step="0.01" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category_id} onChange={e => handleCategoryChange(e.target.value)} required>
                <option value="">Select category...</option>
                {EXPENSE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Business Segment</label>
              <input className="form-input" value={form.segment_name} readOnly style={{ opacity: 0.7 }} placeholder="Auto-set from category" />
            </div>
            <div className="form-group">
              <label className="form-label">Vendor / Supplier</label>
              <select className="form-select" value={form.vendor_id} onChange={e => handleVendorChange(e.target.value)}>
                <option value="">Select vendor...</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                <option value="_other">Other / Manual</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select className="form-select" value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}>
                <option>Cash</option>
                <option>Bank Transfer</option>
                <option>Cheque</option>
                <option>Online Banking</option>
                <option>Credit Card</option>
                <option>Mobile Money</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label className="form-label">Description</label>
              <input className="form-input" placeholder="Describe the expense..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-textarea" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="form-group full-width">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.recurring} onChange={e => setForm(f => ({ ...f, recurring: e.target.checked }))} />
                <span className="form-label" style={{ marginBottom: 0 }}>Recurring Expense</span>
              </label>
            </div>
            {form.recurring && (
              <div className="form-group full-width">
                <label className="form-label">Recurrence Period</label>
                <select className="form-select" value={form.recurrence_period} onChange={e => setForm(f => ({ ...f, recurrence_period: e.target.value }))}>
                  <option value="">Select...</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">💾 Save Expense</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  const { expenses, deleteExpense } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [segFilter, setSegFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Derived state for filtering
  const filtered = expenses.filter(e => {
    const matchSearch = !search || 
      (e.description || '').toLowerCase().includes(search.toLowerCase()) || 
      (e.vendor_name || '').toLowerCase().includes(search.toLowerCase()) || 
      (e.category_name || '').toLowerCase().includes(search.toLowerCase());
    const matchSeg = !segFilter || e.segment_id === segFilter;
    const matchCat = !catFilter || e.category_id === catFilter;
    const matchFrom = !dateFrom || e.date >= dateFrom;
    const matchTo = !dateTo || e.date <= dateTo;
    return matchSearch && matchSeg && matchCat && matchFrom && matchTo;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const handleExport = () => {
    setIsExporting(true);
    const headers = ['Date', 'Description', 'Vendor', 'Category', 'Segment', 'Amount', 'Payment Method'];
    const rows = filtered.map(e => [
      e.date,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      `"${(e.vendor_name || '').replace(/"/g, '""')}"`,
      `"${e.category_name}"`,
      `"${e.segment_name}"`,
      e.amount,
      e.payment_method
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Braes_Creek_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsExporting(false), 800);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">💸 Expenses</div>
          <div className="page-subtitle">Track all business and farm expenditures</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm">📥 Import CSV</button>
          <button 
            className={`btn btn-outline btn-sm ${isExporting ? 'animate-pulse' : ''}`} 
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? '⌛ Exporting...' : '📤 Export'}
          </button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Expense</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="card" style={{ padding: '12px 20px', flex: 1, minWidth: 160 }}>
          <div className="kpi-label">Total (filtered)</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-red)' }}>{formatCurrency(total)}</div>
        </div>
        <div className="card" style={{ padding: '12px 20px', flex: 1, minWidth: 160 }}>
          <div className="kpi-label">Transactions</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>{filtered.length}</div>
        </div>
        <div className="card" style={{ padding: '12px 20px', flex: 1, minWidth: 160 }}>
          <div className="kpi-label">Recurring</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-amber)' }}>{filtered.filter(e => e.recurring).length}</div>
        </div>
        <div className="card" style={{ padding: '12px 20px', flex: 1, minWidth: 160 }}>
          <div className="kpi-label">Avg per Transaction</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>{filtered.length > 0 ? formatCurrency(total / filtered.length) : '$0'}</div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input type="text" className="search-input" placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 180 }} value={segFilter} onChange={e => setSegFilter(e.target.value)}>
          <option value="">All Segments</option>
          {BUSINESS_SEGMENTS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
        </select>
        <select className="form-select" style={{ width: 200 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <input type="date" className="form-input" style={{ width: 150 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} title="From date" />
        <input type="date" className="form-input" style={{ width: 150 }} value={dateTo} onChange={e => setDateTo(e.target.value)} title="To date" />
        <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setSegFilter(''); setCatFilter(''); setDateFrom(''); setDateTo(''); }}>Clear Filters</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Vendor</th>
                <th>Category</th>
                <th>Segment</th>
                <th>Method</th>
                <th>Type</th>
                <th className="text-right">Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No expenses found</td></tr>
              ) : filtered.map(exp => (
                <tr key={exp.id}>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{exp.date}</td>
                  <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }} title={exp.description}>{exp.description}</td>
                  <td style={{ fontSize: '12px' }}>{exp.vendor_name}</td>
                  <td><span className="badge badge-gray" style={{ fontSize: '11px' }}>{exp.category_name}</span></td>
                  <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{exp.segment_name}</td>
                  <td style={{ fontSize: '11px' }}>{exp.payment_method}</td>
                  <td>{exp.recurring ? <span className="badge badge-amber">🔄 {exp.recurrence_period}</span> : <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>}</td>
                  <td className="text-right font-bold" style={{ color: 'var(--accent-red)', whiteSpace: 'nowrap' }}>{formatCurrency(exp.amount)}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm btn-icon" title="Delete" onClick={() => deleteExpense(exp.id)} style={{ color: 'var(--accent-red)' }}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={7} style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>TOTAL</td>
                  <td className="text-right font-bold" style={{ padding: '12px 14px', color: 'var(--accent-red)', fontSize: '15px', background: 'var(--bg-secondary)', whiteSpace: 'nowrap' }}>{formatCurrency(total)}</td>
                  <td style={{ background: 'var(--bg-secondary)' }} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {showAdd && <AddExpenseModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
