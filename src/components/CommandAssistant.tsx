"use client";

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Sparkles, X, MessageSquare, ChevronRight, 
  Search, AlertCircle, FileText, Landmark, 
  Users, Sprout, Beef, Building2, HelpCircle,
  ArrowRight, CreditCard, PieChart, Upload,
  LayoutDashboard
} from 'lucide-react';

const COLORS = {
  success: 'var(--status-success)',
  warning: 'var(--status-warning)',
  danger: 'var(--status-critical)',
  info: 'var(--status-ai)',
  muted: 'var(--text-muted)',
  border: 'var(--border-soft)',
  accent: 'var(--status-success)',
  bg: 'var(--bg-surface)',
  glass: 'var(--bg-surface)'
};

const SHORTCUTS = [
  { label: 'Dashboard', icon: <LayoutDashboard size={14}/>, href: '/' },
  { label: 'Reports', icon: <FileText size={14}/>, href: '/reports' },
  { label: 'Capital Control', icon: <Landmark size={14}/>, href: '/capital-control' },
  { label: 'Loans', icon: <CreditCard size={14}/>, href: '/loans' },
  { label: 'Crops', icon: <Sprout size={14}/>, href: '/crops' },
  { label: 'Livestock', icon: <Beef size={14}/>, href: '/livestock' },
  { label: 'Workforce', icon: <Users size={14}/>, href: '/labor' },
  { label: 'Infrastructure', icon: <Building2 size={14}/>, href: '/infrastructure' },
];

