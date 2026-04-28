'use client'
interface TopbarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header className="topbar">
      <div style={{ flex: 1 }}>
        <div className="topbar-title">{title}</div>
        {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
      </div>
      <div className="topbar-actions">
        {actions}
        <button className="topbar-btn" title="Notifications">🔔</button>
        <button className="topbar-btn" title="Help">❓</button>
      </div>
    </header>
  )
}
