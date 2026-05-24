"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from "@/components/Sidebar";
import NotificationCenter from "@/components/NotificationCenter";
import ThemeToggle from "@/components/ThemeToggle";
import { useUIStore } from '@/store/useUIStore';
import { 
  Smartphone, Bell, Zap, 
  ShieldAlert, Clock, CheckCircle2,
  ChevronRight, RefreshCw, Settings, 
  Smartphone as PhoneIcon, AlertTriangle, Plus, ArrowRight, Sparkles, Target, Activity, MessageSquare, X
} from "lucide-react";
import { toast, Toaster } from 'react-hot-toast';

import { THEME_COLORS as COLORS, TC } from '@/lib/theme-colors';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TTD', maximumFractionDigits: 0 }).format(n);

export default function MobileAlertsPage() {
  const { sidebarCollapsed } = useUIStore();
  const [mountedTime, setMountedTime] = useState("");
  
  useEffect(() => {
    setMountedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const [activeTab, setActiveTab] = useState('App Push');
  const [isRoutingActive, setIsRoutingActive] = useState(true);

  // Alert Rule Builder selections
  const [selectedDomain, setSelectedDomain] = useState('Capital Runway');
  const [selectedThreshold, setSelectedThreshold] = useState('Below 14 Days');
  const [selectedSeverity, setSelectedSeverity] = useState('Critical');

  // Deployed alert rules state with persistence
  const [deployments, setDeployments] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mobile_alert_deployments');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [
      {
        id: 'rule-1',
        name: 'Runway Guard Alert',
        domain: 'Capital Runway',
        threshold: 'Below 14 Days',
        severity: 'Critical',
        channels: ['App Push', 'SMS'],
        recipients: 'Peter (Admin)',
        schedule: 'Immediate',
        status: 'active',
        lastTriggered: '10:30 AM'
      },
      {
        id: 'rule-2',
        name: 'Maturity Auto-Reminder',
        domain: 'Loan Maturity',
        threshold: 'Within 48 Hours',
        severity: 'High Priority',
        channels: ['SMS'],
        recipients: 'Mary (Entry)',
        schedule: 'Scheduled',
        status: 'active',
        lastTriggered: '09:15 AM'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('mobile_alert_deployments', JSON.stringify(deployments));
  }, [deployments]);

  // SMS Gateway state with persistence
  const [gatewayNumber, setGatewayNumber] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mobile_alert_gateway') || '';
    }
    return '';
  });

  useEffect(() => {
    localStorage.setItem('mobile_alert_gateway', gatewayNumber);
  }, [gatewayNumber]);

  // Modal display states
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [editingDeploymentId, setEditingDeploymentId] = useState<string | null>(null);
  
  const [modalForm, setModalForm] = useState({
    name: '',
    domain: 'Capital Runway',
    threshold: 'Below 14 Days',
    severity: 'Critical',
    channels: { appPush: true, sms: false, whatsapp: false },
    recipients: 'Peter (Admin)',
    schedule: 'Immediate'
  });

  const [alerts, setAlerts] = useState([
     { id: 1, title: 'Cash Flow Warning', severity: 'Critical', source: 'Capital', action: 'Review expenses today', time: '10:30 AM', status: 'Sent' },
     { id: 2, title: 'Loan Payment Due', severity: 'High', source: 'Loans', action: 'Confirm cash reserve', time: '09:15 AM', status: 'Scheduled' },
     { id: 3, title: 'Feed Cost Spike', severity: 'Moderate', source: 'Expenses', action: 'Audit supplier pricing', time: 'Yesterday', status: 'Acknowledged' },
     { id: 4, title: 'Livestock Mortality Risk', severity: 'Critical', source: 'Livestock', action: 'Check pen 4 logs', time: 'Oct 24', status: 'Sent' },
  ]);

  const handleDeployClick = () => {
    setModalForm({
      name: '',
      domain: selectedDomain,
      threshold: selectedThreshold,
      severity: selectedSeverity,
      channels: {
        appPush: activeTab === 'App Push',
        sms: activeTab === 'SMS',
        whatsapp: activeTab === 'WhatsApp'
      },
      recipients: 'Peter (Admin)',
      schedule: 'Immediate'
    });
    setEditingDeploymentId(null);
    setShowDeployModal(true);
  };

  const handleEditDeploy = (dep: any) => {
    setModalForm({
      name: dep.name,
      domain: dep.domain,
      threshold: dep.threshold,
      severity: dep.severity,
      channels: {
        appPush: dep.channels.includes('App Push'),
        sms: dep.channels.includes('SMS'),
        whatsapp: dep.channels.includes('WhatsApp')
      },
      recipients: dep.recipients || 'Peter (Admin)',
      schedule: dep.schedule || 'Immediate'
    });
    setEditingDeploymentId(dep.id);
    setShowDeployModal(true);
  };

  const handleConfirmDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Gateway validation check
    const needsGateway = modalForm.channels.sms || modalForm.channels.whatsapp;
    if (needsGateway && !gatewayNumber.trim()) {
      toast.error("Gateway integration required", {
        style: { background: '#101010', color: '#fff', border: '1px solid var(--status-critical)' }
      });
      return;
    }

    const selectedChannelsList: string[] = [];
    if (modalForm.channels.appPush) selectedChannelsList.push('App Push');
    if (modalForm.channels.sms) selectedChannelsList.push('SMS');
    if (modalForm.channels.whatsapp) selectedChannelsList.push('WhatsApp');

    if (selectedChannelsList.length === 0) {
      toast.error("Please select at least one delivery channel", {
        style: { background: '#101010', color: '#fff', border: '1px solid var(--status-critical)' }
      });
      return;
    }

    if (editingDeploymentId) {
      // Edit mode
      setDeployments(prev => prev.map(d => d.id === editingDeploymentId ? {
        ...d,
        name: modalForm.name,
        domain: modalForm.domain,
        threshold: modalForm.threshold,
        severity: modalForm.severity,
        channels: selectedChannelsList,
        recipients: modalForm.recipients,
        schedule: modalForm.schedule
      } : d));
      toast.success('Alert rule updated successfully', {
        style: { background: '#101010', color: '#fff', border: '1px solid var(--status-success)' }
      });
    } else {
      // Create mode
      const newRule = {
        id: `rule-${Date.now()}`,
        name: modalForm.name,
        domain: modalForm.domain,
        threshold: modalForm.threshold,
        severity: modalForm.severity,
        channels: selectedChannelsList,
        recipients: modalForm.recipients,
        schedule: modalForm.schedule,
        status: 'active',
        lastTriggered: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setDeployments(prev => [newRule, ...prev]);
      toast.success('Alert rule deployed successfully', {
        style: { background: '#101010', color: '#fff', border: '1px solid var(--status-success)' }
      });
    }

    setShowDeployModal(false);
    setEditingDeploymentId(null);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-body)', color: 'var(--text-primary)' }}>
      <Toaster position="top-right" />
      <Sidebar />

      <div style={{ marginLeft: sidebarCollapsed ? 64 : 250, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease', overflow: 'hidden' }}>
        
        <header style={{ height: 72, background: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${COLORS.border}` }}>
          <div>
             <h1 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Mobile Alert Center</h1>
             <p style={{ fontSize: 10, color: COLORS.muted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Omni-Channel Operations Assistant</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.muted, display: 'flex', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={14} className="spin-slow" /> System Sync: {mountedTime}
            </div>
            <ThemeToggle />
            <NotificationCenter />
            <div style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.bg, fontWeight: 950, fontSize: 13 }}>B</div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
           <div style={{ maxWidth: 1440, margin: '0 auto', padding: '40px' }}>
              
              <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 32 }}>
                 
                 {/* LEFT SIDE: ALERT MANAGEMENT */}
                 <div style={{ gridColumn: 'span 8' }}>
                    
                    {/* 1. ALERT CENTER OVERVIEW */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
                       {[
                          { label: 'Total Alerts', val: 12, color: 'var(--text-primary)' },
                          { label: 'Scheduled', val: 3, color: COLORS.info },
                          { label: 'Sent Today', val: 5, color: COLORS.success },
                          { label: 'Failures', val: 0, color: COLORS.danger },
                       ].map((stat, i) => (
                          <div key={i} className="card-glass" style={{ padding: '24px' }}>
                             <div style={{ fontSize: 10, fontWeight: 900, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>{stat.label}</div>
                             <div style={{ fontSize: 28, fontWeight: 950, color: stat.color, letterSpacing: '-0.04em' }}>{stat.val}</div>
                          </div>
                       ))}
                    </div>

                    {/* 2. ALERT RULE BUILDER */}
                    <div className="card-glass" style={{ padding: '32px', marginBottom: 32 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                             <Zap size={18} color={COLORS.primary} />
                             <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Intelligence Rule Builder</h3>
                          </div>
                          <span className="premium-badge">AI LOGIC ENABLED</span>
                       </div>
                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                          <div>
                             <label className="input-label">ALERT DOMAIN</label>
                             <select className="saas-select" value={selectedDomain} onChange={e => setSelectedDomain(e.target.value)}>
                                <option>Capital Runway</option>
                                <option>Loan Maturity</option>
                                <option>Livestock Health</option>
                                <option>Market Volatility</option>
                             </select>
                          </div>
                          <div>
                             <label className="input-label">TRIGGER THRESHOLD</label>
                             <select className="saas-select" value={selectedThreshold} onChange={e => setSelectedThreshold(e.target.value)}>
                                <option>Below 14 Days</option>
                                <option>Within 48 Hours</option>
                                <option>Above 15% Variance</option>
                             </select>
                          </div>
                          <div>
                             <label className="input-label">SEVERITY LEVEL</label>
                             <select className="saas-select" value={selectedSeverity} onChange={e => setSelectedSeverity(e.target.value)}>
                                <option>Critical</option>
                                <option>High Priority</option>
                                <option>Operational Warning</option>
                             </select>
                          </div>
                       </div>
                       <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${COLORS.border}`, paddingTop: 24 }}>
                           <div style={{ display: 'flex', gap: 12 }}>
                              <button className={`tab-pill ${activeTab === 'App Push' ? 'active' : ''}`} onClick={() => setActiveTab('App Push')}>App Push</button>
                              <button className={`tab-pill ${activeTab === 'SMS' ? 'active' : ''}`} onClick={() => setActiveTab('SMS')}>SMS</button>
                              <button className={`tab-pill ${activeTab === 'WhatsApp' ? 'active' : ''}`} onClick={() => setActiveTab('WhatsApp')}>WhatsApp</button>
                           </div>
                           <button className="btn-saas-primary" onClick={handleDeployClick}>Deploy Rule</button>
                       </div>
                    </div>

                    {/* 3. OPERATIONAL ALERT QUEUE */}
                    <div className="card-glass" style={{ padding: '32px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                          <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Operational Alert Ledger</h3>
                          <span style={{ fontSize: 10, color: COLORS.muted, fontWeight: 800 }}>LATEST 24 HOURS</span>
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {alerts.map((alert) => {
                             const isCrit = alert.severity === 'Critical';
                             const isHigh = alert.severity === 'High';
                             const color = isCrit ? COLORS.danger : isHigh ? COLORS.warning : COLORS.info;
                             return (
                                <div key={alert.id} className="saas-alert-row">
                                   <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1.5 }}>
                                      <div className="alert-icon-wrap" style={{ background: `rgba(${isCrit ? '239, 68, 68' : (isHigh ? '245, 158, 11' : '59, 130, 246')}, 0.08)`, border: `1px solid rgba(${isCrit ? '239, 68, 68' : (isHigh ? '245, 158, 11' : '59, 130, 246')}, 0.2)` }}>
                                         <Bell size={18} color={color} />
                                      </div>
                                      <div>
                                         <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{alert.title}</div>
                                         <div style={{ fontSize: 10, color: COLORS.muted, fontWeight: 800, textTransform: 'uppercase' }}>{alert.source} • {alert.time}</div>
                                      </div>
                                   </div>
                                   <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{alert.action}</div>
                                   </div>
                                   <div style={{ textAlign: 'right', flex: 0.5 }}>
                                      <span className="status-tag" style={{ color, borderColor: `rgba(${isCrit ? '239, 68, 68' : (isHigh ? '245, 158, 11' : '59, 130, 246')}, 0.2)` }}>
                                         {alert.status.toUpperCase()}
                                      </span>
                                   </div>
                                   <div style={{ display: 'flex', gap: 10, marginLeft: 20 }}>
                                      <button className="icon-btn-ghost" onClick={() => toast.success('Alert marked as resolved')}><CheckCircle2 size={14} /></button>
                                      <button className="icon-btn-ghost" onClick={() => toast.success('Viewing alert details')}><ArrowRight size={14} /></button>
                                   </div>
                                </div>
                             );
                          })}
                       </div>
                    </div>

                    {/* 4. ACTIVE DEPLOYMENTS SECTION */}
                    <div className="card-glass" style={{ padding: '32px', marginTop: 32 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                             <Activity size={18} color={COLORS.primary} />
                             <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Active Deployments</h3>
                          </div>
                          <span style={{ fontSize: 10, color: COLORS.muted, fontWeight: 800 }}>
                             {deployments.length} DEPLOYED RULES
                          </span>
                       </div>
                       <div style={{ overflowX: 'auto' }}>
                          <table className="saas-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                             <thead>
                                <tr style={{ borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 10, color: COLORS.muted, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', textAlign: 'left' }}>
                                   <th style={{ padding: '12px 8px' }}>Rule Name</th>
                                   <th style={{ padding: '12px 8px' }}>Domain</th>
                                   <th style={{ padding: '12px 8px' }}>Severity</th>
                                   <th style={{ padding: '12px 8px' }}>Channel</th>
                                   <th style={{ padding: '12px 8px' }}>Status</th>
                                   <th style={{ padding: '12px 8px' }}>Last Triggered</th>
                                   <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                                </tr>
                             </thead>
                             <tbody>
                                {deployments.map(dep => {
                                   const isCrit = dep.severity === 'Critical';
                                   const isHigh = dep.severity === 'High Priority' || dep.severity === 'High';
                                   const color = isCrit ? COLORS.danger : isHigh ? COLORS.warning : COLORS.info;
                                   return (
                                      <tr key={dep.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                                         <td style={{ padding: '12px 8px', fontWeight: 800, color: 'var(--text-primary)' }}>{dep.name}</td>
                                         <td style={{ padding: '12px 8px', color: COLORS.muted }}>{dep.domain}</td>
                                         <td style={{ padding: '12px 8px' }}>
                                            <span style={{ color, fontSize: 10, fontWeight: 900 }}>{dep.severity}</span>
                                         </td>
                                         <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>
                                            {dep.channels.join(', ')}
                                         </td>
                                         <td style={{ padding: '12px 8px' }}>
                                            <span className="status-tag" style={{ 
                                               color: dep.status === 'active' ? COLORS.success : COLORS.muted, 
                                               borderColor: dep.status === 'active' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.1)',
                                               background: dep.status === 'active' ? 'rgba(34, 197, 94, 0.05)' : 'transparent',
                                               fontSize: 9,
                                               textTransform: 'uppercase'
                                            }}>
                                               {dep.status}
                                            </span>
                                         </td>
                                         <td style={{ padding: '12px 8px', color: COLORS.muted }}>{dep.lastTriggered || 'Never'}</td>
                                         <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                               {dep.status === 'active' ? (
                                                  <button 
                                                     className="icon-btn-ghost" 
                                                     title="Pause Rule"
                                                     onClick={() => {
                                                        setDeployments(prev => prev.map(d => d.id === dep.id ? { ...d, status: 'paused' } : d));
                                                        toast.success(`Rule "${dep.name}" paused`);
                                                     }}
                                                  >
                                                     ⏸️
                                                  </button>
                                               ) : (
                                                  <button 
                                                     className="icon-btn-ghost" 
                                                     title="Resume Rule"
                                                     onClick={() => {
                                                        setDeployments(prev => prev.map(d => d.id === dep.id ? { ...d, status: 'active' } : d));
                                                        toast.success(`Rule "${dep.name}" resumed`);
                                                     }}
                                                  >
                                                     ▶️
                                                  </button>
                                               )}
                                               <button 
                                                  className="icon-btn-ghost" 
                                                  title="Edit Rule"
                                                  onClick={() => handleEditDeploy(dep)}
                                               >
                                                  ✏️
                                               </button>
                                               <button 
                                                  className="icon-btn-ghost" 
                                                  title="Delete Rule"
                                                  style={{ color: COLORS.danger }}
                                                  onClick={() => {
                                                     setDeployments(prev => prev.filter(d => d.id !== dep.id));
                                                     toast.success(`Rule "${dep.name}" deleted`);
                                                  }}
                                               >
                                                  🗑️
                                               </button>
                                            </div>
                                         </td>
                                      </tr>
                                   );
                                })}
                                {deployments.length === 0 && (
                                   <tr>
                                      <td colSpan={7} style={{ padding: '24px 8px', textAlign: 'center', color: COLORS.muted }}>
                                         No alert rules deployed. Build and deploy one above!
                                      </td>
                                   </tr>
                                )}
                             </tbody>
                          </table>
                       </div>
                    </div>

                 </div>

                 {/* RIGHT SIDE: PHONE PREVIEW & SETTINGS */}
                 <div style={{ gridColumn: 'span 4' }}>
                    
                    {/* PHONE PREVIEW */}
                    <div className="card-glass" style={{ padding: '32px', marginBottom: 32, textAlign: 'center' }}>
                       <h3 style={{ fontSize: 14, fontWeight: 900, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 32, letterSpacing: '0.05em' }}>Mobile Preview</h3>
                       <div className="phone-container">
                          <div className="phone-screen">
                             <div className="phone-header">
                                <span style={{ fontSize: 9, fontWeight: 900 }}>Braes Creek</span>
                                <Activity size={10} color={COLORS.primary} />
                             </div>
                             
                             <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {deployments.filter(d => d.status === 'active').slice(0, 3).map((dep, idx) => {
                                  const isCrit = dep.severity === 'Critical';
                                  const isHigh = dep.severity === 'High Priority' || dep.severity === 'High';
                                  const tag = isCrit ? 'CRITICAL' : isHigh ? 'WARNING' : 'INFO';
                                  const color = isCrit ? COLORS.danger : isHigh ? COLORS.warning : COLORS.info;
                                  const borderLeftColor = isCrit ? 'var(--status-critical)' : isHigh ? 'var(--status-warning)' : 'var(--status-info)';
                                  
                                  return (
                                    <div key={dep.id || idx} className={`phone-notification`} style={{ borderLeft: `4px solid ${borderLeftColor}`, padding: '10px', background: 'var(--bg-card-elevated)', borderRadius: '12px', border: '1px solid var(--border-soft)', borderLeftWidth: '4px' }}>
                                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                          <span style={{ fontSize: 8, fontWeight: 950, color }}>{tag}</span>
                                          <span style={{ fontSize: 8, color: COLORS.muted }}>NOW</span>
                                       </div>
                                       <div style={{ fontSize: 9, fontWeight: 700, textAlign: 'left', lineHeight: 1.3, color: 'var(--text-primary)' }}>
                                          {dep.name}: {dep.domain} threshold {dep.threshold.toLowerCase()} reached.
                                       </div>
                                    </div>
                                  );
                                })}
                                {deployments.filter(d => d.status === 'active').length === 0 && (
                                  <div style={{ padding: '32px 16px', color: COLORS.muted, fontSize: 11, textAlign: 'center' }}>
                                     <Sparkles size={20} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                                     No active alert signals. Screen clear.
                                  </div>
                                )}
                             </div>

                             <div className="phone-dock">
                                <div style={{ width: 60, height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* SETTINGS */}
                    <div className="card-glass" style={{ padding: '24px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                          <Smartphone size={18} color={COLORS.primary} />
                          <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Gateway Integration</h3>
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                          <div>
                             <label className="input-label">Operational SMS Gateway</label>
                             <input 
                               type="text" 
                               className="saas-input" 
                               placeholder="+1 (555) 000-0000" 
                               value={gatewayNumber}
                               onChange={e => setGatewayNumber(e.target.value)}
                             />
                          </div>
                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>AI Neural Routing</span>
                              <div className={`toggle ${isRoutingActive ? 'active' : ''}`} onClick={() => setIsRoutingActive(!isRoutingActive)}><div /></div>
                           </div>
                          <div style={{ height: 1, background: COLORS.border }} />
                          <div style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.6, fontWeight: 500 }}>
                             Omni-channel tactical routing is active. Critical signals will bypass device 'Silent' profiles on verified terminals.
                          </div>
                       </div>
                    </div>

                 </div>

              </div>
           </div>
        </main>
      </div>

      {/* Deploy Operational Alert Rule Modal Overlay */}
      {showDeployModal && (
        <div className="modal-backdrop" onClick={() => { setShowDeployModal(false); setEditingDeploymentId(null); }}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ background: '#0b1220', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 24, padding: 32, width: 500, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 className="modal-title" style={{ fontSize: 18, fontWeight: 950, color: 'var(--text-primary)', margin: 0 }}>
                {editingDeploymentId ? 'Edit Operational Alert Rule' : 'Deploy Operational Alert Rule'}
              </h2>
              <button style={{ background: 'transparent', border: 'none', color: COLORS.muted, cursor: 'pointer' }} onClick={() => { setShowDeployModal(false); setEditingDeploymentId(null); }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmDeploy} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label className="modal-label" style={{ display: 'block', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', color: COLORS.muted, marginBottom: 8 }}>Rule Name *</label>
                <input 
                  type="text" 
                  className="saas-input" 
                  style={{ width: '100%' }}
                  placeholder="e.g. Low Cash Runway Alarm" 
                  value={modalForm.name}
                  onChange={e => setModalForm({ ...modalForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="modal-label" style={{ display: 'block', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', color: COLORS.muted, marginBottom: 8 }}>Alert Domain</label>
                  <select 
                    className="saas-select"
                    value={modalForm.domain}
                    onChange={e => setModalForm({ ...modalForm, domain: e.target.value })}
                  >
                    <option value="Capital Runway">Capital Runway</option>
                    <option value="Loan Maturity">Loan Maturity</option>
                    <option value="Livestock Health">Livestock Health</option>
                    <option value="Market Volatility">Market Volatility</option>
                  </select>
                </div>

                <div>
                  <label className="modal-label" style={{ display: 'block', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', color: COLORS.muted, marginBottom: 8 }}>Trigger Threshold</label>
                  <select 
                    className="saas-select"
                    value={modalForm.threshold}
                    onChange={e => setModalForm({ ...modalForm, threshold: e.target.value })}
                  >
                    <option value="Below 14 Days">Below 14 Days</option>
                    <option value="Within 48 Hours">Within 48 Hours</option>
                    <option value="Above 15% Variance">Above 15% Variance</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="modal-label" style={{ display: 'block', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', color: COLORS.muted, marginBottom: 8 }}>Severity Level</label>
                  <select 
                    className="saas-select"
                    value={modalForm.severity}
                    onChange={e => setModalForm({ ...modalForm, severity: e.target.value })}
                  >
                    <option value="Critical">Critical</option>
                    <option value="High Priority">High Priority</option>
                    <option value="Operational Warning">Operational Warning</option>
                  </select>
                </div>

                <div>
                  <label className="modal-label" style={{ display: 'block', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', color: COLORS.muted, marginBottom: 8 }}>Schedule</label>
                  <select 
                    className="saas-select"
                    value={modalForm.schedule}
                    onChange={e => setModalForm({ ...modalForm, schedule: e.target.value })}
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Recurring">Recurring</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="modal-label" style={{ display: 'block', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', color: COLORS.muted, marginBottom: 8 }}>Target Recipients *</label>
                <input 
                  type="text" 
                  className="saas-input" 
                  style={{ width: '100%' }}
                  placeholder="e.g. Peter (Admin)" 
                  value={modalForm.recipients}
                  onChange={e => setModalForm({ ...modalForm, recipients: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="modal-label" style={{ display: 'block', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', color: COLORS.muted, marginBottom: 8 }}>Delivery Channels *</label>
                <div style={{ display: 'flex', gap: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer', color: 'var(--text-primary)' }}>
                    <input 
                      type="checkbox" 
                      checked={modalForm.channels.appPush}
                      onChange={e => setModalForm({ ...modalForm, channels: { ...modalForm.channels, appPush: e.target.checked } })}
                    />
                    App Push
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer', color: 'var(--text-primary)' }}>
                    <input 
                      type="checkbox" 
                      checked={modalForm.channels.sms}
                      onChange={e => setModalForm({ ...modalForm, channels: { ...modalForm.channels, sms: e.target.checked } })}
                    />
                    SMS
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer', color: 'var(--text-primary)' }}>
                    <input 
                      type="checkbox" 
                      checked={modalForm.channels.whatsapp}
                      onChange={e => setModalForm({ ...modalForm, channels: { ...modalForm.channels, whatsapp: e.target.checked } })}
                    />
                    WhatsApp
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" className="btn-saas-primary" style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-soft)', color: 'var(--text-primary)' }} onClick={() => { setShowDeployModal(false); setEditingDeploymentId(null); }}>Cancel</button>
                <button type="submit" className="btn-saas-primary" style={{ flex: 1 }}>{editingDeploymentId ? 'Save Changes' : 'Deploy Rule'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .card-glass { background: var(--bg-card); backdrop-filter: blur(40px); border: 1px solid var(--border-soft); border-radius: 20px; box-shadow: var(--shadow-medium); }
        .premium-badge { font-size: 8px; font-weight: 950; padding: 6px 14px; background: var(--status-success-glow); color: var(--status-success); border: 1px solid var(--border-soft); border-radius: 30px; letter-spacing: 0.1em; }
        .input-label { display: block; font-size: 9px; font-weight: 900; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.05em; }
        .saas-select, .saas-input { width: 100%; padding: 14px; background: var(--bg-card-elevated); border: 1px solid var(--border-soft); border-radius: 12px; color: var(--text-primary); font-size: 13px; font-weight: 600; outline: none; transition: all 0.2s; box-sizing: border-box; }
        .saas-select:focus, .saas-input:focus { border-color: var(--status-success); background: var(--bg-card); }
        
        .tab-pill { background: transparent; border: none; padding: 10px 20px; color: var(--text-muted); font-size: 12px; font-weight: 800; cursor: pointer; border-radius: 10px; transition: all 0.2s; }
        .tab-pill.active { background: var(--bg-card-elevated); color: var(--text-primary); }
        .btn-saas-primary { background: var(--button-primary-bg); border: none; border-radius: 10px; padding: 12px 24px; color: var(--button-primary-text); font-size: 12px; font-weight: 950; cursor: pointer; transition: all 0.2s; }
        .btn-saas-primary:hover { transform: translateY(-1px); box-shadow: var(--shadow-soft); }
        
        .saas-alert-row { display: flex; align-items: center; padding: 16px 24px; background: var(--bg-card-elevated); border: 1px solid var(--border-soft); border-radius: 16px; transition: all 0.2s; }
        .saas-alert-row:hover { background: var(--bg-card); border-color: var(--border-strong); transform: translateX(4px); }
        .alert-icon-wrap { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .status-tag { font-size: 9px; font-weight: 950; padding: 4px 12px; border-radius: 30px; border: 1px solid var(--border-soft); background: var(--bg-card-elevated); }
        .icon-btn-ghost { background: transparent; border: 1px solid var(--border-soft); border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
        .icon-btn-ghost:hover { background: var(--bg-card-elevated); color: var(--text-primary); }
        
        .phone-container { width: 240px; height: 480px; background: #000; border-radius: 44px; border: 8px solid #222; margin: 0 auto; position: relative; box-shadow: var(--shadow-strong); }
        .phone-screen { position: absolute; inset: 4px; background: var(--bg-body); border-radius: 36px; overflow: hidden; display: flex; flex-direction: column; }
        .phone-header { height: 44px; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-soft); }
        .phone-notification { background: var(--bg-card); backdrop-filter: blur(10px); border: 1px solid var(--border-soft); border-radius: 14px; padding: 14px; border-left-width: 4px; }
        .phone-notification.critical { border-left-color: var(--status-critical); }
        .phone-notification.warning { border-left-color: var(--status-warning); }
        .phone-dock { position: absolute; bottom: 12px; left: 0; right: 0; display: flex; justify-content: center; }
        
        .toggle { width: 42px; height: 24px; background: var(--bg-card-elevated); border-radius: 30px; position: relative; cursor: pointer; }
        .toggle.active { background: var(--status-success); }
        .toggle div { position: absolute; left: 4px; top: 4px; width: 16px; height: 16px; background: #fff; border-radius: 50%; transition: transform 0.2s; }
        .toggle.active div { transform: translateX(18px); }
        
        .spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.25s ease-out;
        }
        .modal-card {
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @media (max-width: 1200px) {
           .grid-responsive { grid-template-columns: 1fr !important; }
        }
      `}} />
    </div>
  );
}
