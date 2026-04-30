'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUIStore } from '@/store/useUIStore'
import {
  LayoutDashboard, BarChart3, CreditCard, Banknote,
  Users, Beef, Sprout, Settings, ChevronRight,
  Circle, ChevronLeft, ChevronRight as CR, Bell, FileText,
  TrendingDown, Zap, ArrowRightLeft, Smartphone, DollarSign, 
  Package, LineChart, Landmark, Building2, ShieldAlert,
  ClipboardList, Truck, ShieldCheck
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
    ]
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const w = sidebarCollapsed ? 64 : 250

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
          color: #B8B8B8;
          font-weight: 600;
        }
        .nav-link:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #F5F5F5;
        }
        .nav-link.active {
          background: rgba(34, 197, 94, 0.14);
          color: #22C55E !important;
          font-weight: 800;
          border: 1px solid rgba(34, 197, 94, 0.1);
        }
        .group-header {
          font-size: 9px;
          font-weight: 900;
          color: #555555;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          padding: 20px 14px 8px 14px;
          margin-top: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
        }
        .main-content {
          margin-left: ${w}px !important;
        }
      `}} />

      <aside style={{
        position: 'fixed', top: 0, left: 0, width: w, height: '100vh',
        background: '#101010', borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column', zIndex: 100,
        overflow: 'hidden', transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Brand */}
        <div style={{
          height: 72, display: 'flex', alignItems: 'center',
          padding: sidebarCollapsed ? '0 15px' : '0 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start', gap: 12,
        }}>
          <div style={{ width: 34, height: 34, background: '#22C55E', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 15px rgba(34, 197, 94, 0.2)' }}>
            <span style={{ color: '#101010', fontSize: 16, fontWeight: 950 }}>B</span>
          </div>
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: '#F5F5F5', fontWeight: 900, fontSize: 14, letterSpacing: '-0.02em' }}>Braes Creek Estate</div>
              <div style={{ color: '#22C55E', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Command Center</div>
            </div>
          )}
        </div>

        {/* Nav Sections */}
        <nav className="custom-scrollbar" style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {GROUPS.map((group) => (
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
                    {!sidebarCollapsed && isActive && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Toggle button */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={toggleSidebar} style={{
            width: '100%', padding: '10px', borderRadius: 10, cursor: 'pointer',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#7A7A7A', display: 'flex', alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between', transition: 'all 0.2s',
          }}>
            {!sidebarCollapsed && <span style={{ fontSize: 11, fontWeight: 700 }}>Collapse Menu</span>}
            {sidebarCollapsed ? <CR size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* User Footer */}
        {!sidebarCollapsed && (
          <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#101010', fontSize: 13, fontWeight: 950, flexShrink: 0 }}>P</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#F5F5F5', fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Peter Admin</div>
                <div style={{ color: '#22C55E', fontSize: 10, fontWeight: 800 }}>Estate Control</div>
              </div>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
