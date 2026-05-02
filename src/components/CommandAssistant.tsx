"use client";

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sparkles, X, ChevronRight, FileText, Landmark,
  Users, Sprout, Beef, Building2, ArrowRight,
  CreditCard, LayoutDashboard, Send, TrendingUp,
  TrendingDown, DollarSign, ShieldAlert
} from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useAlertStore } from '@/store/useAlertStore';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  actions?: { label: string; href: string }[];
  card?: { label: string; value: string; color: string; icon: React.ReactNode };
};

const SHORTCUTS = [
  { label: 'Dashboard',        icon: <LayoutDashboard size={14}/>, href: '/' },
  { label: 'Reports',          icon: <FileText size={14}/>,        href: '/reports' },
  { label: 'Capital Control',  icon: <Landmark size={14}/>,        href: '/capital-control' },
  { label: 'Loans',            icon: <CreditCard size={14}/>,      href: '/loans' },
  { label: 'Crops',            icon: <Sprout size={14}/>,          href: '/crops' },
  { label: 'Livestock',        icon: <Beef size={14}/>,            href: '/livestock' },
  { label: 'Workforce',        icon: <Users size={14}/>,           href: '/labor' },
  { label: 'Infrastructure',   icon: <Building2 size={14}/>,       href: '/infrastructure' },
];

