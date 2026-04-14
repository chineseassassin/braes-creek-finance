'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { formatCurrency, EXPENSE_CATEGORIES, BUSINESS_SEGMENTS } from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';

function CreateBudgetModal({ onClose }: { onClose: () => void }) {
  const { addBudget, currentUser, addAuditLog } = useAppStore();
  const [form, setForm] = useState({
    category_id: '',
    category_name: '',
    segment_id: '',
    segment_name: '',
    budgeted_amount: '',
    period: 'Monthly (April 2025)',
  });

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.budgeted_amount) return;

    const budget = {
      category_id: form.category_id,
      category_name: form.category_name,
      segment_id: form.segment_id,
      segment_name: form.segment_name,
      budgeted_amount: parseFloat(form.budgeted_amount),
      actual_amount: 0,
      variance: parseFloat(form.budgeted_amount),
      period: form.period,
    };

    await addBudget(budget);
    addAuditLog({
      id: uuidv4(),
      user_name: currentUser.name,
      action: 'CREATE',
      table_name: 'budgets',
      record_id: 'pending',
      details: `Created budget for ${budget.category_name}: ${formatCurrency(budget.budgeted_amount)}`,
      timestamp: new Date().toISOString(),
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">🎯 Create New Budget</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Expense Category</label>
              <select className="form-select" value={form.category_id} onChange={e => handleCategoryChange(e.target.value)} required>
                <option value="">Select category...</option>
                {EXPENSE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Business Segment</label>
              <input className="form-input" value={form.segment_name} readOnly style={{ opacity: 0.7 }} placeholder="Auto-set" />
            </div>
            <div className="form-group">
              <label className="form-label">Budget Limit (JMD)</label>
              <input type="number" className="form-input" placeholder="0.00" value={form.budgeted_amount} onChange={e => setForm(f => ({ ...f, budgeted_amount: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Fiscal Period</label>
              <select className="form-select" value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))}>
                <option>Monthly (April 2025)</option>
                <option>Quarterly (Q2 2025)</option>
                <option>Yearly (2025)</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">💾 Save Budget</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BudgetsPage() {
  const { budgets, expenses, deleteBudget } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);

  // Dynamic spending calculation
  const budgetList = budgets.map(b => {
    const actualSpend = expenses
      .filter(e => e.category_id === b.category_id)
      .reduce((s, e) => s + e.amount, 0);
    return {
      ...b,
      actual_amount: actualSpend,
      variance: b.budgeted_amount - actualSpend
    };
  });

  const totalBudgeted = budgetList.reduce((s, b) => s + b.budgeted_amount, 0);
  const totalActual = budgetList.reduce((s, b) => s + b.actual_amount, 0);
  const totalVariance = totalBudgeted - totalActual;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">🎯 Budget Management</div>
          <div className="page-subtitle">Set spending limits and monitor actual vs budgeted costs</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Create Budget</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="kpi-card blue">
          <div className="kpi-icon">🎯</div>
          <div className="kpi-label">Total Allocated</div>
          <div className="kpi-value">{formatCurrency(totalBudgeted)}</div>
        </div>
        <div className="kpi-card amber">
          <div className="kpi-icon">💸</div>
          <div className="kpi-label">Actual Spending</div>
          <div className="kpi-value">{formatCurrency(totalActual)}</div>
        </div>
        <div className={`kpi-card ${totalVariance >= 0 ? 'green' : 'red'}`}>
          <div className="kpi-icon">{totalVariance >= 0 ? '✅' : '⚠️'}</div>
          <div className="kpi-label">Total Variance</div>
          <div className="kpi-value" style={{ color: totalVariance >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {totalVariance >= 0 ? '+' : ''}{formatCurrency(totalVariance)}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Period</th>
              <th className="text-right">Budget Limit</th>
              <th className="text-right">Actual Spend</th>
              <th className="text-right">Remaining</th>
              <th>Utilization</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {budgetList.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No budgets established yet</td></tr>
            ) : budgetList.map(b => {
              const pct = b.budgeted_amount > 0 ? (b.actual_amount / b.budgeted_amount * 100) : 0;
              const over = b.variance < 0;
              return (
                <tr key={b.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.category_name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{b.segment_name}</div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.period}</td>
                  <td className="text-right">{formatCurrency(b.budgeted_amount)}</td>
                  <td className="text-right" style={{ color: over ? 'var(--accent-red)' : 'var(--text-primary)' }}>{formatCurrency(b.actual_amount)}</td>
                  <td className="text-right font-bold" style={{ color: over ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                    {formatCurrency(Math.abs(b.variance))} {over ? 'OVER' : 'LEFT'}
                  </td>
                  <td style={{ minWidth: 140 }}>
                    <div className="progress-bar" style={{ height: 6 }}>
                      <div className="progress-fill" style={{
                        width: `${Math.min(100, pct)}%`,
                        background: pct > 100 ? 'var(--accent-red)' : pct > 85 ? 'var(--accent-amber)' : 'var(--accent-green)',
                      }} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{pct.toFixed(1)}% of limit</div>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => deleteBudget(b.id)} style={{ color: 'var(--accent-red)' }}>🗑</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAdd && <CreateBudgetModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
