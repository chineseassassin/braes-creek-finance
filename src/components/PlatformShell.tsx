'use client';
import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';
import LoginPage from '@/components/LoginPage';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import ExpensesPage from '@/components/ExpensesPage';
import LoansPage from '@/components/LoansPage';
import LaborPage from '@/components/LaborPage';
import PayrollPage from '@/components/PayrollPage';
import LivestockPage from '@/components/LivestockPage';
import CropsPage from '@/components/CropsPage';
import ReportsPage from '@/components/ReportsPage';
import BudgetsPage from '@/components/BudgetsPage';
import VendorsPage from '@/components/VendorsPage';
import MaintenancePage from '@/components/MaintenancePage';
import OperationsPage from '@/components/OperationsPage';
import AuditPage from '@/components/AuditPage';
import GlobalSearch from '@/components/GlobalSearch';
import DocumentsPage from '@/components/DocumentsPage';
import InventoryPage from '@/components/InventoryPage';
import NotificationCenter from '@/components/NotificationCenter';
import SettingsPage from '@/components/SettingsPage';
import AlertsPage from '@/components/AlertsPage';
import PLPage from '@/components/PLPage';
import ThemeToggle from '@/components/ThemeToggle';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  pl: 'P&L Intelligence',
  alerts: 'Alerts & Notifications',
  expenses: 'Expenses',
  loans: 'Loans',
  labor: 'Labor',
  payroll: 'Payroll',
  livestock: 'Livestock',
  crops: 'Crops',
  feed: 'Feed & Maintenance',
  maintenance: 'Maintenance',
  operations: 'Operations & Yield',
  vendors: 'Vendors',
  budgets: 'Budgets',
  reports: 'Reports',
  documents: 'Documents',
  audit: 'Audit Trail',
  settings: 'Settings',
};

export default function PlatformShell() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const { sidebarOpen, setSidebarOpen, loadAllData } = useAppStore();

  useEffect(() => {
    (window as any).__onNavigate = setActivePage;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthenticated(!!session);
      if (session && loadAllData) {
        loadAllData(session.user.id);
      }
      setLoadingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
      if (session && loadAllData) {
        loadAllData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadAllData]);

  useEffect(() => {
    document.title = `${PAGE_TITLES[activePage] || 'Dashboard'} | Braes Creek Estate`;
  }, [activePage]);

  if (loadingSession) {
    return <div style={{ height: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader"></div></div>;
  }

  if (!authenticated) {
    return <LoginPage onLogin={() => setAuthenticated(true)} />;
  }

  function renderPage() {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'expenses': return <ExpensesPage />;
      case 'loans': return <LoansPage />;
      case 'labor': return <LaborPage />;
      case 'payroll': return <PayrollPage />;
      case 'livestock': return <LivestockPage />;
      case 'crops': return <CropsPage />;
      case 'feed': return <MaintenancePage />;
      case 'maintenance': return <MaintenancePage />;
      case 'operations': return <OperationsPage />;
      case 'vendors': return <VendorsPage />;
      case 'budgets': return <BudgetsPage />;
      case 'reports': return <ReportsPage />;
      case 'audit': return <AuditPage />;
      case 'inventory': return <InventoryPage />;
      case 'documents': return <DocumentsPage />;
      case 'alerts': return <AlertsPage />;
      case 'pl': return <PLPage />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  }

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={() => setAuthenticated(false)}
      />

      <div className="main-content">
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <button
              className="btn btn-ghost btn-icon mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span>{sidebarOpen ? '✕' : '☰'}</span>
            </button>
            <div className="header-title-container">
              <span className="header-title">{PAGE_TITLES[activePage] || 'Dashboard'}</span>
              <div className="header-breadcrumbs">Braes Creek Estate / Platform</div>
            </div>
            <div className="desktop-only" style={{ flex: 1, marginLeft: 20 }}>
              <GlobalSearch onNavigate={setActivePage} />
            </div>
          </div>
          <div className="header-actions">
            <ThemeToggle />
            <NotificationCenter />
            <span className="header-date">
              📅 {typeof window !== 'undefined' ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '...'}
            </span>
          </div>
        </header>

        <div className="mobile-only" style={{ padding: '0 16px 12px 16px', borderBottom: '1px solid hsl(var(--border) / 0.5)' }}>
          <GlobalSearch onNavigate={setActivePage} />
        </div>

        <main className="page-content">
          <Suspense fallback={<div className="loader"></div>}>
            <div className="content-inner">{renderPage()}</div>
          </Suspense>
        </main>

        <nav className="mobile-only mobile-nav-bar">
          {[
            { id: 'dashboard', icon: '📊', label: 'Home' },
            { id: 'expenses', icon: '💸', label: 'Flow' },
            { id: 'livestock', icon: '🐄', label: 'Live' },
            { id: 'reports', icon: '📋', label: 'Data' },
          ].map(item => (
            <div key={item.id} className={`mobile-nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => setActivePage(item.id)}>
              <span className="mobile-nav-icon">{item.icon}</span>
              <span className="mobile-nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
      </div>
      
      <style jsx>{`
        .header-title-container { display: flex; flex-direction: column; }
        .header-title { font-size: 18px; font-weight: 800; color: hsl(var(--text-primary)); line-height: 1.2; }
        .header-breadcrumbs { font-size: 11px; color: hsl(var(--text-muted)); font-weight: 600; text-transform: uppercase; }
        .header-actions { display: flex; align-items: center; gap: 12px; }
        .header-date { font-size: 12px; font-weight: 700; color: hsl(var(--text-secondary)); padding: 8px 16px; background: hsl(var(--bg-secondary)); border-radius: 10px; display: flex; align-items: center; gap: 8px; }
        .mobile-nav-bar { position: fixed; bottom: 0; left: 0; right: 0; height: 64px; background: hsl(var(--bg-card) / 0.8); backdrop-filter: blur(20px); border-top: 1px solid hsl(var(--border)); display: flex; justify-content: space-around; align-items: center; z-index: 100; }
        .mobile-nav-item { display: flex; flex-direction: column; align-items: center; gap: 4px; color: hsl(var(--text-muted)); }
        .mobile-nav-item.active { color: hsl(var(--accent-blue)); }
        .mobile-nav-icon { font-size: 20px; }
        .mobile-nav-label { font-size: 10px; font-weight: 700; }
        .desktop-only { display: block; }
        .mobile-only { display: none; }
        @media (max-width: 1024px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