export default function CommandAssistant() {
  const [isOpen, setIsOpen]       = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping]   = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages]   = useState<Message[]>([
    { role: 'assistant', content: "Welcome to Braes Creek Command Center. I'm your Estate Advisor. Ask me anything about operations, finances, or risks." }
  ]);

  const pathname   = usePathname();
  const router     = useRouter();
  const scrollRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  const { getTotalRevenue, getTotalExpenses, getNetProfit } = useDashboardStore();
  const { getActiveAlerts } = useAlertStore();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) { setUnreadCount(0); setTimeout(() => inputRef.current?.focus(), 300); }
  }, [isOpen]);

  const fmt = (n: number) => `$${Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

  const getPageExplanation = () => {
    const map: Record<string, string> = {
      '/':              'The Command Center gives you a live tactical overview. Check the AI Decision Hub for recommendations and the Priority Alerts strip for escalations.',
      '/reports':       'Reports & Receipts is where you audit financial statements and upload physical documents.',
      '/loans':         'Loans & Liabilities monitors all debt obligations, interest rates, and repayment schedules.',
      '/crops':         'AI Crop Intelligence tracks maturation, yield forecasting, and harvest timelines.',
      '/livestock':     'Livestock Intelligence audits health, mortality, and production across all species.',
      '/labor':         'Workforce Intelligence tracks labor costs, worker efficiency, and productivity.',
      '/infrastructure':'Infrastructure & Ops manages the estate fleet, fuel consumption, and maintenance.',
      '/capital-control':'Capital Control provides a complete view of your asset base, liabilities, and net equity.',
    };
    return map[pathname] ?? 'This section helps you manage specific estate operations.';
  };

  const parseInput = (input: string): string => {
    const l = input.toLowerCase();
    if (l.includes('revenue') || l.includes('income'))                   return 'revenue';
    if (l.includes('expense') || l.includes('spend') || l.includes('cost')) return 'expenses';
    if (l.includes('profit') || l.includes('net') || l.includes('p&l'))  return 'profit';
    if (l.includes('alert') || l.includes('warning') || l.includes('risk')) return 'alerts';
    if (l.includes('loan') || l.includes('debt'))                        return 'loans';
    if (l.includes('upload') || l.includes('receipt'))                   return 'upload';
    if (l.includes('crop') || l.includes('harvest'))                     return 'crops';
    if (l.includes('livestock') || l.includes('cattle'))                 return 'livestock';
    if (l.includes('staff') || l.includes('labor') || l.includes('payroll')) return 'labor';
    if (l.includes('explain') || l.includes('what') || l.includes('help')) return 'explain';
    if (l.includes('start') || l.includes('begin'))                      return 'start';
    return 'general';
  };

  const buildResponse = (id: string): Pick<Message, 'content' | 'actions' | 'card'> => {
    const revenue  = getTotalRevenue();
    const expenses = getTotalExpenses();
    const profit   = getNetProfit();
    const alerts   = getActiveAlerts();
    const critical = alerts.filter(a => a.severity === 'critical' || a.severity === 'emergency').length;

    switch (id) {
      case 'revenue':
        return {
          content: `Total revenue this period is ${fmt(revenue)}, reflecting all income from livestock, crops, and operations.`,
          card: { label: 'Total Revenue', value: fmt(revenue), color: 'var(--status-success)', icon: <TrendingUp size={18}/> },
          actions: [{ label: 'View P&L Statement', href: '/finance/pl' }],
        };
      case 'expenses':
        return {
          content: `Total expenses stand at ${fmt(expenses)}. Energy and labor are the primary cost drivers this cycle.`,
          card: { label: 'Total Expenses', value: fmt(expenses), color: 'var(--status-critical)', icon: <TrendingDown size={18}/> },
          actions: [{ label: 'View Expenses', href: '/expenses' }],
        };
      case 'profit': {
        const ok = profit >= 0;
        return {
          content: ok
            ? `Net profit is ${fmt(profit)} — the estate is operating in the green.`
            : `Net position shows a ${fmt(profit)} deficit. Review expenses for actionable cuts.`,
          card: { label: 'Net Profit', value: fmt(profit), color: ok ? 'var(--status-success)' : 'var(--status-critical)', icon: <DollarSign size={18}/> },
          actions: [{ label: 'View P&L', href: '/finance/pl' }],
        };
      }
      case 'alerts':
        return {
          content: `There are ${alerts.length} active alerts, of which ${critical} are critical and require immediate attention.`,
          card: { label: 'Active Alerts', value: String(alerts.length), color: critical > 0 ? 'var(--status-critical)' : 'var(--status-warning)', icon: <ShieldAlert size={18}/> },
          actions: [{ label: 'View Alerts Hub', href: '/alerts' }],
        };
      case 'loans':
        return { content: 'Debt pressure is MODERATE. One payment is due in 4 days. Pre-allocate capital now to avoid a missed-payment flag.', actions: [{ label: 'Check Loans', href: '/loans' }] };
      case 'upload':
        return { content: "Navigate to Reports and use the 'Receipt Upload' panel on the right side.", actions: [{ label: 'Go to Reports', href: '/reports' }] };
      case 'crops':
        return { content: '42 active acres at optimal health. Harvest window opens in ~3 weeks. No immediate interventions required.', actions: [{ label: 'Open Crop Intelligence', href: '/crops' }] };
      case 'livestock':
        return { content: '840 units across all species. 2 active health alerts detected — early intervention recommended for the flagged cattle group.', actions: [{ label: 'Open Livestock', href: '/livestock' }] };
      case 'labor':
        return { content: '12 active workforce members. Labor costs are trending upward — efficiency ratio dropped 2.1% week-over-week.', actions: [{ label: 'View Workforce', href: '/labor' }] };
      case 'explain':
        return { content: getPageExplanation() };
      case 'start':
        return {
          content: `Start with Priority Alerts (${alerts.length} active), then review the P&L Statement for financial positioning.`,
          actions: [{ label: 'View Alerts', href: '/alerts' }, { label: 'Open P&L', href: '/finance/pl' }],
        };
      default:
        return { content: 'I can help with financials, alerts, crops, livestock, loans, or navigation. Try asking about your revenue, expenses, or active risks.' };
    }
  };

  const dispatch = (id: string, userLabel: string) => {
    setMessages(prev => [...prev, { role: 'user', content: userLabel }]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const resp = buildResponse(id);
      const msg: Message = { role: 'assistant', ...resp };
      setMessages(prev => [...prev, msg]);
      if (!isOpen) setUnreadCount(c => c + 1);
    }, 800 + Math.random() * 500);
  };

  const handleSend = () => {
    const t = inputValue.trim();
    if (!t) return;
    setInputValue('');
    dispatch(parseInput(t), t);
  };

  return (
    <>
      {/* Floating Button */}
      <div
        onClick={() => setIsOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--status-success)', color: 'var(--text-inverse)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 8px 32px rgba(34,197,94,0.35)',
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          transform: isOpen ? 'rotate(90deg) scale(0.9)' : 'scale(1)',
          animation: !isOpen ? 'btnPulse 2s infinite' : 'none'
        }}
      >
        {isOpen ? <X size={24}/> : <Sparkles size={24}/>}
        {!isOpen && unreadCount > 0 && (
          <div style={{
            position: 'absolute', top: -4, right: -4, width: 20, height: 20,
            borderRadius: '50%', background: 'var(--status-critical)', color: '#fff',
            fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center',
            justifyContent: 'center', border: '2px solid var(--bg-body)',
            animation: 'badgePop 0.3s cubic-bezier(0.175,0.885,0.32,1.275)'
          }}>
            {unreadCount}
          </div>
        )}
      </div>

      {/* Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 92, right: 24, zIndex: 1000,
          width: 400, height: 640, maxHeight: 'calc(100vh - 120px)',
          background: 'var(--bg-surface)', backdropFilter: 'blur(30px)',
          border: '1px solid var(--border-soft)', borderRadius: 24,
          boxShadow: 'var(--shadow-strong)', display: 'flex',
          flexDirection: 'column', overflow: 'hidden',
          animation: 'slideUp 0.4s cubic-bezier(0.4,0,0.2,1)'
        }}>

          {/* Header */}
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-soft)', background: 'var(--bg-card-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--status-success-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={13} color="var(--status-success)"/>
                </div>
                <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>Estate Advisor</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--status-success-glow)', border: '1px solid var(--status-success)', padding: '2px 7px', borderRadius: 20 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--status-success)', animation: 'liveDot 2s infinite' }}/>
                  <span style={{ fontSize: 9, fontWeight: 900, color: 'var(--status-success)', letterSpacing: '0.08em' }}>LIVE</span>
                </div>
              </div>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>Operational Intelligence</p>
            </div>
            <button onClick={() => setMessages([{ role: 'assistant', content: 'Chat cleared. How can I help?' }])} style={{ padding: 7, borderRadius: 9, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-soft)', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={13}/>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%', display: 'flex', flexDirection: 'column', gap: 7 }}>
                <div style={{
                  padding: '11px 15px',
                  borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.role === 'user' ? 'var(--status-success)' : 'var(--bg-card-elevated)',
                  color: m.role === 'user' ? 'var(--text-inverse)' : 'var(--text-primary)',
                  fontSize: 13, lineHeight: 1.6,
                  border: m.role === 'assistant' ? '1px solid var(--border-soft)' : 'none'
                }}>
                  {m.content}
                </div>
                {m.card && (
                  <div style={{ padding: '11px 14px', borderRadius: 12, background: 'var(--bg-card)', border: `1px solid ${m.card.color}33`, display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: `${m.card.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.card.color, flexShrink: 0 }}>
                      {m.card.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{m.card.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: m.card.color, letterSpacing: '-0.03em' }}>{m.card.value}</div>
                    </div>
                  </div>
                )}
                {m.actions && m.actions.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {m.actions.map((act, ai) => (
                      <button key={ai} onClick={() => router.push(act.href)} style={{ padding: '7px 11px', borderRadius: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: 'var(--status-success)', fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {act.label} <ArrowRight size={11}/>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', padding: '11px 15px', borderRadius: '16px 16px 16px 4px', background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', display: 'flex', gap: 5, alignItems: 'center' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--status-success)', display: 'inline-block', animation: 'dot1 1.2s infinite' }}/>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--status-success)', display: 'inline-block', animation: 'dot2 1.2s infinite' }}/>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--status-success)', display: 'inline-block', animation: 'dot3 1.2s infinite' }}/>
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.15)', borderTop: '1px solid var(--border-soft)' }}>
            {/* Quick Commands */}
            <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Quick Commands</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
              {[
                { label: 'Explain this page', id: 'explain' },
                { label: "Today's alerts",    id: 'alerts'  },
                { label: 'Revenue summary',   id: 'revenue' },
                { label: 'Where to start?',   id: 'start'   },
              ].map(cmd => (
                <button key={cmd.id} onClick={() => dispatch(cmd.id, cmd.label)} style={{ padding: '8px 10px', background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', borderRadius: 9, color: 'var(--text-primary)', fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <ChevronRight size={11} color="var(--status-success)"/>
                  <span style={{ flex: 1 }}>{cmd.label}</span>
                </button>
              ))}
            </div>

            {/* Shortcuts */}
            <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Shortcuts</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 10 }}>
              {SHORTCUTS.map(s => (
                <button key={s.label} onClick={() => router.push(s.href)} style={{ padding: '7px 10px', background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', borderRadius: 9, color: 'var(--text-primary)', fontSize: 10, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
                  {s.icon}
                  <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</span>
                </button>
              ))}
            </div>

            {/* Text Input */}
            <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <input
                ref={inputRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything about the estate..."
                style={{ flex: 1, background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', borderRadius: 11, padding: '9px 13px', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }}
                onFocus={e => (e.target.style.borderColor = 'var(--status-success)')}
                onBlur={e  => (e.target.style.borderColor = 'var(--border-soft)')}
              />
              <button
                onClick={handleSend}
                style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, background: inputValue.trim() ? 'var(--status-success)' : 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', color: inputValue.trim() ? 'var(--text-inverse)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputValue.trim() ? 'pointer' : 'default', transition: 'all 0.2s' }}
              >
                <Send size={14}/>
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes btnPulse {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.45); }
          70%  { box-shadow: 0 0 0 16px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(40px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes liveDot {
          0%,100% { opacity:0.4; }
          50%      { opacity:1; box-shadow:0 0 6px var(--status-success); }
        }
        @keyframes badgePop {
          from { transform:scale(0); }
          to   { transform:scale(1); }
        }
        @keyframes dot1 {
          0%,60%,100% { transform:translateY(0); opacity:0.4; }
          30%          { transform:translateY(-5px); opacity:1; }
        }
        @keyframes dot2 {
          0%,60%,100% { transform:translateY(0); opacity:0.4; }
          40%          { transform:translateY(-5px); opacity:1; }
        }
        @keyframes dot3 {
          0%,60%,100% { transform:translateY(0); opacity:0.4; }
          50%          { transform:translateY(-5px); opacity:1; }
        }
      `}}/>
    </>
  );
}
