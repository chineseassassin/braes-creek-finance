import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { formatCurrency, BUSINESS_SEGMENTS } from '@/lib/data';

function AddLivestockModal({ onClose }: { onClose: () => void }) {
  const { addLivestockUnit } = useAppStore();
  const [form, setForm] = useState({
    animal_type: '',
    breed: '',
    quantity: '',
    purchase_date: new Date().toISOString().split('T')[0],
    acquisition_date: new Date().toISOString().split('T')[0],
    acquisition_cost: '',
    current_value: '',
    location: '',
    segment_id: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addLivestockUnit({
      animal_type: form.animal_type,
      breed: form.breed,
      quantity: parseInt(form.quantity),
      purchase_date: form.purchase_date,
      acquisition_date: form.acquisition_date,
      acquisition_cost: parseFloat(form.acquisition_cost),
      current_value: parseFloat(form.current_value),
      mortality_qty: 0,
      location: form.location,
      segment_id: form.segment_id,
      notes: form.notes,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🐄 Add New Livestock Unit</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Animal Type</label>
            <input type="text" className="form-input" placeholder="e.g. Broiler Chicken, Boer Goat" required value={form.animal_type} onChange={e => setForm({...form, animal_type: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Breed</label>
            <input type="text" className="form-input" placeholder="e.g. Ross 308, Angus" value={form.breed} onChange={e => setForm({...form, breed: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Initial Quantity</label>
            <input type="number" className="form-input" required value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Location / Pen</label>
            <input type="text" className="form-input" placeholder="e.g. House A, Back Pasture" required value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Purchase Date</label>
            <input type="date" className="form-input" required value={form.purchase_date} onChange={e => setForm({...form, purchase_date: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Internal Track Date</label>
            <input type="date" className="form-input" value={form.acquisition_date} onChange={e => setForm({...form, acquisition_date: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Total Acquisition Cost ($)</label>
            <input type="number" className="form-input" required value={form.acquisition_cost} onChange={e => setForm({...form, acquisition_cost: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Current Est. Value ($)</label>
            <input type="number" className="form-input" required value={form.current_value} onChange={e => setForm({...form, current_value: e.target.value})} />
          </div>
          <div className="form-group full-width" style={{ gridColumn: 'span 2' }}>
            <label>Business Segment</label>
            <select className="form-select" required value={form.segment_id} onChange={e => setForm({...form, segment_id: e.target.value})}>
              <option value="">Select segment...</option>
              {BUSINESS_SEGMENTS.filter(s => ['seg-001','seg-002','seg-003','seg-004','seg-005'].includes(s.id)).map(s => (
                <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group full-width" style={{ gridColumn: 'span 2' }}>
            <label>Notes</label>
            <textarea className="form-input" placeholder="Vaccination status, source, etc." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          </div>
          <div style={{ gridColumn: 'span 2', marginTop: 8 }}>
            <button type="submit" className="btn btn-primary w-full">Save Livestock Record</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LivestockCard({ unit, onDelete }: { unit: import('@/lib/data').LivestockUnit, onDelete: (id: string) => void }) {
  const costPerHead = unit.quantity > 0 ? unit.acquisition_cost / unit.quantity : 0;
  const valuePerHead = unit.quantity > 0 ? unit.current_value / unit.quantity : 0;
  const roi = unit.acquisition_cost > 0 ? ((unit.current_value - unit.acquisition_cost) / unit.acquisition_cost * 100) : 0;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'hsl(var(--text-primary))' }}>{unit.animal_type}</h3>
          <p style={{ fontSize: 12, color: 'hsl(var(--text-muted))' }}>{unit.breed} · {unit.location}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            className="btn btn-ghost btn-sm btn-icon" 
            title="Delete Record" 
            onClick={() => window.confirm('Permanently delete this livestock record?') && onDelete(unit.id)}
            style={{ color: 'hsl(var(--accent-red))' }}
          >
            🗑
          </button>
          <div style={{ fontSize: 32, opacity: 0.8 }}>
            {unit.animal_type.toLowerCase().includes('chicken') || unit.animal_type.toLowerCase().includes('broiler') ? '🐔' : 
             unit.animal_type.toLowerCase().includes('layer') ? '🥚' : 
             unit.animal_type.toLowerCase().includes('goat') ? '🐐' : 
             unit.animal_type.toLowerCase().includes('pig') ? '🐷' : '🐄'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
        {[
          { label: 'Quantity', value: unit.quantity?.toLocaleString() || '0', color: 'hsl(var(--accent-blue))' },
          { label: 'Mortality', value: unit.mortality_qty?.toLocaleString() || '0', color: (unit.mortality_qty || 0) > 0 ? 'hsl(var(--accent-red))' : 'hsl(var(--text-muted))' },
          { label: 'Acq. Date', value: unit.acquisition_date || '—', color: 'hsl(var(--text-muted))' },
          { label: 'Pur. Date', value: unit.purchase_date || '—', color: 'hsl(var(--text-muted))' },
          { label: 'Acq. Cost', value: formatCurrency(unit.acquisition_cost || 0), color: 'hsl(var(--text-primary))' },
          { label: 'Current Value', value: formatCurrency(unit.current_value || 0), color: roi >= 0 ? 'hsl(var(--accent-green))' : 'hsl(var(--accent-red))' },
          { label: 'Cost/Head', value: formatCurrency(costPerHead), color: 'hsl(var(--text-secondary))' },
          { label: 'Value/Head', value: formatCurrency(valuePerHead), color: 'hsl(var(--text-secondary))' },
          { label: 'Net Profit', value: formatCurrency(unit.net_profit || (unit.current_value - unit.acquisition_cost)), color: 'hsl(var(--accent-green))' },
        ].map(s => (
          <div key={s.label} style={{ background: 'hsl(var(--bg-secondary) / 0.5)', borderRadius: 6, padding: '8px 12px', border: '1px solid hsl(var(--border) / 0.2)' }}>
            <div style={{ fontSize: 9, color: 'hsl(var(--text-muted))', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {unit.slaughter_date && (
        <div style={{ background: 'rgba(239, 68, 68, 0.05)', borderRadius: 6, padding: '10px 12px', border: '1px solid rgba(239, 68, 68, 0.1)', marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: 'hsl(var(--accent-red))', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>🪓 Slaughter Record</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'hsl(var(--text-primary))' }}>
            <span><strong>Date:</strong> {unit.slaughter_date}</span>
            <span><strong>Qty:</strong> {unit.slaughter_qty}</span>
            <span><strong>Weight:</strong> {unit.slaughter_weight} lbs</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className={`badge ${roi >= 0 ? 'badge-green' : 'badge-red'}`}>
          ROI: {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
        </span>
        {unit.notes && <span style={{ fontSize: 11, color: 'hsl(var(--text-muted))', fontStyle: 'italic', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{unit.notes}</span>}
      </div>
    </div>
  );
}

export default function LivestockPage() {
  const { livestockUnits, expenses, deleteLivestockUnit } = useAppStore();
  const [showModal, setShowModal] = useState(false);

  const totalHead = livestockUnits.reduce((s, u) => s + (u.quantity || 0), 0);
  const totalAcqCost = livestockUnits.reduce((s, u) => s + (u.acquisition_cost || 0), 0);
  const totalCurrentValue = livestockUnits.reduce((s, u) => s + (u.current_value || 0), 0);
  const livestockExpenses = expenses.filter(e => ['seg-001', 'seg-002', 'seg-003', 'seg-004', 'seg-005'].includes(e.segment_id));
  const totalOpCost = livestockExpenses.reduce((s, e) => s + e.amount, 0);

  const handleExport = () => {
    const headers = ['Type', 'Breed', 'Location', 'Qty', 'Mortality', 'Acq Date', 'Purchase Date', 'Acq Cost', 'Current Value', 'ROI %'];
    const rows = livestockUnits.map(u => {
      const roi = u.acquisition_cost > 0 ? ((u.current_value - u.acquisition_cost) / u.acquisition_cost * 100) : 0;
      return [
        `"${u.animal_type}"`,
        `"${u.breed}"`,
        `"${u.location}"`,
        u.quantity,
        u.mortality_qty,
        u.acquisition_date,
        u.purchase_date,
        u.acquisition_cost,
        u.current_value,
        roi.toFixed(1)
      ];
    });
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Braes_Creek_Livestock_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {showModal && <AddLivestockModal onClose={() => setShowModal(false)} />}
      
      <div className="page-header">
        <div>
          <div className="page-title">🐄 Livestock Operations</div>
          <div className="page-subtitle">Track all animal units, values, and operating costs</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={handleExport}>📤 Export to Excel</button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Livestock</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi-card teal">
          <div className="kpi-icon">🐄</div>
          <div className="kpi-label">Total Head Count</div>
          <div className="kpi-value">{totalHead.toLocaleString()}</div>
          <div className="kpi-sub">{livestockUnits.length} animal types</div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-icon">💲</div>
          <div className="kpi-label">Total Acquisition Cost</div>
          <div className="kpi-value">{formatCurrency(totalAcqCost)}</div>
          <div className="kpi-sub">Original investment</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-icon">📈</div>
          <div className="kpi-label">Current Livestock Value</div>
          <div className="kpi-value">{formatCurrency(totalCurrentValue)}</div>
          <div className="kpi-sub">{totalAcqCost > 0 ? ((totalCurrentValue - totalAcqCost) / totalAcqCost * 100).toFixed(1) : 0}% gain</div>
        </div>
        <div className="kpi-card amber">
          <div className="kpi-icon">💸</div>
          <div className="kpi-label">Operating Costs</div>
          <div className="kpi-value">{formatCurrency(totalOpCost)}</div>
          <div className="kpi-sub">Feed, vet, labor tracked</div>
        </div>
      </div>

      <div className="grid-auto">
        {livestockUnits.map(unit => <LivestockCard key={unit.id} unit={unit} onDelete={deleteLivestockUnit} />)}
      </div>

      {/* Cost breakdown by animal type */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">💸 Operating Expenses by Livestock Type</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Segment</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {livestockExpenses.length === 0 ? (
                <tr><td colSpan={5} className="text-center" style={{ padding: 40, color: 'hsl(var(--text-muted))' }}>No livestock expenses found.</td></tr>
              ) : livestockExpenses.sort((a, b) => b.date.localeCompare(a.date)).map(e => (
                <tr key={e.id}>
                  <td style={{ color: 'hsl(var(--text-muted))' }}>{e.date}</td>
                  <td>{e.description}</td>
                  <td><span className="badge badge-gray">{e.category_name}</span></td>
                  <td style={{ fontSize: 12 }}>{e.segment_name}</td>
                  <td className="text-right font-bold" style={{ color: 'hsl(var(--accent-red))' }}>{formatCurrency(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
