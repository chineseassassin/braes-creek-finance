'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';

function AddInventoryModal({ onClose }: { onClose: () => void }) {
  const { addInventoryItem, currentUser, addAuditLog } = useAppStore();
  const [form, setForm] = useState({
    item_name: '',
    category: 'Feed',
    sku: '',
    current_stock: '',
    min_threshold: '10',
    unit: 'bags',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const item = {
      item_name: form.item_name,
      category: form.category,
      sku: form.sku,
      current_stock: parseFloat(form.current_stock || '0'),
      min_threshold: parseFloat(form.min_threshold || '10'),
      unit: form.unit,
    };
    await addInventoryItem(item);
    addAuditLog({
      id: uuidv4(),
      user_name: currentUser.name,
      action: 'CREATE',
      table_name: 'inventory',
      record_id: 'pending',
      details: `Added inventory item: ${item.item_name} (${item.current_stock} ${item.unit})`,
      timestamp: new Date().toISOString(),
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">📦 Add Inventory Item</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Item name</label>
              <input className="form-input" value={form.item_name} onChange={e => setForm(f => ({ ...f, item_name: e.target.value }))} required placeholder="e.g. Hi-Pro Broiler Starter" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option>Feed</option>
                <option>Fertilizer</option>
                <option>Medication</option>
                <option>Fuel</option>
                <option>Tools</option>
                <option>Seeds</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">SKU / Code</label>
              <input className="form-input" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="Optional" />
            </div>
            <div className="form-group">
              <label className="form-label">Initial Stock</label>
              <input type="number" className="form-input" value={form.current_stock} onChange={e => setForm(f => ({ ...f, current_stock: e.target.value }))} required min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Min. Threshold (Alert)</label>
              <input type="number" className="form-input" value={form.min_threshold} onChange={e => setForm(f => ({ ...f, min_threshold: e.target.value }))} required min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-select" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                <option value="bags">bags</option>
                <option value="kgs">kg</option>
                <option value="lbs">lbs</option>
                <option value="litres">litres</option>
                <option value="units">units</option>
                <option value="crates">crates</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">💾 Save Item</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const { inventory, updateStock, deleteInventoryItem } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = inventory.filter(i => 
    i.item_name.toLowerCase().includes(search.toLowerCase()) || 
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = inventory.filter(i => i.current_stock <= i.min_threshold);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">📦 Inventory & Supplies</div>
          <div className="page-subtitle">Manage farm stock levels, fuel, and feed</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Item</button>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="alert" style={{ marginBottom: 20, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <strong style={{ color: 'var(--accent-red)' }}>Low Stock Alert</strong>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {lowStock.length} items are below their minimum threshold: {lowStock.map(i => i.item_name).join(', ')}.
            </p>
          </div>
        </div>
      )}

      <div className="filter-bar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input type="text" className="search-input" placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Status</th>
              <th className="text-right">Stock Level</th>
              <th>Threshold</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No inventory items found</td></tr>
            ) : filtered.map(item => {
              const stockPct = Math.min(100, (item.current_stock / (item.min_threshold * 3)) * 100);
              const isLow = item.current_stock <= item.min_threshold;
              
              return (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.item_name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>SKU: {item.sku || 'N/A'}</div>
                  </td>
                  <td><span className="badge badge-gray">{item.category}</span></td>
                  <td>
                    {isLow ? <span className="badge badge-red">Low Stock</span> : <span className="badge badge-green">In Stock</span>}
                  </td>
                  <td className="text-right">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: isLow ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                        {item.current_stock} {item.unit}
                      </span>
                      <div className="progress-bar" style={{ width: 80, height: 4 }}>
                        <div className="progress-fill" style={{ width: `${stockPct}%`, background: isLow ? 'var(--accent-red)' : 'var(--accent-blue)' }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{item.min_threshold} {item.unit}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {item.last_restocked ? new Date(item.last_restocked).toLocaleDateString() : 'Never'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost btn-sm btn-icon" title="Update Stock" onClick={() => {
                        const amt = prompt(`Add/Subtract stock for ${item.item_name}:`, '0');
                        if (amt) updateStock(item.id, item.current_stock + parseFloat(amt));
                      }}>➕</button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => deleteInventoryItem(item.id)} style={{ color: 'var(--accent-red)' }}>🗑</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAdd && <AddInventoryModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
