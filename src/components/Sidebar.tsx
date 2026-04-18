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
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          width: '80px',
          height: 'calc(100vh - 48px)',
          margin: '24px',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="sidebar-logo" style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ padding: '4px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)' }}>
            <Image
              src="/logo-transparent.png"
              alt="BC"
              width={32}
              height={32}
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>

        <nav className="sidebar-nav custom-scrollbar" style={{ padding: '0 8px', flex: 1, overflowY: 'auto', width: '100%' }}>
          {navSections.map(section => (
            <div key={section.label} style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                {section.items.map(item => (
                  <div
                    key={item.id}
                    className={`nav-item-icon-only ${activePage === item.id ? 'active' : ''}`}
                    title={item.label}
                    onClick={() => {
                      onNavigate(item.id);
                      if (window.innerWidth <= 1024) setSidebarOpen(false);
                    }}
                    style={{ 
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      color: activePage === item.id ? '#fff' : 'rgba(255,255,255,0.3)',
                      background: activePage === item.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                      cursor: 'pointer',
                      border: activePage === item.id ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent'
                    }}
                  >
                    <span>{item.icon}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-user" style={{ padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '12px', borderRadius: '100px', color: '#fff' }}>🚪</button>
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

