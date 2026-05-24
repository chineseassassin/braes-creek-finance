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
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import {
  Bell, Search, Users, ShoppingCart,
  AlertCircle, ShieldAlert, Wrench, Landmark, Sprout, Beef,
  ArrowRight, ShieldCheck, Zap, Info, AlertTriangle, Clock,
  Sparkles, ChevronRight, Activity, DollarSign, TrendingUp, TrendingDown, MessageSquare, Target, BrainCircuit
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { transactions, fetchTransactions, getTotalRevenue, getTotalExpenses, getNetProfit } = useDashboardStore();
  const { sidebarCollapsed } = useUIStore();
  const { recommendations, updateRecommendationStatus, generateRecommendations } = useWorkflowStore();
  const { initializeEngine, currentUser } = useAppStore();

  const getModuleRoute = (moduleName: string) => {
    const m = moduleName.toLowerCase();
    if (m.includes('livestock')) return '/livestock';
    if (m.includes('crop')) return '/crops';
    if (m.includes('infrastructure')) return '/infrastructure';
    if (m.includes('expense')) return '/expenses';
    if (m.includes('inventory')) return '/inventory';
    if (m.includes('payroll')) return '/payroll';
    if (m.includes('budget')) return '/budgets';
    if (m.includes('predictive') || m.includes('ai') || m.includes('intelligence')) return '/decision-engine';
    return '/' + m.replace(/\s+/g, '-');
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initializeEngine();
  }, [initializeEngine]);
  
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
    { label: 'Loans', val: '$42.5k', status: '1 Overdue', icon: <Landmark size={20}/>, color: 'var(--status-critical)', href: '/loans' },
    { label: 'Crops', val: '42 Acres', status: 'Optimal Health', icon: <Sprout size={20}/>, color: 'var(--status-success)', href: '/crops' },
    { label: 'Livestock', val: '840 Units', status: '2 Active Alerts', icon: <Beef size={20}/>, color: 'var(--status-warning)', href: '/livestock' },
    { label: 'Workforce', val: '12 Active', status: 'Labor Costs Rising', icon: <Users size={20}/>, color: 'var(--status-info)', href: '/labor' },
    { label: 'Maintenance', val: '4 Fleet', status: '1 Service Overdue', icon: <Wrench size={20}/>, color: 'var(--status-critical)', href: '/infrastructure' },
    { label: 'Supplies', val: '12 Items', status: 'Low Inventory Alert', icon: <ShoppingCart size={20}/>, color: 'var(--status-warning)', href: '/inventory' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', maxWidth: '100vw', overflow: 'hidden', background: 'var(--bg-body)' }}>
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
        <header style={{ height: 72, background: 'var(--bg-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid var(--border-soft)`, width: '100%', boxSizing: 'border-box' }}>
          <div>
             <h1 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Command Center</h1>
             <p className="label-small">Estate Tactical Operations</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <ThemeToggle />
            <NotificationCenter />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderLeft: '1px solid var(--border-soft)', paddingLeft: 24 }}>
               <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{currentUser?.name || 'Peter Admin'}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--status-success)' }}>
                     {currentUser?.role === 'admin' ? 'Estate Control' : currentUser?.role === 'data-entry' ? 'Data Entry Operator' : currentUser?.role === 'viewer' ? 'Viewer Mode' : 'Restricted Mode'}
                  </div>
               </div>
               <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-inverse)', fontWeight: 950, fontSize: 14, boxShadow: '0 0 15px var(--status-success-glow)' }}>
                  {currentUser?.name ? currentUser.name[0].toUpperCase() : 'P'}
               </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', width: '100%', boxSizing: 'border-box', padding: 24 }}>
           <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', overflowX: 'hidden' }}>
              
              {/* 1. ALERT ESCALATION SYSTEM BANNER */}
              {mounted && highestAlert && highestAlert.severity === 'emergency' && (
                <div 
                  className={`card ${mounted ? 'animate-alert-entrance animate-siren animate-periodic-glitch' : ''}`} 
                  style={{ marginBottom: 32, padding: '24px 32px', background: 'var(--status-critical-glow)', border: '3px solid var(--status-critical)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 0 60px var(--status-critical-glow)', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => {
                    if (highestAlert.category === 'spending' && highestAlert.related_record_id) window.location.href = `/expenses?highlight=${highestAlert.related_record_id}`;
                    else if (highestAlert.category === 'payroll' && highestAlert.related_record_id) window.location.href = `/payroll?highlight=${highestAlert.related_record_id}`;
                    else router.push('/alerts');
                  }}
                >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', background: 'var(--status-critical)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                       <div style={{ background: 'var(--status-critical)', color: 'var(--text-inverse)', padding: '8px 16px', borderRadius: 6, fontWeight: 950, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: '0 0 25px var(--status-critical)', animation: 'pulse 1s infinite' }}>EMERGENCY</div>
                       <div>
                          <div style={{ fontSize: 20, fontWeight: 950, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
                             <ShieldAlert size={20} className="animate-pulse" style={{ color: 'var(--status-critical)' }} />
                             {highestAlert.title}
                          </div>
                          <div style={{ fontSize: 14, color: 'var(--status-critical)', fontWeight: 700, opacity: 0.9 }}>{highestAlert.message}</div>
                       </div>
                    </div>
                    <div className="btn-resolve-hover" style={{ background: 'var(--status-critical)', color: 'var(--text-inverse)', padding: '14px 28px', borderRadius: 10, fontWeight: 950, fontSize: 13, cursor: 'pointer', boxShadow: '0 0 30px var(--status-critical-glow)', transition: 'all 0.3s ease' }}>
                       INITIATE RESPONSE
                    </div>
                </div>
              )}

              {mounted && highestAlert && highestAlert.severity === 'critical' && (
                <div 
                  onClick={() => {
                    if (highestAlert.category === 'spending' && highestAlert.related_record_id) window.location.href = `/expenses?highlight=${highestAlert.related_record_id}`;
                    else if (highestAlert.category === 'payroll' && highestAlert.related_record_id) window.location.href = `/payroll?highlight=${highestAlert.related_record_id}`;
                    else router.push('/alerts');
                  }} 
                  className={`${mounted ? 'animate-alert-entrance' : ''} critical-hover`} 
                  style={{ marginBottom: 32, padding: '14px 24px', background: 'var(--status-critical-glow)', border: '1px solid var(--status-critical)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 0 30px var(--status-critical-glow)', cursor: 'pointer' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                       <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--status-critical-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--status-critical)' }}>
                          <AlertTriangle size={20} color="var(--status-critical)" />
                       </div>
                       <div className="animate-ai-text-update" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ color: 'var(--status-critical)', fontWeight: 950, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.1em' }}>CRITICAL ALERT</span>
                          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{highestAlert.title} — {highestAlert.recommended_action}</span>
                       </div>
                    </div>
                    <div className="btn-resolve-hover" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 950, color: 'var(--text-inverse)', letterSpacing: '0.05em', background: 'var(--status-critical)', padding: '10px 20px', borderRadius: 8 }}>
                       RESOLVE <ArrowRight size={16} />
                    </div>
                </div>
              )}

              {mounted && highestAlert && highestAlert.severity === 'warning' && (
                <div 
                  onClick={() => {
                    if (highestAlert.category === 'spending' && highestAlert.related_record_id) window.location.href = `/expenses?highlight=${highestAlert.related_record_id}`;
                    else if (highestAlert.category === 'payroll' && highestAlert.related_record_id) window.location.href = `/payroll?highlight=${highestAlert.related_record_id}`;
                    else router.push('/alerts');
                  }} 
                  className={mounted ? 'animate-alert-entrance animate-soft-pulse' : ''} 
                  style={{ cursor: 'pointer', marginBottom: 32, padding: '12px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 14 }}
                >
                   <div className="pulse-dot" style={{ background: 'var(--status-warning)', width: 10, height: 10 }} />
                   <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--status-warning)', fontWeight: 900, marginRight: 10, letterSpacing: '0.08em', fontSize: 12 }}>WARNING</span>
                      {highestAlert.title} — {highestAlert.message}
                   </div>
                </div>
              )}
                       {/* 2. AI NEURAL HUB: ACTIONABLE INTELLIGENCE */}
               <div className={`card neural-card ${mounted ? 'animate-soft-pulse' : ''}`} style={{ marginBottom: 40, padding: '40px', border: '1px solid var(--status-info)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: 'radial-gradient(circle at 100% 0%, var(--status-info-glow) 0%, transparent 70%)', pointerEvents: 'none' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ padding: 12, borderRadius: 14, background: 'var(--status-info-glow)', color: 'var(--status-info)', boxShadow: '0 0 20px var(--status-info-glow)' }}><BrainCircuit size={24}/></div>
                        <div>
                           <h2 className="section-title" style={{ margin: 0, fontSize: 20, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Intelligence Decision Hub</h2>
                           <div className="label-small" style={{ color: 'var(--text-muted)', marginTop: 4 }}>Neural Engine: <span style={{ color: 'var(--status-success)' }}>ACTIVE</span> • Phase 5 Actionable Intel</div>
                        </div>
                     </div>
                     <div style={{ display: 'flex', gap: 8 }}>
                         <div className="badge-info" style={{ 
                            background: 'var(--status-info-glow)', 
                            color: 'var(--status-info)', 
                            border: '1px solid var(--status-info)',
                            padding: '6px 14px',
                            borderRadius: '30px',
                            fontSize: '10px',
                            fontWeight: 900,
                            letterSpacing: '0.05em',
                            height: 'fit-content'
                         }}>{mounted ? activeRecs.length : 0} RECOMMENDATIONS</div>
                     </div>
                  </div>

                  {(mounted ? activeRecs.length : 0) === 0 ? (
                     <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Sparkles size={32} style={{ marginBottom: 16, opacity: 0.3 }} />
                        <div style={{ fontSize: 16, fontWeight: 600 }}>System Health Optimal</div>
                        <div style={{ fontSize: 13 }}>No critical anomalies requiring AI intervention.</div>
                     </div>
                  ) : (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        {activeRecs.map((rec, idx) => (
                           <div key={rec.id} style={{ 
                              paddingBottom: idx !== activeRecs.length - 1 ? 32 : 0, 
                              borderBottom: idx !== activeRecs.length - 1 ? '1px solid var(--border-soft)' : 'none' 
                           }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>{rec.title}</div>
                                    <span style={{ 
                                       padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', 
                                       background: rec.urgency === 'critical' ? 'var(--status-critical-glow)' : 'var(--status-warning-glow)',
                                       color: rec.urgency === 'critical' ? 'var(--status-critical)' : 'var(--status-warning)',
                                       border: `1px solid ${rec.urgency === 'critical' ? 'var(--status-critical)' : 'var(--status-warning)'}`
                                    }}>{rec.urgency}</span>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--status-success)', background: 'var(--status-success-glow)', padding: '4px 8px', borderRadius: 8 }}>{rec.confidence}% CONFIDENCE</span>
                                 </div>
                                 <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--status-info)', background: 'var(--status-info-glow)', padding: '6px 12px', borderRadius: 10, border: '1px solid var(--status-info)' }}>
                                    IMPACT: {rec.estimated_impact}
                                 </div>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32, marginBottom: 24 }}>
                                 <div>
                                    <div className="label-small" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><MessageSquare size={12}/> <span>WHAT IS HAPPENING</span></div>
                                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{rec.what_happening}</div>
                                 </div>
                                 <div>
                                    <div className="label-small" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Activity size={12}/> <span>WHY IT MATTERS</span></div>
                                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{rec.why_it_matters}</div>
                                 </div>
                                 <div style={{ padding: '16px 20px', background: 'var(--bg-card-elevated)', borderRadius: 12, border: '1px solid var(--border-soft)' }}>
                                    <div className="label-small" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--status-info)' }}><Target size={12}/> <span>NEXT STEPS</span></div>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.5 }}>{rec.next_steps}</div>
                                 </div>
                              </div>

                              <div style={{ display: 'flex', gap: 12 }}>
                                 <button className="btn btn-primary" onClick={() => {
                                    const route = getModuleRoute(rec.module);
                                    router.push(route);
                                 }} style={{ padding: '10px 20px', fontSize: 13, fontWeight: 800 }}>Open {rec.module} Module</button>
                                 <button className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: 13, fontWeight: 800 }}>Delegate Tactical Task</button>
                                 <button className="btn btn-ghost" onClick={() => handleMarkReviewed(rec.id)} style={{ padding: '10px 20px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Mark as Reviewed</button>
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
                    <button className="btn btn-ghost" onClick={() => router.push('/alerts')} style={{ fontSize: 11, padding: '6px 12px' }}>View All Alerts <ArrowRight size={14}/></button>
                 </div>
                 <div style={{ position: 'relative', width: '100%' }}>
                    <div style={{ display: 'flex', gap: 16, overflowX: 'auto', overflowY: 'hidden', paddingBottom: 16, width: '100%', boxSizing: 'border-box' }} className="no-scrollbar">
                    {/* Priority Alert Loop */}
                     {(mounted ? activeAlerts : [
                        { title: 'System Monitoring', severity: 'info', recommended_action: 'Operational scan active' },
                        { title: 'Financial Watch', severity: 'warning', recommended_action: 'Monitoring expense activity' },
                        { title: 'Priority Alert', severity: 'critical', recommended_action: 'Review critical farm signals' }
                     ]).map((a, i) => {
                       const isCrit = a.severity.toLowerCase() === 'critical';
                       const isWarn = a.severity.toLowerCase() === 'warning';
                       const color = isCrit ? 'var(--status-critical)' : isWarn ? 'var(--status-warning)' : 'var(--status-info)';
                       const glow = isCrit ? 'var(--status-critical-glow)' : isWarn ? 'var(--status-warning-glow)' : 'var(--status-info-glow)';
                        const hoverClass = isCrit ? 'critical-hover' : isWarn ? 'warning-hover' : 'info-hover';
                        return <div key={i} onClick={() => router.push('/alerts')} className={`card priority-alert-card ${mounted ? hoverClass : ''}`} style={{ width: 240, flexShrink: 0, padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                              <div style={{ padding: '16px 20px', borderLeft: `3px solid ${color}`, background: isCrit ? `linear-gradient(90deg, ${glow} 0%, transparent 100%)` : 'none', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                       <ShieldAlert size={12} color={color} />
                                       <span style={{ fontSize: 9, fontWeight: 900, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{a.severity}</span>
                                    </div>
                                    <Clock size={10} color="var(--text-muted)" />
                                 </div>
                                 <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                                 <div style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {a.recommended_action} <ArrowRight size={10} color={color} />
                                 </div>
                              </div>
                           </div>
                     })}
                    </div>
                    <div style={{ position: 'absolute', top: 0, right: 0, bottom: 16, width: 80, background: 'linear-gradient(to right, transparent, var(--bg-body))', pointerEvents: 'none' }} />
                 </div>
              </div>

              {/* 4. MAIN GRID */}
              <div className="grid-12" style={{ marginBottom: 40, gap: 20 }}>
                 
                 {/* ACTION CENTER (LEFT 8) */}
                 <div style={{ gridColumn: 'span 8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                       <h3 className="section-title">Operational Action Center</h3>
                       <div className="badge-info" style={{ 
                           background: 'var(--status-info-glow)', 
                           color: 'var(--status-info)', 
                           border: '1px solid var(--status-info)', 
                           padding: '6px 14px',
                           borderRadius: '30px',
                           fontSize: '10px',
                           fontWeight: 900,
                           letterSpacing: '0.05em',
                           height: 'fit-content'
                        }}>6 ACTIVE SECTORS</div>
                    </div>
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        {ACTIONS.map((act, i) => (
                           <div key={i} onClick={() => router.push(act.href)} className="card action-card" style={{ padding: 24, height: 160, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
                                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 16px 40px ${act.color}33`; e.currentTarget.style.borderColor = act.color; }}
                                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = ''; }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                 <div className="action-icon" style={{ color: act.color, background: `${act.color}22`, padding: 8, borderRadius: 10 }}>{act.icon}</div>
                                 <div className="open-arrow" style={{ padding: '4px 10px', borderRadius: 20, background: 'var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                    <span style={{ fontSize: 10, fontWeight: 900, marginRight: 6 }} className="open-text">OPEN</span>
                                    <ArrowRight size={12} />
                                 </div>
                              </div>
                              <div>
                                 <div className="metric-main" style={{ fontSize: 24, marginBottom: 8, color: 'var(--text-primary)' }}>{act.val}</div>
                                 <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-primary)' }}>{act.label}</div>
                                 <div className="label-small" style={{ color: 'var(--text-muted)', marginTop: 4 }}>{act.status}</div>
                              </div>
                           </div>
                        ))}
                     </div>
                 </div>

                  {/* SYSTEM HEALTH (RIGHT 4) */}
                  <div style={{ gridColumn: 'span 4' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h3 className="section-title">System Health Matrix</h3>
                        <div className="label-small" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>
                        <div className="pulse-dot" style={{ flexShrink: 0 }}></div> 
                        <span>Updated just now</span>
                     </div>
                     </div>
                     <div className="card" style={{ padding: '32px' }}>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                          <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                 <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 700 }}>Capital Status</span>
                                 <span style={{ fontSize: 11, fontWeight: 950, color: stats.profit > 0 ? 'var(--status-success)' : 'var(--status-critical)', textShadow: stats.profit > 0 ? '0 0 10px var(--status-success-glow)' : '0 0 10px var(--status-critical-glow)' }}>{stats.profit > 0 ? 'OPTIMAL' : 'RISK'}</span>
                              </div>
                              <div style={{ height: 4, background: 'var(--border-soft)', borderRadius: 2 }}>
                                 <div className="progress-fill" style={{ height: '100%', width: stats.profit > 0 ? '85%' : '30%', background: stats.profit > 0 ? 'var(--status-success)' : 'var(--status-critical)', borderRadius: 2, boxShadow: stats.profit > 0 ? '0 0 10px var(--status-success-glow)' : '0 0 10px var(--status-critical-glow)' }} />
                              </div>
                           </div>
                           <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                 <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 700 }}>Operational Flow</span>
                                 <span style={{ fontSize: 11, fontWeight: 950, color: 'var(--status-success)', textShadow: '0 0 10px var(--status-success-glow)' }}>SECURE</span>
                              </div>
                              <div style={{ height: 4, background: 'var(--border-soft)', borderRadius: 2 }}>
                                 <div className="progress-fill" style={{ height: '100%', width: '94%', background: 'var(--status-success)', borderRadius: 2, boxShadow: '0 0 10px var(--status-success-glow)' }} />
                              </div>
                           </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                             <div className="card-elevated" style={{ padding: 20, borderRadius: 16 }}>
                                <div className="label-small" style={{ marginBottom: 6 }}>Alerts</div>
                                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)' }}>{mounted ? activeAlerts.length : 0}</div>
                             </div>
                             <div className="card-elevated" style={{ padding: 20, borderRadius: 16 }}>
                                <div className="label-small" style={{ marginBottom: 6 }}>Neural Conf.</div>
                                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--status-success)' }}>94%</div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* 5. REAL-TIME INSIGHTS */}
              <div style={{ borderTop: `1px solid var(--border-soft)`, paddingTop: 40 }}>
                 <h3 className="section-title" style={{ marginBottom: 24 }}>Strategic Intelligence Insights</h3>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    {[
                      { label: 'Expense Trend', val: '+4.2%', desc: 'Energy up', color: 'var(--status-critical)', grad: 'var(--status-critical-glow)' },
                      { label: 'Labor Impact', val: '-2.1%', desc: 'High efficiency', color: 'var(--status-success)', grad: 'var(--status-success-glow)' },
                      { label: 'Crop Status', val: 'On Track', desc: '94% yield', color: 'var(--status-success)', grad: 'var(--status-success-glow)' },
                      { label: 'Vendor Costs', val: 'Steady', desc: 'No shifts', color: 'var(--status-info)', grad: 'var(--status-info-glow)' },
                    ].map((insight, i) => (
                       <div key={i} className="card insight-card" style={{ background: `linear-gradient(180deg, ${insight.grad} 0%, transparent 100%), var(--bg-card)`, padding: 24, transition: 'all 0.3s ease', cursor: 'default' }}
                            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 8px 30px ${insight.grad}`; e.currentTarget.style.borderColor = insight.color; }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = ''; }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                             <span className="label-small">{insight.label}</span>
                             <div style={{ width: 8, height: 8, borderRadius: '50%', background: insight.color, boxShadow: `0 0 12px ${insight.color}` }} />
                          </div>
                          <div style={{ fontSize: 28, fontWeight: 950, color: insight.color, marginBottom: 4, letterSpacing: '-0.04em', textShadow: `0 0 16px ${insight.grad}` }}>{insight.val}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{insight.desc}</div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* 6. LIVE ACTIVITY FEED */}
              <div style={{ borderTop: `1px solid var(--border-soft)`, paddingTop: 40, marginTop: 40 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 className="section-title">Live Activity Feed</h3>
                     <div className="badge-info" style={{ 
                        background: 'var(--status-info-glow)', 
                        color: 'var(--status-info)', 
                        border: '1px solid var(--status-info)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 8,
                        padding: '6px 14px',
                        borderRadius: '30px',
                        fontSize: '10px',
                        fontWeight: 900,
                        letterSpacing: '0.05em',
                        height: 'fit-content'
                     }}>
                        <div className="live-dot-subtle" style={{ background: 'var(--status-info)', flexShrink: 0, width: 6, height: 6 }}></div>
                        CONNECTED ENGINE
                     </div>

                 </div>
                 <div className="card" style={{ padding: '32px 40px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                       {(mounted ? logs.slice(0, 6) : []).map((evt, i) => (
                          <div key={evt.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 20, position: 'relative' }}>
                             {i !== logs.slice(0, 6).length - 1 && <div style={{ position: 'absolute', top: 40, bottom: -24, left: 19, width: 2, background: 'var(--border-soft)' }} />}
                             <div style={{ 
                                width: 40, height: 40, borderRadius: '50%', 
                                background: evt.severity === 'emergency' ? 'var(--status-critical-glow)' : 
                                            evt.severity === 'critical' ? 'var(--status-critical-glow)' : 
                                            evt.severity === 'success' ? 'var(--status-success-glow)' : 'var(--status-info-glow)', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, 
                                border: `1px solid ${
                                  evt.severity === 'emergency' ? 'var(--status-critical)' : 
                                  evt.severity === 'critical' ? 'var(--status-critical)' : 
                                  evt.severity === 'success' ? 'var(--status-success)' : 'var(--status-info)'
                                }` 
                             }}>
                                {evt.severity === 'emergency' || evt.severity === 'critical' ? <ShieldAlert size={18} color={evt.severity === 'emergency' ? 'var(--status-critical)' : 'var(--status-warning)'} /> : 
                                 evt.severity === 'success' ? <ShieldCheck size={18} color="var(--status-success)" /> : <Activity size={18} color="var(--status-info)" />}
                             </div>
                             <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                   <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{evt.title}</div>
                                   <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{mounted ? new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, fontWeight: 600 }}>
                                   <span style={{ color: 'var(--text-secondary)' }}>{evt.module}</span>
                                   <span style={{ color: 'var(--text-muted)' }}>•</span>
                                   <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: 'var(--text-primary)' }}>{evt.user[0]}</div>
                                      {evt.user}
                                   </span>
                                   <span style={{ color: 'var(--text-muted)' }}>•</span>
                                   <span style={{ 
                                     background: evt.severity === 'emergency' ? 'var(--status-critical-glow)' : 
                                                 evt.severity === 'critical' ? 'var(--status-critical-glow)' : 
                                                 evt.severity === 'success' ? 'var(--status-success-glow)' : 'var(--status-info-glow)', 
                                     color: evt.severity === 'emergency' ? 'var(--status-critical)' : 
                                            evt.severity === 'critical' ? 'var(--status-critical)' : 
                                            evt.severity === 'success' ? 'var(--status-success)' : 'var(--status-info)', 
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

      <style dangerouslySetInnerHTML={{__html: `
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
          0% { box-shadow: 0 0 20px var(--status-critical-glow); border-color: var(--status-critical); }
          100% { box-shadow: 0 0 50px var(--status-critical); border-color: var(--status-critical); transform: scale(1.005); }
        }

        .animate-soft-pulse {
          animation: softPulse 3s infinite ease-in-out;
        }
        @keyframes softPulse {
          0% { opacity: 0.85; border-color: var(--border-soft); }
          50% { opacity: 1; border-color: var(--status-warning); transform: translateY(-1px); }
          100% { opacity: 0.85; border-color: var(--border-soft); }
        }

        .btn-resolve-hover:hover {
            transform: scale(1.02);
            box-shadow: 0 8px 24px var(--status-critical-glow) !important;
            filter: brightness(1.1);
        }

        .live-dot-subtle {
           width: 6px; height: 6px; border-radius: 50%;
           background: var(--status-critical);
           animation: liveDotSubtle 2s infinite ease-in-out;
        }
        @keyframes liveDotSubtle {
           0% { opacity: 0.4; }
           50% { opacity: 1; box-shadow: 0 0 8px var(--status-critical-glow); }
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
           box-shadow: 0 4px 24px var(--status-critical-glow) !important;
           border-color: var(--status-critical) !important;
        }
        .warning-hover:hover {
           transform: scale(1.03) translateY(-2px);
           box-shadow: 0 12px 32px var(--status-warning-glow) !important;
           border-color: var(--status-warning) !important;
        }
        .info-hover:hover {
           transform: scale(1.03) translateY(-2px);
           box-shadow: 0 12px 32px var(--status-info-glow) !important;
           border-color: var(--status-info) !important;
        }

        .animate-ai-shimmer {
          background: radial-gradient(circle at top right, var(--status-info-glow), transparent 50%), linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%), var(--bg-card) !important;
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
           color: var(--text-secondary);
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
           background: var(--border-soft) !important;
           color: var(--text-primary) !important;
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
           background: var(--status-success);
           animation: pulseDot 2s infinite;
        }
        @keyframes pulseDot {
           0% { box-shadow: 0 0 0 0 var(--status-success-glow); }
           70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
           100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        
        @media (max-width: 1200px) {
           .grid-12 { grid-template-columns: 1fr !important; }
           .grid-12 > div { grid-column: span 12 !important; }
        }
      `}} />
    </div>
  );
}

import React from 'react';