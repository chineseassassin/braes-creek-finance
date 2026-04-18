'use client';
import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { formatCurrency, Notification } from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { loans, maintenanceRecords, livestockUnits, notifications: userNotifications, addNotification, markNotificationAsRead } = useAppStore();

  const [form, setForm] = useState({ title: '', desc: '', type: 'info' as Notification['type'], icon: '📝' });

  const overdueLoans = loans.filter(l => l.status === 'overdue');
  const overdueMaint = maintenanceRecords.filter(m => m.status === 'overdue');
  const highMortality = livestockUnits.filter(l => (l.mortality_qty || 0) > 10);

  const systemNotifications = [
    ...overdueLoans.map(l => ({
      id: `loan-${l.id}`,
      type: 'danger' as const,
      title: 'Overdue Loan Payment',
      desc: `${l.lender_name}: ${formatCurrency(l.remaining_balance)} overdue`,
      icon: '🏦',
      created_at: new Date().toISOString(),
      read: false
    })),
    ...overdueMaint.map(m => ({
      id: `maint-${m.id}`,
      type: 'warning' as const,
      title: 'Maintenance Required',
      desc: `${m.equipment_name} was due on ${m.next_due_date}`,
      icon: '🔧',
      created_at: new Date().toISOString(),
      read: false
    })),
    ...highMortality.map(l => ({
      id: `mort-${l.id}`,
      type: 'danger' as const,
      title: 'High Mortality Alert',
      desc: `${l.animal_type} (${l.breed}) has ${l.mortality_qty} mortality count`,
      icon: '💀',
      created_at: new Date().toISOString(),
      read: false
    }))
  ];

  const allNotifications = [...systemNotifications, ...userNotifications.filter(n => !n.read)];
  const totalCount = allNotifications.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowAddForm(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setShowAddForm(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;

    addNotification({
      id: uuidv4(),
      ...form,
      created_at: new Date().toISOString(),
      read: false
    });

    setForm({ title: '', desc: '', type: 'info', icon: '📝' });
    setShowAddForm(false);
  };

  return (
    <div className="notification-center-wrapper" ref={dropdownRef}>
      <button 
        className="btn btn-ghost btn-icon notification-btn"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && totalCount > 0) {
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.volume = 0.4;
              audio.play().catch(() => {});
            } catch (e) {}
          }
        }}
        style={{ position: 'relative' }}
      >
        <span style={{ fontSize: 18 }}>🔔</span>
        {totalCount > 0 && <span className="notification-dot" />}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>{showAddForm ? 'Create New Alert' : 'Notifications'}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {!showAddForm && totalCount > 0 && <span className="notification-count">{totalCount} New</span>}
              <button 
                className="btn btn-ghost btn-icon btn-sm" 
                onClick={() => setShowAddForm(!showAddForm)}
                title={showAddForm ? 'View Notifications' : 'Add Notification'}
              >
                {showAddForm ? '🔙' : '➕'}
              </button>
            </div>
          </div>
          
          <div className="notification-list">
            {showAddForm ? (
              <form onSubmit={handleSubmit} style={{ padding: 20 }}>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Title</label>
                  <input 
                    className="form-input" 
                    placeholder="e.g. Order Fertilizer" 
                    value={form.title} 
                    onChange={e => setForm({...form, title: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Description</label>
                  <textarea 
                    className="form-input" 
                    placeholder="Details for this alert..." 
                    rows={2} 
                    value={form.desc} 
                    onChange={e => setForm({...form, desc: e.target.value})} 
                  />
                </div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Type</label>
                    <select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value as any})}>
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="danger">Danger</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ width: 80 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Icon</label>
                    <select className="form-select" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})}>
                      <option value="📝">📝</option>
                      <option value="💡">💡</option>
                      <option value="⚡">⚡</option>
                      <option value="🛑">🛑</option>
                      <option value="✅">✅</option>
                      <option value="🚜">🚜</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-full">💾 Save Alert</button>
              </form>
            ) : allNotifications.length === 0 ? (
              <div className="notification-empty">
                <span>✨</span>
                <p>All clear! No pending alerts.</p>
              </div>
            ) : (
              allNotifications.map(n => (
                <div key={n.id} className={`notification-item ${n.type}`} onClick={() => n.id.includes('-') ? markNotificationAsRead(n.id) : null}>
                  <div className="notification-item-icon">{n.icon}</div>
                  <div className="notification-item-content">
                    <div className="notification-item-title">{n.title}</div>
                    <div className="notification-item-desc">{n.desc}</div>
                  </div>
                  {userNotifications.find(un => un.id === n.id) && (
                    <button 
                      className="btn btn-ghost btn-sm btn-icon" 
                      onClick={(e) => { e.stopPropagation(); markNotificationAsRead(n.id); }}
                      style={{ fontSize: 10, opacity: 0.5 }}
                    >
                      Done
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          
          <div className="notification-footer">
            <button 
              className="btn btn-ghost btn-sm" 
              style={{ width: '100%' }}
              onClick={() => {
                const nav = (window as any).__onNavigate;
                if (nav) nav('alerts');
                setIsOpen(false);
              }}
            >
              View History
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .notification-center-wrapper {
          position: relative;
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: hsl(var(--accent-red));
          border-radius: 50%;
          border: 2px solid hsl(var(--bg-secondary));
        }

        .notification-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 320px;
          background: hsl(var(--bg-card));
          border: 1px solid hsl(var(--border-light));
          border-radius: 16px;
          box-shadow: var(--shadow-premium);
          z-index: 1000;
          overflow: hidden;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .notification-header {
          padding: 16px 20px;
          border-bottom: 1px solid hsl(var(--border) / 0.5);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .notification-header h3 {
          font-size: 14px;
          font-weight: 800;
          color: hsl(var(--text-primary));
        }

        .notification-count {
          font-size: 10px;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.6);
          padding: 2px 8px;
          border-radius: 100px;
          text-transform: uppercase;
        }

        .notification-list {
          max-height: 420px;
          overflow-y: auto;
        }

        .notification-item {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid hsl(var(--border) / 0.3);
          transition: background 0.2s ease;
          cursor: pointer;
        }

        .notification-list form {
          animation: fadeIn 0.3s ease;
        }

        .notification-item:hover {
          background: hsl(var(--bg-secondary) / 0.5);
        }

        .notification-item.danger {
          border-left: 3px solid hsl(var(--accent-red));
        }

        .notification-item.warning {
          border-left: 3px solid hsl(var(--accent-amber));
        }
        
        .notification-item.success {
          border-left: 3px solid hsl(var(--accent-green));
        }
        
        .notification-item.info {
          border-left: 3px solid hsl(var(--accent-blue));
        }

        .notification-item-icon {
          font-size: 18px;
          flex-shrink: 0;
        }

        .notification-item-content {
          flex: 1;
        }

        .notification-item-title {
          font-size: 13px;
          font-weight: 700;
          color: hsl(var(--text-primary));
          margin-bottom: 2px;
        }

        .notification-item-desc {
          font-size: 12px;
          color: hsl(var(--text-muted));
          line-height: 1.4;
        }

        .notification-empty {
          padding: 40px 20px;
          text-align: center;
          color: hsl(var(--text-muted));
        }

        .notification-empty span {
          font-size: 24px;
          display: block;
          margin-bottom: 8px;
        }

        .notification-footer {
          padding: 12px;
          background: hsl(var(--bg-secondary) / 0.3);
          border-top: 1px solid hsl(var(--border) / 0.5);
        }

        @media (max-width: 768px) {
          .notification-dropdown {
            width: calc(100vw - 32px);
            right: -60px;
          }
        }
      `}</style>
    </div>
  );
}
