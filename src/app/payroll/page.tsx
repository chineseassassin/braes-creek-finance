'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { SAMPLE_PAYROLL, SAMPLE_SEGMENTS } from '@/lib/sample-data'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TTD', maximumFractionDigits: 0 }).format(n)

export default function PayrollPage() {
  const [payroll, setPayroll] = useState(SAMPLE_PAYROLL)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    employee_name: '', employee_id: '', pay_period_start: '', pay_period_end: '',
    base_salary: '', overtime_hours: '0', overtime_rate: '0', deductions: '0',
    segment_id: '', notes: ''
  })

  const totalNetPay = payroll.reduce((s, p) => s + p.net_pay, 0)
  const totalBaseSalary = payroll.reduce((s, p) => s + p.base_salary, 0)
  const totalDeductions = payroll.reduce((s, p) => s + p.deductions, 0)
  const totalOvertime = payroll.reduce((s, p) => s + p.overtime_hours * p.overtime_rate, 0)
  const pendingCount = payroll.filter(p => p.status === 'pending').length

  const employeeChart = payroll.map(p => ({
    name: p.employee_name.split(' ')[0],
    base: p.base_salary,
    overtime: p.overtime_hours * p.overtime_rate,
    deductions: -p.deductions,
    net: p.net_pay,
  }))

  const calcNet = () => {
    const base = parseFloat(form.base_salary) || 0
    const ot = (parseFloat(form.overtime_hours) || 0) * (parseFloat(form.overtime_rate) || 0)
    const ded = parseFloat(form.deductions) || 0
    return base + ot - ded
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newRec = {
      id: `pay-${Date.now()}`,
      ...form,
      base_salary: parseFloat(form.base_salary) || 0,
      overtime_hours: parseFloat(form.overtime_hours) || 0,
      overtime_rate: parseFloat(form.overtime_rate) || 0,
      deductions: parseFloat(form.deductions) || 0,
      net_pay: calcNet(),
      status: 'pending' as const,
      created_by: 'user-1',
      created_at: new Date().toISOString(),
    }
    setPayroll(prev => [newRec as any, ...prev])
    setShowModal(false)
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar
          title="Payroll"
          subtitle="Employee compensation, deductions & payment tracking"
          actions={<button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Add Payroll</button>}
        />
        <div className="page-container">
          {pendingCount > 0 && (
            <div className="alert alert-warning" style={{ marginBottom: 16 }}>
              ⏳ <strong>{pendingCount} payroll record(s)</strong> are pending payment.
            </div>
          )}

          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="kpi-card" style={{ '--kpi-color': '#6366f1' } as any}>
              <div className="kpi-label">Total Net Pay</div>
              <div className="kpi-value">{fmt(totalNetPay)}</div>
              <div className="kpi-sub">{payroll.length} employees</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#3b82f6' } as any}>
              <div className="kpi-label">Base Salaries</div>
              <div className="kpi-value">{fmt(totalBaseSalary)}</div>
              <div className="kpi-sub">before adjustments</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#10b981' } as any}>
              <div className="kpi-label">Overtime Paid</div>
              <div className="kpi-value">{fmt(totalOvertime)}</div>
              <div className="kpi-sub">extra hours</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#ef4444' } as any}>
              <div className="kpi-label">Total Deductions</div>
              <div className="kpi-value">{fmt(totalDeductions)}</div>
              <div className="kpi-sub">NIS, tax, etc.</div>
            </div>
          </div>

          <div className="card section-gap">
            <div className="card-header"><div className="card-title">Payroll Breakdown by Employee</div></div>
            <div className="card-body" style={{ paddingTop: 0 }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={employeeChart} margin={{ top: 4, right: 0, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: any) => fmt(v)} contentStyle={{ background: '#1f1f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="base" name="Base" fill="#3b82f6" stackId="a" fillOpacity={0.8} />
                  <Bar dataKey="overtime" name="Overtime" fill="#10b981" stackId="a" fillOpacity={0.9} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Payroll Records</div>
              <button className="btn btn-secondary btn-sm">📥 Export CSV</button>
            </div>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>ID</th>
                    <th>Period</th>
                    <th>Base Salary</th>
                    <th>OT Hours</th>
                    <th>OT Pay</th>
                    <th>Deductions</th>
                    <th>Net Pay</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.map(p => {
                    const seg = SAMPLE_SEGMENTS.find(s => s.id === p.segment_id)
                    return (
                      <tr key={p.id}>
                        <td className="primary">
                          <div>{p.employee_name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{seg?.icon} {seg?.name?.split('/')[0].trim()}</div>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.employee_id ?? '—'}</td>
                        <td style={{ fontSize: 12 }}>{p.pay_period_start} → {p.pay_period_end}</td>
                        <td className="amount">{fmt(p.base_salary)}</td>
                        <td style={{ textAlign: 'center' }}>{p.overtime_hours}h</td>
                        <td style={{ color: '#4ade80', fontWeight: 600 }}>{fmt(p.overtime_hours * p.overtime_rate)}</td>
                        <td style={{ color: '#f87171', fontWeight: 600 }}>{fmt(p.deductions)}</td>
                        <td className="amount" style={{ fontSize: 14 }}>{fmt(p.net_pay)}</td>
                        <td>
                          <span className={`badge ${p.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                            {p.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {p.status === 'pending' && <button className="btn btn-primary btn-sm">Pay</button>}
                            <button className="btn btn-ghost btn-sm">✏️</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Add Payroll Record</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Employee Name *</label>
                    <input className="form-input" value={form.employee_name} onChange={e => setForm(p => ({ ...p, employee_name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Employee ID</label>
                    <input className="form-input" placeholder="EMP-001" value={form.employee_id} onChange={e => setForm(p => ({ ...p, employee_id: e.target.value }))} />
                  </div>
                </div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Period Start *</label>
                    <input type="date" className="form-input" value={form.pay_period_start} onChange={e => setForm(p => ({ ...p, pay_period_start: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Period End *</label>
                    <input type="date" className="form-input" value={form.pay_period_end} onChange={e => setForm(p => ({ ...p, pay_period_end: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Base Salary (TTD) *</label>
                    <input type="number" className="form-input" placeholder="0.00" value={form.base_salary} onChange={e => setForm(p => ({ ...p, base_salary: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Deductions</label>
                    <input type="number" className="form-input" placeholder="0.00" value={form.deductions} onChange={e => setForm(p => ({ ...p, deductions: e.target.value }))} />
                  </div>
                </div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Overtime Hours</label>
                    <input type="number" className="form-input" placeholder="0" value={form.overtime_hours} onChange={e => setForm(p => ({ ...p, overtime_hours: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Overtime Rate / hr</label>
                    <input type="number" className="form-input" placeholder="0.00" value={form.overtime_rate} onChange={e => setForm(p => ({ ...p, overtime_rate: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Department / Segment</label>
                  <select className="form-select" value={form.segment_id} onChange={e => setForm(p => ({ ...p, segment_id: e.target.value }))}>
                    <option value="">Select segment…</option>
                    {SAMPLE_SEGMENTS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                  </select>
                </div>
                <div className="alert alert-info">
                  💼 Calculated Net Pay: <strong>{fmt(calcNet())}</strong>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
