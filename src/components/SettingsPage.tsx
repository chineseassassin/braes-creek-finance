'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { BUSINESS_SEGMENTS } from '@/lib/data';

export default function SettingsPage() {
  const { currentUser, clearAllData } = useAppStore();
  const [activeTab, setActiveTab] = useState('account');
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [role, setRole] = useState(currentUser?.role || 'User');
  const [currency, setCurrency] = useState('USD');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingSegment, setIsAddingSegment] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [segments, setSegments] = useState(BUSINESS_SEGMENTS.map(s => ({
    id: s.id,
    title: s.name,
    desc: 'Operational unit',
    icon: s.icon
  })));
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // FEATURE REQUEST: Nuke Logic
  const [showNukeModal, setShowNukeModal] = useState(false);
  const [nukeConfirm, setNukeConfirm] = useState('');

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
    <div className="settings-page" style={{ animation: 'fadeIn 0.6s ease' }}>
      <div className="page-header">
        <div className="page-title">⚙️ Platform Settings</div>
        <p className="page-subtitle">Manage your account, preferences, and business configurations</p>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>👤 Account</button>
        <button className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>🔔 Notifications</button>
        <button className={`tab-btn ${activeTab === 'business' ? 'active' : ''}`} onClick={() => setActiveTab('business')}>🏢 Business</button>
        <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>🔒 Security</button>
        <button className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`} onClick={() => setActiveTab('system')}>📟 System</button>
      </div>

      <div className="settings-content card" style={{ padding: '32px' }}>
        {activeTab === 'account' && (
          <div className="settings-section">
            <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Profile Information</h3>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="login-input" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="login-input" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="settings-section" style={{ animation: 'visionPop 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '16px', color: '#ef4444' }}>Danger Zone: System Erasure</h3>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '14px', marginBottom: '32px', maxWidth: '600px' }}>
              Executing a system wipe will return the Braes Creek Platform to its factory state. All ledger entries, loans, and historical logs will be permanently deleted.
            </p>
            
            <div style={{ border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '24px', padding: '32px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '4px', color: '#ef4444' }}>Master Repository Reset</h4>
                    <p style={{ fontSize: '13px', opacity: 0.7 }}>Wipe all local and synchronized data modules instantly.</p>
                  </div>
                  <button 
                    onClick={() => setShowNukeModal(true)}
                    style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '100px', fontWeight: 900, cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    RESET ALL DATA
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* Support for other tabs for complete demo feel */}
        {(activeTab === 'notifications' || activeTab === 'business' || activeTab === 'security') && (
          <div style={{ color: 'hsl(var(--text-muted))', textAlign: 'center', padding: '100px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
            <div style={{ fontSize: '16px', fontWeight: 900 }}>Module Online</div>
            <p style={{ fontSize: '13px' }}>Standard cloud preferences are currently active for this demo.</p>
          </div>
        )}
      </div>

      {/* MASTER RESET MODAL (Feature Request #2) */}
      {showNukeModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(32px)' }}>
           <div style={{ width: '100%', maxWidth: '520px', background: 'hsl(var(--bg-card))', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '40px', padding: '56px', boxShadow: '0 0 100px rgba(0,0,0,0.5)', textAlign: 'center' }}>
              <div style={{ fontSize: '80px', marginBottom: '24px', filter: 'drop-shadow(0 0 20px #ef444460)' }}>⚠️</div>
              <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '16px', letterSpacing: '-0.03em' }}>Confirm Factory Reset</h2>
              <div style={{ color: '#ef4444', fontSize: '14px', fontWeight: 900, marginBottom: '40px', background: 'rgba(239, 68, 68, 0.1)', padding: '20px', borderRadius: '24px', border: '1px dashed #ef444480' }}>
                WARNING: Once deleted all data inputted will be loss. This infrastructure operation cannot be reversed.
              </div>
              
              <div style={{ textAlign: 'left', marginBottom: '40px' }}>
                 <label style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', opacity: 0.6, display: 'block', marginBottom: '12px', letterSpacing: '0.1em' }}>Type "DELETE" to authenticate</label>
                 <input 
                    type="text" 
                    placeholder="ENTER CODE"
                    className="login-input"
                    value={nukeConfirm}
                    onChange={e => setNukeConfirm(e.target.value.toUpperCase())}
                    style={{ textAlign: 'center', fontSize: '24px', fontWeight: 900, letterSpacing: '0.3em', background: 'rgba(255,255,255,0.05)', border: nukeConfirm === 'DELETE' ? '1px solid #ef4444' : '1px solid hsl(var(--border))' }}
                    autoFocus
                 />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                 <button onClick={() => { setShowNukeModal(false); setNukeConfirm(''); }} style={{ flex: 1, border: '1px solid hsl(var(--border))', background: 'transparent', padding: '18px', borderRadius: '100px', fontWeight: 900, cursor: 'pointer', color: 'hsl(var(--text-muted))' }}>Abort</button>
                 <button 
                    disabled={nukeConfirm !== 'DELETE'}
                    onClick={() => {
                      clearAllData();
                      setShowNukeModal(false);
                      setNukeConfirm('');
                      alert('System Successfully Erased. Ready for new data entries.');
                    }}
                    style={{ flex: 1, border: 'none', background: nukeConfirm === 'DELETE' ? '#ef4444' : '#222', color: '#fff', padding: '18px', borderRadius: '100px', fontWeight: 900, cursor: 'pointer', opacity: nukeConfirm === 'DELETE' ? 1 : 0.4 }}
                 >
                    Confirm Reset
                 </button>
              </div>
           </div>
        </div>
      )}

      <style jsx>{`
        .form-label { display: block; font-size: 12px; font-weight: 700; color: hsl(var(--text-muted)); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
        .login-input { width: 100%; background: hsl(var(--bg-secondary)); border: 1px solid hsl(var(--border)); border-radius: 12px; padding: 12px 16px; color: hsl(var(--text-primary)); font-size: 14px; outline: none; transition: border 0.3s ease; }
        .login-input:focus { border-color: hsl(var(--accent-blue)); }
        .tab-btn { background: none; border: none; padding: 12px 24px; font-size: 14px; font-weight: 800; cursor: pointer; color: hsl(var(--text-muted)); border-bottom: 2px solid transparent; transition: all 0.3s; }
        .tab-btn.active { color: hsl(var(--text-primary)); border-bottom-color: hsl(var(--accent-blue)); }
      `}</style>
    </div>
  );
}
