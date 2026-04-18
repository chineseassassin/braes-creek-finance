import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { formatCurrency, Notification } from '@/lib/data';

function AddAlertModal({ onClose }: { onClose: () => void }) {
  const { addNotification } = useAppStore();
  const [form, setForm] = useState({
    title: '',
    desc: '',
    type: 'info' as Notification['type'],
    icon: '🔔'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addNotification({
      id: '', // Will be set by store/DB
      ...form,
      created_at: new Date().toISOString(),
      read: false
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <div className="modal-title">🔔 Create New Alert</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Alert Title</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Call Vet, Order Feed" 
              required 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              className="form-input" 
              placeholder="Provide more details..." 
              style={{ minHeight: 80 }}
              value={form.desc} 
              onChange={e => setForm({...form, desc: e.target.value})} 
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Alert Priority</label>
              <select 
                className="form-select" 
                value={form.type} 
                onChange={e => setForm({...form, type: e.target.value as any})}
              >
                <option value="info">ℹ️ Info (Blue)</option>
                <option value="success">✅ Success (Green)</option>
                <option value="warning">⚠️ Warning (Amber)</option>
                <option value="danger">🚨 Danger (Red)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Icon / Emoji</label>
              <select 
                className="form-select" 
                value={form.icon} 
                onChange={e => setForm({...form, icon: e.target.value})}
              >
                <option value="🔔">🔔 Bell</option>
                <option value="📞">📞 Call</option>
                <option value="🚜">🚜 Tractor</option>
                <option value="💊">💊 Vet/Medicine</option>
                <option value="🌾">🌾 Feed</option>
                <option value="💰">💰 Finance</option>
                <option value="⚠️">⚠️ Warning</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <button type="submit" className="btn btn-primary w-full shadow-lg">Save Alert Reminder</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const { 
    loans, maintenanceRecords, livestockUnits, 
    notifications: userNotifications, 
    markNotificationAsRead,
    deleteNotification
  } = useAppStore();

  const [showAddModal, setShowAddModal] = useState(false);

  const overdueLoans = loans.filter(l => l.status === 'overdue');
  const overdueMaint = maintenanceRecords.filter(m => m.status === 'overdue');
  const highMortality = livestockUnits.filter(l => (l.mortality_qty || 0) > 10);

  const systemNotifications = [
    ...overdueLoans.map(l => ({
      id: `system-loan-${l.id}`,
      type: 'danger' as const,
      title: 'System Alert: Overdue Loan',
      desc: `${l.lender_name} payment is late. Total balance: ${formatCurrency(l.remaining_balance)}`,
      icon: '🏦',
      created_at: l.created_at || new Date().toISOString(),
      read: false,
      isSystem: true
    })),
    ...overdueMaint.map(m => ({
      id: `system-maint-${m.id}`,
      type: 'warning' as const,
      title: 'System Alert: Maintenance',
      desc: `${m.equipment_name} maintenance was due on ${m.next_due_date}`,
      icon: '🔧',
      created_at: new Date().toISOString(),
      read: false,
      isSystem: true
    })),
    ...highMortality.map(l => ({
      id: `system-mort-${l.id}`,
      type: 'danger' as const,
      title: 'System Alert: Livestock Health',
      desc: `High mortality detected in ${l.animal_type} (${l.breed}). Count: ${l.mortality_qty}`,
      icon: '⚡',
      created_at: new Date().toISOString(),
      read: false,
      isSystem: true
    }))
  ];

  const allAlerts = [
    ...userNotifications.map(n => ({ ...n, isSystem: false })),
    ...systemNotifications
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const stats = {
    total: allAlerts.length,
    unread: allAlerts.filter(a => !a.read).length,
    system: systemNotifications.length,
    manual: userNotifications.length
  };

  return (
    <div className="alerts-page" style={{ animation: 'fadeIn 0.5s ease' }}>
      {showAddModal && <AddAlertModal onClose={() => setShowAddModal(false)} />}

      <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="page-title">🔔 Alerts & Notifications</div>
          <div className="page-subtitle">Manage system triggers and manual team reminders</div>
        </div>
        <button className="btn btn-primary shadow-lg" onClick={() => setShowAddModal(true)}>
          + Add Manual Alert
        </button>
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        <div className="kpi-card blue">
          <div className="kpi-label">Total Alerts</div>
          <div className="kpi-value">{stats.total}</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-label">Pending Action</div>
          <div className="kpi-value">{stats.unread}</div>
        </div>
        <div className="kpi-card amber">
          <div className="kpi-label">System Triggers</div>
          <div className="kpi-value">{stats.system}</div>
        </div>
        <div className="kpi-card teal">
          <div className="kpi-label">User Reminders</div>
          <div className="kpi-value">{stats.manual}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">📝 Notification History</div>
        <div className="search-bar" style={{ marginBottom: 20 }}>
          <input className="form-input" placeholder="Search alerts..." style={{ maxWidth: 400 }} />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Type</th>
                <th>Title & Description</th>
                <th>Source</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allAlerts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
                    <p>No alerts or notifications yet.</p>
                  </td>
                </tr>
              ) : (
                allAlerts.map(alert => (
                  <tr key={alert.id} style={{ opacity: alert.read ? 0.6 : 1 }}>
                    <td>
                      <span className={`badge ${alert.read ? 'badge-gray' : 'badge-blue pulse'}`}>
                        {alert.read ? 'Archived' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div className={`notification-item-icon ${alert.type}`} style={{ fontSize: 20 }}>{alert.icon}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: 'hsl(var(--text-primary))' }}>{alert.title}</div>
                      <div style={{ fontSize: 12, color: 'hsl(var(--text-muted))' }}>{alert.desc}</div>
                    </td>
                    <td>
                      <span className={`badge ${alert.isSystem ? 'badge-amber' : 'badge-teal'}`}>
                        {alert.isSystem ? 'System' : 'Manual'}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'hsl(var(--text-muted))' }}>
                      {new Date(alert.created_at).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                        {!alert.read && !alert.isSystem && (
                          <button 
                            className="btn btn-ghost btn-sm" 
                            onClick={() => markNotificationAsRead(alert.id)}
                            style={{ color: 'hsl(var(--accent-blue))' }}
                          >
                            Acknowledge
                          </button>
                        )}
                        {!alert.isSystem && (
                          <button 
                            className="btn btn-ghost btn-sm btn-icon" 
                            title="Delete Alert"
                            onClick={() => deleteNotification(alert.id)}
                            style={{ color: 'hsl(var(--accent-red))' }}
                          >
                            🗑
                          </button>
                        )}
                        {alert.isSystem && (
                          <span style={{ fontSize: 11, color: 'hsl(var(--text-muted))', fontStyle: 'italic' }}>Auto-resolver active</span>
                        )}
                        {alert.read && <span style={{ color: 'hsl(var(--accent-green))' }}>✓</span>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .pulse {
          animation: badgePulse 2s infinite;
        }
        @keyframes badgePulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      `}</style>
    </div>
  );
}
