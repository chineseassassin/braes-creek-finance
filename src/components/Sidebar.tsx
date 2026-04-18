'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', color: 'blue' },
      { id: 'alerts', label: 'Alerts Hub', icon: '🔔', color: 'red' },
      { id: 'reports', label: 'Reports', icon: '📋', color: 'purple' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { id: 'pl', label: 'P&L Intelligence', icon: '📈', color: 'green' },
      { id: 'expenses', label: 'Expenses', icon: '💸', color: 'red' },
      { id: 'loans', label: 'Loans', icon: '🏦', color: 'blue' },
      { id: 'budgets', label: 'Budgets', icon: '🎯', color: 'amber' },
      { id: 'payroll', label: 'Payroll', icon: '💰', color: 'green' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'operations', label: 'Yield & Sales', icon: '🚜', color: 'teal' },
      { id: 'labor', label: 'Labor', icon: '👷', color: 'amber' },
      { id: 'livestock', label: 'Livestock', icon: '🐄', color: 'red' },
      { id: 'crops', label: 'Crops', icon: '🌿', color: 'green' },
      { id: 'maintenance', label: 'Maintenance', icon: '🔧', color: 'purple' },
    ],
  },
  {
    label: 'Business',
    items: [
      { id: 'vendors', label: 'Vendors', icon: '🏪', color: 'blue' },
      { id: 'inventory', label: 'Inventory', icon: '📦', color: 'amber' },
      { id: 'documents', label: 'Documents', icon: '📁', color: 'amber' },
      { id: 'audit', label: 'Audit Trail', icon: '🔍', color: 'teal' },
      { id: 'settings', label: 'Settings', icon: '⚙️', color: 'gray' },
    ],
  },
];


interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ activePage, onNavigate, onLogout }: SidebarProps) {
  const { currentUser, sidebarOpen, setSidebarOpen, navSections, renameNavItem, deleteNavItem, resetNavigation } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);

  const handleRename = (e: React.MouseEvent, id: string, currentLabel: string) => {
    e.stopPropagation();
    const newName = prompt(`Rename "${currentLabel}" to:`, currentLabel);
    if (newName && newName.trim() !== '' && newName !== currentLabel) {
      renameNavItem(id, newName.trim());
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string, label: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove "${label}" from the sidebar?`)) {
      deleteNavItem(id);
    }
  };

  return (
    <>
      <div 
        className={`modal-overlay ${sidebarOpen ? 'mobile-show' : 'mobile-hide'}`}
        style={{ zIndex: 45, display: 'none' }}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{ background: 'hsl(var(--sidebar-bg))', borderRight: '1px solid hsl(var(--border))' }}>
        <div className="sidebar-logo" style={{ height: '80px', padding: '0 24px', borderBottom: '1px solid hsl(var(--border))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image
                src="/logo-transparent.png"
                alt="Braes Creek Estate"
                width={36}
                height={36}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <h1 style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                BRAES CREEK <span style={{ color: 'hsl(var(--accent-green))' }}>HQ</span>
              </h1>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Est. 2026 / OS
              </p>
            </div>
          </div>
          
          <button 
            className="mobile-only btn btn-ghost" 
            onClick={() => setSidebarOpen(false)}
            style={{ marginLeft: 'auto', padding: '8px' }}
          >✕</button>
        </div>

        <nav className="sidebar-nav" style={{ padding: '24px 16px' }}>
          {navSections.map(section => (
            <div key={section.label} style={{ marginBottom: '32px' }}>
              <div style={{ padding: '0 12px', fontSize: '10px', fontWeight: 900, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>
                {section.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {section.items.map(item => (
                  <div
                    key={item.id}
                    className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                    onClick={() => {
                      if (!isEditing) {
                        onNavigate(item.id);
                        if (window.innerWidth <= 1024) setSidebarOpen(false);
                      }
                    }}
                    style={{ 
                      padding: '10px 12px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      color: activePage === item.id ? 'hsl(var(--accent-blue))' : 'hsl(var(--text-secondary))',
                      background: activePage === item.id ? 'hsl(var(--accent-blue) / 0.1)' : 'transparent',
                      border: activePage === item.id ? '1px solid hsl(var(--accent-blue) / 0.2)' : '1px solid transparent'
                    }}
                  >
                    <span style={{ fontSize: '18px', filter: activePage === item.id ? 'grayscale(0)' : 'grayscale(1) opacity(0.6)' }}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    
                    {isEditing && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn-xs" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={(e) => handleRename(e, item.id, item.label)}>✏️</button>
                        <button className="btn-xs" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'hsl(var(--accent-red))' }} onClick={(e) => handleDelete(e, item.id, item.label)}>✕</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <button 
            className="btn btn-ghost"
            onClick={() => setIsEditing(!isEditing)}
            style={{ width: '100%', fontSize: '11px', fontWeight: 800, marginTop: '24px', background: isEditing ? 'hsl(var(--bg-primary))' : 'transparent', border: '1px solid hsl(var(--border))' }}
          >
            {isEditing ? 'SAVING CONFIG...' : '⚙️ CONFIGURE HUB'}
          </button>
        </nav>

        <div className="sidebar-user" style={{ padding: '24px', borderTop: '1px solid hsl(var(--border))', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
            <div className="user-avatar" style={{ width: '40px', height: '40px', borderRadius: '12px', fontSize: '14px', fontWeight: 900 }}>
              {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{currentUser.name}</div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{currentUser.role}</div>
            </div>
            <button onClick={onLogout} className="btn-icon" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '8px' }}>🚪</button>
          </div>
        </div>
      </aside>

      <style jsx>{`
        .mobile-only { display: none; }
        .btn-xs { padding: 4px; min-width: 24px; min-height: 24px; font-size: 10px; }
        @media (max-width: 1024px) {
          .mobile-only { display: flex; }
          .mobile-show { display: flex !important; }
        }
      `}</style>
    </>
  );
}

