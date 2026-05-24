'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUIStore } from '@/store/useUIStore'
import { useAppStore } from '@/store/useAppStore'
import {
  LayoutDashboard, BarChart3, CreditCard, Banknote,
  Users, Beef, Sprout, Settings, ChevronRight,
  Circle, ChevronLeft, ChevronRight as CR, Bell, FileText,
  TrendingDown, Zap, ArrowRightLeft, Smartphone, DollarSign, 
  Package, LineChart, Landmark, Building2, ShieldAlert,
  ClipboardList, Truck, ShieldCheck, LogOut
} from 'lucide-react'

const GROUPS = [
  {
    title: 'Command Center',
    items: [
      { href: '/',          label: 'Dashboard',   icon: LayoutDashboard },
      { href: '/decision-engine', label: 'AI Decision Engine', icon: Zap },
      { href: '/approvals', label: 'Approval Center', icon: ShieldCheck },
      { href: '/employee-tasks', label: 'My Tasks', icon: ClipboardList },
      { href: '/alerts',     label: 'Alerts Hub',    icon: Bell },
      { href: '/alerts/mobile', label: 'Mobile Alerts', icon: Smartphone },
    ]
  },
  {
    title: 'Operations',
    items: [
      { href: '/crops',           label: 'Crop Intelligence', icon: Sprout },
      { href: '/livestock',       label: 'Livestock Intelligence', icon: Beef },
      { href: '/labor',           label: 'Workforce Intelligence', icon: Users },
      { href: '/infrastructure',  label: 'Infrastructure & Ops', icon: Building2 },
    ]
  },
  {
    title: 'Financial Core',
    items: [
      { href: '/expenses',  label: 'Expenses',    icon: TrendingDown },
      { href: '/payroll',   label: 'Payroll',     icon: DollarSign },
      { href: '/finance/pl', label: 'P&L Statement', icon: FileText },
    ]
  },
  {
    title: 'Capital Control',
    items: [
      { href: '/capital-control', label: 'Capital Overview', icon: Banknote },
      { href: '/loans',           label: 'Loans & Liabilities', icon: CreditCard },
      { href: '/capital',         label: 'Assets',              icon: Landmark },
      { href: '/cash-flow',       label: 'Cash Flow',           icon: ArrowRightLeft },
    ]
  },
  {
    title: 'Profit Intelligence',
    items: [
      { href: '/finance/analytics', label: 'Profit Intelligence', icon: LineChart },
      { href: '/analytics',         label: 'Analytics',           icon: BarChart3 },
      { href: '/reports',           label: 'Reports',             icon: ClipboardList },
    ]
  },
  {
    title: 'System',
    items: [
      { href: '/inventory', label: 'Inventory', icon: Package },
      { href: '/vendors',   label: 'Vendors',   icon: Truck },
      { href: '/settings',  label: 'Settings',  icon: Settings },
      { href: '/login',     label: 'Log Out',   icon: LogOut },
    ]
  },
  {
    title: 'Worker Interface',
    items: [
      { href: '/worker-hub', label: 'Data Entry Hub', icon: ClipboardList },
    ]
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { currentUser } = useAppStore()
  const w = sidebarCollapsed ? 64 : 250

  const filteredGroups = GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (currentUser.role === 'restricted') {
        const restrictedHrefs = ['/loans', '/finance/pl', '/capital', '/capital-control', '/reports', '/settings', '/cash-flow'];
        if (restrictedHrefs.includes(item.href)) return false;
      }
      return true;
    })
  })).filter(group => group.items.length > 0);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: ${sidebarCollapsed ? '10px' : '10px 14px'};
          justify-content: ${sidebarCollapsed ? 'center' : 'flex-start'};
          border-radius: 12px;
          margin-bottom: 2px;
          text-decoration: none;
          font-size: 13px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          color: var(--text-secondary);
          font-weight: 600;
        }
        .nav-link:hover {
          background: var(--border-soft);
          color: var(--text-primary);
        }
        .nav-link.active {
          background: var(--status-success-glow);
          color: var(--status-success) !important;
          font-weight: 800;
          border: 1px solid var(--status-success-glow);
        }
        .group-header {
          font-size: 9px;
          font-weight: 900;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          padding: 20px 14px 8px 14px;
          margin-top: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border-soft);
          border-radius: 10px;
        }
        .main-content {
          margin-left: ${w}px !important;
        }
        .logo-container:hover {
          transform: scale(1.05) translateY(-2px);
          border-color: rgba(var(--status-success-rgb), 0.4) !important;
          background: rgba(255,255,255,0.06) !important;
        }
      `}} />

      <aside style={{
        position: 'fixed', top: 0, left: 0, width: w, height: '100vh',
        background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-soft)',
        display: 'flex', flexDirection: 'column', zIndex: 100,
        overflow: 'hidden', transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Brand */}
        <div style={{
          height: 72, display: 'flex', alignItems: 'center',
          padding: sidebarCollapsed ? '0 15px' : '0 24px',
          borderBottom: '1px solid var(--border-soft)',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start', gap: 12,
        }}>
          <div 
            className="logo-container"
            style={{ 
              width: 60, height: 60, borderRadius: 16, overflow: 'hidden', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              flexShrink: 0, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 0 20px rgba(255,255,255,0.02)',
              cursor: 'pointer'
            }}
          >
            <img 
              src="/bc-logo.png" 
              alt="BC Logo" 
              style={{ 
                width: '90%', height: '90%', objectFit: 'contain',
                filter: 'drop-shadow(0 0 8px var(--status-success-glow))'
              }} 
            />
          </div>
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: 'var(--text-primary)', fontWeight: 900, fontSize: 14, letterSpacing: '-0.02em' }}>Braes Creek Estate</div>
              <div style={{ color: 'var(--status-success)', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Command Center</div>
            </div>
          )}
        </div>

        {/* Nav Sections */}
        <nav className="custom-scrollbar" style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {filteredGroups.map((group) => (
            <div key={group.title} style={{ marginBottom: 12 }}>
              {!sidebarCollapsed && <div className="group-header">{group.title}</div>}
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = item.href === '/' 
                  ? pathname === '/' 
                  : (pathname === item.href) || (pathname.startsWith(item.href + '/') && !GROUPS.some(g => g.items.some(i => i.href !== item.href && pathname.startsWith(i.href))))
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    <Icon size={16} style={{ flexShrink: 0 }} />
                    {!sidebarCollapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                    {!sidebarCollapsed && isActive && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--status-success)', boxShadow: '0 0 8px var(--status-success)' }} />}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Toggle button */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--border-soft)' }}>
          <button onClick={toggleSidebar} style={{
            width: '100%', padding: '10px', borderRadius: 10, cursor: 'pointer',
            background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)',
            color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between', transition: 'all 0.2s',
          }}>
            {!sidebarCollapsed && <span style={{ fontSize: 11, fontWeight: 700 }}>Collapse Menu</span>}
            {sidebarCollapsed ? <CR size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* User Footer */}
        {!sidebarCollapsed && (
          <div style={{ padding: '16px 20px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-soft)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-inverse)', fontSize: 13, fontWeight: 950, flexShrink: 0 }}>
                {currentUser?.name ? currentUser.name[0].toUpperCase() : 'P'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--text-primary)', fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser?.name || 'Peter Admin'}
                </div>
                <div style={{ color: 'var(--status-success)', fontSize: 10, fontWeight: 800 }}>
                  {currentUser?.role === 'admin' ? 'Estate Control' : currentUser?.role === 'data-entry' ? 'Data Entry Operator' : currentUser?.role === 'viewer' ? 'Viewer Mode' : 'Restricted Mode'}
                </div>
              </div>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-success)', boxShadow: '0 0 8px var(--status-success)' }} />
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
