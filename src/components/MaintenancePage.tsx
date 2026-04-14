'use client';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/data';
import { useState } from 'react';

function AddMaintenanceModal({ onClose }: { onClose: () => void }) {
  const { addMaintenanceRecord } = useAppStore();
  const [form, setForm] = useState({
    equipment_name: '',
    maintenance_type: 'Routine',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    next_due_date: '',
    cost: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.equipment_name || !form.date) return;

    await addMaintenanceRecord({
      id: crypto.randomUUID(),
      equipment_name: form.equipment_name,
      maintenance_type: form.maintenance_type,
      date: form.date,
      vendor: form.vendor,
      next_due_date: form.next_due_date || undefined,
      status: 'completed',
      cost: parseFloat(form.cost) || 0,
      notes: form.notes
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🔧 Log Maintenance Activity</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Equipment Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Tractor, Broiler House 1"
                required
                value={form.equipment_name}
                onChange={e => setForm({...form, equipment_name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Maintenance Type</label>
              <select 
                className="form-select"
                value={form.maintenance_type}
                onChange={e => setForm({...form, maintenance_type: e.target.value})}
              >
                <option>Routine</option>
                <option>Repair</option>
                <option>Upgrade</option>
                <option>Cleaning</option>
              </select>
            </div>
            <div className="form-group">
              <label>Service Date</label>
              <input 
                type="date" 
                className="form-input" 
                required
                value={form.date}
                onChange={e => setForm({...form, date: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Service Vendor</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Vendor or Technician"
                value={form.vendor}
                onChange={e => setForm({...form, vendor: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Next Due Date (Opt)</label>
              <input 
                type="date" 
                className="form-input" 
                value={form.next_due_date}
                onChange={e => setForm({...form, next_due_date: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Total Cost ($)</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="0.00"
                value={form.cost}
                onChange={e => setForm({...form, cost: e.target.value})}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Notes / Work Performed</label>
            <textarea 
              className="form-input" 
              rows={3}
              value={form.notes}
              onChange={e => setForm({...form, notes: e.target.value})}
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>Save Maintenance Record</button>
        </form>
      </div>
    </div>
  );
}

export default function MaintenancePage() {
  const { maintenanceRecords, expenses } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  
  const feedExpenses = expenses.filter(e => ['cat-006', 'cat-007', 'cat-008', 'cat-009', 'cat-010'].includes(e.category_id));

  const totalFeedCost = feedExpenses.reduce((s, e) => s + e.amount, 0);
  const overdue = maintenanceRecords.filter(m => m.status === 'overdue');
  const scheduled = maintenanceRecords.filter(m => m.status === 'scheduled');

  return (
    <div>
      {showModal && <AddMaintenanceModal onClose={() => setShowModal(false)} />}
      <div className="page-header">
        <div>
          <div className="page-title">🔧 Maintenance & Feed Supplies</div>
          <div className="page-subtitle">Equipment maintenance schedule and feed purchase tracking</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Log Maintenance</button>
        </div>
      </div>

      {overdue.length > 0 && (
        <div className="alert alert-warning">
          🔧 <strong>{overdue.length} maintenance item(s) overdue</strong>: {overdue.map(m => m.equipment_name).join(', ')}
        </div>
      )}

      {/* Maintenance */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">🔧 Equipment Maintenance Records</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Type</th>
                <th>Date</th>
                <th>Vendor</th>
                <th>Next Due</th>
                <th>Status</th>
                <th className="text-right">Cost</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceRecords.map(m => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.equipment_name}</td>
                  <td><span className="badge badge-blue">{m.maintenance_type}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{m.date}</td>
                  <td style={{ fontSize: 12 }}>{m.vendor || '—'}</td>
                  <td style={{ fontSize: 12, color: m.status === 'overdue' ? 'var(--accent-red)' : 'var(--text-muted)' }}>{m.next_due_date}</td>
                  <td>
                    <span className={`badge ${m.status === 'completed' ? 'badge-green' : m.status === 'overdue' ? 'badge-red' : 'badge-amber'}`}>
                      {m.status === 'completed' ? '✅' : m.status === 'overdue' ? '⚠️' : '📅'} {m.status}
                    </span>
                  </td>
                  <td className="text-right" style={{ color: m.cost > 0 ? 'var(--accent-red)' : 'var(--text-muted)', fontWeight: m.cost > 0 ? 700 : 400 }}>{m.cost > 0 ? formatCurrency(m.cost) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feed Tracking */}
      <div className="card">
        <div className="card-title">🌾 Feed & Supply Purchases</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 16px', flex: 1, minWidth: 150 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Total Feed Cost</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-amber)' }}>{formatCurrency(totalFeedCost)}</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 16px', flex: 1, minWidth: 150 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Feed Transactions</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{feedExpenses.length}</div>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Feed Type</th>
                <th>Vendor</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {feedExpenses.sort((a, b) => b.date.localeCompare(a.date)).map(e => (
                <tr key={e.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{e.date}</td>
                  <td>{e.description}</td>
                  <td><span className="badge badge-amber">{e.category_name}</span></td>
                  <td style={{ fontSize: 12 }}>{e.vendor_name}</td>
                  <td className="text-right font-bold" style={{ color: 'var(--accent-amber)' }}>{formatCurrency(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
