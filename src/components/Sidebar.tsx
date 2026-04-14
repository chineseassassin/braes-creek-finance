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
  const { currentUser, sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`modal-overlay ${sidebarOpen ? 'mobile-show' : 'mobile-hide'}`}
        style={{ zIndex: 45, display: 'none' }}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo Section */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" style={{ background: 'transparent', width: 40, height: 40 }}>
            <Image
              src="/logo-transparent.png"
              alt="Braes Creek Estate"
              width={40}
              height={40}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div className="sidebar-logo-text">
            <h1>Braes Creek Estate <span style={{ color: 'hsl(var(--text-muted))', fontWeight: 400, fontSize: '0.9em' }}>/ Platform</span></h1>
          </div>
          
          {/* Mobile Close Button */}
          <button 
            className="mobile-only btn btn-ghost btn-icon" 
            onClick={() => setSidebarOpen(false)}
            style={{ marginLeft: 'auto' }}
          >✕</button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_SECTIONS.map(section => (
            <div key={section.label} style={{ marginBottom: '2px' }}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.items.map(item => (
                <div
                  key={item.id}
                  className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => {
                    onNavigate(item.id);
                    if (window.innerWidth <= 1024) setSidebarOpen(false);
                  }}
                >
                  <span className={`nav-item-icon color-${item.color}`}>{item.icon}</span>
                  <span className="nav-item-label">{item.label}</span>

                </div>
              ))}
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="sidebar-user">
          <div className="user-avatar" title={currentUser.name}>
            {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-primary))', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', textTransform: 'capitalize' }}>
              {currentUser.role}
            </div>
          </div>
          <button
            onClick={onLogout}
            className="btn btn-ghost btn-icon"
            title="Sign out"
            style={{ fontSize: '16px' }}
          >🚪</button>
        </div>
      </aside>

      <style jsx>{`
        .mobile-only { display: none; }
        @media (max-width: 1024px) {
          .mobile-only { display: flex; }
          .mobile-show { display: flex !important; }
        }
      `}</style>
    </>
  );
}

