"use client";

import { useEffect, useState, useMemo } from 'react';
import Sidebar from "@/components/Sidebar";
import NotificationCenter from "@/components/NotificationCenter";
import ThemeToggle from "@/components/ThemeToggle";
import { useInventoryStore } from '@/store/useInventoryStore';
import { useUIStore } from '@/store/useUIStore';
import { useAppStore } from '@/store/useAppStore';
import { 
  Plus, Search, Filter, Download, 
  Package, Boxes, RefreshCw, AlertCircle, 
  MoreVertical, Sparkles, Activity, X, 
  PlusCircle, MinusCircle, History, Edit2, Truck
} from "lucide-react";
import { toast, Toaster } from 'react-hot-toast';
import { THEME_COLORS as COLORS } from '@/lib/theme-colors';

const CATEGORIES = ['Feed', 'Fertilizer', 'Chemical', 'Medicine', 'Building Material', 'Fuel', 'Equipment', 'Other'];

export default function InventoryPage() {
  const { sidebarCollapsed } = useUIStore();
  const { currentUser } = useAppStore();
  const { items, isLoading, addItem, updateStock } = useInventoryStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [stockAction, setStockAction] = useState<'add' | 'use'>('add');
  const [stockAmount, setStockAmount] = useState('');
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [form, setForm] = useState({
    itemName: '', category: 'Feed' as any, quantity: '', unit: '',
    reorderThreshold: '', criticalThreshold: '', unitCost: '',
    vendorName: '', notes: ''
  });

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === "All" || item.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [items, searchTerm, categoryFilter]);

  const approvedItems = useMemo(() => items.filter(i => i.workflow_status === 'approved'), [items]);
  const totalValue = useMemo(() => approvedItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0), [approvedItems]);
  const lowStockCount = approvedItems.filter(item => item.quantity <= item.reorderThreshold).length;
  const criticalCount = approvedItems.filter(item => item.quantity <= item.criticalThreshold).length;
  const criticalItem = approvedItems.find(item => item.quantity <= item.criticalThreshold);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      quantity: parseFloat(form.quantity) || 0,
      reorderThreshold: parseFloat(form.reorderThreshold) || 0,
      criticalThreshold: parseFloat(form.criticalThreshold) || 0,
      unitCost: parseFloat(form.unitCost) || 0,
    };

    const result = await addItem(payload);
    if (result) {
      if (currentUser.role === 'admin') {
        toast.success('Inventory item saved & approved');
      } else {
        toast.success('Submitted for approval');
      }
      setIsModalOpen(false);
      setForm({
        itemName: '', category: 'Feed', quantity: '', unit: '',
        reorderThreshold: '', criticalThreshold: '', unitCost: '',
        vendorName: '', notes: ''
      });
    }
  };

  const handleStockUpdate = async () => {
    if (!selectedItem || !stockAmount) return;
    await updateStock(selectedItem.id, parseFloat(stockAmount), stockAction);
    toast.success(`Stock ${stockAction === 'add' ? 'added' : 'reduced'} successfully`);
    setIsStockModalOpen(false);
    setStockAmount('');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-body)' }}>
      <Toaster position="top-right" />
      <Sidebar />

      <div style={{ marginLeft: sidebarCollapsed ? 64 : 250, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease' }}>
        
        <header style={{ height: 72, background: 'var(--bg-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid var(--border-soft)` }}>
          <div>
             <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Inventory & Supply Control</h1>
             <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>Strategic stock management & predictive logistics</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ThemeToggle />
            <NotificationCenter />
            <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
               <Plus size={16} /> Add Item
            </button>
          </div>
        </header>

        <main style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          
          {/* INVENTORY STATUS HERO */}
          <div style={{ marginBottom: 32, background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-elevated) 100%)', border: `1px solid var(--border-soft)`, borderRadius: 24, padding: '32px', position: 'relative', overflow: 'hidden' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Inventory Health:</span>
                      <span className={`badge ${criticalCount > 0 ? 'badge-critical' : (lowStockCount > 0 ? 'badge-warning' : 'badge-healthy')}`}>
                        {criticalCount > 0 ? 'CRITICAL' : (lowStockCount > 0 ? 'AT RISK' : 'HEALTHY')}
                      </span>
                   </div>
                   
                   <div style={{ display: 'flex', gap: 64, marginBottom: 32 }}>
                      <div>
                         <div className="label-small">Total Asset Value</div>
                         <div className="metric-main">{fmt(totalValue)}</div>
                      </div>
                      <div>
                         <div className="label-small">Shortage Alerts</div>
                         <div className="metric-main" style={{ color: criticalCount > 0 ? 'var(--status-critical)' : 'var(--text-primary)' }}>{criticalCount + lowStockCount}</div>
                      </div>
                      <div>
                         <div className="label-small">Active SKUs</div>
                         <div className="metric-main" style={{ fontSize: 24 }}>{approvedItems.length} items</div>
                      </div>
                   </div>

                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'var(--status-ai-glow)', borderRadius: 16, border: '1px solid var(--border-soft)', maxWidth: 800 }}>
                      <Sparkles size={18} color="var(--status-ai)" />
                      <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>
                         <span style={{ fontWeight: 800 }}>AI Insight:</span> {criticalItem ? `${criticalItem.itemName} is below critical threshold. Reorder immediately from ${criticalItem.vendorName || 'primary vendor'}.` : "All supplies are within healthy operational thresholds."}
                      </div>
                   </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   <button className="btn-secondary" style={{ width: 160 }}>Log Supply Audit</button>
                   <button className="btn-primary" style={{ width: 160 }}>Bulk Reorder</button>
                </div>
             </div>
          </div>

          <div className="grid-12" style={{ gap: 24, marginBottom: 32 }}>
             <div className="col-8 card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <h3 className="card-title">Stock Asset Ledger</h3>
                   <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '0 16px', height: 40 }}>
                         <Search size={14} color="var(--text-muted)" />
                         <input 
                           placeholder="Filter ledger..." 
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 13, width: 180 }} 
                         />
                      </div>
                      <select 
                        className="saas-input" 
                        style={{ height: 40, padding: '0 12px' }}
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                      >
                         <option value="All">All Categories</option>
                         {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                   </div>
                </div>

                <table className="saas-table">
                   <thead>
                      <tr>
                         <th>Item & Category</th>
                         <th>In Stock</th>
                         <th>Valuation</th>
                         <th>Status</th>
                         <th>Actions</th>
                      </tr>
                   </thead>
                   <tbody>
                      {filteredItems.map((item) => {
                         const isCritical = item.quantity <= item.criticalThreshold;
                         const isLow = item.quantity <= item.reorderThreshold;
                         const isPending = item.workflow_status === 'pending';

                         return (
                            <tr key={item.id} style={{ opacity: isPending ? 0.7 : 1 }}>
                               <td>
                                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 14 }}>{item.itemName}</div>
                                  <div className="label-small" style={{ fontSize: 9 }}>{item.category.toUpperCase()}</div>
                               </td>
                               <td>
                                  <div style={{ fontSize: 15, fontWeight: 900, color: isCritical ? 'var(--status-critical)' : 'var(--text-primary)' }}>
                                     {item.quantity} <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{item.unit}</span>
                                  </div>
                               </td>
                               <td>
                                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(item.quantity * item.unitCost)}</div>
                                  <div className="label-small" style={{ fontSize: 9 }}>{fmt(item.unitCost)} / {item.unit}</div>
                               </td>
                               <td>
                                  {isPending ? (
                                    <span className="badge badge-warning">PENDING</span>
                                  ) : (
                                    <span className={`badge ${isCritical ? 'badge-critical' : (isLow ? 'badge-warning' : 'badge-healthy')}`}>
                                       {isCritical ? 'CRITICAL' : (isLow ? 'LOW STOCK' : 'HEALTHY')}
                                    </span>
                                  )}
                               </td>
                               <td>
                                  <div style={{ display: 'flex', gap: 6 }}>
                                     <button className="btn-ghost-small" title="Add Stock" onClick={() => { setSelectedItem(item); setStockAction('add'); setIsStockModalOpen(true); }}><PlusCircle size={14} /></button>
                                     <button className="btn-ghost-small" title="Use Stock" onClick={() => { setSelectedItem(item); setStockAction('use'); setIsStockModalOpen(true); }}><MinusCircle size={14} /></button>
                                     <button className="btn-ghost-small"><MoreVertical size={14} /></button>
                                  </div>
                               </td>
                            </tr>
                         )
                      })}
                      {filteredItems.length === 0 && (
                        <tr>
                           <td colSpan={5} style={{ textAlign: 'center', padding: '60px 0' }}>
                              <Boxes size={48} color="var(--text-muted)" style={{ opacity: 0.2, marginBottom: 16, marginInline: 'auto' }} />
                              <div style={{ fontWeight: 800, color: 'var(--text-muted)' }}>No matching inventory found</div>
                           </td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>

             <div className="col-4">
                <div className="card" style={{ padding: '24px', marginBottom: 24 }}>
                   <h3 className="card-title" style={{ marginBottom: 20 }}>Operational Alerts</h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {approvedItems.filter(i => i.quantity <= i.reorderThreshold).map(item => (
                        <div key={item.id} style={{ padding: '16px', borderRadius: 16, background: 'var(--bg-card-elevated)', border: `1px solid ${item.quantity <= item.criticalThreshold ? 'var(--status-critical)' : 'var(--status-warning)'}`, display: 'flex', gap: 12 }}>
                           <AlertTriangle size={18} color={item.quantity <= item.criticalThreshold ? 'var(--status-critical)' : 'var(--status-warning)'} />
                           <div>
                              <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)' }}>{item.itemName}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Currently at {item.quantity} {item.unit}. Minimum {item.reorderThreshold} recommended.</div>
                           </div>
                        </div>
                      ))}
                      {lowStockCount === 0 && (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                           <CheckCircle2 size={32} style={{ opacity: 0.2, marginBottom: 12, marginInline: 'auto' }} />
                           <div style={{ fontSize: 13 }}>All stock levels are optimal</div>
                        </div>
                      )}
                   </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                      <Activity size={18} color="var(--status-ai)" />
                      <h3 className="card-title">Inventory Intelligence</h3>
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {[
                        { icon: <Truck size={16}/>, text: "Supply chain report: Fuel prices expected to rise 8% next month." },
                        { icon: <History size={16}/>, text: "Unusual consumption detected for Layer Mash (+15% vs avg)." }
                      ].map((insight, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, padding: '12px', background: 'var(--bg-card-elevated)', borderRadius: 12 }}>
                           <div style={{ color: 'var(--status-ai)' }}>{insight.icon}</div>
                           <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{insight.text}</div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </main>

        {/* MODAL: ADD ITEM */}
        {isModalOpen && (
           <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
              <div className="modal" style={{ maxWidth: 640 }}>
                 <div className="modal-header">
                    <h2 className="modal-title">Provision New Stock Item</h2>
                    <button className="btn-ghost-small" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                 </div>
                 <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                       <div className="form-group" style={{ marginBottom: 16 }}>
                          <label className="form-label">Item Name *</label>
                          <input className="form-input" placeholder="e.g. Premium Layer Mash" value={form.itemName} onChange={e => setForm(p => ({ ...p, itemName: e.target.value }))} required />
                       </div>
                       <div className="form-grid" style={{ marginBottom: 16 }}>
                          <div className="form-group">
                             <label className="form-label">Category *</label>
                             <select className="form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as any }))}>
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                             </select>
                          </div>
                          <div className="form-group">
                             <label className="form-label">Vendor / Supplier</label>
                             <input className="form-input" placeholder="e.g. AgroCorp" value={form.vendorName} onChange={e => setForm(p => ({ ...p, vendorName: e.target.value }))} />
                          </div>
                       </div>
                       <div className="form-grid" style={{ marginBottom: 16 }}>
                          <div className="form-group">
                             <label className="form-label">Initial Quantity *</label>
                             <input type="number" className="form-input" placeholder="0" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} required />
                          </div>
                          <div className="form-group">
                             <label className="form-label">Unit *</label>
                             <input className="form-input" placeholder="e.g. bags, kg, liters" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} required />
                          </div>
                       </div>
                       <div className="form-grid" style={{ marginBottom: 16 }}>
                          <div className="form-group">
                             <label className="form-label">Reorder Level (Warning) *</label>
                             <input type="number" className="form-input" placeholder="50" value={form.reorderThreshold} onChange={e => setForm(p => ({ ...p, reorderThreshold: e.target.value }))} required />
                          </div>
                          <div className="form-group">
                             <label className="form-label">Critical Level (Alert) *</label>
                             <input type="number" className="form-input" placeholder="20" value={form.criticalThreshold} onChange={e => setForm(p => ({ ...p, criticalThreshold: e.target.value }))} required />
                          </div>
                       </div>
                       <div className="form-group" style={{ marginBottom: 16 }}>
                          <label className="form-label">Unit Cost (TTD) *</label>
                          <input type="number" className="form-input" placeholder="0.00" value={form.unitCost} onChange={e => setForm(p => ({ ...p, unitCost: e.target.value }))} required />
                       </div>
                       <div className="form-group">
                          <label className="form-label">Notes</label>
                          <textarea className="form-textarea" placeholder="Storage instructions, expiry warnings, etc." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                       </div>
                    </div>
                    <div className="modal-footer">
                       <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                       <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'Provisioning...' : 'Add Item to Ledger'}</button>
                    </div>
                 </form>
              </div>
           </div>
        )}

        {/* MODAL: ADJUST STOCK */}
        {isStockModalOpen && (
           <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsStockModalOpen(false)}>
              <div className="modal" style={{ maxWidth: 400 }}>
                 <div className="modal-header">
                    <h2 className="modal-title">{stockAction === 'add' ? 'Increase' : 'Decrease'} Inventory Stock</h2>
                    <button className="btn-ghost-small" onClick={() => setIsStockModalOpen(false)}><X size={20} /></button>
                 </div>
                 <div className="modal-body">
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                       <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>Adjusting Ledger For:</div>
                       <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>{selectedItem?.itemName}</div>
                       <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Currently: {selectedItem?.quantity} {selectedItem?.unit}</div>
                    </div>

                    <div className="form-group">
                       <label className="form-label">Amount to {stockAction === 'add' ? 'Add' : 'Use'} ({selectedItem?.unit}) *</label>
                       <input 
                         type="number" 
                         className="saas-input" 
                         style={{ height: 50, fontSize: 18, fontWeight: 800, textAlign: 'center' }} 
                         placeholder="0"
                         value={stockAmount}
                         onChange={(e) => setStockAmount(e.target.value)}
                         autoFocus
                       />
                    </div>
                 </div>
                 <div className="modal-footer">
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsStockModalOpen(false)}>Cancel</button>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleStockUpdate}>Confirm Adjustment</button>
                 </div>
              </div>
           </div>
        )}

      </div>

      <style jsx global>{`
        .btn-ghost-small {
          background: var(--bg-card-elevated);
          color: var(--text-muted);
          border: 1px solid var(--border-soft);
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-ghost-small:hover {
          background: var(--border-soft);
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TTD', maximumFractionDigits: 0 }).format(n);
