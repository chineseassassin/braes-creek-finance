"use client";

import { useEffect, useState, useMemo } from 'react';
import Sidebar from "@/components/Sidebar";
import NotificationCenter from "@/components/NotificationCenter";
import ThemeToggle from "@/components/ThemeToggle";
import { useDashboardStore } from '@/store/useDashboardStore';
import { useUIStore } from '@/store/useUIStore';
import { useAlertStore, AlertSeverity } from '@/store/useAlertStore';
import { useActivityStore } from '@/store/useActivityStore';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { useRouter } from 'next/navigation';
import {
  Bell, Search, Users, ShoppingCart,
  AlertCircle, ShieldAlert, Wrench, Landmark, Sprout, Beef,
  ArrowRight, ShieldCheck, Zap, Info, TriangleAlert, Clock,
  Sparkles, ChevronRight, Activity, DollarSign, TrendingUp, TrendingDown, MessageSquare, Target, BrainCircuit
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { transactions, fetchTransactions, getTotalRevenue, getTotalExpenses, getNetProfit } = useDashboardStore();
  const { sidebarCollapsed } = useUIStore();
  const { recommendations, updateRecommendationStatus, generateRecommendations } = useWorkflowStore();
  
  const [timeAgo, setTimeAgo] = useState(2);
  useEffect(() => {
    generateRecommendations(); // Brain on mount
    const timer = setInterval(() => setTimeAgo(prev => prev + 1), 60000);
    return () => clearInterval(timer);
  }, [generateRecommendations]);

  const { logs } = useActivityStore();
  const { fetchAlerts, getActiveAlerts, getFinancialHealthScore, getRiskBrief, evaluateEscalations } = useAlertStore();
  const activeAlerts = getActiveAlerts();

  const stats = useMemo(() => {
     return {
        revenue: getTotalRevenue(),
        expenses: getTotalExpenses(),
        profit: getNetProfit(),
        health: getFinancialHealthScore(transactions),
        rev: getTotalRevenue(),
        exp: getTotalExpenses()
     };
  }, [transactions, getTotalRevenue, getTotalExpenses, getNetProfit, getFinancialHealthScore]);

  // Phase 5 AI Decisions
  const activeRecs = useMemo(() => {
     return recommendations.filter(r => r.status === 'new').slice(0, 3);
  }, [recommendations]);

  const handleMarkReviewed = (id: string) => {
     updateRecommendationStatus(id, 'dismissed');
  };

  useEffect(() => { 
    fetchTransactions(); 
    fetchAlerts();
  }, [fetchTransactions, fetchAlerts]);

  // 🔄 ALERT ESCALATION LOOP
  useEffect(() => {
    const escalationInterval = setInterval(() => {
      evaluateEscalations();
    }, 5000); // Check every 5 seconds
    return () => clearInterval(escalationInterval);
  }, [evaluateEscalations]);

  // 🔊 EMERGENCY SOUND EFFECT
  useEffect(() => {
    const hasEmergency = activeAlerts.some(a => a.severity === 'emergency');
    if (hasEmergency) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
      audio.volume = 0.2;
      audio.play().catch(e => console.log('Audio play blocked'));
    }
  }, [activeAlerts]);

  const highestAlert = useMemo(() => {
    return activeAlerts.find(a => a.severity === 'emergency') 
        || activeAlerts.find(a => a.severity === 'critical')
        || activeAlerts.find(a => a.severity === 'warning');
  }, [activeAlerts]);

  const riskBrief = getRiskBrief();

  const ACTIONS = [
    { label: 'Loans', val: '$42.5k', status: '1 Overdue', icon: <Landmark size={20}/>, color: 'var(--color-danger)', href: '/loans' },
    { label: 'Crops', val: '42 Acres', status: 'Optimal Health', icon: <Sprout size={20}/>, color: 'var(--color-primary)', href: '/crops' },
    { label: 'Livestock', val: '840 Units', status: '2 Active Alerts', icon: <Beef size={20}/>, color: 'var(--color-warning)', href: '/livestock' },
    { label: 'Workforce', val: '12 Active', status: 'Labor Costs Rising', icon: <Users size={20}/>, color: 'var(--color-info)', href: '/labor' },
    { label: 'Maintenance', val: '4 Fleet', status: '1 Service Overdue', icon: <Wrench size={20}/>, color: 'var(--color-danger)', href: '/infrastructure' },
    { label: 'Supplies', val: '12 Items', status: 'Low Inventory Alert', icon: <ShoppingCart size={20}/>, color: 'var(--color-warning)', href: '/infrastructure' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', maxWidth: '100vw', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ 
        marginLeft: sidebarCollapsed ? 64 : 250, 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        transition: 'margin-left 0.2s ease',
        minWidth: 0,
        overflow: 'hidden'
      }}>
        <header style={{ height: 72, background: 'var(--color-surface-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid var(--color-border)`, width: '100%', boxSizing: 'border-box' }}>
          <div>
             <h1 style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Command Center</h1>
             <p className="label-small">Estate Tactical Operations</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <ThemeToggle />
            <NotificationCenter />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderLeft: '1px solid var(--color-border)', paddingLeft: 24 }}>
               <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text-primary)' }}>Peter Admin</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)' }}>Estate Control</div>
               </div>
               <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#101010', fontWeight: 950, fontSize: 14, boxShadow: '0 0 15px rgba(34, 197, 94, 0.2)' }}>P</div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', width: '100%', boxSizing: 'border-box', padding: 24 }}>
           <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', overflowX: 'hidden' }}>
              
              {/* 1. ALERT ESCALATION SYSTEM BANNER */}
              {highestAlert && highestAlert.severity === 'emergency' && (
                <div 
                  className="card animate-alert-entrance animate-siren animate-periodic-glitch" 
                  style={{ marginBottom: 32, padding: '24px 32px', background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0.08) 100%)', border: '3px solid #ef4444', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 0 60px rgba(239, 68, 68, 0.4)', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => {
                    if (highestAlert.category === 'spending' && highestAlert.related_record_id) window.location.href = `/expenses?highlight=${highestAlert.related_record_id}`;
                    else if (highestAlert.category === 'payroll' && highestAlert.related_record_id) window.location.href = `/payroll?highlight=${highestAlert.related_record_id}`;
                    else router.push('/alerts');
                  }}
                >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', background: '#ef4444' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                       <div style={{ background: '#ef4444', color: '#fff', padding: '8px 16px', borderRadius: 6, fontWeight: 950, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: '0 0 25px rgba(239, 68, 68, 0.9)', animation: 'pulse 1s infinite' }}>EMERGENCY</div>
                       <div>
                          <div style={{ fontSize: 20, fontWeight: 950, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                             {highestAlert.title}
                             <ShieldAlert size={20} className="animate-pulse" />
                          </div>
                          <div style={{ fontSize: 14, color: '#fca5a5', fontWeight: 700, opacity: 0.9 }}>{highestAlert.message}</div>
                       </div>
                    </div>
                    <div className="btn-resolve-hover" style={{ background: '#ef4444', color: '#fff', padding: '14px 28px', borderRadius: 10, fontWeight: 950, fontSize: 13, cursor: 'pointer', boxShadow: '0 0 30px rgba(239, 68, 68, 0.6)', transition: 'all 0.3s ease' }}>
                       INITIATE RESPONSE
                    </div>
                </div>
              )}

              {highestAlert && highestAlert.severity === 'critical' && (
                <div 
                  onClick={() => {
                    if (highestAlert.category === 'spending' && highestAlert.related_record_id) window.location.href = `/expenses?highlight=${highestAlert.related_record_id}`;
                    else if (highestAlert.category === 'payroll' && highestAlert.related_record_id) window.location.href = `/payroll?highlight=${highestAlert.related_record_id}`;
                    else router.push('/alerts');
                  }} 
                  className="animate-alert-entrance critical-hover" 
                  style={{ marginBottom: 32, padding: '14px 24px', background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.04) 100%)', border: '1px solid rgba(239, 68, 68, 0.6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 0 30px rgba(239, 68, 68, 0.15)', cursor: 'pointer' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                       <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                          <TriangleAlert size={20} color="#ef4444" />
                       </div>
                       <div className="animate-ai-text-update" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ color: '#ef4444', fontWeight: 950, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.1em' }}>CRITICAL ALERT</span>
                          <span style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>{highestAlert.title} — {highestAlert.recommended_action}</span>
                       </div>
                    </div>
                    <div className="btn-resolve-hover" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 950, color: '#fff', letterSpacing: '0.05em', background: '#ef4444', padding: '10px 20px', borderRadius: 8 }}>
                       RESOLVE <ArrowRight size={16} />
                    </div>
                </div>
              )}

              {highestAlert && highestAlert.severity === 'warning' && (
                <div 
                  onClick={() => {
                    if (highestAlert.category === 'spending' && highestAlert.related_record_id) window.location.href = `/expenses?highlight=${highestAlert.related_record_id}`;
                    else if (highestAlert.category === 'payroll' && highestAlert.related_record_id) window.location.href = `/payroll?highlight=${highestAlert.related_record_id}`;
                    else router.push('/alerts');
                  }} 
                  className="animate-alert-entrance animate-soft-pulse" 
                  style={{ cursor: 'pointer', marginBottom: 32, padding: '12px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 14 }}
                >
                   <div className="pulse-dot" style={{ background: '#fbbf24', width: 10, height: 10 }} />
                   <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                      <span style={{ color: '#fbbf24', fontWeight: 900, marginRight: 10, letterSpacing: '0.08em', fontSize: 12 }}>WARNING</span>
                      {highestAlert.title} — {highestAlert.message}
                   </div>
                </div>
              )}
                       {/* 2. AI NEURAL HUB: ACTIONABLE INTELLIGENCE */}
               <div className="card neural-card animate-soft-pulse" style={{ marginBottom: 40, padding: '40px', border: '1px solid rgba(139, 92, 246, 0.2)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: 'radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ padding: 12, borderRadius: 14, background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)' }}><BrainCircuit size={24}/></div>
                        <div>
                           <h2 className="section-title" style={{ margin: 0, fontSize: 20, color: '#fff', letterSpacing: '-0.02em' }}>Intelligence Decision Hub</h2>
                           <div className="label-small" style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>Neural Engine: <span style={{ color: 'var(--color-primary)' }}>ACTIVE</span> • Phase 5 Actionable Intel</div>
                        </div>
                     </div>
                     <div style={{ display: 'flex', gap: 8 }}>
                        <div className="badge-info" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.2)' }}>{activeRecs.length} RECOMMENDATIONS</div>
                     </div>
                  </div>

                  {activeRecs.length === 0 ? (
                     <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        <Sparkles size={32} style={{ marginBottom: 16, opacity: 0.3 }} />
                        <div style={{ fontSize: 16, fontWeight: 600 }}>System Health Optimal</div>
                        <div style={{ fontSize: 13 }}>No critical anomalies requiring AI intervention.</div>
                     </div>
                  ) : (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        {activeRecs.map((rec, idx) => (
                           <div key={rec.id} style={{ 
                              paddingBottom: idx !== activeRecs.length - 1 ? 32 : 0, 
                              borderBottom: idx !== activeRecs.length - 1 ? '1px solid var(--color-border)' : 'none' 
                           }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{rec.title}</div>
                                    <span style={{ 
                                       padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', 
                                       background: rec.urgency === 'critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                       color: rec.urgency === 'critical' ? '#ef4444' : '#f59e0b',
                                       border: `1px solid ${rec.urgency === 'critical' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                                    }}>{rec.urgency}</span>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-primary)', background: 'rgba(34, 197, 94, 0.1)', padding: '4px 8px', borderRadius: 8 }}>{rec.confidence}% CONFIDENCE</span>
                                 </div>
                                 <div style={{ fontSize: 12, fontWeight: 800, color: '#a78bfa', background: 'rgba(139, 92, 246, 0.1)', padding: '6px 12px', borderRadius: 10, border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                    IMPACT: {rec.estimated_impact}
                                 </div>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32, marginBottom: 24 }}>
                                 <div>
                                    <div className="label-small" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><MessageSquare size={12}/> <span>WHAT IS HAPPENING</span></div>
                                    <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{rec.what_happening}</div>
                                 </div>
                                 <div>
                                    <div className="label-small" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Activity size={12}/> <span>WHY IT MATTERS</span></div>
                                    <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{rec.why_it_matters}</div>
                                 </div>
                                 <div style={{ padding: '16px 20px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: 12, border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                                    <div className="label-small" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, color: '#a78bfa' }}><Target size={12}/> <span>NEXT STEPS</span></div>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1.5 }}>{rec.next_steps}</div>
                                 </div>
                              </div>

                              <div style={{ display: 'flex', gap: 12 }}>
                                 <button className="btn-primary" onClick={() => router.push(`/${rec.module.toLowerCase()}`)} style={{ padding: '10px 20px', fontSize: 13, fontWeight: 800 }}>Open {rec.module} Module</button>
                                 <button className="btn-secondary" style={{ padding: '10px 20px', fontSize: 13, fontWeight: 800, background: 'rgba(255,255,255,0.03)' }}>Delegate Tactical Task</button>
                                 <button className="btn-ghost" onClick={() => handleMarkReviewed(rec.id)} style={{ padding: '10px 20px', fontSize: 13, fontWeight: 800, color: 'var(--color-text-muted)' }}>Mark as Reviewed</button>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>

              {/* 3. PRIORITY ALERT STRIP */}
              <div style={{ marginBottom: 40, width: '100%' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 className="section-title">Priority Alerts</h3>
                    <button className="btn-ghost" onClick={() => router.push('/alerts')} style={{ fontSize: 11, padding: '6px 12px' }}>View All Alerts <ArrowRight size={14}/></button>
                 </div>
                 <div style={{ position: 'relative', width: '100%' }}>
                    <div style={{ display: 'flex', gap: 16, overflowX: 'auto', overflowY: 'hidden', paddingBottom: 16, width: '100%', boxSizing: 'border-box' }} className="no-scrollbar">
                    {activeAlerts.map((a, i) => {
                       const isCrit = a.severity.toLowerCase() === 'critical';
                       const isWarn = a.severity.toLowerCase() === 'warning';
                       const color = isCrit ? 'var(--color-danger)' : isWarn ? 'var(--color-warning)' : 'var(--color-info)';
                       return <div key={i} onClick={() => router.push('/alerts')} className={`card priority-alert-card ${isCrit ? 'critical-hover' : isWarn ? 'warning-hover' : 'info-hover'}`} style={{ width: 240, flexShrink: 0, padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                              <div style={{ padding: '16px 20px', borderLeft: `3px solid ${color}`, background: isCrit ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.05) 0%, transparent 100%)' : 'none', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                       <ShieldAlert size={12} color={color} />
                                       <span style={{ fontSize: 9, fontWeight: 900, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{a.severity}</span>
                                    </div>
                                    <Clock size={10} color="var(--color-text-muted)" />
                                 </div>
                                 <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 6, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                                 <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {a.recommended_action} <ArrowRight size={10} color={color} />
                                 </div>
                              </div>
                           </div>
                     })}
                    </div>
                    <div style={{ position: 'absolute', top: 0, right: 0, bottom: 16, width: 80, background: 'linear-gradient(to right, transparent, var(--color-bg-body))', pointerEvents: 'none' }} />
                 </div>
              </div>

              {/* 4. MAIN GRID */}
              <div className="grid-12" style={{ marginBottom: 40, gap: 20 }}>
                 
                 {/* ACTION CENTER (LEFT 8) */}
                 <div style={{ gridColumn: 'span 8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                       <h3 className="section-title">Operational Action Center</h3>
                       <div className="badge-info">6 ACTIVE SECTORS</div>
                    </div>
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        {ACTIONS.map((act, i) => (
                           <div key={i} onClick={() => router.push(act.href)} className="card action-card" style={{ padding: 24, height: 160, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
                                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 16px 40px color-mix(in srgb, ${act.color} 20%, transparent)`; e.currentTarget.style.borderColor = `color-mix(in srgb, ${act.color} 40%, transparent)`; }}
                                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = ''; }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                 <div className="action-icon" style={{ color: act.color, background: `color-mix(in srgb, ${act.color} 15%, transparent)`, padding: 8, borderRadius: 10 }}>{act.icon}</div>
                                 <div className="open-arrow" style={{ padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                                    <span style={{ fontSize: 10, fontWeight: 900, marginRight: 6 }} className="open-text">OPEN</span>
                                    <ArrowRight size={12} />
                                 </div>
                              </div>
                              <div>
                                 <div className="metric-main" style={{ fontSize: 24, marginBottom: 8 }}>{act.val}</div>
                                 <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--color-text-primary)' }}>{act.label}</div>
                                 <div className="label-small" style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>{act.status}</div>
                              </div>
                           </div>
                        ))}
                     </div>
                 </div>

                  {/* SYSTEM HEALTH (RIGHT 4) */}
                  <div style={{ gridColumn: 'span 4' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h3 className="section-title">System Health Matrix</h3>
                        <div className="label-small" style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><div className="pulse-dot"></div> Updated just now</div>
                     </div>
                     <div className="card" style={{ padding: '32px' }}>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                          <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                 <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 700 }}>Capital Status</span>
                                 <span style={{ fontSize: 11, fontWeight: 950, color: stats.profit > 0 ? 'var(--color-primary)' : 'var(--color-danger)', textShadow: stats.profit > 0 ? '0 0 10px rgba(34, 197, 94, 0.4)' : '0 0 10px rgba(239, 68, 68, 0.4)' }}>{stats.profit > 0 ? 'OPTIMAL' : 'RISK'}</span>
                              </div>
                              <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                 <div className="progress-fill" style={{ height: '100%', width: stats.profit > 0 ? '85%' : '30%', background: stats.profit > 0 ? 'var(--color-primary)' : 'var(--color-danger)', borderRadius: 2, boxShadow: stats.profit > 0 ? '0 0 10px rgba(34, 197, 94, 0.5)' : '0 0 10px rgba(239, 68, 68, 0.5)' }} />
                              </div>
                           </div>
                           <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                 <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 700 }}>Operational Flow</span>
                                 <span style={{ fontSize: 11, fontWeight: 950, color: 'var(--color-primary)', textShadow: '0 0 10px rgba(34, 197, 94, 0.4)' }}>SECURE</span>
                              </div>
                              <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                 <div className="progress-fill" style={{ height: '100%', width: '94%', background: 'var(--color-primary)', borderRadius: 2, boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)' }} />
                              </div>
                           </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                             <div className="card-elevated" style={{ padding: 20, borderRadius: 16 }}>
                                <div className="label-small" style={{ marginBottom: 6 }}>Alerts</div>
                                <div style={{ fontSize: 22, fontWeight: 900 }}>{activeAlerts.length}</div>
                             </div>
                             <div className="card-elevated" style={{ padding: 20, borderRadius: 16 }}>
                                <div className="label-small" style={{ marginBottom: 6 }}>Neural Conf.</div>
                                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-primary)' }}>94%</div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* 5. REAL-TIME INSIGHTS */}
              <div style={{ borderTop: `1px solid var(--color-border)`, paddingTop: 40 }}>
                 <h3 className="section-title" style={{ marginBottom: 24 }}>Strategic Intelligence Insights</h3>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    {[
                      { label: 'Expense Trend', val: '+4.2%', desc: 'Energy up', color: 'var(--color-danger)', grad: 'rgba(239, 68, 68, 0.1)' },
                      { label: 'Labor Impact', val: '-2.1%', desc: 'High efficiency', color: 'var(--color-primary)', grad: 'rgba(34, 197, 94, 0.1)' },
                      { label: 'Crop Status', val: 'On Track', desc: '94% yield', color: 'var(--color-primary)', grad: 'rgba(34, 197, 94, 0.1)' },
                      { label: 'Vendor Costs', val: 'Steady', desc: 'No shifts', color: 'var(--color-info)', grad: 'rgba(59, 130, 246, 0.1)' },
                    ].map((insight, i) => (
                       <div key={i} className="card insight-card" style={{ background: `linear-gradient(180deg, ${insight.grad} 0%, transparent 100%), var(--color-surface-card)`, padding: 24, transition: 'all 0.3s ease', cursor: 'default' }}
                            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 8px 30px ${insight.grad.replace('0.1', '0.2')}`; e.currentTarget.style.borderColor = insight.color; }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = ''; }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                             <span className="label-small">{insight.label}</span>
                             <div style={{ width: 8, height: 8, borderRadius: '50%', background: insight.color, boxShadow: `0 0 12px ${insight.color}` }} />
                          </div>
                          <div style={{ fontSize: 28, fontWeight: 950, color: insight.color, marginBottom: 4, letterSpacing: '-0.04em', textShadow: `0 0 16px ${insight.grad}` }}>{insight.val}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>{insight.desc}</div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* 6. LIVE ACTIVITY FEED */}
              <div style={{ borderTop: `1px solid var(--color-border)`, paddingTop: 40, marginTop: 40 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 className="section-title">Live Activity Feed</h3>
                    <div className="badge-info" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}><div className="live-dot-subtle" style={{ background: '#60a5fa' }}></div> CONNECTED ENGINE</div>
                 </div>
                 <div className="card" style={{ padding: '32px 40px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                       {logs.slice(0, 6).map((evt, i) => (
                          <div key={evt.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 20, position: 'relative' }}>
                             {i !== logs.slice(0, 6).length - 1 && <div style={{ position: 'absolute', top: 40, bottom: -24, left: 19, width: 2, background: 'rgba(255,255,255,0.05)' }} />}
                             <div style={{ 
                               width: 40, height: 40, borderRadius: '50%', 
                               background: evt.severity === 'emergency' ? 'rgba(239, 68, 68, 0.2)' : 
                                           evt.severity === 'critical' ? 'rgba(245, 158, 11, 0.2)' : 
                                           evt.severity === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)', 
                               display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, 
                               border: `1px solid ${
                                 evt.severity === 'emergency' ? 'rgba(239, 68, 68, 0.4)' : 
                                 evt.severity === 'critical' ? 'rgba(245, 158, 11, 0.4)' : 
                                 evt.severity === 'success' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(59, 130, 246, 0.4)'
                               }` 
                             }}>
                                {evt.severity === 'emergency' || evt.severity === 'critical' ? <ShieldAlert size={18} color={evt.severity === 'emergency' ? '#ef4444' : '#f59e0b'} /> : 
                                 evt.severity === 'success' ? <ShieldCheck size={18} color="#4ade80" /> : <Activity size={18} color="#60a5fa" />}
                             </div>
                             <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                   <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-primary)' }}>{evt.title}</div>
                                   <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>{new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, fontWeight: 600 }}>
                                   <span style={{ color: 'var(--color-text-secondary)' }}>{evt.module}</span>
                                   <span style={{ color: 'var(--color-text-muted)' }}>•</span>
                                   <span style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: 'var(--color-text-primary)' }}>{evt.user[0]}</div>
                                      {evt.user}
                                   </span>
                                   <span style={{ color: 'var(--color-text-muted)' }}>•</span>
                                   <span style={{ 
                                     background: evt.severity === 'emergency' ? 'rgba(239, 68, 68, 0.1)' : 
                                                 evt.severity === 'critical' ? 'rgba(245, 158, 11, 0.1)' : 
                                                 evt.severity === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)', 
                                     color: evt.severity === 'emergency' ? '#ef4444' : 
                                            evt.severity === 'critical' ? '#f59e0b' : 
                                            evt.severity === 'success' ? '#4ade80' : '#60a5fa', 
                                     padding: '4px 10px', borderRadius: 8, fontWeight: 900, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' 
                                   }}>{evt.status}</span>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

           </div>
        </main>
      </div>

      <style jsx>{`
        .animate-alert-entrance {
          animation: aggressiveShake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
        @keyframes aggressiveShake {
          0% { transform: translateX(0); opacity: 0; }
          15% { transform: translateX(-10px); }
          30% { transform: translateX(10px); }
          45% { transform: translateX(-10px); }
          60% { transform: translateX(10px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); opacity: 1; }
        }

        .animate-periodic-glitch {
          animation: periodicGlitch 4s infinite;
        }
        @keyframes periodicGlitch {
          0%, 85%, 90%, 100% { transform: translate(0,0); filter: hue-rotate(0deg); }
          86% { transform: translate(-3px, 2px); filter: hue-rotate(90deg); }
          87% { transform: translate(3px, -2px); filter: hue-rotate(-90deg); }
          88% { transform: translate(-2px, -3px); }
          89% { transform: translate(2px, 3px); }
        }

        .animate-siren {
          animation: sirenEffect 0.8s infinite alternate cubic-bezier(0.45, 0.05, 0.55, 0.95);
        }
        @keyframes sirenEffect {
          0% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); border-color: rgba(239, 68, 68, 0.5); }
          100% { box-shadow: 0 0 50px rgba(239, 68, 68, 0.7); border-color: rgba(239, 68, 68, 1); transform: scale(1.005); }
        }

        .animate-soft-pulse {
          animation: softPulse 3s infinite ease-in-out;
        }
        @keyframes softPulse {
          0% { opacity: 0.85; border-color: rgba(255,255,255,0.1); }
          50% { opacity: 1; border-color: rgba(251, 191, 36, 0.3); transform: translateY(-1px); }
          100% { opacity: 0.85; border-color: rgba(255,255,255,0.1); }
        }

        .btn-resolve-hover:hover {
            transform: scale(1.02);
            box-shadow: 0 8px 24px rgba(239, 68, 68, 0.5) !important;
            filter: brightness(1.1);
        }

        .live-dot-subtle {
           width: 6px; height: 6px; border-radius: 50%;
           background: var(--color-danger);
           animation: liveDotSubtle 2s infinite ease-in-out;
        }
        @keyframes liveDotSubtle {
           0% { opacity: 0.4; }
           50% { opacity: 1; box-shadow: 0 0 8px rgba(239, 68, 68, 0.5); }
           100% { opacity: 0.4; }
        }

        .animate-ai-text-update {
           animation: textFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes textFadeIn {
           0% { opacity: 0; transform: translateY(2px); }
           100% { opacity: 1; transform: translateY(0); }
        }

        .critical-hover:hover {
           transform: translateY(-1px);
           box-shadow: 0 4px 24px rgba(239, 68, 68, 0.2) !important;
           border-color: rgba(239, 68, 68, 0.4) !important;
        }
        .warning-hover:hover {
           transform: scale(1.03) translateY(-2px);
           box-shadow: 0 12px 32px rgba(245, 158, 11, 0.3) !important;
           border-color: rgba(245, 158, 11, 0.7) !important;
        }
        .info-hover:hover {
           transform: scale(1.03) translateY(-2px);
           box-shadow: 0 12px 32px rgba(59, 130, 246, 0.25) !important;
           border-color: rgba(59, 130, 246, 0.6) !important;
        }

        .animate-ai-shimmer {
          background: radial-gradient(circle at top right, rgba(139, 92, 246, 0.15), transparent 50%), linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%), var(--color-surface-card) !important;
          background-size: 200% 200% !important;
          animation: aiShimmer 8s ease infinite;
        }
        @keyframes aiShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .action-card {
           transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .action-card:hover {
           transform: scale(1.02) translateY(-4px);
        }
        .action-card .action-icon {
           transition: transform 0.2s ease;
        }
        .action-card:hover .action-icon {
           transform: scale(1.1);
        }
        .action-card .open-arrow {
           transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
           color: var(--color-text-secondary);
        }
        .action-card .open-arrow .open-text {
           opacity: 0;
           width: 0;
           transform: translateX(-10px);
           transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
           display: inline-block;
           overflow: hidden;
        }
        .action-card:hover .open-arrow {
           background: rgba(255,255,255,0.1) !important;
           color: #fff !important;
           padding-left: 12px !important;
           padding-right: 12px !important;
        }
        .action-card:hover .open-arrow .open-text {
           opacity: 1;
           width: 32px;
           transform: translateX(0);
        }

        .progress-fill {
           animation: fillProgress 1.5s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
           transform-origin: left;
           transform: scaleX(0);
        }
        @keyframes fillProgress {
           to { transform: scaleX(1); }
        }

        .pulse-dot {
           width: 6px; height: 6px; border-radius: 50%;
           background: var(--color-primary);
           animation: pulseDot 2s infinite;
        }
        @keyframes pulseDot {
           0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
           70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
           100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }

        .btn-resolve-hover:hover {
           background: rgba(239, 68, 68, 0.2) !important;
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        
        @media (max-width: 1200px) {
           .grid-12 { grid-template-columns: 1fr !important; }
           .grid-12 > div { grid-column: span 12 !important; }
        }
      `}</style>
    </div>
  );
}

import React from 'react';