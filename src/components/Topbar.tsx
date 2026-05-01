'use client'
import { useUIStore } from '@/store/useUIStore'
import NotificationCenter from '@/components/NotificationCenter'
import ThemeToggle from '@/components/ThemeToggle'

interface TopbarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  const { sidebarCollapsed } = useUIStore()

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--bg-sidebar)',
      borderBottom: '1px solid var(--border-soft)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      height: 72,
      width: '100%',
      boxSizing: 'border-box',
    }}>
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginTop: 2 }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ThemeToggle />
        <NotificationCenter />
        {actions && (
          <>
            <div style={{ width: 1, height: 24, background: 'var(--border-soft)', margin: '0 4px' }} />
            {actions}
          </>
        )}
      </div>
    </header>
  )
}
