"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";
import NotificationCenter from "@/components/NotificationCenter";
import ThemeToggle from "@/components/ThemeToggle";
import { useUIStore } from '@/store/useUIStore';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import { 
  Zap, BrainCircuit, AlertTriangle, ArrowUpRight, TrendingDown,
  Target, Activity, Clock, CheckCircle2, ChevronRight, ShieldAlert,
  BarChart3, Sparkles, MessageSquare, History, Play, X, Shield, Calendar, AlertCircle
} from "lucide-react";
import { toast, Toaster } from 'react-hot-toast';

interface Decision {
  id: string;
  level: 'CRITICAL' | 'MODERATE' | 'MONITOR';
  confidence: number;
  module: string;
  moduleRoute: string;
  title: string;
  reason: string;
  impactText: string;
  financialImpact: number;
  recommendedAction: string;
  whyThisMatters: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  createdDate: string;
  status: 'pending' | 'Reviewed' | 'Approved' | 'Rejected' | 'Hold' | 'Escalated';
  delegatedTo?: string;
  delegatedDueDate?: string;
  delegatedPriority?: string;
  delegatedNotes?: string;
}

const INITIAL_DECISIONS: Decision[] = [
  {
    id: 'dec-1',
    level: 'CRITICAL',
    confidence: 98,
    module: 'Livestock Intelligence',
    moduleRoute: '/livestock',
    title: 'Reduce Feed Waste in Broilers',
    reason: 'Feed cost is 52% above monthly average while poultry mortality increased.',
    impactText: 'TTD 3,200',
    financialImpact: -3200,
    recommendedAction: 'Review feed supplier and inspect poultry health records.',
    whyThisMatters: 'Feed waste directly cuts into operational poultry margins. Combined with rising mortality, this points to feed contamination, poor feeder designs, or disease. Swift action prevents larger losses.',
    riskLevel: 'High',
    createdDate: new Date(Date.now() - 3600000 * 5).toLocaleDateString(), // 5 hours ago
    status: 'pending'
  },
  {
    id: 'dec-2',
    level: 'MODERATE',
    confidence: 94,
    module: 'Expenses',
    moduleRoute: '/expenses',
    title: 'Renegotiate Soy Supplier Contract',
    reason: 'Market soy prices dropped 12% globally. Current vendor contract permits mid-year adjustment.',
    impactText: '+$3,200/mo',
    financialImpact: 3200,
    recommendedAction: 'Draft renegotiation letter and schedule vendor meeting.',
    whyThisMatters: 'Taking advantage of global commodity price drops is key to raw supply chain cost containment. The contract allows mid-year adjustments, making this a low-risk, high-reward optimization.',
    riskLevel: 'Medium',
    createdDate: new Date(Date.now() - 3600000 * 24).toLocaleDateString(), // 1 day ago
    status: 'pending'
  },
  {
    id: 'dec-3',
    level: 'MONITOR',
    confidence: 78,
    module: 'Infrastructure',
    moduleRoute: '/infrastructure',
    title: 'Delay Tractor Maintenance',
    reason: 'Usage hours are 15% below threshold. Maintenance can be safely delayed to next fiscal quarter.',
    impactText: '+$1,800',
    financialImpact: 1800,
    recommendedAction: 'Log decision and set reminder for next quarter.',
    whyThisMatters: 'Pruning preventative maintenance cycles based on actual asset usage telemetry preserves short-term operational cash flow without introducing premature mechanical wear.',
    riskLevel: 'Low',
    createdDate: new Date(Date.now() - 3600000 * 48).toLocaleDateString(), // 2 days ago
    status: 'pending'
  },
  {
    id: 'dec-4',
    level: 'CRITICAL',
    confidence: 88,
    module: 'Poultry Block C Feed Control',
    moduleRoute: '/poultry-block-c', // Non-existent route to trigger the Drawer context!
    title: 'Feed Cost Anomaly in Block C',
    reason: 'Poultry feed consumption is 52% above standard baseline with minor mortality increase.',
    impactText: '-8.4% margin',
    financialImpact: -14500,
    recommendedAction: 'Isolate Block C feed supply & deploy rapid antibiotic protocol.',
    whyThisMatters: 'Variable feed cost increases without output growth represent a critical margin threat. If feed contamination is suspected, immediate quarantine protects the rest of the flock.',
    riskLevel: 'High',
    createdDate: new Date().toLocaleDateString(),
    status: 'pending'
  }
];

