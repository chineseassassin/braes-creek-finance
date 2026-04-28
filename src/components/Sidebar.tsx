'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { href: '/', label: 'Dashboard', icon: '📊' },
      { href: '/reports', label: 'Reports', icon: '📈' },
      { href: '/documents', label: 'Documents', icon: '📁' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/expenses', label: 'Expenses', icon: '💸' },
      { href: '/loans', label: 'Loans', icon: '💰', badge: '3' },
      { href: '/payroll', label: 'Payroll', icon: '💼' },
      { href: '/budgets', label: 'Budgets', icon: '🎯' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/labor', label: 'Labor', icon: '👷' },
      { href: '/livestock', label: 'Livestock', icon: '🐄' },
      { href: '/crops', label: 'Crops', icon: '🌱' },
      { href: '/feed-supplies', label: 'Feed & Supplies', icon: '🌾' },
    ],
  },
  {
    label: 'Management',
    items: [
      { href: '/vendors', label: 'Vendors', icon: '🏪' },
      { href: '/settings', label: 'Settings', icon: '⚙️' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">🌿</div>
        <div className="logo-text">
          <span>AgroFinance</span>
          <span>Pro Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map((item) => {
              const isActive = item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item${isActive ? ' active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="user-avatar">A</div>
        <div className="user-info">
          <span>Admin User</span>
          <span>Administrator</span>
        </div>
      </div>
    </aside>
  )
}
