"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from "@/components/Sidebar";
import NotificationCenter from "@/components/NotificationCenter";
import ThemeToggle from "@/components/ThemeToggle";
import { useDashboardStore } from '@/store/useDashboardStore';
import { useUIStore } from '@/store/useUIStore';
import { 
  Plus, Search, Filter, Download, 
  Package, Boxes, Archive, RefreshCw,
  BarChart3, Calendar, FileText, Banknote,
  AlertCircle, ChevronRight, MoreVertical,
  Zap, CheckCircle2, Wallet, ArrowRight,
  TrendingUp, TrendingDown, Target, Sparkles,
  Layers, ShoppingCart, Truck, Thermometer,
  Activity, ShieldAlert, X, Trash2, Edit2, Copy,
  AlertTriangle, PieChart
} from "lucide-react";

import { THEME_COLORS as COLORS, TC } from '@/lib/theme-colors';

const CATEGORY_COLORS = {
  'Feed': '#39C86A',
  'Fertilizer': '#3b82f6',
  'Chemicals': '#f59e0b',
  'Medicine': '#ef4444',
  'Materials': '#8b5cf6'
};

export default function InventoryPage() {
  const { sidebarCollapsed } = useUIStore();
  const [mountedTime, setMountedTime] = useState("");
  
  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    setMountedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const [inventoryItems, setInventoryItems] = useState([
    { id: 1, name: 'Poultry Feed (Standard)', category: 'Feed', qty: 450, unit: 'kg', usage: 120, days: 5, value: 5400, status: 'Critical' },
    { id: 2, name: 'Diesel Fuel (Tractor)', category: 'Materials', qty: 85, unit: 'L', usage: 15, days: 6, value: 1200, status: 'Low' },
    { id: 3, name: 'Corn Seeds (Hybrid)', category: 'Materials', qty: 0, unit: 'bags', usage: 0, days: 0, value: 0, status: 'Critical' },
    { id: 4, name: 'Nitrogen Fertilizer', category: 'Fertilizer', qty: 1200, unit: 'kg', usage: 200, days: 42, value: 8400, status: 'Healthy' },
    { id: 5, name: 'Livestock Antibiotics', category: 'Medicine', qty: 24, unit: 'vials', usage: 2, days: 84, value: 2880, status: 'Healthy' },
    { id: 6, name: 'Herbicides', category: 'Chemicals', qty: 50, unit: 'L', usage: 5, days: 70, value: 1500, status: 'Overstocked' },
  ]);

  const hasData = inventoryItems.length > 0;

  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === "All" || item.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [inventoryItems, searchTerm, categoryFilter]);

  const totalValue = useMemo(() => inventoryItems.reduce((sum, item) => sum + item.value, 0), [inventoryItems]);
  const lowStockCount = inventoryItems.filter(item => item.status === 'Low' || item.status === 'Critical').length;
  const criticalItem = inventoryItems.find(item => item.status === 'Critical');

  const categories = ['Feed', 'Fertilizer', 'Chemicals', 'Medicine', 'Materials'];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-body)' }}>
      <Sidebar />

      <div style={{ marginLeft: sidebarCollapsed ? 64 : 250, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease' }}>
        
        <header style={{ height: 72, background: 'var(--bg-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid var(--border-soft)` }}>
          <div>
             <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Inventory & Supply Control</h1>
             <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>Strategic stock management & predictive logistics</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontSize: 12, color: COLORS.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={14} /> Logistics Synced: {mountedTime}
            </div>
            <ThemeToggle />
            <NotificationCenter />
            <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
               <Plus size={16} /> Add Item
            </button>
          </div>
        </header>

        <main style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          
          {/* 1. INVENTORY STATUS HERO */}
          <div style={{ marginBottom: 32, background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-elevated) 100%)', border: `1px solid var(--border-soft)`, borderRadius: 24, padding: '32px', position: 'relative', overflow: 'hidden' }}>
             <div style={{ position: 'absolute', top: -40, right: -40, width: 300, height: 300, background: 'rgba(57, 200, 106, 0.05)', borderRadius: '50%', filter: 'blur(80px)' }} />
             
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>Inventory Health:</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: lowStockCount > 2 ? COLORS.danger : (lowStockCount > 0 ? COLORS.warning : COLORS.success), background: 'rgba(255,255,255,0.03)', padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
                        {lowStockCount > 2 ? 'CRITICAL' : (lowStockCount > 0 ? 'AT RISK' : 'HEALTHY')}
                      </span>
                   </div>
                   
                   <div style={{ display: 'flex', gap: 64, marginBottom: 32 }}>
                      <div>
                         <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Total Inventory Value</div>
                         <div style={{ fontSize: 40, fontWeight: 950, color: 'var(--text-primary)' }}>${totalValue.toLocaleString()}</div>
                      </div>
                      <div>
                         <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Low Stock Items</div>
                         <div style={{ fontSize: 40, fontWeight: 950, color: lowStockCount > 0 ? COLORS.warning : '#fff' }}>{lowStockCount}</div>
                      </div>
                      <div>
                         <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Next Critical Shortage</div>
                         <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginTop: 8 }}>{criticalItem ? criticalItem.name : 'None'}</div>
                      </div>
                   </div>

                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', maxWidth: 800 }}>
                      <Sparkles size={18} color={COLORS.warning} />
                      <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>
                         <span style={{ fontWeight: 800 }}>AI Message:</span> {hasData ? `Poultry feed will run out in ${criticalItem?.days || 5} days based on current usage.` : "Add income and expenses to activate cash flow tracking"}
                      </div>
                   </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   <button className="btn-ghost" style={{ padding: '12px 24px', fontSize: 12, width: 160, justifyContent: 'center' }}>Stock Audit</button>
                   <button className="btn-primary" style={{ padding: '12px 24px', fontSize: 12, width: 160, justifyContent: 'center' }}>Rapid Reorder</button>
                </div>
             </div>
          </div>

          {/* 2. LOW STOCK ALERTS */}
          <div className="grid-12" style={{ gap: 24, marginBottom: 32 }}>
             <div className="col-12">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Active Stock Alerts</h3>
                <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
                   {hasData ? (
                      inventoryItems.filter(i => i.status === 'Critical' || i.status === 'Low').map((item, i) => (
                         <div key={i} className="card" style={{ minWidth: 280, padding: '20px', borderLeft: `4px solid ${item.status === 'Critical' ? COLORS.danger : COLORS.warning}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                               <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{item.category}</span>
                               <AlertCircle size={14} color={item.status === 'Critical' ? COLORS.danger : COLORS.warning} />
                            </div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{item.name}</div>
                            <div style={{ fontSize: 12, color: item.status === 'Critical' ? COLORS.danger : COLORS.warning, fontWeight: 700 }}>
                               {item.days} days remaining ({item.qty}{item.unit} left)
                            </div>
                         </div>
                      ))
                   ) : (
                      <div style={{ width: '100%', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: 20, border: '1px dashed rgba(255,255,255,0.05)' }}>
                         <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Inventory alerts will activate once stock is added.</div>
                      </div>
                   )}
                </div>
             </div>
          </div>

          <div className="grid-12" style={{ gap: 24, marginBottom: 32 }}>
             {/* 3. INVENTORY TABLE */}
             <div className="col-8 card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                   <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Stock Asset Ledger</h3>
                   <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '8px 16px' }}>
                         <Search size={14} color={COLORS.muted} />
                         <input 
                           placeholder="Search inventory..." 
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 13, width: 180 }} 
                         />
                      </div>
                      <button className="btn-ghost" style={{ fontSize: 12 }}><Filter size={14} /> Filter</button>
                   </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-soft)' }}>
                         <th style={{ padding: '16px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Item Name</th>
                         <th style={{ padding: '16px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category</th>
                         <th style={{ padding: '16px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Quantity</th>
                         <th style={{ padding: '16px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Days Left</th>
                         <th style={{ padding: '16px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                         <th style={{ width: 40 }}></th>
                      </tr>
                   </thead>
                   <tbody>
                      {filteredItems.map((item) => (
                         <tr key={item.id} className="row-hover" style={{ borderBottom: '1px solid var(--border-soft)' }}>
                            <td style={{ padding: '16px' }}>
                               <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</div>
                            </td>
                            <td style={{ padding: '16px' }}>
                               <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{item.category.toUpperCase()}</span>
                            </td>
                            <td style={{ padding: '16px' }}>
                               <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.qty} {item.unit}</div>
                               <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.usage}{item.unit}/week usage</div>
                            </td>
                            <td style={{ padding: '16px', fontSize: 13, fontWeight: 700, color: item.days < 7 ? COLORS.danger : '#fff' }}>
                               {item.days} days
                            </td>
                            <td style={{ padding: '16px' }}>
                               <span style={{ 
                                  fontSize: 10, 
                                  fontWeight: 900, 
                                  padding: '4px 10px', 
                                  borderRadius: 6, 
                                  background: item.status === 'Healthy' ? 'rgba(57, 200, 106, 0.1)' : (item.status === 'Critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'), 
                                  color: item.status === 'Healthy' ? COLORS.success : (item.status === 'Critical' ? COLORS.danger : COLORS.warning)
                               }}>
                                  {item.status.toUpperCase()}
                               </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                               <button className="btn-ghost-small"><MoreVertical size={14} /></button>
                            </td>
                         </tr>
                      ))}
                      {!hasData && (
                         <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: '80px 0' }}>
                               <div style={{ marginBottom: 16 }}><Boxes size={48} opacity={0.1} /></div>
                               <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>No inventory data yet</div>
                               <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Start by adding feed, fertilizer, or supplies to unlock monitoring.</div>
                               <button className="btn-primary" onClick={() => setIsModalOpen(true)}>Add First Item</button>
                            </td>
                         </tr>
                      )}
                   </tbody>
                </table>
             </div>

             <div className="col-4">
                {/* 5. INVENTORY VALUE & BREAKDOWN */}
                <div className="card" style={{ padding: '32px', marginBottom: 24 }}>
                   <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Value Breakdown</h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {categories.map((cat, i) => {
                         const val = inventoryItems.filter(item => item.category === cat).reduce((sum, item) => sum + item.value, 0);
                         return (
                            <div key={i}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                                  <span style={{ fontWeight: 700 }}>{cat}</span>
                                  <span style={{ fontWeight: 900, color: 'var(--text-primary)' }}>${val.toLocaleString()} <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>({((val / totalValue) * 100).toFixed(0)}%)</span></span>
                               </div>
                               <div style={{ height: 6, background: 'var(--bg-card-elevated)', borderRadius: 3 }}>
                                  <div style={{ height: '100%', width: `${(val / totalValue) * 100}%`, background: CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] || COLORS.info, borderRadius: 3 }} />
                               </div>
                            </div>
                         );
                      })}
                   </div>
                </div>

                {/* 6. AI INSIGHTS */}
                <div className="card" style={{ padding: '32px' }}>
                   <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Inventory Intelligence</h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {[
                         { text: "Feed usage increased 15% this week; audit livestock consumption.", type: "warning" },
                         { text: "You are currently overstocked on herbicides; delay upcoming purchase.", type: "info" },
                         { text: "Current seed levels may not last until the next expected planting cycle.", type: "danger" }
                      ].map((insight, i) => (
                         <div key={i} style={{ padding: '16px', background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', borderRadius: 16, display: 'flex', gap: 12 }}>
                            <Sparkles size={16} color={insight.type === 'warning' ? 'var(--status-warning)' : (insight.type === 'danger' ? 'var(--status-critical)' : 'var(--status-info)')} style={{ flexShrink: 0 }} />
                            <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>{insight.text}</div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>

        </main>

        {/* 7. ADD INVENTORY MODAL */}
        {isModalOpen && (
           <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div className="card" style={{ width: 600, padding: '48px', position: 'relative' }}>
                 <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={24} />
                 </button>
                 <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 32 }}>Add New Stock Item</h2>
                 
                 <div className="grid-12" style={{ gap: 20 }}>
                    <div className="col-12">
                       <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Item Name</label>
                       <input placeholder="e.g. Poultry Feed (Premium)" style={{ width: '100%', padding: '14px', background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', color: 'var(--text-primary)', fontSize: 14 }} />
                    </div>
                    <div className="col-6">
                       <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Category</label>
                       <select style={{ width: '100%', padding: '14px', background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', color: 'var(--text-primary)', fontSize: 14 }}>
                          {categories.map(cat => <option key={cat}>{cat}</option>)}
                       </select>
                    </div>
                    <div className="col-3">
                       <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Quantity</label>
                       <input type="number" placeholder="500" style={{ width: '100%', padding: '14px', background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', color: 'var(--text-primary)', fontSize: 14 }} />
                    </div>
                    <div className="col-3">
                       <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Unit</label>
                       <input placeholder="kg/L/bag" style={{ width: '100%', padding: '14px', background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', color: 'var(--text-primary)', fontSize: 14 }} />
                    </div>
                    <div className="col-6">
                       <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Unit Cost ($)</label>
                       <input type="number" placeholder="12.50" style={{ width: '100%', padding: '14px', background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', color: 'var(--text-primary)', fontSize: 14 }} />
                    </div>
                    <div className="col-12">
                       <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Notes</label>
                       <textarea placeholder="Vendor details or storage location..." rows={3} style={{ width: '100%', padding: '14px', background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', color: 'var(--text-primary)', fontSize: 14, resize: 'none' }} />
                    </div>
                    <div className="col-12" style={{ marginTop: 24, display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
                       <button onClick={() => setIsModalOpen(false)} className="btn-ghost" style={{ padding: '14px 40px' }}>Cancel</button>
                       <button className="btn-primary" style={{ padding: '14px 40px' }}>Add First Item</button>
                    </div>
                 </div>
              </div>
           </div>
        )}

      </div>

      <style jsx>{`
        .card {
          background: var(--bg-card);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-soft);
          border-radius: 24px;
        }
        .row-hover:hover td {
           background: var(--bg-card-elevated);
        }
        .btn-primary {
          background: var(--status-success);
          color: var(--text-inverse);
          border: none;
          border-radius: 12px;
          padding: 10px 20px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }
        .btn-ghost {
          background: var(--bg-card-elevated);
          color: var(--text-primary);
          border: 1px solid var(--border-soft);
          border-radius: 10px;
          padding: 8px 12px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .btn-ghost:hover {
          background: var(--border-soft);
        }
        .btn-ghost-small {
          background: var(--bg-card-elevated);
          color: var(--text-muted);
          border: 1px solid var(--border-soft);
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-ghost-small:hover {
          background: var(--border-strong);
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
