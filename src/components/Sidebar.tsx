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
      { id: 'labor', label: 'Workers', icon: '👷', color: 'amber' },
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
          background: '#0A0A0A', 
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          width: '80px',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 100,
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          padding: '24px 0'
        }}
      >
        <div className="sidebar-logo" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            width: '44px', height: '44px', 
            background: 'rgba(0, 245, 255, 0.1)', 
            border: '1px solid rgba(0, 245, 255, 0.2)', 
            borderRadius: '12px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 245, 255, 0.1)'
          }}>
            <img src="/bc-logo-final-v72.png" alt="B" style={{ width: '28px', height: 'auto', mixBlendMode: 'screen' }} />
          </div>
        </div>

        <nav className="sidebar-nav custom-scrollbar" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', alignItems: 'center' }}>
          {navSections.map(section => (
            <div key={section.label} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', alignItems: 'center', width: '100%' }}>
              <div style={{ height: '1px', width: '20px', background: 'rgba(255,255,255,0.05)', marginBottom: '8px' }} />
              {section.items.map(item => (
                <div
                  key={item.id}
                  className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => {
                    onNavigate(item.id);
                    if (window.innerWidth <= 1024) setSidebarOpen(false);
                  }}
                  title={item.label}
                  style={{ 
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    background: activePage === item.id ? 'rgba(0, 245, 255, 0.08)' : 'transparent',
                    border: activePage === item.id ? '1px solid rgba(0, 245, 255, 0.15)' : '1px solid transparent',
                    cursor: 'pointer',
                    color: activePage === item.id ? '#00F5FF' : 'rgba(255,255,255,0.3)',
                    position: 'relative'
                  }}
                >
                  <span style={{ fontSize: '20px', filter: activePage === item.id ? 'none' : 'grayscale(1) opacity(0.5)' }}>{item.icon}</span>
                  {activePage === item.id && (
                    <div style={{ position: 'absolute', right: '-12px', width: '3px', height: '20px', background: '#00F5FF', borderRadius: '10px', boxShadow: '0 0 10px #00F5FF' }} />
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer" style={{ padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
           <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #1e293b, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, border: '1px solid rgba(255,255,255,0.1)' }}>{currentUser?.name?.[0]}</div>
           <button onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'rgba(255,255,255,0.4)' }}>🚪</button>
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

