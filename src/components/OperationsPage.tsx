'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { BUSINESS_SEGMENTS, formatCurrency } from '@/lib/data';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function AddSalesModal({ onClose }: { onClose: () => void }) {
  const { addSalesRecord } = useAppStore();
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    customer: '',
    item_name: '',
    quantity: '',
    unit_price: '',
    segment_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const seg = BUSINESS_SEGMENTS.find(s => s.id === form.segment_id);
    await addSalesRecord({
      date: form.date,
      customer: form.customer,
      item_name: form.item_name,
      quantity: parseFloat(form.quantity),
      unit_price: parseFloat(form.unit_price),
      segment_id: form.segment_id,
      segment_name: seg?.name || '',
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">💰 Log New Sale</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Date</label>
            <input type="date" className="form-input" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Customer Name</label>
            <input type="text" className="form-input" placeholder="Guest / Regular" value={form.customer} onChange={e => setForm({...form, customer: e.target.value})} />
          </div>
          <div className="form-group full-width" style={{ gridColumn: 'span 2' }}>
            <label>Produce / Item Sold</label>
            <input type="text" className="form-input" placeholder="e.g. 30ct Egg Tray, 5lb Scotch Bonnet" required value={form.item_name} onChange={e => setForm({...form, item_name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input type="number" className="form-input" required value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Unit Price ($)</label>
            <input type="number" className="form-input" required value={form.unit_price} onChange={e => setForm({...form, unit_price: e.target.value})} />
          </div>
          <div className="form-group full-width" style={{ gridColumn: 'span 2' }}>
            <label>Business Segment</label>
            <select className="form-select" required value={form.segment_id} onChange={e => setForm({...form, segment_id: e.target.value})}>
              <option value="">Select segment...</option>
              {BUSINESS_SEGMENTS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: 'span 2', marginTop: 8 }}>
            <button type="submit" className="btn btn-primary w-full">Save Sale Record</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddProductionModal({ onClose }: { onClose: () => void }) {
  const { addProductionRecord } = useAppStore();
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    item_name: '',
    quantity: '',
    unit: 'units',
    segment_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const seg = BUSINESS_SEGMENTS.find(s => s.id === form.segment_id);
    await addProductionRecord({
      date: form.date,
      item_name: form.item_name,
      quantity: parseFloat(form.quantity),
      unit: form.unit,
      segment_id: form.segment_id,
      segment_name: seg?.name || '',
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🌾 Log Yield / Production</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Date</label>
            <input type="date" className="form-input" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Item / Crop</label>
            <input type="text" className="form-input" placeholder="e.g. Eggs, Cassava" required value={form.item_name} onChange={e => setForm({...form, item_name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input type="number" className="form-input" required value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Unit</label>
            <select className="form-select" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
              <option value="units">Units</option>
              <option value="lbs">Pounds (lbs)</option>
              <option value="kgs">Kilograms (kg)</option>
              <option value="crates">Crates</option>
              <option value="trays">Trays</option>
            </select>
          </div>
          <div className="form-group full-width" style={{ gridColumn: 'span 2' }}>
            <label>Business Segment</label>
            <select className="form-select" required value={form.segment_id} onChange={e => setForm({...form, segment_id: e.target.value})}>
              <option value="">Select segment...</option>
              {BUSINESS_SEGMENTS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: 'span 2', marginTop: 8 }}>
            <button type="submit" className="btn btn-primary w-full">Save Production Log</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OperationsPage() {
  const { sales, production, deleteSalesRecord, deleteProductionRecord } = useAppStore();
  const [tab, setTab] = useState<'sales' | 'yield'>('sales');
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showProdModal, setShowProdModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    let headers: string[] = [];
    let rows: any[] = [];
    let filename = '';

    if (tab === 'sales') {
      headers = ['Date', 'Item', 'Customer', 'Segment', 'Quantity', 'Unit Price', 'Total Amount'];
      rows = sales.map(s => [s.date, `"${s.item_name}"`, `"${s.customer || ''}"`, `"${s.segment_name}"`, s.quantity, s.unit_price, s.total_amount || s.quantity * s.unit_price]);
      filename = `Braes_Creek_Sales_${new Date().toISOString().split('T')[0]}`;
    } else {
      headers = ['Date', 'Product', 'Segment', 'Quantity', 'Unit'];
      rows = production.map(p => [p.date, `"${p.item_name}"`, `"${p.segment_name}"`, p.quantity, p.unit]);
      filename = `Braes_Creek_Production_${new Date().toISOString().split('T')[0]}`;
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsExporting(false), 800);
  };

  const totalRevenue = sales.reduce((s, r) => s + (r.total_amount || 0), 0);
  const totalSalesCount = sales.length;

  return (
    <div>
      {showSalesModal && <AddSalesModal onClose={() => setShowSalesModal(false)} />}
      {showProdModal && <AddProductionModal onClose={() => setShowProdModal(false)} />}
      
      <div className="page-header">
        <div>
          <div className="page-title">🚜 Operations & Yield</div>
          <div className="page-subtitle">Track farm production, harvests, and direct sales revenue</div>
        </div>
        <div className="page-actions">
          <button 
            className={`btn btn-outline btn-sm ${isExporting ? 'animate-pulse' : ''}`} 
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? '⌛ Exporting...' : '📤 Export to Excel'}
          </button>
          {tab === 'sales' ? (
            <button className="btn btn-primary" onClick={() => setShowSalesModal(true)}>+ Log Sale</button>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowProdModal(true)}>+ Log Production</button>
          )}
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card teal">
          <div className="kpi-icon">💰</div>
          <div className="kpi-label">Total Revenue</div>
          <div className="kpi-value">{formatCurrency(totalRevenue)}</div>
          <div className="kpi-sub">Gross income recorded</div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-icon">🧾</div>
          <div className="kpi-label">Sales Transactions</div>
          <div className="kpi-value">{totalSalesCount}</div>
          <div className="kpi-sub">Customer orders billed</div>
        </div>
        <div className="kpi-card amber">
          <div className="kpi-icon">🌾</div>
          <div className="kpi-label">Production Logs</div>
          <div className="kpi-value">{production.length}</div>
          <div className="kpi-sub">Total harvests recorded</div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'sales' ? 'active' : ''}`} onClick={() => setTab('sales')}>💸 Sales Revenue</button>
        <button className={`tab-btn ${tab === 'yield' ? 'active' : ''}`} onClick={() => setTab('yield')}>📦 Yield & Production</button>
      </div>

      {tab === 'sales' && (
        <div className="card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Item</th>
                <th>Customer</th>
                <th>Segment</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Unit Price</th>
                <th className="text-right">Total</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr><td colSpan={8} className="text-center" style={{ padding: 40, color: 'var(--text-muted)' }}>No sales recorded. Start tracking your income!</td></tr>
              ) : sales.sort((a,b) => b.date.localeCompare(a.date)).map(s => (
                <tr key={s.id}>
                  <td style={{ color: 'hsl(var(--text-muted))' }}>{s.date}</td>
                  <td style={{ fontWeight: 600 }}>{s.item_name}</td>
                  <td style={{ fontSize: 12 }}>{s.customer || '—'}</td>
                  <td><span className="badge badge-blue">{s.segment_name}</span></td>
                  <td className="text-right">{s.quantity}</td>
                  <td className="text-right">{formatCurrency(s.unit_price)}</td>
                  <td className="text-right font-bold" style={{ color: 'hsl(var(--accent-teal))' }}>{formatCurrency(s.total_amount || s.quantity * s.unit_price)}</td>
                  <td className="text-right">
                    <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'hsl(var(--accent-red))' }} onClick={() => deleteSalesRecord(s.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'yield' && (
        <div className="card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Segment</th>
                <th className="text-right">Quantity</th>
                <th>Unit</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {production.length === 0 ? (
                <tr><td colSpan={6} className="text-center" style={{ padding: 40, color: 'var(--text-muted)' }}>No production logs found. Record your first harvest!</td></tr>
              ) : production.sort((a,b) => b.date.localeCompare(a.date)).map(p => (
                <tr key={p.id}>
                  <td style={{ color: 'hsl(var(--text-muted))' }}>{p.date}</td>
                  <td style={{ fontWeight: 600 }}>{p.item_name}</td>
                  <td><span className="badge badge-amber">{p.segment_name}</span></td>
                  <td className="text-right font-bold">{p.quantity}</td>
                  <td style={{ color: 'hsl(var(--text-muted))' }}>{p.unit}</td>
                  <td className="text-right">
                    <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'hsl(var(--accent-red))' }} onClick={() => deleteProductionRecord(p.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
