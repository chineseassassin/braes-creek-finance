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
import ControlPanel from '@/components/ControlPanel';

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
  const { 
    sidebarOpen, setSidebarOpen, loadAllData, controlPanelOpen, setControlPanelOpen,
    loans, sales, expenses, livestockUnits, notifications, addNotification, clearAllData
  } = useAppStore();

  const [authenticated, setAuthenticated] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const { navSections, renameNavItem } = useAppStore();

  // TERMINOLOGY PATCH: Auto-convert Labor -> Workers
  useEffect(() => {
    navSections.forEach(section => {
      section.items.forEach((item: any) => {
        if (item.id === 'labor' && item.label === 'Labor') {
          renameNavItem('labor', 'Workers');
        }
      });
    });
  }, [navSections, renameNavItem]);

  useEffect(() => {
    (window as any).__onNavigate = setActivePage;
    
    // Global Command Hotkey (Cmd/Ctrl + K)
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setControlPanelOpen(!controlPanelOpen);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [controlPanelOpen, setControlPanelOpen]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthenticated(true);
        loadAllData(session.user.id);
      }
      setLoadingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
      if (session) {
        loadAllData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadAllData]);

  // Mission Logic: Persistent Session Guard
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    document.title = `${PAGE_TITLES[activePage] || 'Dashboard'} | Braes Creek Estate`;
  }, [activePage]);

  // --- Smart Alerts Engine ---
  useEffect(() => {
    if (!authenticated) return;

    const checkHealth = () => {
      const today = new Date().toISOString().split('T')[0];

      // 1. Overdue Loans
      (loans || []).forEach(loan => {
        if (loan.status !== 'paid_off' && loan.due_date && loan.due_date < today) {
          const alertId = `overdue-${loan.id}`;
          if (!notifications.find(n => n.id === alertId)) {
            addNotification({
              id: alertId,
              title: 'Critical: Overdue Loan',
              message: `Loan from ${loan.lender_name} was due on ${loan.due_date}.`,
              type: 'alert',
              category: 'Finance',
              timestamp: new Date().toISOString()
            });
          }
        }
      });

      // 2. Low Cash (Simple liquidity check)
      const totalRev = (sales || []).reduce((s, r) => s + (r.total_amount || 0), 0);
      const totalExp = (expenses || []).reduce((s, e) => s + e.amount, 0);
      if (totalRev > 0 && (totalRev - totalExp) < (totalExp * 0.1)) { // Warning if cash < 10% of monthly burn
        const alertId = 'low-liquidity';
        if (!notifications.find(n => n.id === alertId)) {
          addNotification({
            id: alertId,
            title: 'Financial Warning: Low Liquidity',
            message: 'Net operational cash flow is dropping below 10% safety margin.',
            type: 'alert',
            category: 'Finance',
            timestamp: new Date().toISOString()
          });
        }
      }
    };

    const timer = setTimeout(checkHealth, 3000); // Check 3s after load
    return () => clearTimeout(timer);
  }, [authenticated, loans, sales, expenses, notifications, addNotification]);

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
    <div className="app-layout" style={{ background: '#050505', height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex' }}>
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={async () => {
          await supabase.auth.signOut();
          setAuthenticated(false);
        }}
      />

      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <header className="top-header" style={{ 
          height: '70px', 
          background: 'rgba(5, 5, 5, 0.4)', 
          backdropFilter: 'blur(20px)', 
          WebkitBackdropFilter: 'blur(20px)', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.03)', 
          padding: '0 32px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '24px', 
          zIndex: 40 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <div className="header-title-container" style={{ width: '224px' }}>
              <span className="header-title" style={{ fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>{PAGE_TITLES[activePage] || 'Dashboard'}</span>
              <div className="header-breadcrumbs" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>BC ESTATE</div>
            </div>
            <div className="desktop-only" style={{ flex: 1 }}>
              <GlobalSearch onNavigate={setActivePage} />
            </div>
          </div>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="btn-command" 
              onClick={() => setControlPanelOpen(true)}
              style={{ borderRadius: '12px', fontSize: '10px', padding: '0 20px', height: '36px', fontWeight: 900, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
            >
              CMD K
            </button>
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.05)' }} />
            <ThemeToggle />
            <NotificationCenter />
            <div style={{ 
              width: '36px', height: '36px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, #1e293b, #334155)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer'
            }}>
               <span style={{ fontSize: '12px', fontWeight: 800 }}>{currentUser?.name?.[0]}</span>
            </div>
          </div>
        </header>

        <ControlPanel isOpen={controlPanelOpen} onClose={() => setControlPanelOpen(false)} />

        <main className="page-content custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <Suspense fallback={<div className="loader"></div>}>
            <div className="content-inner" key={activePage}>{renderPage()}</div>
          </Suspense>
        </main>
      </div>
      
      <style jsx>{`
        .header-title-container { display: flex; flex-direction: column; }
        .desktop-only { display: block; }
        @media (max-width: 1024px) {
           .desktop-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}
