"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, LayoutDashboard, FileText, Landmark, 
  CreditCard, Sprout, Beef, Users, Building2, 
  Plus, ArrowRight, Settings, Command
} from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';

type CommandItem = {
  id: string;
  title: string;
  icon: React.ReactNode;
  category: 'Navigation' | 'Actions' | 'System';
  action: () => void;
};

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Example to add a dummy transaction or trigger a modal
  const { addTransaction } = useDashboardStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands: CommandItem[] = [
    { id: 'nav-dashboard', title: 'Go to Dashboard', icon: <LayoutDashboard size={16} />, category: 'Navigation', action: () => router.push('/') },
    { id: 'nav-reports', title: 'Go to Reports', icon: <FileText size={16} />, category: 'Navigation', action: () => router.push('/reports') },
    { id: 'nav-capital', title: 'Go to Capital Control', icon: <Landmark size={16} />, category: 'Navigation', action: () => router.push('/capital-control') },
    { id: 'nav-loans', title: 'Go to Loans', icon: <CreditCard size={16} />, category: 'Navigation', action: () => router.push('/loans') },
    { id: 'nav-crops', title: 'Go to Crops', icon: <Sprout size={16} />, category: 'Navigation', action: () => router.push('/crops') },
    { id: 'nav-livestock', title: 'Go to Livestock', icon: <Beef size={16} />, category: 'Navigation', action: () => router.push('/livestock') },
    { id: 'nav-labor', title: 'Go to Workforce', icon: <Users size={16} />, category: 'Navigation', action: () => router.push('/labor') },
    { id: 'nav-infra', title: 'Go to Infrastructure', icon: <Building2 size={16} />, category: 'Navigation', action: () => router.push('/infrastructure') },
    
    { 
      id: 'act-expense', 
      title: 'Log New Expense', 
      icon: <Plus size={16} />, 
      category: 'Actions', 
      action: () => {
        router.push('/expenses?action=new');
      }
    },
    { 
      id: 'act-income', 
      title: 'Log New Income', 
      icon: <Plus size={16} />, 
      category: 'Actions', 
      action: () => {
        router.push('/income?action=new');
      }
    },
    
    { id: 'sys-settings', title: 'System Settings', icon: <Settings size={16} />, category: 'System', action: () => router.push('/settings') },
  ];

  const filteredCommands = commands.filter((command) =>
    command.title.toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    }
    if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      e.preventDefault();
      filteredCommands[selectedIndex].action();
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="palette-backdrop"
        onClick={() => setIsOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          paddingTop: '10vh',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        <div 
          className="palette-modal"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 540,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-soft)',
            borderRadius: 24,
            boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            animation: 'slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border-soft)', background: 'var(--bg-card-elevated)' }}>
            <Search size={20} color="var(--text-muted)" style={{ marginRight: 16 }} />
            <input 
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search..."
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 16, fontWeight: 500
              }}
            />
            <div style={{ display: 'flex', gap: 4 }}>
              <kbd style={{ background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: 6, fontSize: 10, color: 'var(--text-muted)', border: '1px solid var(--border-soft)', fontWeight: 800 }}>ESC</kbd>
            </div>
          </div>

          {/* Results Area */}
          <div style={{ maxHeight: 400, overflowY: 'auto', padding: '12px' }}>
            {filteredCommands.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                No commands found for "{search}"
              </div>
            ) : (
              Object.entries(groupedCommands).map(([category, items]) => {
                const categoryStartIndex = filteredCommands.findIndex(c => c === items[0]);
                
                return (
                  <div key={category} style={{ marginBottom: 16 }}>
                    <div style={{ padding: '0 12px', fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                      {category}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {items.map((cmd, idx) => {
                        const globalIndex = categoryStartIndex + idx;
                        const isSelected = globalIndex === selectedIndex;
                        return (
                          <div
                            key={cmd.id}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            onClick={() => {
                              cmd.action();
                              setIsOpen(false);
                            }}
                            style={{
                              padding: '12px 16px', borderRadius: 12,
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              background: isSelected ? 'var(--bg-card-elevated)' : 'transparent',
                              cursor: 'pointer',
                              border: isSelected ? '1px solid var(--border-soft)' : '1px solid transparent',
                              color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                              transition: 'all 0.1s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ 
                                width: 28, height: 28, borderRadius: 8, 
                                background: isSelected ? 'var(--status-success-glow)' : 'rgba(255,255,255,0.03)',
                                color: isSelected ? 'var(--status-success)' : 'inherit',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>
                                {cmd.icon}
                              </div>
                              <span style={{ fontSize: 14, fontWeight: isSelected ? 600 : 500 }}>{cmd.title}</span>
                            </div>
                            {isSelected && <ArrowRight size={14} color="var(--text-muted)" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div style={{ padding: '12px 24px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: 'var(--text-muted)' }}>
             <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Command size={12}/> Navigate</span>
             <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><kbd style={{ background: 'var(--bg-card)', padding: '2px 4px', borderRadius: 4, border: '1px solid var(--border-soft)' }}>↑</kbd> <kbd style={{ background: 'var(--bg-card)', padding: '2px 4px', borderRadius: 4, border: '1px solid var(--border-soft)' }}>↓</kbd> Select</span>
             <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><kbd style={{ background: 'var(--bg-card)', padding: '2px 4px', borderRadius: 4, border: '1px solid var(--border-soft)' }}>↵</kbd> Execute</span>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </>
  );
}
