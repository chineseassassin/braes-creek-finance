'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { formatCurrency, CropType } from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';

function StatusBadge({ status }: { status: CropType['status'] }) {
  const map = { planted: 'badge-blue', growing: 'badge-green', harvested: 'badge-teal', failed: 'badge-red' };
  const icons = { planted: '🌱', growing: '🌿', harvested: '✅', failed: '❌' };
  return <span className={`badge ${map[status]}`}>{icons[status]} {status}</span>;
}

function AddCropModal({ onClose }: { onClose: () => void }) {
  const { addCropType, currentUser } = useAppStore();
  const [form, setForm] = useState({
    name: '', variety: '', season: '', planting_date: new Date().toISOString().split('T')[0],
    harvest_date: '', area_planted: '', expected_yield: '', unit: 'lbs', notes: '', status: 'planted',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const crop: CropType = {
      id: `crop-${uuidv4().slice(0, 8)}`,
      name: form.name, variety: form.variety, season: form.season,
      planting_date: form.planting_date, harvest_date: form.harvest_date,
      area_planted: parseFloat(form.area_planted), expected_yield: parseFloat(form.expected_yield),
      unit: form.unit, segment_id: 'seg-006', status: form.status as CropType['status'], notes: form.notes,
    };
    addCropType(crop);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">🌿 Add Crop</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Crop Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Tomato" />
            </div>
            <div className="form-group">
              <label className="form-label">Variety</label>
              <input className="form-input" value={form.variety} onChange={e => setForm(f => ({ ...f, variety: e.target.value }))} placeholder="e.g. Roma VF" />
            </div>
            <div className="form-group">
              <label className="form-label">Season</label>
              <input className="form-input" value={form.season} onChange={e => setForm(f => ({ ...f, season: e.target.value }))} placeholder="e.g. Winter, Year-round" />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="planted">Planted</option>
                <option value="growing">Growing</option>
                <option value="harvested">Harvested</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Planting Date</label>
              <input type="date" className="form-input" value={form.planting_date} onChange={e => setForm(f => ({ ...f, planting_date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Expected Harvest Date</label>
              <input type="date" className="form-input" value={form.harvest_date} onChange={e => setForm(f => ({ ...f, harvest_date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Area Planted (acres)</label>
              <input type="number" className="form-input" value={form.area_planted} onChange={e => setForm(f => ({ ...f, area_planted: e.target.value }))} step="0.1" min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Expected Yield</label>
              <input type="number" className="form-input" value={form.expected_yield} onChange={e => setForm(f => ({ ...f, expected_yield: e.target.value }))} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-select" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                <option value="lbs">lbs</option>
                <option value="kg">kg</option>
                <option value="dozen">dozen</option>
                <option value="bags">bags</option>
                <option value="crates">crates</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">💾 Add Crop</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CropsPage() {
  const { cropTypes, expenses, deleteCropType } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const cropExpenses = expenses.filter(e => e.segment_id === 'seg-006');
  const totalCropCost = cropExpenses.reduce((s, e) => s + e.amount, 0);

  const handleExport = () => {
    const headers = ['Crop', 'Variety', 'Season', 'Status', 'Planting Date', 'Harvest Date', 'Area (Acres)', 'Exp Yield', 'Unit'];
    const rows = cropTypes.map(c => [
      `"${c.name}"`, `"${c.variety}"`, `"${c.season}"`, `"${c.status}"`,
      c.planting_date, c.harvest_date, c.area_planted, c.expected_yield, c.unit
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Braes_Creek_Crops_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = statusFilter ? cropTypes.filter(c => c.status === statusFilter) : cropTypes;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">🌿 Crops Operations</div>
          <div className="page-subtitle">Track all crop types, yields, and associated costs</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={handleExport}>📤 Export to Excel</button>
          <select className="form-select" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="planted">Planted</option>
            <option value="growing">Growing</option>
            <option value="harvested">Harvested</option>
            <option value="failed">Failed</option>
          </select>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Crop</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi-card green">
          <div className="kpi-icon">🌿</div>
          <div className="kpi-label">Total Crop Types</div>
          <div className="kpi-value">{cropTypes.length}</div>
          <div className="kpi-sub">{cropTypes.filter(c => c.status === 'growing' || c.status === 'planted').length} active</div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-icon">📐</div>
          <div className="kpi-label">Total Area Planted</div>
          <div className="kpi-value">{cropTypes.reduce((s, c) => s + c.area_planted, 0).toFixed(1)} ac</div>
          <div className="kpi-sub">Total farm acreage in crops</div>
        </div>
        <div className="kpi-card amber">
          <div className="kpi-icon">💸</div>
          <div className="kpi-label">Total Crop Costs</div>
          <div className="kpi-value">{formatCurrency(totalCropCost)}</div>
          <div className="kpi-sub">{cropExpenses.length} expense entries</div>
        </div>
        <div className="kpi-card teal">
          <div className="kpi-icon">✅</div>
          <div className="kpi-label">Harvested Crops</div>
          <div className="kpi-value">{cropTypes.filter(c => c.status === 'harvested').length}</div>
          <div className="kpi-sub">Completed this season</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {filtered.map(crop => {
          const yieldPct = crop.actual_yield && crop.expected_yield > 0 ? (crop.actual_yield / crop.expected_yield * 100) : null;
          return (
            <div className="card" key={crop.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'hsl(var(--text-primary))', marginBottom: 2 }}>{crop.name}</h3>
                  <p style={{ fontSize: 12, color: 'hsl(var(--text-muted))' }}>{crop.variety} · {crop.season}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button 
                    className="btn btn-ghost btn-sm btn-icon" 
                    title="Delete Crop" 
                    onClick={() => window.confirm('Permanently delete this crop record?') && deleteCropType(crop.id)}
                    style={{ color: 'hsl(var(--accent-red))', opacity: 0.6 }}
                  >
                    🗑
                  </button>
                  <StatusBadge status={crop.status} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                {[
                  { label: 'Planting Date', value: crop.planting_date },
                  { label: 'Harvest Date', value: crop.harvest_date },
                  { label: 'Area Planted', value: `${crop.area_planted} acres` },
                  { label: 'Expected Yield', value: `${crop.expected_yield.toLocaleString()} ${crop.unit}` },
                  ...(crop.actual_yield ? [{ label: 'Actual Yield', value: `${crop.actual_yield.toLocaleString()} ${crop.unit}` }] : []),
                ].map(s => (
                  <div key={s.label} style={{ background: 'hsl(var(--bg-secondary))', borderRadius: 6, padding: '8px 12px' }}>
                    <div style={{ fontSize: 10, color: 'hsl(var(--text-muted))', marginBottom: 2 }}>{s.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'hsl(var(--text-primary))' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {yieldPct !== null && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: 'hsl(var(--text-muted))' }}>Yield Achievement</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: yieldPct >= 100 ? 'hsl(var(--accent-green))' : 'hsl(var(--accent-amber))' }}>{yieldPct.toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(100, yieldPct)}%`, background: yieldPct >= 100 ? 'var(--accent-green)' : yieldPct >= 75 ? 'var(--accent-amber)' : 'var(--accent-red)' }} />
                  </div>
                </div>
              )}

              {crop.notes && <p style={{ marginTop: 10, fontSize: 12, color: 'hsl(var(--text-muted))', fontStyle: 'italic' }}>{crop.notes}</p>}
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">💸 Crop-Related Expenses</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Vendor</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {cropExpenses.sort((a, b) => b.date.localeCompare(a.date)).map(e => (
                <tr key={e.id}>
                  <td style={{ color: 'hsl(var(--text-muted))' }}>{e.date}</td>
                  <td>{e.description}</td>
                  <td><span className="badge badge-green">{e.category_name}</span></td>
                  <td style={{ fontSize: 12, color: 'hsl(var(--text-muted))' }}>{e.vendor_name}</td>
                  <td className="text-right font-bold" style={{ color: 'hsl(var(--accent-red))' }}>{formatCurrency(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <AddCropModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
