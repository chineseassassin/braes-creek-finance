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

      <aside 
        className={`sidebar ${sidebarOpen ? 'open' : ''}`} 
        style={{ 
          background: 'rgba(0, 0, 0, 0.8)', 
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '20px 0 60px rgba(0,0,0,0.5)'
        }}
      >
        <div className="sidebar-logo" style={{ height: '100px', padding: '0 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '4px', border: '1px solid rgba(0, 245, 255, 0.2)', borderRadius: '12px', background: 'rgba(0, 245, 255, 0.05)' }}>
              <Image
                src="/logo-transparent.png"
                alt="Braes Creek Estate"
                width={40}
                height={40}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <h1 style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '0.05em', whiteSpace: 'nowrap', color: '#fff' }}>
                BRAES CREEK <span style={{ color: '#00F5FF' }}>HQ</span>
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <span className="status-light" />
                <p style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  NODE ACTIVE
                </p>
              </div>
            </div>
          </div>
          
          <button 
            className="mobile-only btn btn-ghost" 
            onClick={() => setSidebarOpen(false)}
            style={{ marginLeft: 'auto', padding: '8px', color: '#fff' }}
          >✕</button>
        </div>

        <nav className="sidebar-nav" style={{ padding: '32px 16px' }}>
          {navSections.map(section => (
            <div key={section.label} style={{ marginBottom: '32px' }}>
              <div style={{ padding: '0 12px', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '20px' }}>
                {section.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                      padding: '12px 16px',
                      borderRadius: '16px',
                      fontSize: '13px',
                      fontWeight: activePage === item.id ? 900 : 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      color: activePage === item.id ? '#fff' : 'rgba(255,255,255,0.5)',
                      background: activePage === item.id ? 'rgba(0, 245, 255, 0.08)' : 'transparent',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <span style={{ fontSize: '18px', filter: activePage === item.id ? 'grayscale(0)' : 'grayscale(1) opacity(0.5)' }}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <div className="status-light" style={{ opacity: activePage === item.id ? 1 : 0 }} />
                    
                    {isEditing && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn-xs" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={(e) => handleRename(e, item.id, item.label)}>✏️</button>
                        <button className="btn-xs" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }} onClick={(e) => handleDelete(e, item.id, item.label)}>✕</button>
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
            style={{ 
              width: '100%', 
              fontSize: '11px', 
              fontWeight: 900, 
              marginTop: '24px', 
              background: isEditing ? 'rgba(0, 245, 255, 0.1)' : 'rgba(255,255,255,0.03)', 
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              color: '#fff',
              letterSpacing: '0.05em'
            }}
          >
            {isEditing ? 'SAVING DATA...' : 'SYSTEM CONFIG'}
          </button>
        </nav>

        <div className="sidebar-user" style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 'auto', background: 'linear-gradient(0deg, rgba(0,0,0,0.4), transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
            <div className="user-avatar" style={{ 
              width: '44px', height: '44px', 
              borderRadius: '14px', 
              fontSize: '14px', 
              fontWeight: 900,
              background: 'linear-gradient(135deg, #00F5FF, #FFD700)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.5)'
            }}>
              {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '14px', fontWeight: 900, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: '#fff' }}>{currentUser.name}</div>
              <div style={{ fontSize: '10px', fontWeight: 900, color: '#00F5FF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{currentUser.role}</div>
            </div>
            <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '8px', borderRadius: '10px', color: '#fff' }}>🚪</button>
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

