'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Vendor } from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';

function AddVendorModal({ onClose }: { onClose: () => void }) {
  const { addVendor } = useAppStore();
  const [form, setForm] = useState({ name: '', category: '', contact: '', email: '', phone: '', address: '', notes: '' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const vendor: Vendor = { id: `v-${uuidv4().slice(0, 8)}`, ...form };
    addVendor(vendor);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">🏪 Add Vendor</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="">Select...</option>
                <option>Feed Supplier</option>
                <option>Veterinary</option>
                <option>Chemicals & Fertilizers</option>
                <option>Construction</option>
                <option>Transportation</option>
                <option>Utilities</option>
                <option>Seeds & Planting</option>
                <option>Equipment</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Primary Contact</label>
              <input className="form-input" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Address</label>
              <input className="form-input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">💾 Save Vendor</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VendorsPage() {
  const { vendors, expenses, deleteVendor } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = vendors.filter(v =>
    !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase())
  );

  function getVendorSpend(vendorId: string) {
    return expenses.filter(e => e.vendor_id === vendorId).reduce((s, e) => s + e.amount, 0);
  }

  function getVendorTxnCount(vendorId: string) {
    return expenses.filter(e => e.vendor_id === vendorId).length;
  }

  const categoryMap: Record<string, string> = {
    'Feed Supplier': 'badge-green',
    'Veterinary': 'badge-blue',
    'Chemicals & Fertilizers': 'badge-teal',
    'Construction': 'badge-amber',
    'Transportation': 'badge-orange',
    'Utilities': 'badge-purple',
    'Seeds & Planting': 'badge-green',
    'Equipment': 'badge-gray',
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">🏪 Vendors & Suppliers</div>
          <div className="page-subtitle">Manage all business vendors, suppliers, and contacts</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Vendor</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filtered.map(vendor => {
          const spend = getVendorSpend(vendor.id);
          const txns = getVendorTxnCount(vendor.id);
          return (
            <div className="card" key={vendor.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{vendor.name}</div>
                  <span className={`badge ${categoryMap[vendor.category] || 'badge-gray'}`}>{vendor.category}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {spend > 0 && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent-red)' }}>{new Intl.NumberFormat('en-JM', { style: 'currency', currency: 'JMD', minimumFractionDigits: 0 }).format(spend)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{txns} transactions</div>
                    </div>
                  )}
                  <button 
                    className="btn btn-ghost btn-sm btn-icon" 
                    title="Delete Vendor" 
                    onClick={() => window.confirm('Delete this vendor?') && deleteVendor(vendor.id)}
                    style={{ color: 'var(--accent-red)', opacity: 0.6 }}
                  >
                    🗑
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {vendor.contact && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>👤 {vendor.contact}</div>}
                {vendor.phone && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📞 {vendor.phone}</div>}
                {vendor.email && <div style={{ fontSize: 12, color: 'var(--accent-blue)' }}>✉️ {vendor.email}</div>}
                {vendor.address && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {vendor.address}</div>}
                {vendor.notes && <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 4 }}>{vendor.notes}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {showAdd && <AddVendorModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