export default function CommandAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string, actions?: any[] }[]>([
    { role: 'assistant', content: "Welcome to Braes Creek Command Center. I'm your Command Assistant. How can I help you optimize the estate today?" }
  ]);
  const pathname = usePathname();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getPageExplanation = () => {
    if (pathname === '/') return "The Dashboard provides a high-level overview of operational health, risk factors, and financial liquidity. Check the 'Risk Hub' for immediate attention items.";
    if (pathname === '/reports') return "Reports & Receipts is where you audit financial statements and upload physical documents. Use the 'Receipt Upload' panel to digitize estate spending.";
    if (pathname === '/loans') return "This module monitors all debt obligations, interest rates, and repayment schedules. 'Debt Pressure' indicates your current liability risk.";
    if (pathname === '/crops') return "AI Crop Intelligence tracks maturation, yield forecasting, and harvest timelines using satellite-style monitoring.";
    if (pathname === '/livestock') return "Livestock Intelligence audits health, mortality, and production across all species including Poultry, Goats, and Cattle.";
    if (pathname === '/labor') return "Workforce Intelligence tracks labor costs, worker efficiency, and productivity spikes across estate tasks.";
    if (pathname === '/infrastructure') return "Infrastructure & Ops manages the estate's physical fleet, fuel consumption, and predictive maintenance schedules.";
    return "This section helps you manage specific estate operations. Use the tabs to navigate between visual analysis and data ledgers.";
  };

  const handleAction = (type: string) => {
    let response = "";
    let actions: any[] = [];

    switch (type) {
      case 'explain':
        response = getPageExplanation();
        break;
      case 'alerts':
        response = "You have 1 overdue loan payment and diesel fuel levels are below 35%. I recommend reviewing Infrastructure and Loans immediately.";
        actions = [{ label: 'View Alerts Hub', href: '/alerts' }];
        break;
      case 'upload':
        response = "To upload receipts, navigate to Reports and use the 'Receipt Upload' panel on the right side.";
        actions = [{ label: 'Go to Reports', href: '/reports' }];
        break;
      case 'loans':
        response = "Debt pressure is currently MODERATE. You have one upcoming payment in 4 days.";
        actions = [{ label: 'Check Loans', href: '/loans' }];
        break;
      case 'start':
        response = "I recommend starting with your Daily Alerts to clear critical operational blockers, then checking the P&L Matrix in Reports.";
        break;
      default:
        response = "I'm here to help you navigate. What specifically would you like to review?";
    }

    setMessages([...messages, { role: 'assistant', content: response, actions }]);
  };

  return (
    <>
      {/* Floating Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--status-success)', color: 'var(--text-inverse)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 8px 32px rgba(57, 200, 106, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen ? 'rotate(90deg) scale(0.9)' : 'scale(1)',
          animation: !isOpen ? 'pulse 2s infinite' : 'none'
        }}
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </div>

      {/* Assistant Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 92, right: 24, zIndex: 1000,
          width: 380, height: 600, maxHeight: 'calc(100vh - 120px)',
           background: 'var(--bg-surface)', backdropFilter: 'blur(30px)',
           border: `1px solid var(--border-soft)`, borderRadius: 24,
           boxShadow: 'var(--shadow-strong)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {/* Header */}
          <div style={{ padding: '24px', borderBottom: `1px solid var(--border-soft)`, background: 'var(--bg-card-elevated)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
               <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--status-success-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={16} color="var(--status-success)" />
               </div>
               <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Command Assistant</h3>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>Braes Creek Estate Advisor</p>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
             {messages.map((m, i) => (
               <div key={i} style={{ 
                 alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                 maxWidth: '85%',
                 padding: '12px 16px',
                 borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                 background: m.role === 'user' ? 'var(--status-success)' : 'var(--bg-card-elevated)',
                 color: m.role === 'user' ? 'var(--text-inverse)' : 'var(--text-primary)',
                 fontSize: 13, lineHeight: 1.5,
                 border: m.role === 'assistant' ? `1px solid var(--border-soft)` : 'none'
               }}>
                  {m.content}
                  {m.actions && m.actions.length > 0 && (
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                       {m.actions.map((act, ai) => (
                         <button 
                            key={ai}
                            onClick={() => router.push(act.href)}
                            style={{ 
                              padding: '8px 12px', borderRadius: 8, background: 'rgba(57, 200, 106, 0.1)', 
                              border: `1px solid rgba(57, 200, 106, 0.2)`, color: COLORS.success,
                              fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                            }}
                         >
                            {act.label} <ArrowRight size={12}/>
                         </button>
                       ))}
                    </div>
                  )}
               </div>
             ))}
          </div>

          {/* Quick Actions Grid */}
          <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderTop: `1px solid ${COLORS.border}` }}>
             <div style={{ fontSize: 9, fontWeight: 900, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, paddingLeft: 4 }}>Quick Commands</div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {[
                  { label: 'Explain this page', id: 'explain' },
                  { label: 'Today\'s alerts', id: 'alerts' },
                  { label: 'Upload receipt', id: 'upload' },
                  { label: 'Where do I start?', id: 'start' },
                ].map(cmd => (
                  <button 
                    key={cmd.id}
                    onClick={() => handleAction(cmd.id)}
                    style={{
                      padding: '10px 12px', background: 'var(--bg-card-elevated)', border: `1px solid var(--border-soft)`,
                      borderRadius: 10, color: 'var(--text-primary)', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s'
                    }}
                  >
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronRight size={12} color={COLORS.success} />
                     </div>
                     <span style={{ flex: 1 }}>{cmd.label}</span>
                  </button>
                ))}
             </div>

             <div style={{ fontSize: 9, fontWeight: 900, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, paddingLeft: 4 }}>Shortcuts</div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {SHORTCUTS.map(s => (
                  <button 
                    key={s.label}
                    onClick={() => router.push(s.href)}
                    style={{
                      padding: '10px 12px', background: 'var(--bg-card-elevated)', 
                      border: `1px solid var(--border-soft)`, borderRadius: 12, color: 'var(--text-primary)', 
                      fontSize: 10, fontWeight: 800, cursor: 'pointer', display: 'flex', 
                      alignItems: 'center', gap: 8, transition: 'all 0.2s'
                    }}
                  >
                     <div style={{ width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                     <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</span>
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(57, 200, 106, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(57, 200, 106, 0); }
          100% { box-shadow: 0 0 0 0 rgba(57, 200, 106, 0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}
