'use client';
import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/data';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { loans, maintenanceRecords, livestockUnits } = useAppStore();

  const overdueLoans = loans.filter(l => l.status === 'overdue');
  const overdueMaint = maintenanceRecords.filter(m => m.status === 'overdue');
  const highMortality = livestockUnits.filter(l => (l.mortality_qty || 0) > 10);

  const notifications = [
    ...overdueLoans.map(l => ({
      id: `loan-${l.id}`,
      type: 'danger',
      title: 'Overdue Loan Payment',
      desc: `${l.lender_name}: ${formatCurrency(l.remaining_balance)} overdue`,
      icon: '🏦'
    })),
    ...overdueMaint.map(m => ({
      id: `maint-${m.id}`,
      type: 'warning',
      title: 'Maintenance Required',
      desc: `${m.equipment_name} was due on ${m.next_due_date}`,
      icon: '🔧'
    })),
    ...highMortality.map(l => ({
      id: `mort-${l.id}`,
      type: 'danger',
      title: 'High Mortality Alert',
      desc: `${l.animal_type} (${l.breed}) has ${l.mortality_qty} mortality count`,
      icon: '💀'
    }))
  ];

  const totalCount = notifications.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
            <h3>Notifications</h3>
            {totalCount > 0 && <span className="notification-count">{totalCount} New</span>}
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <span>✨</span>
                <p>All clear! No pending alerts.</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`notification-item ${n.type}`}>
                  <div className="notification-item-icon">{n.icon}</div>
                  <div className="notification-item-content">
                    <div className="notification-item-title">{n.title}</div>
                    <div className="notification-item-desc">{n.desc}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="notification-footer">
            <button className="btn btn-ghost btn-sm" style={{ width: '100%' }}>View All Alerts</button>
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
          background: hsl(var(--accent-blue) / 0.15);
          color: hsl(var(--accent-blue));
          padding: 2px 8px;
          border-radius: 100px;
          text-transform: uppercase;
        }

        .notification-list {
          max-height: 380px;
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

        .notification-item:hover {
          background: hsl(var(--bg-secondary) / 0.5);
        }

        .notification-item.danger {
          border-left: 3px solid hsl(var(--accent-red));
        }

        .notification-item.warning {
          border-left: 3px solid hsl(var(--accent-amber));
        }

        .notification-item-icon {
          font-size: 18px;
          flex-shrink: 0;
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
