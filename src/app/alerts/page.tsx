"use client";

import { useEffect, useState, useMemo } from 'react';
import Sidebar from "@/components/Sidebar";
import NotificationCenter from "@/components/NotificationCenter";
import ThemeToggle from "@/components/ThemeToggle";
import { useUIStore } from '@/store/useUIStore';
import { useAlertStore, Alert, AlertCategory, AlertSeverity } from '@/store/useAlertStore';
import {
  Bell, Search, RefreshCw, AlertCircle, Sparkles, TrendingUp, MoreVertical,
  Activity, User, ArrowUpRight, ArrowDownRight, Settings, HeartPulse,
  ShieldAlert, Banknote, ShoppingCart, Users, Layers, CheckCircle2,
  X, Filter, ChevronRight, Clock, Info, AlertTriangle, Plus, Trash2
} from "lucide-react";

export default function AlertHub() {
  const { sidebarCollapsed } = useUIStore();
  const { alerts, fetchAlerts, addAlert, deleteAlert, resolveAlert, snoozeAlert, assignAlert, isLoading, getRiskBrief } = useAlertStore();
  
  const [activeTab, setActiveTab] = useState<string>('All');
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [mountedTime, setMountedTime] = useState("");
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchAlerts();
    setMountedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [fetchAlerts]);

  const filteredAlerts = useMemo(() => {
    if (activeTab === 'All') return alerts.filter(a => a.status !== 'resolved');
    if (activeTab === 'Resolved') return alerts.filter(a => a.status === 'resolved');
    if (activeTab === 'Urgent') return alerts.filter(a => a.severity === 'urgent' && a.status !== 'resolved');
    if (activeTab === 'Critical') return alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved');
    return alerts.filter(a => a.category === activeTab.toLowerCase() && a.status !== 'resolved');
  }, [alerts, activeTab]);

  const stats = useMemo(() => {
    const active = alerts.filter(a => a.status !== 'resolved');
    return {
      total: active.length,
      urgent: active.filter(a => (a.severity === 'urgent' || a.severity === 'critical')).length,
      loans: active.filter(a => a.category === 'loans').length,
      ops: active.filter(a => a.category === 'livestock' || a.category === 'system').length,
    }
  }, [alerts]);

  const getSeverityColor = (sev: AlertSeverity) => {
    switch (sev) {
      case 'urgent':
      case 'critical': return 'var(--color-danger)';
      case 'warning': return 'var(--color-warning)';
      case 'info': return 'var(--color-info)';
      case 'resolved': return 'var(--color-primary)';
      default: return 'var(--color-text-muted)';
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', maxWidth: '100vw', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ marginLeft: sidebarCollapsed ? 64 : 250, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease', overflow: 'hidden' }}>
        
        <header style={{ height: 72, background: 'var(--color-surface-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid var(--color-border)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--color-surface-input)', borderRadius: 12, padding: '10px 18px', width: 300, border: `1px solid var(--color-border)` }}>
            <Search size={16} color="var(--color-text-muted)" />
            <input placeholder="Search risk signals..." style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: 13, width: '100%' }} />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div className="label-small" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> {isLoading ? 'Syncing...' : `Last Sync: ${mountedTime}`}
            </div>
            <ThemeToggle />
            <NotificationCenter />
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#101010', fontWeight: 950, fontSize: 13 }}>B</div>
          </div>
        </header>

        <main style={{ padding: '40px', flex: 1, overflowY: 'auto' }} className="page-padding">
           <div className="max-container">
          
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
                <div>
                   <h1 className="page-title" style={{ margin: 0 }}>Risk Intelligence Hub</h1>
                   <p className="text-body" style={{ marginTop: 4, fontWeight: 600 }}>Operational & financial risk monitoring for Braes Creek Estate.</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus size={16} /> Create Signal
                  </button>
                  <button className="btn-secondary">
                    <Settings size={16} /> Audit Settings
                  </button>
                </div>
              </div>

              {/* AI RISK BRIEFING */}
              <div className="card" style={{ 
                padding: '32px', marginBottom: 40, borderLeft: `4px solid var(--color-danger)`,
                background: `linear-gradient(90deg, rgba(239, 68, 68, 0.08) 0%, transparent 100%), var(--color-surface-card)`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-danger)', fontWeight: 900, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    <Sparkles size={16} /> AI Neural Assessment
                  </div>
                  <div className="label-small">GENERATED {mountedTime}</div>
                </div>
                <div style={{ fontSize: 18, color: 'var(--color-text-primary)', fontWeight: 600, lineHeight: 1.5 }}>
                  Neural Insight: <span style={{ color: 'var(--color-danger)' }}>{getRiskBrief()}</span>
                </div>
              </div>

              {/* STATS GRID */}
              <div className="grid-12" style={{ marginBottom: 40 }}>
                {[
                  { label: 'Total Active', val: stats.total, color: 'var(--color-text-primary)' },
                  { label: 'High Priority', val: stats.urgent, color: 'var(--color-danger)' },
                  { label: 'Capital Risks', val: stats.loans, color: 'var(--color-warning)' },
                  { label: 'Operations', val: stats.ops, color: 'var(--color-info)' },
                ].map((s, i) => (
                  <div key={i} className="card" style={{ gridColumn: 'span 3' }}>
                    <div className="label-small" style={{ marginBottom: 12 }}>{s.label}</div>
                    <div className="metric-main" style={{ color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* TABS & LIST */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {['All', 'Urgent', 'Critical', 'Resolved'].map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className="btn-secondary"
                    style={{ 
                      borderRadius: 999, padding: '8px 24px', fontSize: 12,
                      background: activeTab === tab ? 'var(--color-surface-elevated)' : 'transparent',
                      borderColor: activeTab === tab ? 'var(--color-border-strong)' : 'transparent'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>Alert Information</th>
                      <th>Severity</th>
                      <th>Neural Context</th>
                      <th style={{ textAlign: 'right' }}>Management</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlerts.length > 0 ? filteredAlerts.map(alert => (
                      <tr 
                        key={alert.id} 
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          if (alert.category === 'spending' && alert.related_record_id) {
                            window.location.href = `/expenses?highlight=${alert.related_record_id}`;
                          } else if (alert.category === 'payroll' && alert.related_record_id) {
                            window.location.href = `/payroll?highlight=${alert.related_record_id}`;
                          } else {
                            setSelectedAlertId(alert.id);
                          }
                        }}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: getSeverityColor(alert.severity) }}>
                              <Bell size={16} />
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text-primary)' }}>{alert.title}</div>
                              <div className="label-small" style={{ marginTop: 2 }}>{alert.category} • {new Date(alert.created_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill`} style={{ 
                            color: getSeverityColor(alert.severity), 
                            background: `${getSeverityColor(alert.severity)}1a`,
                            border: `1px solid ${getSeverityColor(alert.severity)}33`
                          }}>
                            {alert.severity.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div className="text-body" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{alert.message}</div>
                          <div className="label-small" style={{ marginTop: 4, textTransform: 'none' }}>Rec: {alert.recommended_action}</div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                           <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                              {(alert.category === 'spending' || alert.category === 'payroll') && alert.related_record_id && (
                                <button 
                                  className="btn-ghost" 
                                  style={{ fontSize: 10, padding: '4px 8px' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `/${alert.category === 'spending' ? 'expenses' : 'payroll'}?highlight=${alert.related_record_id}`;
                                  }}
                                >
                                  View Context <ChevronRight size={10} />
                                </button>
                              )}
                              <button className="btn-secondary" style={{ width: 34, height: 34, padding: 0 }} onClick={(e) => { e.stopPropagation(); deleteAlert(alert.id); }}><Trash2 size={14} color="var(--color-danger)" /></button>
                              <button className="btn-primary" style={{ padding: '6px 16px', fontSize: 11 }} onClick={(e) => { e.stopPropagation(); resolveAlert(alert.id); }} disabled={alert.status === 'resolved'}>
                                {alert.status === 'resolved' ? 'Archived' : 'Resolve'}
                              </button>
                           </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} style={{ padding: '80px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No signals detected in this cluster.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

           </div>
        </main>
      </div>

      <style jsx>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
