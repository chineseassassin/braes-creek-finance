'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function RunPayrollModal({ onClose }: { onClose: () => void }) {
  const { laborEntries, addPayroll, currentUser, addAuditLog } = useAppStore();
  const [form, setForm] = useState({
    worker_name: '',
    role: '',
    department: '',
    period_start: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    period_end: new Date().toISOString().split('T')[0],
    base_salary: 0,
    overtime_hours: 0,
    overtime_rate: 0,
    deductions: 0,
    notes: '',
  });

  const workers = [...new Set(laborEntries.map(l => l.worker_name))];

  // Smart Fill: Calculate pay from logged labor
  const calculateSmartPay = () => {
    if (!form.worker_name) return 0;
    const workerLabor = laborEntries.filter(l => 
      l.worker_name === form.worker_name &&
      l.date >= form.period_start &&
      l.date <= form.period_end
    );
    return workerLabor.reduce((s, l) => s + l.total_cost, 0);
  };

  useEffect(() => {
    if (form.worker_name) {
      const suggest = calculateSmartPay();
      const lastEntry = laborEntries.find(l => l.worker_name === form.worker_name);
      setForm(f => ({ ...f, base_salary: suggest, department: lastEntry?.department || '' }));
    }
  }, [form.worker_name, form.period_start, form.period_end]);

  const netPay = form.base_salary + (form.overtime_hours * form.overtime_rate) - form.deductions;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const entry = {
      ...form,
      net_pay: netPay,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    await addPayroll(entry);
    addAuditLog({
      id: Math.random().toString(36).slice(2),
      user_name: currentUser.name,
      action: 'CREATE',
      table_name: 'payroll',
      record_id: 'new',
      details: `Generated payroll for ${form.worker_name} (${form.period_start} to ${form.period_end})`,
      timestamp: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <div className="modal-title">💰 Run Employee Payroll</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group full-width" style={{ gridColumn: 'span 2' }}>
            <label>Select Worker</label>
            <select className="form-select" required value={form.worker_name} onChange={e => setForm({...form, worker_name: e.target.value})}>
              <option value="">Select a worker...</option>
              {workers.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Period Start</label>
            <input type="date" className="form-input" required value={form.period_start} onChange={e => setForm({...form, period_start: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Period End</label>
            <input type="date" className="form-input" required value={form.period_end} onChange={e => setForm({...form, period_end: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Base Salary / Wages</label>
            <input type="number" className="form-input" required value={form.base_salary} onChange={e => setForm({...form, base_salary: parseFloat(e.target.value)})} />
            <p style={{ fontSize: 10, color: 'var(--accent-blue)', marginTop: 4 }}>Auto-calculated from {laborEntries.filter(l => l.worker_name === form.worker_name).length} labor logs</p>
          </div>
          <div className="form-group">
            <label>Deductions (NIS/NHT)</label>
            <input type="number" className="form-input" value={form.deductions} onChange={e => setForm({...form, deductions: parseFloat(e.target.value)})} />
          </div>
          
          <div className="full-width" style={{ gridColumn: 'span 2', background: 'var(--bg-secondary)', padding: 16, borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Net Amount Payable</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-teal)' }}>{formatCurrency(netPay)}</div>
              </div>
              <button type="submit" className="btn btn-primary">Authorize & Generate Pay</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PayrollPage() {
  const { payroll } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showRunModal, setShowRunModal] = useState(false);

  const filtered = payroll.filter(p => {
    const matchSearch = !search || p.worker_name.toLowerCase().includes(search.toLowerCase()) || p.department.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => b.period_end.localeCompare(a.period_end));

  const totalNet = filtered.reduce((s, p) => s + p.net_pay, 0);
  const totalGross = filtered.reduce((s, p) => s + p.base_salary + (p.overtime_hours * p.overtime_rate), 0);
  const totalDeductions = filtered.reduce((s, p) => s + p.deductions, 0);

  const workers = [...new Set(payroll.map(p => p.worker_name))];
  const workerSummary = workers.map(w => ({
    name: w.split(' ')[0],
    total: payroll.filter(p => p.worker_name === w).reduce((s, p) => s + p.net_pay, 0),
  }));

  const handleExport = () => {
    const headers = ['Worker', 'Role', 'Department', 'Period Start', 'Period End', 'Base', 'Overtime', 'Deductions', 'Net Pay', 'Status'];
    const rows = filtered.map(p => [
      `"${p.worker_name}"`,
      `"${p.role}"`,
      `"${p.department}"`,
      p.period_start,
      p.period_end,
      p.base_salary,
      p.overtime_hours * p.overtime_rate,
      p.deductions,
      p.net_pay,
      p.status
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Braes_Creek_Payroll_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {showRunModal && <RunPayrollModal onClose={() => setShowRunModal(false)} />}
      
      <div className="page-header">
        <div>
          <div className="page-title">💰 Payroll</div>
          <div className="page-subtitle">Employee payroll records and compensation tracking</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={handleExport}>📤 Export Payroll</button>
          <button className="btn btn-primary" onClick={() => setShowRunModal(true)}>+ Run Payroll</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi-card teal">
          <div className="kpi-icon">💰</div>
          <div className="kpi-label">Total Net Pay</div>
          <div className="kpi-value">{formatCurrency(totalNet)}</div>
          <div className="kpi-sub">{filtered.length} pay records</div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-icon">📋</div>
          <div className="kpi-label">Gross Payroll</div>
          <div className="kpi-value">{formatCurrency(totalGross)}</div>
          <div className="kpi-sub">Before deductions</div>
        </div>
        <div className="kpi-card amber">
          <div className="kpi-icon">📉</div>
          <div className="kpi-label">Total Deductions</div>
          <div className="kpi-value">{formatCurrency(totalDeductions)}</div>
          <div className="kpi-sub">NIS, NHT, taxes</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-icon">👷</div>
          <div className="kpi-label">Active Workers</div>
          <div className="kpi-value">{workers.length}</div>
          <div className="kpi-sub">On payroll</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-title">💰 Net Pay by Worker</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workerSummary} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="total" name="Net Pay (YTD)" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-title">📊 Payroll Breakdown</div>
          {workers.map(w => {
            const wRecords = payroll.filter(p => p.worker_name === w);
            const net = wRecords.reduce((s, p) => s + p.net_pay, 0);
            const maxNet = Math.max(...workers.map(ww => payroll.filter(p => p.worker_name === ww).reduce((s, p) => s + p.net_pay, 0)));
            return (
              <div key={w} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{w}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-teal)' }}>{formatCurrency(net)}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(net / maxNet) * 100}%`, background: 'var(--accent-teal)' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{wRecords[0]?.role} · {wRecords[0]?.department}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search worker..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Role / Dept</th>
                <th>Period</th>
                <th>Base Salary</th>
                <th>Overtime</th>
                <th>Deductions</th>
                <th>Payment Date</th>
                <th>Status</th>
                <th className="text-right">Net Pay</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.worker_name}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.role} · {p.department}</td>
                  <td style={{ fontSize: 12 }}>{p.period_start} → {p.period_end}</td>
                  <td>{formatCurrency(p.base_salary)}</td>
                  <td style={{ color: 'var(--accent-amber)' }}>{p.overtime_hours > 0 ? `${p.overtime_hours}h @ ${formatCurrency(p.overtime_rate)}` : '—'}</td>
                  <td style={{ color: 'var(--accent-red)' }}>({formatCurrency(p.deductions)})</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{p.payment_date || '—'}</td>
                  <td>
                    <span className={`badge ${p.status === 'paid' ? 'badge-green' : p.status === 'pending' ? 'badge-amber' : 'badge-red'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="text-right font-bold" style={{ color: 'var(--accent-teal)', whiteSpace: 'nowrap' }}>{formatCurrency(p.net_pay)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
