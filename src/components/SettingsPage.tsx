'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';

export default function SettingsPage() {
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState('account');
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [role, setRole] = useState(currentUser.role);
  const [currency, setCurrency] = useState('USD');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingSegment, setIsAddingSegment] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [segments, setSegments] = useState([
    { id: 1, title: 'Braes Creek HQ', desc: 'Primary management location', icon: '🏢' }
  ]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1200);
  };

  const handleAddSegmentConfirm = () => {
    if (newSegmentName.trim()) {
      setSegments([...segments, { 
        id: Date.now(), 
        title: newSegmentName, 
        desc: 'New operational unit', 
        icon: '🚜' 
      }]);
      setNewSegmentName('');
      setIsAddingSegment(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div className="page-title">⚙️ Platform Settings</div>
        <p className="page-subtitle">Manage your account, preferences, and business configurations</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >👤 Account</button>
        <button 
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >🔔 Notifications</button>
        <button 
          className={`tab-btn ${activeTab === 'business' ? 'active' : ''}`}
          onClick={() => setActiveTab('business')}
        >🏢 Business</button>
        <button 
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >🔒 Security</button>
      </div>

      <div className="settings-content card" style={{ padding: '32px' }}>
        {activeTab === 'account' && (
          <div className="settings-section">
            <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Profile Information</h3>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="login-input" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="login-input" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="login-input" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Auditor">Auditor</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Default Currency</label>
                <select className="login-input" value={currency} onChange={e => setCurrency(e.target.value)}>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="settings-section">
            <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Notification Preferences</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div 
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'hsl(var(--bg-secondary) / 0.3)', borderRadius: '12px', border: '1px solid hsl(var(--border) / 0.5)' }}
                onClick={() => setEmailNotifications(!emailNotifications)}
              >
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>Email Summary</div>
                  <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>Receive daily financial summaries via email</div>
                </div>
                <input type="checkbox" checked={emailNotifications} readOnly style={{ width: '20px', height: '20px', accentColor: 'hsl(var(--accent-blue))' }} />
              </div>
              
              <div 
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'hsl(var(--bg-secondary) / 0.3)', borderRadius: '12px', border: '1px solid hsl(var(--border) / 0.5)' }}
                onClick={() => setPushNotifications(!pushNotifications)}
              >
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>Push Alerts</div>
                  <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>Real-time browser notifications for overdue loans</div>
                </div>
                <input type="checkbox" checked={pushNotifications} readOnly style={{ width: '20px', height: '20px', accentColor: 'hsl(var(--accent-blue))' }} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'business' && (
          <div className="settings-section">
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Business Configuration</h3>
            <p style={{ color: 'hsl(var(--text-muted))', marginBottom: '24px' }}>Manage segments, locations, and asset categories.</p>
            <div className="grid-2">
              {!isAddingSegment ? (
                <div className="card" onClick={() => setIsAddingSegment(true)} style={{ background: 'hsl(var(--bg-secondary) / 0.3)', borderStyle: 'dashed', cursor: 'pointer' }}>
                  <div style={{ fontSize: '24px', marginBottom: '12px' }}>➕</div>
                  <div style={{ fontWeight: 700 }}>Add Segment</div>
                  <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Add a new business unit or farm section</div>
                </div>
              ) : (
                <div className="card" style={{ background: 'hsl(var(--bg-secondary) / 0.8)', border: '1px solid hsl(var(--accent-blue))' }}>
                  <div style={{ fontWeight: 700, marginBottom: '12px' }}>New Segment Name</div>
                  <input 
                    type="text" 
                    className="login-input" 
                    placeholder="e.g. North Pasture"
                    value={newSegmentName}
                    onChange={(e) => setNewSegmentName(e.target.value)}
                    style={{ marginBottom: '12px' }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={handleAddSegmentConfirm}>Add</button>
                    <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setIsAddingSegment(false)}>Cancel</button>
                  </div>
                </div>
              )}
              {segments.map(seg => (
                <div className="card" key={seg.id} style={{ background: 'hsl(var(--bg-secondary) / 0.3)' }}>
                  <div style={{ fontSize: '24px', marginBottom: '12px' }}>{seg.icon}</div>
                  <div style={{ fontWeight: 700 }}>{seg.title}</div>
                  <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>{seg.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="settings-section">
            <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Security Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  setResetSent(true);
                  setTimeout(() => setResetSent(false), 3000);
                }}
                disabled={resetSent}
                style={{ 
                  borderStyle: 'solid', 
                  borderColor: resetSent ? 'hsl(var(--accent-green))' : 'hsl(var(--accent-red) / 0.3)', 
                  color: resetSent ? 'hsl(var(--accent-green))' : 'hsl(var(--accent-red))', 
                  alignSelf: 'flex-start' 
                }}
              >
                {resetSent ? '✓ Reset link sent' : 'Reset Password'}
              </button>
              
              <div 
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'hsl(var(--bg-secondary) / 0.3)', borderRadius: '12px', border: '1px solid hsl(var(--border) / 0.5)' }}
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              >
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>Two-Factor Authentication (2FA)</div>
                  <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>Require a security code to sign in</div>
                </div>
                <div style={{
                  width: '40px', height: '24px', background: twoFactorEnabled ? 'hsl(var(--accent-blue))' : 'hsl(var(--text-muted) / 0.3)',
                  borderRadius: '12px', position: 'relative', transition: 'all 0.2s'
                }}>
                  <div style={{
                    width: '18px', height: '18px', background: 'white', borderRadius: '50%',
                    position: 'absolute', top: '3px', left: twoFactorEnabled ? '19px' : '3px', transition: 'all 0.2s'
                  }} />
                </div>
              </div>

              <div style={{ marginTop: '8px', padding: '16px', background: 'hsl(var(--accent-amber) / 0.05)', borderRadius: '12px', border: '1px solid hsl(var(--accent-amber) / 0.1)' }}>
                <div style={{ color: 'hsl(var(--accent-amber))', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>Advanced Protection</div>
                <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>
                  {twoFactorEnabled 
                    ? 'Security is now actively managed by your local profile. You will be prompted at next login.' 
                    : 'Security configurations are currently synced with your Google Workspace / Supabase Admin.'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
        <button className="btn btn-ghost">Discard Changes</button>
        <button 
          className={`btn btn-primary ${isSaving ? 'animate-pulse' : ''}`} 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>


      <style jsx>{`
        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: hsl(var(--text-muted));
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .login-input {
          width: 100%;
          background: hsl(var(--bg-secondary));
          border: 1px solid hsl(var(--border));
          border-radius: 12px;
          padding: 12px 16px;
          color: hsl(var(--text-primary));
          font-size: 14px;
          outline: none;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}