const KNOWN_ROUTES = ['/livestock', '/expenses', '/infrastructure', '/budgets', '/crops', '/inventory', '/labor', '/loans', '/payroll', '/settings', '/analytics'];

export default function DecisionEnginePage() {
  const router = useRouter();
  const { sidebarCollapsed } = useUIStore();
  const { currentUser } = useAppStore();

  const [decisions, setDecisions] = useState<Decision[]>(INITIAL_DECISIONS);
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showContextDrawer, setShowContextDrawer] = useState(false);
  const [activeDecision, setActiveDecision] = useState<Decision | null>(null);

  const [delegateForm, setDelegateForm] = useState({
    assignTo: 'Livestock Team',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 days from now
    priority: 'High',
    notes: ''
  });

  const handleOpenModuleClick = (dec: Decision) => {
    if (KNOWN_ROUTES.includes(dec.moduleRoute)) {
      router.push(dec.moduleRoute);
    } else {
      setActiveDecision(dec);
      setShowContextDrawer(true);
    }
  };

  const handleAnalyzeClick = (dec: Decision) => {
    setActiveDecision(dec);
    setShowDetailsModal(true);
  };

  const handleDelegateClick = (dec: Decision) => {
    setActiveDecision(dec);
    setDelegateForm({
      assignTo: dec.module.includes('Livestock') ? 'Livestock Team' : dec.module.includes('Expense') ? 'Finance & Accounting' : 'Operations Crew',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      priority: dec.level === 'CRITICAL' ? 'Critical' : dec.level === 'MODERATE' ? 'High' : 'Medium',
      notes: ''
    });
    setShowDelegateModal(true);
  };

  const handleMarkReviewedClick = (id: string) => {
    setDecisions(prev => prev.map(dec => {
      if (dec.id === id) {
        return { ...dec, status: 'Reviewed' as const };
      }
      return dec;
    }));
    toast.success('Recommendation marked as reviewed');
  };

  const handleSaveDelegation = () => {
    if (!activeDecision) return;
    
    setDecisions(prev => prev.map(dec => {
      if (dec.id === activeDecision.id) {
        return { 
          ...dec, 
          delegatedTo: delegateForm.assignTo,
          delegatedDueDate: delegateForm.dueDate,
          delegatedPriority: delegateForm.priority,
          delegatedNotes: delegateForm.notes
        };
      }
      return dec;
    }));

    toast.success(`Recommendation delegated to ${delegateForm.assignTo}`);
    setShowDelegateModal(false);
  };

  const handleExecutiveOrder = (action: 'Approved' | 'Rejected' | 'Hold' | 'Escalated') => {
    if (!activeDecision) return;

    setDecisions(prev => prev.map(dec => {
      if (dec.id === activeDecision.id) {
        return { ...dec, status: action };
      }
      return dec;
    }));

    const actionText = action === 'Hold' ? 'placed on Hold' : action;
    toast.success(`Decision ${actionText} successfully`);
    setShowDetailsModal(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', maxWidth: '100vw', overflow: 'hidden' }}>
      <Toaster position="top-right" />
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
             <h1 style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={16} color="var(--color-primary)"/> AI Decision Engine</h1>
             <p className="label-small" style={{ marginLeft: 24 }}>System Brain & Executive Orders</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <ThemeToggle />
            <NotificationCenter />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderLeft: '1px solid var(--color-border)', paddingLeft: 24 }}>
               <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text-primary)' }}>{currentUser?.name || 'Peter Admin'}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)' }}>
                     {currentUser?.role === 'admin' ? 'Estate Control' : currentUser?.role === 'data-entry' ? 'Data Entry Operator' : currentUser?.role === 'viewer' ? 'Viewer Mode' : 'Restricted Mode'}
                  </div>
               </div>
               <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#101010', fontWeight: 950, fontSize: 14, boxShadow: '0 0 15px rgba(34, 197, 94, 0.2)' }}>
                  {currentUser?.name ? currentUser.name[0].toUpperCase() : 'P'}
               </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', width: '100%', boxSizing: 'border-box', padding: '32px 40px' }}>
           <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', overflowX: 'hidden' }}>
           
              {/* SECTION 1 — AI BRIEF (HERO) */}
              <div className="card animate-ai-shimmer" style={{ marginBottom: 48, padding: 48, border: '2px solid rgba(139, 92, 246, 0.5)', boxShadow: '0 25px 80px rgba(139, 92, 246, 0.2)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                       <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px var(--color-primary-glow)' }}>
                          <BrainCircuit size={32} color="var(--color-primary)" />
                       </div>
                       <div>
                           <h2 style={{ fontSize: 32, fontWeight: 950, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>Neural Strategic Brief</h2>
                           <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div className="pulse-dot" style={{ background: 'var(--color-primary)' }}></div> SYSTEM ANALYSIS ACTIVE
                           </div>
                       </div>
                    </div>
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: 32 }}>
                    <div>
                       <div className="label-small" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)' }}><Activity size={14}/> <span>WHAT IS HAPPENING</span></div>
                       <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>Feed cost anomaly + mortality spike detected in Poultry Block C.</div>
                    </div>
                    <div>
                       <div className="label-small" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)' }}><TrendingDown size={14}/> <span>WHY IT MATTERS</span></div>
                       <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>Estimated profit impact: <span style={{ color: 'var(--color-danger)', fontWeight: 900, textShadow: '0 0 12px rgba(239,68,68,0.4)' }}>-8.4% this cycle</span>. Margin risk critical.</div>
                    </div>
                    <div style={{ padding: '24px 32px', background: 'var(--status-ai-glow)', borderRadius: 16, border: '1px solid rgba(139, 92, 246, 0.4)', boxShadow: 'inset 0 0 30px rgba(139, 92, 246, 0.1)' }}>
                       <div className="label-small" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--status-ai)', fontWeight: 950, letterSpacing: '0.15em' }}><Target size={14}/> <span>WHAT TO DO NEXT</span></div>
                       <div style={{ fontSize: 28, fontWeight: 950, color: 'var(--text-primary)', lineHeight: 1.3, letterSpacing: '-0.01em' }}>Isolate Block C feed supply & deploy rapid antibiotic protocol.</div>
                    </div>
                 </div>
              </div>

              {/* SECTION 3 — FINANCIAL IMPACT PANEL */}
              <div style={{ marginBottom: 56 }}>
                 <h3 className="section-title" style={{ marginBottom: 24 }}>Projected Financial Impact</h3>
                 <div className="grid-12" style={{ gap: 24 }}>
                    <div className="card" style={{ gridColumn: 'span 4', padding: 32, background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.1) 0%, transparent 100%)', borderTop: '2px solid var(--color-danger)' }}>
                       <div className="label-small" style={{ marginBottom: 16 }}>Profit Leakage Exposed</div>
                       <div style={{ fontSize: 36, fontWeight: 950, color: 'var(--color-danger)', letterSpacing: '-0.02em', marginBottom: 8, textShadow: 'var(--status-critical-glow)' }}>-$14,500</div>
                       <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 600 }}>Identified across 3 operational domains this month.</p>
                    </div>
                    <div className="card" style={{ gridColumn: 'span 4', padding: 32, background: 'linear-gradient(180deg, rgba(34, 197, 94, 0.1) 0%, transparent 100%)', borderTop: '2px solid var(--color-primary)' }}>
                       <div className="label-small" style={{ marginBottom: 16 }}>Recoverable Revenue</div>
                       <div style={{ fontSize: 36, fontWeight: 950, color: 'var(--color-primary)', letterSpacing: '-0.02em', marginBottom: 8, textShadow: 'var(--status-success-glow)' }}>+$12,400</div>
                       <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 600 }}>Available if critical decisions are executed within 48 hours.</p>
                    </div>
                    <div className="card" style={{ gridColumn: 'span 4', padding: 32, background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%)', borderTop: '2px solid var(--status-ai)' }}>
                       <div className="label-small" style={{ marginBottom: 16 }}>Efficiency Gains</div>
                       <div style={{ fontSize: 36, fontWeight: 950, color: 'var(--status-ai)', letterSpacing: '-0.02em', marginBottom: 8, textShadow: 'var(--status-ai-glow)' }}>+$5,000<span style={{ fontSize: 16 }}>/mo</span></div>
                       <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 600 }}>Long-term savings from supply chain renegotiation.</p>
                    </div>
                 </div>
              </div>

              {/* SECTION 2 — DECISION STACK */}
              <div style={{ marginBottom: 56 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 className="section-title" style={{ fontSize: 24 }}>Executive Decision Stack</h3>
                    <div className="badge-ai" style={{ border: '1px solid rgba(34, 197, 94, 0.4)', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '800' }}>
                      {decisions.filter(d => d.status === 'pending').length} DECISIONS PENDING
                    </div>
                 </div>
                 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {decisions.map((dec) => {
                      const isCritical = dec.level === 'CRITICAL';
                      const isModerate = dec.level === 'MODERATE';

                      const levelColor = isCritical ? 'var(--status-critical)' : isModerate ? 'var(--color-primary)' : 'var(--status-warning)';
                      const levelBg = isCritical ? 'rgba(239, 68, 68, 0.15)' : isModerate ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)';
                      const borderCol = isCritical ? 'rgba(239, 68, 68, 0.5)' : isModerate ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)';
                      const shadowCol = isCritical ? 'rgba(239, 68, 68, 0.15)' : isModerate ? 'rgba(34, 197, 94, 0.08)' : 'rgba(245, 158, 11, 0.08)';
                      const gradColor = isCritical ? 'rgba(239, 68, 68, 0.08)' : isModerate ? 'rgba(34, 197, 94, 0.05)' : 'rgba(245, 158, 11, 0.05)';
                      const sparkColor = isCritical ? 'var(--color-danger)' : isModerate ? 'var(--color-primary)' : 'var(--color-warning)';
                      const actionBg = isCritical ? 'rgba(239, 68, 68, 0.1)' : isModerate ? 'rgba(34, 197, 94, 0.05)' : 'rgba(245, 158, 11, 0.05)';
                      const labelColorText = isCritical ? '#fca5a5' : isModerate ? '#86efac' : '#fcd34d';

                      return (
                        <div key={dec.id} className="card decision-card" style={{ padding: 0, border: `1px solid ${borderCol}`, boxShadow: `0 12px 40px ${shadowCol}`, overflow: 'hidden' }}>
                           <div style={{ padding: '32px 40px', background: `linear-gradient(90deg, ${gradColor} 0%, transparent 100%)` }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                    <div style={{ background: levelBg, color: levelColor, fontSize: 11, fontWeight: 950, padding: '6px 12px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{dec.level}</div>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}><Sparkles size={14} color={sparkColor}/> {dec.confidence}% Confidence</div>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text-muted)' }}>• Related Module: {dec.module}</div>
                                 </div>
                                 
                                 <div style={{ display: 'flex', gap: 8 }}>
                                    {dec.status !== 'pending' && (
                                       <span style={{ 
                                          fontSize: 10, 
                                          fontWeight: 950, 
                                          padding: '4px 8px', 
                                          borderRadius: 4, 
                                          background: 
                                             dec.status === 'Approved' ? 'rgba(34, 197, 94, 0.15)' :
                                             dec.status === 'Rejected' ? 'rgba(239, 68, 68, 0.15)' :
                                             dec.status === 'Hold' ? 'rgba(245, 158, 11, 0.15)' :
                                             dec.status === 'Escalated' ? 'rgba(139, 92, 246, 0.15)' :
                                             dec.status === 'Reviewed' ? 'rgba(59, 130, 246, 0.15)' :
                                             'rgba(255,255,255,0.05)',
                                          color: 
                                             dec.status === 'Approved' ? 'var(--color-primary)' :
                                             dec.status === 'Rejected' ? 'var(--color-danger)' :
                                             dec.status === 'Hold' ? 'var(--color-warning)' :
                                             dec.status === 'Escalated' ? 'var(--status-ai)' :
                                             '#3b82f6',
                                          letterSpacing: '0.05em',
                                          textTransform: 'uppercase'
                                       }}>
                                          {dec.status}
                                       </span>
                                    )}
                                    {dec.delegatedTo && (
                                       <span style={{ fontSize: 10, fontWeight: 950, padding: '4px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-secondary)', letterSpacing: '0.05em' }}>
                                          DELEGATED TO: {dec.delegatedTo.toUpperCase()}
                                       </span>
                                    )}
                                 </div>
                              </div>
                              
                              <h4 style={{ fontSize: 26, fontWeight: 950, color: 'var(--color-text-primary)', marginBottom: 24, letterSpacing: '-0.01em' }}>{dec.title}</h4>
                              
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
                                 <div>
                                    <div className="label-small" style={{ marginBottom: 8, color: 'var(--color-text-secondary)' }}>Reason</div>
                                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>{dec.reason}</div>
                                 </div>
                                 <div>
                                    <div className="label-small" style={{ marginBottom: 8, color: 'var(--color-text-secondary)' }}>Financial Impact</div>
                                    <div style={{ fontSize: 16, fontWeight: 600, color: dec.financialImpact < 0 ? 'var(--color-danger)' : 'var(--color-primary)', lineHeight: 1.5 }}>
                                       {dec.financialImpact < 0 ? 'Estimated monthly profit leakage: ' : 'Cash flow preserved: '}<span style={{ fontWeight: 950, fontSize: 20 }}>{dec.impactText}</span>
                                    </div>
                                 </div>
                              </div>
                              
                              <div style={{ padding: '24px', background: actionBg, borderRadius: 16, border: `1px solid ${borderCol}`, marginBottom: 32 }}>
                                 <div className="label-small" style={{ marginBottom: 8, color: labelColorText, fontWeight: 900, letterSpacing: '0.05em' }}>Recommended Action</div>
                                 <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.4 }}>{dec.recommendedAction}</div>
                              </div>

                              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                 <button 
                                    onClick={() => handleOpenModuleClick(dec)} 
                                    className="btn-primary" 
                                    style={{ padding: '12px 24px', fontSize: 14, fontWeight: 800, background: levelColor, color: 'var(--text-inverse)', border: 'none', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s' }}
                                 >
                                    Open Module
                                 </button>
                                 <button 
                                    onClick={() => handleAnalyzeClick(dec)} 
                                    className="btn-secondary" 
                                    style={{ padding: '12px 24px', fontSize: 14, fontWeight: 800, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, cursor: 'pointer', color: 'var(--color-text-primary)', transition: 'all 0.2s' }}
                                 >
                                    Inspect Details
                                 </button>
                                 <button 
                                    onClick={() => handleDelegateClick(dec)} 
                                    className="btn-secondary" 
                                    style={{ padding: '12px 24px', fontSize: 14, fontWeight: 800, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, cursor: 'pointer', color: 'var(--color-text-primary)', transition: 'all 0.2s' }}
                                 >
                                    Delegate
                                 </button>
                                 <button 
                                    onClick={() => handleMarkReviewedClick(dec.id)} 
                                    disabled={dec.status === 'Reviewed'}
                                    className="btn-secondary" 
                                    style={{ 
                                       padding: '12px 24px', 
                                       fontSize: 14, 
                                       fontWeight: 800, 
                                       background: dec.status === 'Reviewed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.05)', 
                                       border: '1px solid rgba(255,255,255,0.05)', 
                                       borderRadius: 10, 
                                       cursor: dec.status === 'Reviewed' ? 'default' : 'pointer',
                                       color: dec.status === 'Reviewed' ? 'var(--color-primary)' : 'var(--color-text-primary)',
                                       transition: 'all 0.2s'
                                    }}
                                 >
                                    {dec.status === 'Reviewed' ? 'Reviewed ✓' : 'Mark Reviewed'}
                                 </button>
                              </div>
                           </div>
                        </div>
                      );
                    })}
                 </div>
              </div>

              {/* SECTION 5 — DECISION HISTORY */}
              <div style={{ marginBottom: 40 }}>
                 <h3 className="section-title" style={{ marginBottom: 24 }}>Neural Decision History</h3>
                 <div className="card" style={{ padding: 0 }}>
                    <div style={{ padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', fontSize: 11, fontWeight: 900, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                       <div>Action Taken</div>
                       <div>Execution Date</div>
                       <div>Projected Impact</div>
                       <div>Actual Realized</div>
                    </div>
                    {[
                       { title: 'Automated Irrigation Bypass', date: 'Apr 28, 2026', proj: '+$1,200', actual: '+$1,340', status: 'SUCCESS' },
                       { title: 'Shift Labor Block B', date: 'Apr 25, 2026', proj: '+$850', actual: '+$850', status: 'SUCCESS' },
                       { title: 'Forward Contract Corn', date: 'Apr 21, 2026', proj: '+$15,000', actual: 'Pending', status: 'IN PROGRESS' }
                    ].map((history, i) => (
                       <div key={i} style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.02)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                             <CheckCircle2 size={18} color={history.status === 'SUCCESS' ? 'var(--color-primary)' : 'var(--color-warning)'} />
                             <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)' }}>{history.title}</span>
                          </div>
                          <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', fontWeight: 600 }}>{history.date}</div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-primary)' }}>{history.proj}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                             <span style={{ fontSize: 15, fontWeight: 900, color: history.status === 'SUCCESS' ? 'var(--color-primary)' : 'var(--color-warning)' }}>{history.actual}</span>
                             {history.status === 'SUCCESS' && <div style={{ fontSize: 10, fontWeight: 950, color: 'var(--color-primary)', background: 'rgba(34, 197, 94, 0.1)', padding: '4px 8px', borderRadius: 6, letterSpacing: '0.05em' }}>REALIZED</div>}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

           </div>
        </main>
      </div>

      {/* DELEGATE MODAL */}
      {showDelegateModal && activeDecision && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}>
          <div style={{ width: '90%', maxWidth: '520px', background: 'var(--bg-card, #0d1527)', border: '1px solid var(--border-soft, rgba(255,255,255,0.08))', borderRadius: '24px', padding: '36px', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', margin: 0 }}>Delegate Recommendation</h2>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>{activeDecision.title}</p>
              </div>
              <button onClick={() => setShowDelegateModal(false)} style={{ background: 'none', border: 'none', color: '#8e9bb0', cursor: 'pointer' }}><X size={20}/></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '10px', fontWeight: 900, color: '#8e9bb0', letterSpacing: '0.05em' }}>ASSIGN TO</label>
                <select 
                  value={delegateForm.assignTo} 
                  onChange={e => setDelegateForm({...delegateForm, assignTo: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', background: '#050911', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none' }}
                >
                  <option value="Livestock Team">Livestock Team</option>
                  <option value="Operations Crew">Operations Crew</option>
                  <option value="Finance & Accounting">Finance & Accounting</option>
                  <option value="Jane Doe (Data Entry)">Jane Doe (Data Entry)</option>
                  <option value="Mary Operator">Mary Operator</option>
                  <option value="Staff Member">Staff Member</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 900, color: '#8e9bb0', letterSpacing: '0.05em' }}>DUE DATE</label>
                  <input 
                    type="date"
                    value={delegateForm.dueDate}
                    onChange={e => setDelegateForm({...delegateForm, dueDate: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', background: '#050911', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 900, color: '#8e9bb0', letterSpacing: '0.05em' }}>PRIORITY</label>
                  <select 
                    value={delegateForm.priority}
                    onChange={e => setDelegateForm({...delegateForm, priority: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', background: '#050911', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none' }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '10px', fontWeight: 900, color: '#8e9bb0', letterSpacing: '0.05em' }}>DELEGATION NOTES</label>
                <textarea 
                  value={delegateForm.notes}
                  onChange={e => setDelegateForm({...delegateForm, notes: e.target.value})}
                  placeholder="Specify actions, standards, or key details..."
                  style={{ width: '100%', minHeight: '80px', padding: '12px 16px', background: '#050911', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button 
                  onClick={() => setShowDelegateModal(false)}
                  style={{ flex: 1, height: '48px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveDelegation}
                  style={{ flex: 1, height: '48px', borderRadius: '10px', border: 'none', background: 'var(--color-primary)', color: '#101010', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}
                >
                  Save Delegation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RELATED MODULE CONTEXT DRAWER */}
      {showContextDrawer && activeDecision && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={e => e.target === e.currentTarget && setShowContextDrawer(false)}>
          <div style={{ width: '100%', maxWidth: '460px', height: '100%', background: 'var(--bg-card, #0d1527)', borderLeft: '1px solid var(--border-soft, rgba(255,255,255,0.08))', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '-10px 0 40px rgba(0,0,0,0.5)', overflowY: 'auto' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', margin: 0 }}>Related Module Context</h2>
                  <p style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 700, margin: '4px 0 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Route Fallback Intercept</p>
                </div>
                <button onClick={() => setShowContextDrawer(false)} style={{ background: 'none', border: 'none', color: '#8e9bb0', cursor: 'pointer' }}><X size={24}/></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 900, color: '#8e9bb0', letterSpacing: '0.05em', marginBottom: '6px' }}>MODULE NAME</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>{activeDecision.module}</div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 900, color: '#8e9bb0', letterSpacing: '0.05em', marginBottom: '6px' }}>LINKED RECOMMENDATION</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>{activeDecision.title}</div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 900, color: '#8e9bb0', letterSpacing: '0.05em', marginBottom: '6px' }}>REASON FOR ALERT</div>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>{activeDecision.reason}</p>
                </div>

                <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--color-danger)', letterSpacing: '0.05em', marginBottom: '6px' }}>REQUIRED NEXT ACTION</div>
                  <p style={{ fontSize: '15px', color: '#fff', fontWeight: 700, lineHeight: 1.4, margin: 0 }}>{activeDecision.recommendedAction}</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '40px' }}>
              <button 
                onClick={() => setShowContextDrawer(false)}
                style={{ width: '100%', height: '48px', borderRadius: '10px', border: 'none', background: '#fff', color: '#101010', fontWeight: 900, cursor: 'pointer' }}
              >
                Close Context Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DECISION DETAILS / ANALYZE DRAWER */}
      {showDetailsModal && activeDecision && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={e => e.target === e.currentTarget && setShowDetailsModal(false)}>
          <div style={{ width: '100%', maxWidth: '460px', height: '100%', background: 'var(--bg-card, #0d1527)', borderLeft: '1px solid var(--border-soft, rgba(255,255,255,0.08))', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '-10px 0 40px rgba(0,0,0,0.5)', overflowY: 'auto' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                  <span style={{ 
                    fontSize: '9px', 
                    fontWeight: 950, 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    background: activeDecision.level === 'CRITICAL' ? 'rgba(239, 68, 68, 0.15)' : activeDecision.level === 'MODERATE' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: activeDecision.level === 'CRITICAL' ? 'var(--color-danger)' : activeDecision.level === 'MODERATE' ? 'var(--color-primary)' : 'var(--color-warning)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}>
                    {activeDecision.level} DECISION
                  </span>
                  <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', margin: '8px 0 0 0', letterSpacing: '-0.01em' }}>Decision Details</h2>
                </div>
                <button onClick={() => setShowDetailsModal(false)} style={{ background: 'none', border: 'none', color: '#8e9bb0', cursor: 'pointer' }}><X size={24}/></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>{activeDecision.title}</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    <span>Confidence: <strong style={{ color: 'var(--color-primary)' }}>{activeDecision.confidence}%</strong></span>
                    <span>•</span>
                    <span>Module: <strong>{activeDecision.module}</strong></span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 900, color: '#8e9bb0', letterSpacing: '0.05em', marginBottom: '6px' }}>CONTEXT & REASON</div>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>{activeDecision.reason}</p>
                </div>

                <div>
                  <div style={{ fontSize: '10px', fontWeight: 900, color: '#8e9bb0', letterSpacing: '0.05em', marginBottom: '6px' }}>WHY THIS MATTERS</div>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>{activeDecision.whyThisMatters}</p>
                </div>

                <div style={{ padding: '20px', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '16px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--status-ai, #8b5cf6)', letterSpacing: '0.05em', marginBottom: '6px' }}>SUGGESTED ACTION</div>
                  <p style={{ fontSize: '15px', color: '#fff', fontWeight: 700, lineHeight: 1.4, margin: 0 }}>{activeDecision.recommendedAction}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#8e9bb0', letterSpacing: '0.05em', marginBottom: '4px' }}>ESTIMATED FINANCIAL IMPACT</div>
                    <div style={{ 
                      fontSize: '20px', 
                      fontWeight: 900, 
                      color: activeDecision.financialImpact < 0 ? 'var(--color-danger)' : 'var(--color-primary)' 
                    }}>
                      {activeDecision.impactText}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#8e9bb0', letterSpacing: '0.05em', marginBottom: '4px' }}>RISK LEVEL</div>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: 800, 
                      color: activeDecision.riskLevel === 'High' ? 'var(--color-danger)' : activeDecision.riskLevel === 'Medium' ? 'var(--color-warning)' : 'var(--color-primary)' 
                    }}>
                      {activeDecision.riskLevel}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 900, color: '#8e9bb0', letterSpacing: '0.05em', marginBottom: '8px' }}>CURRENT EXECUTIVE ORDER STATUS</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 900, 
                      padding: '6px 12px', 
                      borderRadius: '6px', 
                      textTransform: 'uppercase',
                      background: 
                        activeDecision.status === 'Approved' ? 'rgba(34, 197, 94, 0.15)' :
                        activeDecision.status === 'Rejected' ? 'rgba(239, 68, 68, 0.15)' :
                        activeDecision.status === 'Hold' ? 'rgba(245, 158, 11, 0.15)' :
                        activeDecision.status === 'Escalated' ? 'rgba(139, 92, 246, 0.15)' :
                        activeDecision.status === 'Reviewed' ? 'rgba(59, 130, 246, 0.15)' :
                        'rgba(255,255,255,0.05)',
                      color: 
                        activeDecision.status === 'Approved' ? 'var(--color-primary)' :
                        activeDecision.status === 'Rejected' ? 'var(--color-danger)' :
                        activeDecision.status === 'Hold' ? 'var(--color-warning)' :
                        activeDecision.status === 'Escalated' ? 'var(--status-ai)' :
                        activeDecision.status === 'Reviewed' ? '#3b82f6' :
                        'var(--color-text-secondary)'
                    }}>
                      {activeDecision.status === 'pending' ? 'PENDING DECISION' : activeDecision.status}
                    </span>
                    {activeDecision.delegatedTo && (
                      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                        Delegated: <strong>{activeDecision.delegatedTo}</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 900, color: '#8e9bb0', letterSpacing: '0.05em' }}>ISSUE EXECUTIVE ORDER</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                    <button 
                      onClick={() => handleExecutiveOrder('Approved')}
                      style={{ padding: '12px 6px', fontSize: '11px', fontWeight: 900, background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '10px', color: 'var(--color-primary)', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      APPROVE
                    </button>
                    <button 
                      onClick={() => handleExecutiveOrder('Rejected')}
                      style={{ padding: '12px 6px', fontSize: '11px', fontWeight: 900, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', color: 'var(--color-danger)', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      REJECT
                    </button>
                    <button 
                      onClick={() => handleExecutiveOrder('Hold')}
                      style={{ padding: '12px 6px', fontSize: '11px', fontWeight: 900, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '10px', color: 'var(--color-warning)', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      HOLD
                    </button>
                    <button 
                      onClick={() => handleExecutiveOrder('Escalated')}
                      style={{ padding: '12px 6px', fontSize: '11px', fontWeight: 900, background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '10px', color: 'var(--status-ai, #8b5cf6)', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      ESCALATE
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => {
                  setShowDetailsModal(false);
                  if (KNOWN_ROUTES.includes(activeDecision.moduleRoute)) {
                    router.push(activeDecision.moduleRoute);
                  } else {
                    setShowContextDrawer(true);
                  }
                }}
                style={{ width: '100%', height: '48px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.06)', color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                Go to Module <ArrowUpRight size={16}/>
              </button>
              <button 
                onClick={() => setShowDetailsModal(false)}
                style={{ width: '100%', height: '48px', borderRadius: '10px', border: 'none', background: '#fff', color: '#101010', fontWeight: 900, cursor: 'pointer' }}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-ai-shimmer {
          background: radial-gradient(circle at top left, rgba(139, 92, 246, 0.25), transparent 70%), 
                      linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(139, 92, 246, 0.02) 100%), 
                      var(--bg-card);
          background-size: 200% 200%;
          animation: aiShimmer 10s ease infinite;
        }
        @keyframes aiShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .pulse-dot {
           width: 8px; height: 8px; border-radius: 50%;
           animation: pulseDot 2s infinite;
        }
        @keyframes pulseDot {
           0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
           70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
           100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .decision-card {
           transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
        }
        .decision-card:hover {
           transform: translateX(8px);
        }
      `}</style>
    </div>
  );
}
