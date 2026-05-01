"use client";

import React, { useState } from 'react';
import Sidebar from "@/components/Sidebar";
import NotificationCenter from "@/components/NotificationCenter";
import ThemeToggle from "@/components/ThemeToggle";
import { useUIStore } from '@/store/useUIStore';
import { 
  Zap, BrainCircuit, AlertTriangle, ArrowUpRight, TrendingDown,
  Target, Activity, Clock, CheckCircle2, ChevronRight, ShieldAlert,
  BarChart3, Sparkles, MessageSquare, History, Play
} from "lucide-react";

export default function DecisionEnginePage() {
  const { sidebarCollapsed } = useUIStore();

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
             <h1 style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={16} color="var(--color-primary)"/> AI Decision Engine</h1>
             <p className="label-small" style={{ marginLeft: 24 }}>System Brain & Executive Orders</p>
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

              {/* SECTION 2 — DECISION STACK (MOST IMPORTANT) */}
              <div style={{ marginBottom: 56 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 className="section-title" style={{ fontSize: 24 }}>Executive Decision Stack</h3>
                    <div className="badge-ai" style={{ border: '1px solid rgba(34, 197, 94, 0.4)', color: 'var(--color-primary)' }}>3 DECISIONS PENDING</div>
                 </div>
                 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Decision 1 (Critical) */}
                    <div className="card decision-card" style={{ padding: 0, border: '1px solid rgba(239, 68, 68, 0.5)', boxShadow: '0 12px 40px rgba(239, 68, 68, 0.15)', overflow: 'hidden' }}>
                       <div style={{ padding: '32px 40px', background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.08) 0%, transparent 100%)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                             <div style={{ background: 'var(--status-critical)', color: 'var(--text-inverse)', fontSize: 11, fontWeight: 950, padding: '6px 12px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: 'var(--shadow-soft)' }}>CRITICAL</div>
                             <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}><Sparkles size={14} color="var(--color-danger)"/> 98% Confidence</div>
                             <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text-muted)' }}>• Related Module: Livestock Intelligence</div>
                          </div>
                          
                          <h4 style={{ fontSize: 26, fontWeight: 950, color: 'var(--color-text-primary)', marginBottom: 24, letterSpacing: '-0.01em' }}>Reduce Feed Waste in Broilers</h4>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
                             <div>
                                <div className="label-small" style={{ marginBottom: 8, color: 'var(--color-text-secondary)' }}>Reason</div>
                                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>Feed cost is 52% above monthly average while poultry mortality increased.</div>
                             </div>
                             <div>
                                <div className="label-small" style={{ marginBottom: 8, color: 'var(--color-text-secondary)' }}>Financial Impact</div>
                                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-danger)', lineHeight: 1.5 }}>Estimated monthly profit leakage: <span style={{ fontWeight: 900, fontSize: 20 }}>TTD 3,200</span></div>
                             </div>
                          </div>
                          
                          <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 16, border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: 32 }}>
                             <div className="label-small" style={{ marginBottom: 8, color: '#fca5a5', fontWeight: 900, letterSpacing: '0.05em' }}>Recommended Action</div>
                             <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.4 }}>Review feed supplier and inspect poultry health records.</div>
                          </div>

                          <div style={{ display: 'flex', gap: 12 }}>
                             <button className="btn-primary" style={{ padding: '12px 24px', fontSize: 14, fontWeight: 800, background: 'var(--status-critical)', color: 'var(--text-inverse)', border: 'none', borderRadius: 10, cursor: 'pointer' }}>Open Module</button>
                             <button className="btn-secondary" style={{ padding: '12px 24px', fontSize: 14, fontWeight: 800, background: 'rgba(255,255,255,0.05)' }}>Create Task</button>
                             <button className="btn-secondary" style={{ padding: '12px 24px', fontSize: 14, fontWeight: 800, background: 'rgba(255,255,255,0.05)' }}>Send Alert</button>
                             <button className="btn-secondary" style={{ padding: '12px 24px', fontSize: 14, fontWeight: 800, background: 'rgba(255,255,255,0.05)' }}>Mark Reviewed</button>
                          </div>
                       </div>
                    </div>

                    {/* Decision 2 (Positive) */}
                    <div className="card decision-card" style={{ padding: 0, border: '1px solid rgba(34, 197, 94, 0.3)', overflow: 'hidden' }}>
                       <div style={{ padding: '32px 40px', background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.05) 0%, transparent 100%)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                             <div style={{ background: 'rgba(34, 197, 94, 0.15)', color: 'var(--color-primary)', fontSize: 11, fontWeight: 950, padding: '6px 12px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>MODERATE</div>
                             <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}><Sparkles size={14} color="var(--color-primary)"/> 94% Confidence</div>
                             <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text-muted)' }}>• Related Module: Expenses</div>
                          </div>
                          
                          <h4 style={{ fontSize: 26, fontWeight: 950, color: 'var(--color-text-primary)', marginBottom: 24, letterSpacing: '-0.01em' }}>Renegotiate Soy Supplier Contract</h4>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
                             <div>
                                <div className="label-small" style={{ marginBottom: 8, color: 'var(--color-text-secondary)' }}>Reason</div>
                                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>Market soy prices dropped 12% globally. Current vendor contract permits mid-year adjustment.</div>
                             </div>
                             <div>
                                <div className="label-small" style={{ marginBottom: 8, color: 'var(--color-text-secondary)' }}>Financial Impact</div>
                                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-primary)', lineHeight: 1.5 }}>Estimated efficiency gain: <span style={{ fontWeight: 900, fontSize: 20 }}>+$3,200/mo</span></div>
                             </div>
                          </div>
                          
                          <div style={{ padding: '24px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: 16, border: '1px solid rgba(34, 197, 94, 0.2)', marginBottom: 32 }}>
                             <div className="label-small" style={{ marginBottom: 8, color: '#86efac', fontWeight: 900, letterSpacing: '0.05em' }}>Recommended Action</div>
                             <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.4 }}>Draft renegotiation letter and schedule vendor meeting.</div>
                          </div>

                          <div style={{ display: 'flex', gap: 12 }}>
                             <button className="btn-primary" style={{ padding: '12px 24px', fontSize: 14, fontWeight: 800, background: 'var(--status-success)', color: 'var(--text-inverse)', border: 'none', borderRadius: 10, cursor: 'pointer' }}>Open Module</button>
                             <button className="btn-secondary" style={{ padding: '12px 24px', fontSize: 14, fontWeight: 800, background: 'rgba(255,255,255,0.05)' }}>Create Task</button>
                             <button className="btn-secondary" style={{ padding: '12px 24px', fontSize: 14, fontWeight: 800, background: 'rgba(255,255,255,0.05)' }}>Send Alert</button>
                             <button className="btn-secondary" style={{ padding: '12px 24px', fontSize: 14, fontWeight: 800, background: 'rgba(255,255,255,0.05)' }}>Mark Reviewed</button>
                          </div>
                       </div>
                    </div>

                    {/* Decision 3 (Warning/Monitor) */}
                    <div className="card decision-card" style={{ padding: 0, border: '1px solid rgba(245, 158, 11, 0.3)', overflow: 'hidden' }}>
                       <div style={{ padding: '32px 40px', background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.05) 0%, transparent 100%)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                             <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', fontSize: 11, fontWeight: 950, padding: '6px 12px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>MONITOR</div>
                             <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}><Sparkles size={14} color="var(--color-warning)"/> 78% Confidence</div>
                             <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text-muted)' }}>• Related Module: Infrastructure</div>
                          </div>
                          
                          <h4 style={{ fontSize: 26, fontWeight: 950, color: 'var(--color-text-primary)', marginBottom: 24, letterSpacing: '-0.01em' }}>Delay Tractor Maintenance</h4>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
                             <div>
                                <div className="label-small" style={{ marginBottom: 8, color: 'var(--color-text-secondary)' }}>Reason</div>
                                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>Usage hours are 15% below threshold. Maintenance can be safely delayed to next fiscal quarter.</div>
                             </div>
                             <div>
                                <div className="label-small" style={{ marginBottom: 8, color: 'var(--color-text-secondary)' }}>Financial Impact</div>
                                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-warning)', lineHeight: 1.5 }}>Cash flow preserved: <span style={{ fontWeight: 900, fontSize: 20 }}>+$1,800</span></div>
                             </div>
                          </div>
                          
                          <div style={{ padding: '24px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: 16, border: '1px solid rgba(245, 158, 11, 0.2)', marginBottom: 32 }}>
                             <div className="label-small" style={{ marginBottom: 8, color: '#fcd34d', fontWeight: 900, letterSpacing: '0.05em' }}>Recommended Action</div>
                             <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.4 }}>Log decision and set reminder for next quarter.</div>
                          </div>

                          <div style={{ display: 'flex', gap: 12 }}>
                             <button className="btn-primary" style={{ padding: '12px 24px', fontSize: 14, fontWeight: 800, background: 'var(--status-warning)', color: 'var(--text-inverse)', border: 'none', borderRadius: 10, cursor: 'pointer' }}>Open Module</button>
                             <button className="btn-secondary" style={{ padding: '12px 24px', fontSize: 14, fontWeight: 800, background: 'rgba(255,255,255,0.05)' }}>Create Task</button>
                             <button className="btn-secondary" style={{ padding: '12px 24px', fontSize: 14, fontWeight: 800, background: 'rgba(255,255,255,0.05)' }}>Send Alert</button>
                             <button className="btn-secondary" style={{ padding: '12px 24px', fontSize: 14, fontWeight: 800, background: 'rgba(255,255,255,0.05)' }}>Mark Reviewed</button>
                          </div>
                       </div>
                    </div>
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
