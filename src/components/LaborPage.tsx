'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { BUSINESS_SEGMENTS, LaborEntry, formatCurrency } from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CROP_TYPES = ['Cassava', 'Sweet Potatoes', 'Tomato', 'Cucumber', 'Bell Pepper', 'Sorrel', 'Scotch Bonnet', 'Other'];
const ANIMAL_TYPES = ['Broiler Chicken', 'Layer Chicken', 'Goat', 'Pig', 'Cattle', 'Other'];

function AddLaborModal({ onClose }: { onClose: () => void }) {
  const { addLaborEntry, currentUser } = useAppStore();
  const [form, setForm] = useState({
    worker_name: '', task: '', date: new Date().toISOString().split('T')[0],
    start_time: '07:00', end_time: '15:00', hourly_rate: '',
    department: '', segment_id: '', crop_type: '', animal_type: '', notes: '',
  });

  const startParts = form.start_time.split(':').map(Number);
  const endParts = form.end_time.split(':').map(Number);
  const totalHours = Math.max(0, (endParts[0] * 60 + endParts[1] - (startParts[0] * 60 + startParts[1])) / 60);
  const totalCost = totalHours * (parseFloat(form.hourly_rate) || 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const seg = BUSINESS_SEGMENTS.find(s => s.id === form.segment_id);
    const entry: LaborEntry = {
      id: `lab-${uuidv4().slice(0, 8)}`,
      worker_name: form.worker_name,
      task: form.task,
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      total_hours: totalHours,
      hourly_rate: parseFloat(form.hourly_rate),
      total_cost: totalCost,
      department: form.department,
      segment_id: form.segment_id,
      segment_name: seg?.name || '',
      crop_type: form.crop_type || undefined,
      animal_type: form.animal_type || undefined,
      notes: form.notes,
      created_by: currentUser.name,
      created_at: new Date().toISOString(),
    };
    addLaborEntry(entry);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">👷 Add Labor Entry</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Worker Name</label>
              <input className="form-input" value={form.worker_name} onChange={e => setForm(f => ({ ...f, worker_name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Task Description</label>
              <input className="form-input" value={form.task} onChange={e => setForm(f => ({ ...f, task: e.target.value }))} required placeholder="Describe the work performed" />
            </div>
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input type="time" className="form-input" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input type="time" className="form-input" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Hourly Rate (JMD)</label>
              <input type="number" className="form-input" value={form.hourly_rate} onChange={e => setForm(f => ({ ...f, hourly_rate: e.target.value }))} required min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input className="form-input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="e.g. Poultry, Crops..." />
            </div>
            <div className="form-group">
              <label className="form-label">Business Segment</label>
              <select className="form-select" value={form.segment_id} onChange={e => setForm(f => ({ ...f, segment_id: e.target.value }))}>
                <option value="">Select...</option>
                {BUSINESS_SEGMENTS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Crop Type (if applicable)</label>
              <select className="form-select" value={form.crop_type} onChange={e => setForm(f => ({ ...f, crop_type: e.target.value }))}>
                <option value="">N/A</option>
                {CROP_TYPES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Animal Type (if applicable)</label>
              <select className="form-select" value={form.animal_type} onChange={e => setForm(f => ({ ...f, animal_type: e.target.value }))}>
                <option value="">N/A</option>
                {ANIMAL_TYPES.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div className="form-group full-width">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>

          {/* Computed summary */}
          {form.hourly_rate && (
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 24, marginTop: 8 }}>
              <div><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Hours: </span><strong>{totalHours.toFixed(2)}</strong></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Cost: </span><strong style={{ color: 'var(--accent-green)' }}>{formatCurrency(totalCost)}</strong></div>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">💾 Save Entry</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LaborPage() {
  const { laborEntries, deleteLaborEntry } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [workerFilter, setWorkerFilter] = useState('');
  const [segFilter, setSegFilter] = useState('');
  const [tab, setTab] = useState<'entries' | 'analytics'>('entries');

  const workers = [...new Set(laborEntries.map(l => l.worker_name))];

  const handleExport = () => {
    const headers = ['Date', 'Worker', 'Task', 'Department', 'Hours', 'Rate', 'Total Cost'];
    const rows = filtered.map(e => [
      e.date,
      `"${e.worker_name}"`,
      `"${e.task.replace(/"/g, '""')}"`,
      `"${e.department}"`,
      e.total_hours.toFixed(1),
      e.hourly_rate,
      e.total_cost
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Braes_Creek_Labor_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = laborEntries.filter(e => {
    const matchSearch = !search || e.worker_name.toLowerCase().includes(search.toLowerCase()) || e.task.toLowerCase().includes(search.toLowerCase());
    const matchWorker = !workerFilter || e.worker_name === workerFilter;
    const matchSeg = !segFilter || e.segment_id === segFilter;
    return matchSearch && matchWorker && matchSeg;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const totalCost = filtered.reduce((s, l) => s + l.total_cost, 0);
  const totalHours = filtered.reduce((s, l) => s + l.total_hours, 0);

  // Worker breakdown
  const workerData = workers.map(w => {
    const entries = laborEntries.filter(e => e.worker_name === w);
    return {
      name: w.split(' ')[0],
      hours: entries.reduce((s, e) => s + e.total_hours, 0),
      cost: entries.reduce((s, e) => s + e.total_cost, 0),
    };
  });

  // Segment breakdown
  const segData = Object.entries(
    laborEntries.reduce((acc, e) => { acc[e.segment_name || 'Other'] = (acc[e.segment_name || 'Other'] || 0) + e.total_cost; return acc; }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]).map(([name, cost]) => ({ name: name.split('/')[0].trim(), cost }));

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">👷 Labor Tracking</div>
          <div className="page-subtitle">Track worker hours, tasks, and labor costs by segment</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={handleExport}>📤 Export</button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Labor Entry</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi-card purple">
          <div className="kpi-icon">💸</div>
          <div className="kpi-label">Total Labor Cost</div>
          <div className="kpi-value">{formatCurrency(totalCost)}</div>
          <div className="kpi-sub">{filtered.length} entries</div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-icon">⏱</div>
          <div className="kpi-label">Total Hours Worked</div>
          <div className="kpi-value">{totalHours.toFixed(1)} hrs</div>
          <div className="kpi-sub">Across all workers</div>
        </div>
        <div className="kpi-card teal">
          <div className="kpi-icon">👷</div>
          <div className="kpi-label">Active Workers</div>
          <div className="kpi-value">{workers.length}</div>
          <div className="kpi-sub">Unique workers tracked</div>
        </div>
        <div className="kpi-card amber">
          <div className="kpi-icon">💰</div>
          <div className="kpi-label">Avg Cost / Hour</div>
          <div className="kpi-value">{totalHours > 0 ? formatCurrency(totalCost / totalHours) : '$0'}</div>
          <div className="kpi-sub">blended hourly rate</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${tab === 'entries' ? 'active' : ''}`} onClick={() => setTab('entries')}>📋 Labor Entries</button>
        <button className={`tab-btn ${tab === 'analytics' ? 'active' : ''}`} onClick={() => setTab('analytics')}>📊 Analytics</button>
      </div>

      {tab === 'analytics' && (
        <div className="grid-2" style={{ marginBottom: 16 }}>
          <div className="card">
            <div className="card-title">👷 Labor Cost by Worker</div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workerData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                  <Bar dataKey="cost" name="Labor Cost" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <div className="card-title">🏢 Labor Cost by Segment</div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={segData} layout="vertical" margin={{ top: 5, right: 10, left: 60, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                  <Bar dataKey="cost" name="Cost" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === 'entries' && (
        <>
          {/* Filters */}
          <div className="filter-bar">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input className="search-input" placeholder="Search worker or task..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 180 }} value={workerFilter} onChange={e => setWorkerFilter(e.target.value)}>
              <option value="">All Workers</option>
              {workers.map(w => <option key={w}>{w}</option>)}
            </select>
            <select className="form-select" style={{ width: 180 }} value={segFilter} onChange={e => setSegFilter(e.target.value)}>
              <option value="">All Segments</option>
              {BUSINESS_SEGMENTS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
            </select>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Worker</th>
                    <th>Task</th>
                    <th>Department</th>
                    <th>Crop/Animal</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Hours</th>
                    <th>Rate/hr</th>
                    <th className="text-right">Total Cost</th>
                    <th style={{ width: 50 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(entry => (
                    <tr key={entry.id}>
                      <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{entry.date}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{entry.worker_name}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.task}</td>
                      <td><span className="badge badge-blue" style={{ fontSize: 11 }}>{entry.department}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{entry.crop_type || entry.animal_type || '—'}</td>
                      <td>{entry.start_time}</td>
                      <td>{entry.end_time}</td>
                      <td style={{ fontWeight: 600 }}>{entry.total_hours.toFixed(1)}</td>
                      <td>{formatCurrency(entry.hourly_rate)}</td>
                      <td className="text-right font-bold" style={{ color: 'var(--accent-purple)', whiteSpace: 'nowrap' }}>{formatCurrency(entry.total_cost)}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm btn-icon" title="Delete" onClick={() => deleteLaborEntry(entry.id)} style={{ color: 'var(--accent-red)' }}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {showAdd && <AddLaborModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
