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
          background: 'rgba(15, 23, 42, 0.4)', 
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          width: '280px',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 100,
          boxShadow: '20px 0 60px rgba(0,0,0,0.5)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="sidebar-logo" style={{ height: '70px', padding: '0 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src="/bc-logo-final-v72.png"
            alt="Braes Creek"
            style={{ 
              width: '120px', 
              height: 'auto', 
              filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.2))',
              mixBlendMode: 'screen',
              opacity: 0.9
            }}
          />
        </div>

        <nav className="sidebar-nav custom-scrollbar" style={{ padding: '16px 12px', flex: 1, overflowY: 'hidden' }}>
          {navSections.map(section => (
            <div key={section.label} style={{ marginBottom: '16px' }}>
              <div style={{ padding: '0 12px', fontSize: '9px', fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                {section.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {section.items.map(item => (
                  <div
                    key={item.id}
                    className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                    onClick={() => {
                      onNavigate(item.id);
                      if (window.innerWidth <= 1024) setSidebarOpen(false);
                    }}
                    style={{ 
                      padding: '8px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: activePage === item.id ? 900 : 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      color: activePage === item.id ? '#fff' : 'rgba(255,255,255,0.45)',
                      background: activePage === item.id ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <span style={{ fontSize: '16px', filter: activePage === item.id ? 'grayscale(0)' : 'grayscale(1) opacity(0.4)' }}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-user" style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="user-avatar" style={{ 
            width: '40px', height: '40px', 
            borderRadius: '12px', 
            fontSize: '14px', 
            fontWeight: 800,
            background: 'linear-gradient(135deg, #1e293b, #334155)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {currentUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AD'}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: '#fff' }}>{currentUser?.name}</div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{currentUser?.role}</div>
          </div>
          <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '8px', borderRadius: '10px', color: '#fff' }}>🚪</button>
        </div>
      </aside>

      <style jsx>{`
        .mobile-only { display: none; }
        .btn-xs { padding: 4px; min-width: 24px; min-height: 24px; font-size: 10px; }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 1024px) {
          .mobile-only { display: flex; }
          .mobile-show { display: flex !important; }
          .sidebar { width: 280px; transform: translateX(-100%); transition: transform 0.3s ease; }
          .sidebar.open { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

