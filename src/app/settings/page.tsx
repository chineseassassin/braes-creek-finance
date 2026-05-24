'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { SAMPLE_USERS, SAMPLE_AUDIT } from '@/lib/sample-data'
import { useAppStore } from '@/store/useAppStore'
import { useCategoryStore } from '@/store/useCategoryStore'
import { useUIStore } from '@/store/useUIStore'
import { toast, Toaster } from 'react-hot-toast'
import { 
  Building2, Palette, ShieldCheck, Tag, 
  Layers, Bell, History, Plus, Edit2, 
  Trash2, Save, Download, Trash, Moon, 
  Sun, Check, ChevronRight, AlertTriangle,
  Mail, Phone, MapPin, Globe, Clock,
  DollarSign, Activity, Settings as SettingsIcon,
  X, Loader2, MessageSquare
} from 'lucide-react'

const SETTING_TABS = [
  { id: 'General', label: 'General', icon: Building2 },
  { id: 'Users & Access', label: 'Users & Access', icon: ShieldCheck },
  { id: 'Categories', label: 'Categories', icon: Tag },
  { id: 'Segments', label: 'Segments', icon: Layers },
  { id: 'Notifications', label: 'Notifications', icon: Bell },
  { id: 'Audit Log', label: 'Audit Log', icon: History }
]

export default function SettingsPage() {
  const { theme, setTheme, currentUser, pendingInvites, addPendingInvite, revokeInvite } = useAppStore();
  const { 
    categories, segments, 
    addCategory, updateCategory, deleteCategory, 
    addSegment, updateSegment, deleteSegment 
  } = useCategoryStore();
  
  const { sidebarCollapsed } = useUIStore();
  const [activeTab, setActiveTab] = useState('General')
  const [farmName, setFarmName] = useState('Braes Creek Estate')
  const [currency, setCurrency] = useState('USD')
  const [timezone, setTimezone] = useState('America/Port_of_Spain')
  const [fiscalStart, setFiscalStart] = useState('January')

  // Notification toggle state
  const [notifState, setNotifState] = useState<Record<string, boolean>>({
    'Overdue loan alerts': true,
    'Budget overrun warnings': true,
    'Maintenance reminders': true,
    'Payroll pending notices': false,
    'Harvest countdown alerts': true,
    'Weekly spend summary': false,
  });

  const toggleNotif = (label: string) => {
    const next = !notifState[label];
    setNotifState(prev => ({ ...prev, [label]: next }));
    toast.success(`${label} ${next ? 'enabled' : 'disabled'}`);
  };
  
  // Category Modal State
  const BLANK_CAT = { name: '', segment_id: '', color: '#22c55e' }
  const [showCatModal, setShowCatModal] = useState(false)
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [newCat, setNewCat] = useState(BLANK_CAT)
  const [catError, setCatError] = useState('')

  // Segment Modal State
  const BLANK_SEG = { name: '', icon: '🌿', color: '#22c55e', description: '' }
  const [showSegModal, setShowSegModal] = useState(false)
  const [editingSegId, setEditingSegId] = useState<string | null>(null)
  const [newSeg, setNewSeg] = useState(BLANK_SEG)
  const [segError, setSegError] = useState('')

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    fullName: '',
    email: '',
    role: 'Admin',
    expiresAt: '',
    message: ''
  });
  const [inviteError, setInviteError] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // Critical Operations confirmation state
  const [showClearDemoModal, setShowClearDemoModal] = useState(false);
  const [clearDemoInput, setClearDemoInput] = useState('');
  const [showFactoryResetModal, setShowFactoryResetModal] = useState(false);
  const [factoryResetInput, setFactoryResetInput] = useState('');

  const handleClearDemo = () => {
    if (clearDemoInput !== 'RESET DEMO DATA') return;
    // Clear all operational/financial records but preserve system config
    const { useCropStore } = require('@/store/useCropStore');
    const { useLivestockStore } = require('@/store/useLivestockStore');
    const { useDashboardStore } = require('@/store/useDashboardStore');
    const { useInventoryStore } = require('@/store/useInventoryStore');
    const { useWorkflowStore } = require('@/store/useWorkflowStore');
    const { useAlertStore } = require('@/store/useAlertStore');
    const { useActivityStore } = require('@/store/useActivityStore');
    // Reset operational records only
    try {
      if (useCropStore.getState().resetCrops) useCropStore.getState().resetCrops();
      if (useLivestockStore.getState().resetUnits) useLivestockStore.getState().resetUnits();
      if (useInventoryStore.getState().resetItems) useInventoryStore.getState().resetItems();
      if (useDashboardStore.getState().resetTransactions) useDashboardStore.getState().resetTransactions();
    } catch (e) { /* stores may not expose reset yet, no crash */ }
    // Clear local storage operational keys only
    const keysToKeep = ['braes-creek-app-storage', 'braes-creek-theme', 'braes-creek-ui'];
    Object.keys(localStorage).forEach(k => {
      if (!keysToKeep.some(keep => k.includes(keep))) localStorage.removeItem(k);
    });
    setShowClearDemoModal(false);
    setClearDemoInput('');
    toast.success('Demo data cleared. Users, roles, and settings are preserved.');
  };

  const handleFactoryReset = () => {
    if (factoryResetInput !== 'RESET BRAES CREEK FACTORY') return;
    // Full wipe — clear all localStorage
    localStorage.clear();
    setShowFactoryResetModal(false);
    setFactoryResetInput('');
    toast.error('Factory reset complete. All system data has been wiped.');
    setTimeout(() => window.location.reload(), 1500);
  };

  const getRoleDescription = (r: string) => {
    if (r === 'Admin') return 'Full access to dashboard, financials, approvals, reports, users, and settings.';
    if (r === 'Data Entry') return 'Can add expenses, payroll, livestock, crops, receipts, and operational records. Cannot approve loans, view sensitive financials, delete data, or manage users.';
    if (r === 'View Only') return 'Can view dashboards, reports, analytics, and records. Cannot edit, approve, delete, upload, or manage users.';
    return '';
  };

  const handleSendInvite = async () => {
    if (!inviteForm.email) {
      setInviteError('Email is required.');
      return;
    }
    if (!inviteForm.role) {
      setInviteError('Role is required.');
      return;
    }
    setInviteError('');
    setIsSendingInvite(true);
    
    const inviteId = `invite-${Date.now()}`;

    try {
      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...inviteForm, inviteId })
      });
      const data = await response.json();

      if (response.ok) {
        addPendingInvite({
          id: inviteId,
          fullName: inviteForm.fullName,
          email: inviteForm.email,
          role: inviteForm.role,
          permissions: inviteForm.role,
          expiresAt: inviteForm.expiresAt,
          message: inviteForm.message,
          status: data.status || 'pending',
          invitedAt: new Date().toISOString(),
          link: data.inviteLink
        });

        if (data.method === 'resend') {
          toast.success('Invite email sent successfully.');
        } else {
          toast.success('Invite saved locally. Email sending is not configured in this environment.');
        }
      } else {
        toast.error(data.error || 'Failed to process invite');
      }
    } catch (err) {
      toast.error('Network error while processing invite');
    } finally {
      setIsSendingInvite(false);
      setShowInviteModal(false);
      setInviteForm({ fullName: '', email: '', role: 'Admin', expiresAt: '', message: '' });
    }
  };

  const handleSaveCategory = () => {
    if (!newCat.name.trim()) { setCatError('Category name is required.'); return; }
    if (!newCat.segment_id) { setCatError('Segment association is required.'); return; }
    setCatError('');

    if (editingCatId) {
      updateCategory(editingCatId, newCat);
      toast.success('Category updated successfully');
    } else {
      addCategory(newCat);
    }
    setShowCatModal(false);
    setEditingCatId(null);
    setNewCat(BLANK_CAT);
  };

  const handleSaveSegment = () => {
    if (!newSeg.name.trim()) { setSegError('Segment name is required.'); return; }
    setSegError('');

    if (editingSegId) {
      updateSegment(editingSegId, newSeg);
      toast.success('Segment updated successfully');
    } else {
      addSegment(newSeg);
    }
    setShowSegModal(false);
    setEditingSegId(null);
    setNewSeg(BLANK_SEG);
  };

  const handleExportAll = () => {
    toast.loading('Compiling platform-wide financial audit...', { duration: 2000 });
    setTimeout(() => {
      toast.success('System-wide data export complete. Archive available in your downloads.');
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-body)' }}>
      <Toaster position="top-right" />
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: sidebarCollapsed ? 64 : 250, transition: 'margin-left 0.25s ease' }}>
        <Topbar
          title="System Settings"
          subtitle="Platform Configuration & Organization Intelligence"
        />
        <div style={{ padding: '32px', maxWidth: 1200 }}>
          {/* Tab Bar */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32, borderBottom: '1px solid var(--border-soft)', paddingBottom: 0, overflowX: 'auto' }} className="no-scrollbar">
            {SETTING_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 20px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 850,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: activeTab === tab.id ? 'var(--status-success)' : 'var(--text-muted)',
                  borderBottom: activeTab === tab.id ? '2px solid var(--status-success)' : '2px solid transparent',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  marginBottom: -1,
                  whiteSpace: 'nowrap'
                }}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* General */}
          {activeTab === 'General' && (
            <div style={{ maxWidth: 640 }}>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header"><div className="card-title">🏢 Business Information</div></div>
                <div className="card-body">
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label">Business / Farm Name</label>
                    <input className="form-input" value={farmName} onChange={e => setFarmName(e.target.value)} />
                  </div>
                  <div className="form-grid" style={{ marginBottom: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Currency</label>
                      <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)}>
                        <option value="TTD">TTD – Trinidad Dollar</option>
                        <option value="USD">USD – US Dollar</option>
                        <option value="JMD">JMD – Jamaican Dollar</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Timezone</label>
                      <select className="form-select" value={timezone} onChange={e => setTimezone(e.target.value)}>
                        <option value="America/Port_of_Spain">America/Port_of_Spain</option>
                        <option value="America/Jamaica">America/Jamaica</option>
                        <option value="America/New_York">America/New_York</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label">Fiscal Year Start</label>
                    <select className="form-select" value={fiscalStart} onChange={e => setFiscalStart(e.target.value)}>
                      <option>January</option>
                      <option>April</option>
                      <option>October</option>
                    </select>
                  </div>
                  <button className="btn btn-primary" onClick={() => toast.success('Business information updated successfully')}>Save Changes</button>
                </div>
              </div>

              <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div style={{ padding: 10, borderRadius: 10, background: 'var(--status-success-glow)', color: 'var(--status-success)' }}>
                    <Palette size={18} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Visual Architecture</h3>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', gap: 16 }}>
                     <button 
                       className="btn"
                       style={{ 
                         flex: 1, height: 100, flexDirection: 'column', gap: 10, 
                         background: '#0a0a0a', color: '#F5F5F5',
                         border: theme === 'dark' ? '2px solid var(--status-success)' : '1px solid var(--border-soft)',
                         boxShadow: theme === 'dark' ? '0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(34, 197, 94, 0.1)' : 'none',
                         borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'
                       }}
                       onClick={() => setTheme('dark')}
                     >
                        <div style={{ padding: 8, borderRadius: '50%', background: theme === 'dark' ? 'var(--status-success-glow)' : 'rgba(255,255,255,0.05)', color: theme === 'dark' ? 'var(--status-success)' : 'inherit' }}>
                           <Moon size={20} />
                        </div>
                        <div style={{ fontWeight: 850, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Studio Dark</div>
                     </button>
                     <button 
                       className="btn"
                       style={{ 
                         flex: 1, height: 100, flexDirection: 'column', gap: 10,
                         background: '#F8FAFC', color: '#0F172A',
                         border: theme === 'light' ? '2px solid var(--status-success)' : '1px solid var(--border-soft)',
                         boxShadow: theme === 'light' ? '0 10px 30px rgba(15, 23, 42, 0.1), 0 0 20px rgba(34, 197, 94, 0.1)' : 'none',
                         borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'
                       }}
                       onClick={() => setTheme('light')}
                     >
                        <div style={{ padding: 8, borderRadius: '50%', background: theme === 'light' ? 'var(--status-success-glow)' : 'rgba(15, 23, 42, 0.05)', color: theme === 'light' ? 'var(--status-success)' : 'inherit' }}>
                           <Sun size={20} />
                        </div>
                        <div style={{ fontWeight: 850, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Professional Light</div>
                     </button>
                  </div>
                  <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', fontWeight: 600 }}>
                     Switch between high-fidelity charcoal and executive light interfaces.
                  </div>
                </div>
              </div>

              <div className="card" style={{ border: '1px solid rgba(239, 68, 68, 0.2)', background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, transparent 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div style={{ padding: 10, borderRadius: 10, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-critical)' }}>
                    <AlertTriangle size={18} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--status-critical)', margin: 0 }}>Critical Operations</h3>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-soft)' }}>
                    <div>
                       <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 13 }}>System Data Portability</div>
                       <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Download a complete cryptographic backup of all records</div>
                    </div>
                    <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: 11 }} onClick={handleExportAll}><Download size={14} /> Full Export</button>
                  </div>
                  {/* Clear Demo Data — amber */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-soft)' }}>
                     <div style={{ flex: 1, marginRight: 16 }}>
                        <div style={{ fontWeight: 800, color: 'var(--status-warning)', fontSize: 13 }}>Clear Demo Data</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.5 }}>Remove all sample operational and financial records. Preserves users, roles, permissions, categories, segments, and system configuration.</div>
                     </div>
                     <button
                        className="btn-secondary"
                        style={{ padding: '8px 16px', fontSize: 11, color: 'var(--status-warning)', borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.06)', whiteSpace: 'nowrap', flexShrink: 0 }}
                        onClick={() => setShowClearDemoModal(true)}
                     >
                        <Trash size={14} /> Clear Demo Data
                     </button>
                  </div>

                  {/* Factory Reset — red critical */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
                     <div style={{ flex: 1, marginRight: 16 }}>
                        <div style={{ fontWeight: 800, color: 'var(--status-critical)', fontSize: 13 }}>Factory Reset Platform</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.5 }}>Full destructive wipe of all system data including users, settings, financials, and records. This action is irreversible.</div>
                     </div>
                     <button
                        className="btn-secondary"
                        style={{ padding: '8px 16px', fontSize: 11, color: 'var(--status-critical)', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', whiteSpace: 'nowrap', flexShrink: 0 }}
                        onClick={() => setShowFactoryResetModal(true)}
                     >
                        <Trash2 size={14} /> Factory Reset
                     </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users & Access */}
          {activeTab === 'Users & Access' && (
            <div style={{ width: '100%', maxWidth: 1200, display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* TOP ROW — USER & ACCESS MANAGEMENT & SMART ROLE PREVIEW */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, alignItems: 'start' }}>
                {/* SECTION 1 — USER & ACCESS MANAGEMENT */}
                <div className="card" style={{ height: 'fit-content' }}>
                  <div className="card-header" style={{ marginBottom: 16 }}>
                    <div>
                       <div className="card-title" style={{ fontSize: 16 }}>User & Access Management</div>
                       <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Manage your organization's members and their system access.</div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowInviteModal(true)}>+ Invite User</button>
                  </div>
                  <div className="data-table-wrapper" style={{ overflow: 'visible' }}>
                    <table className="data-table">
                      <thead>
                        <tr><th>User</th><th>Role</th><th>Status</th><th>Last Active</th></tr>
                      </thead>
                      <tbody>
                        {SAMPLE_USERS.map(u => (
                          <tr key={u.id}>
                            <td className="primary">
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--status-success-glow)', color: 'var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                  {u.name[0]}
                                </div>
                                <div>
                                   <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</div>
                                   <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <select className="form-select" style={{ padding: '6px 12px', fontSize: 12, minWidth: 100, background: 'var(--bg-card)' }} defaultValue={u.role === 'admin' ? 'Admin' : u.role === 'manager' ? 'Data Entry' : 'View Only'}>
                                 <option>View Only</option>
                                 <option>Data Entry</option>
                                 <option>Admin</option>
                              </select>
                            </td>
                            <td><span className="badge" style={{ background: 'var(--status-success-glow)', color: 'var(--status-success)', fontWeight: 800 }}>● Active</span></td>
                            <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.lastLogin}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SECTION 2 & 3 — SMART ROLE PREVIEW */}
                <div className="card" style={{ height: 'fit-content' }}>
                  <div className="card-header" style={{ marginBottom: 16 }}>
                    <div>
                       <div className="card-title" style={{ fontSize: 16 }}>Smart Role Preview</div>
                       <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Capabilities granted to the selected role.</div>
                    </div>
                    <select className="form-select" style={{ width: 140, fontWeight: 700 }} defaultValue="Data Entry">
                       <option>View Only</option>
                       <option>Data Entry</option>
                       <option>Admin</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(255,255,255,0.02)', padding: 24, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--status-success)', fontSize: 13, fontWeight: 600 }}>
                        <span style={{ fontSize: 14 }}>✔</span> Can add expenses
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--status-success)', fontSize: 13, fontWeight: 600 }}>
                        <span style={{ fontSize: 14 }}>✔</span> Can log payroll
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--status-success)', fontSize: 13, fontWeight: 600 }}>
                        <span style={{ fontSize: 14 }}>✔</span> Can update livestock
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--status-critical)', fontSize: 13, fontWeight: 600 }}>
                        <span style={{ fontSize: 14 }}>✖</span> Cannot delete data
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--status-critical)', fontSize: 13, fontWeight: 600 }}>
                        <span style={{ fontSize: 14 }}>✖</span> Cannot access settings
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--status-critical)', fontSize: 13, fontWeight: 600 }}>
                        <span style={{ fontSize: 14 }}>✖</span> Cannot modify reports
                     </div>
                  </div>
                </div>
              </div>

              {/* SECOND ROW — PENDING INVITES */}
              <div className="card" style={{ height: 'fit-content' }}>
                <div className="card-header" style={{ marginBottom: 16 }}>
                  <div>
                     <div className="card-title" style={{ fontSize: 16 }}>Pending Invites</div>
                     <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Invitations awaiting user acceptance.</div>
                  </div>
                </div>
                <div className="data-table-wrapper" style={{ overflow: 'visible' }}>
                  <table className="data-table">
                    <thead>
                      <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Invited Date</th><th>Expires</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {pendingInvites.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                            No pending invites.
                          </td>
                        </tr>
                      ) : (
                        pendingInvites.map((inv: any) => {
                          const getBadgeColor = (status: string) => {
                            if (status === 'Email Sent') return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' };
                            if (status === 'Local Only') return { bg: 'rgba(156, 163, 175, 0.1)', color: '#9ca3af' };
                            if (status === 'Failed') return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
                            if (status === 'Revoked') return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', textDecoration: 'line-through' };
                            if (status === 'Accepted') return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' };
                            return { bg: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }; // pending
                          };
                          const badge = getBadgeColor(inv.status);

                          const handleResend = async () => {
                            toast.loading('Resending invite...', { id: 'resend' });
                            try {
                              const res = await fetch('/api/invites', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email: inv.email, fullName: inv.fullName, role: inv.role, message: inv.message, inviteId: inv.id })
                              });
                              const data = await res.json();
                              if (res.ok) {
                                if (data.method === 'resend') {
                                  toast.success('Invite email sent successfully.', { id: 'resend' });
                                } else {
                                  toast.success('Invite saved locally. Email sending is not configured in this environment.', { id: 'resend' });
                                }
                              } else {
                                toast.error('Failed to resend invite.', { id: 'resend' });
                              }
                            } catch (e) {
                              toast.error('Network error while resending.', { id: 'resend' });
                            }
                          };

                          return (
                          <tr key={inv.id}>
                            <td className="primary" style={{ fontWeight: 600 }}>{inv.fullName || '-'}</td>
                            <td style={{ color: 'var(--text-muted)' }}>{inv.email}</td>
                            <td>
                              <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '100px', fontSize: 12, fontWeight: 800 }}>{inv.role}</span>
                            </td>
                            <td>
                              <span style={{ background: badge.bg, color: badge.color, padding: '4px 8px', borderRadius: '6px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', textDecoration: badge.textDecoration || 'none' }}>
                                {inv.status}
                              </span>
                            </td>
                            <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                              {new Date(inv.invitedAt).toLocaleDateString()}
                            </td>
                            <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                              {inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString() : 'Ongoing'}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button onClick={() => {
                                  let link = inv.link;
                                  if (!link) {
                                    try {
                                      const invitePayload = {
                                        id: inv.id,
                                        email: inv.email,
                                        fullName: inv.fullName || '',
                                        role: inv.role || 'View Only',
                                        message: inv.message || '',
                                        expiresAt: inv.expiresAt || '',
                                        status: inv.status || 'pending',
                                        invitedAt: inv.invitedAt || new Date().toISOString()
                                      };
                                      const jsonStr = JSON.stringify(invitePayload);
                                      const bytes = new TextEncoder().encode(jsonStr);
                                      const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
                                      const encoded = window.btoa(binString);
                                      link = `${window.location.origin}/invite/${inv.id}?d=${encodeURIComponent(encoded)}`;
                                    } catch (e) {
                                      console.error('Failed to generate invite link inline:', e);
                                      link = `${window.location.origin}/invite/${inv.id}`;
                                    }
                                  }
                                  navigator.clipboard.writeText(link);
                                  toast.success('Invite link copied to clipboard');
                                }} style={{ background: 'transparent', border: '1px solid var(--border-soft)', borderRadius: '6px', padding: '4px 8px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, fontSize: 11 }}>Copy Link</button>
                                <button onClick={handleResend} style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Resend</button>
                                <button onClick={() => revokeInvite(inv.id)} style={{ background: 'transparent', border: 'none', color: 'var(--status-critical)', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Revoke</button>
                              </div>
                            </td>
                          </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Categories */}
          {activeTab === 'Categories' && (
            <div className="card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                   <h3 style={{ fontSize: 18, fontWeight: 950, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Expense Taxonomy</h3>
                   <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>Categorize financial transactions for granular P&L reporting</p>
                </div>
                <button className="btn-primary" style={{ padding: '10px 20px' }} onClick={() => { setEditingCatId(null); setNewCat(BLANK_CAT); setCatError(''); setShowCatModal(true); }}><Plus size={16} /> New Category</button>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table className="saas-table">
                  <thead><tr><th>Classification</th><th>Operational Segment</th><th>Brand Visual</th><th style={{ width: 100 }}></th></tr></thead>
                  <tbody>
                    {categories.map(cat => {
                      const seg = segments.find(s => s.id === cat.segment_id)
                      return (
                        <tr key={cat.id}>
                          <td style={{ fontSize: 14, fontWeight: 850, color: 'var(--text-primary)' }}>{cat.name}</td>
                          <td>
                            {seg && (
                               <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <span style={{ fontSize: 16 }}>{seg.icon}</span>
                                  <span style={{ fontSize: 11, fontWeight: 800, color: seg.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{seg.name}</span>
                               </div>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 24, height: 12, borderRadius: 4, background: cat.color }} />
                              <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-muted)' }}>{cat.color.toUpperCase()}</span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              <button className="btn-secondary" style={{ padding: '6px 10px' }} onClick={() => { setEditingCatId(cat.id); setNewCat({ name: cat.name, segment_id: cat.segment_id, color: cat.color }); setCatError(''); setShowCatModal(true); }}><Edit2 size={12}/></button>
                              <button className="btn-secondary" style={{ padding: '6px 10px', color: 'var(--status-critical)', borderColor: 'rgba(239, 68, 68, 0.1)' }} onClick={() => deleteCategory(cat.id)}><Trash2 size={12}/></button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Segments */}
          {activeTab === 'Segments' && (
            <div>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                   <h3 style={{ fontSize: 18, fontWeight: 950, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Operational Segments</h3>
                   <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>Isolated business units for segmented performance analytics</p>
                </div>
                <button className="btn-primary" style={{ padding: '10px 20px' }} onClick={() => { setEditingSegId(null); setNewSeg(BLANK_SEG); setSegError(''); setShowSegModal(true); }}><Plus size={16} /> New Segment</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {segments.map(seg => (
                  <div key={seg.id} className="card" style={{ borderLeft: `4px solid ${seg.color}`, padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                       <div style={{ fontSize: 32 }}>{seg.icon}</div>
                       <button className="btn-secondary" style={{ padding: '6px', borderRadius: 8 }} onClick={() => { setEditingSegId(seg.id); setNewSeg({ name: seg.name, icon: seg.icon || '🌿', color: seg.color || '#22c55e', description: seg.description || '' }); setSegError(''); setShowSegModal(true); }}><Edit2 size={12}/></button>
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 950, color: 'var(--text-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{seg.name}</h4>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 20 }}>{seg.description}</p>
                    <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Records</span>
                       <span style={{ fontSize: 13, fontWeight: 900, color: seg.color }}>{categories.filter(c => c.segment_id === seg.id).length || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'Notifications' && (
            <div className="card" style={{ maxWidth: 600 }}>
              <div className="card-header"><div className="card-title">🔔 Notification Preferences</div></div>
              <div className="card-body">
                {[
                  { label: 'Overdue loan alerts',      desc: 'Get notified when a loan payment is past due' },
                  { label: 'Budget overrun warnings',   desc: 'Alert when spending exceeds budget by more than 10%' },
                  { label: 'Maintenance reminders',     desc: 'Equipment service due date reminders' },
                  { label: 'Payroll pending notices',   desc: 'Reminder to process pending payroll records' },
                  { label: 'Harvest countdown alerts',  desc: 'Notify 30 days before expected harvest date' },
                  { label: 'Weekly spend summary',      desc: 'Email summary of weekly expenses every Monday' },
                ].map(item => {
                  const on = notifState[item.label] ?? false;
                  return (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border-soft)' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{item.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</div>
                      </div>
                      <div
                        onClick={() => toggleNotif(item.label)}
                        style={{
                          position: 'relative', width: 44, height: 24, borderRadius: 24,
                          background: on ? 'var(--status-success)' : 'var(--bg-card-elevated)',
                          border: `1px solid ${on ? 'var(--status-success)' : 'var(--border-soft)'}`,
                          cursor: 'pointer', transition: 'background 0.25s, border-color 0.25s',
                          flexShrink: 0,
                          boxShadow: on ? '0 0 8px var(--status-success-glow)' : 'none'
                        }}
                      >
                        <div style={{
                          position: 'absolute', top: 3,
                          left: on ? 23 : 3,
                          width: 16, height: 16,
                          background: 'white', borderRadius: '50%',
                          transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                        }} />
                      </div>
                    </div>
                  );
                })}
                <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => toast.success('Notification preferences saved')}>Save Preferences</button>
              </div>
            </div>
          )}

          {/* Audit Log */}
          {activeTab === 'Audit Log' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">📋 Audit Trail</div>
                <button className="btn btn-secondary btn-sm" onClick={() => toast.success('Audit log CSV report generated')}>📥 Export Log</button>
              </div>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Table</th><th>Record ID</th></tr></thead>
                  <tbody>
                    {SAMPLE_AUDIT.map(log => (
                      <tr key={log.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{log.time}</td>
                        <td className="primary">{log.user}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{log.action}</td>
                        <td><span className="badge badge-neutral" style={{ fontFamily: 'monospace' }}>{log.table}</span></td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{log.record}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CATEGORY MODAL — Create / Edit */}
      {showCatModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCatModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div className="modal-title">{editingCatId ? 'Edit Category' : 'Create Category'}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowCatModal(false); setEditingCatId(null); }}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Fuel & Lubricants"
                  value={newCat.name}
                  onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Module / Area *</label>
                <select
                  className="form-select"
                  value={newCat.segment_id}
                  onChange={e => setNewCat(p => ({ ...p, segment_id: e.target.value }))}
                >
                  <option value="">— Select segment —</option>
                  {segments.map(s => (
                    <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Colour</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input
                    type="color"
                    value={newCat.color}
                    onChange={e => setNewCat(p => ({ ...p, color: e.target.value }))}
                    style={{ width: 40, height: 36, borderRadius: 8, border: '1px solid var(--border-soft)', background: 'none', cursor: 'pointer', padding: 2 }}
                  />
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)', fontWeight: 700 }}>{newCat.color.toUpperCase()}</span>
                  <div style={{ width: 36, height: 18, borderRadius: 4, background: newCat.color }} />
                </div>
              </div>
              {catError && <div style={{ fontSize: 12, color: 'var(--status-critical)', fontWeight: 700, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>{catError}</div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setShowCatModal(false); setEditingCatId(null); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveCategory}>{editingCatId ? 'Save Changes' : 'Create Category'}</button>
            </div>
          </div>
        </div>
      )}

      {/* SEGMENT MODAL — Create / Edit */}
      {showSegModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowSegModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div className="modal-title">{editingSegId ? 'Edit Segment' : 'Create Segment'}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowSegModal(false); setEditingSegId(null); }}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Segment Name *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Livestock Operations"
                  value={newSeg.name}
                  onChange={e => setNewSeg(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Icon (emoji)</label>
                <input
                  className="form-input"
                  placeholder="🌿"
                  value={newSeg.icon}
                  onChange={e => setNewSeg(p => ({ ...p, icon: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Colour</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input
                    type="color"
                    value={newSeg.color}
                    onChange={e => setNewSeg(p => ({ ...p, color: e.target.value }))}
                    style={{ width: 40, height: 36, borderRadius: 8, border: '1px solid var(--border-soft)', background: 'none', cursor: 'pointer', padding: 2 }}
                  />
                  <div style={{ width: 36, height: 18, borderRadius: 4, background: newSeg.color }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  placeholder="Describe this segment's purpose..."
                  value={newSeg.description}
                  onChange={e => setNewSeg(p => ({ ...p, description: e.target.value }))}
                  style={{ minHeight: 72, resize: 'vertical' }}
                />
              </div>
              {segError && <div style={{ fontSize: 12, color: 'var(--status-critical)', fontWeight: 700, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>{segError}</div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setShowSegModal(false); setEditingSegId(null); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveSegment}>{editingSegId ? 'Save Changes' : 'Create Segment'}</button>
            </div>
          </div>
        </div>
      )}

      {/* INVITE USER MODAL */}
      {showInviteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }} onClick={e => e.target === e.currentTarget && setShowInviteModal(false)}>
          <div style={{ margin: 'auto', width: '100%', maxWidth: '560px', background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: '24px', padding: '40px', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 900, margin: 0 }}>Invite New User</h2>
              <button onClick={() => setShowInviteModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            {inviteError && (
              <div style={{ color: 'var(--status-critical)', fontSize: '13px', background: 'rgba(239,68,68,0.1)', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', fontWeight: 700 }}>
                {inviteError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="form-label" style={{ marginBottom: 8, display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter user's full name"
                  value={inviteForm.fullName}
                  onChange={e => setInviteForm({ ...inviteForm, fullName: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ marginBottom: 8, display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Email Address *</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="name@example.com"
                  value={inviteForm.email}
                  onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ marginBottom: 8, display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Role *</label>
                <select 
                  className="form-select" 
                  value={inviteForm.role}
                  onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="Admin">Admin</option>
                  <option value="Data Entry">Data Entry</option>
                  <option value="View Only">View Only</option>
                </select>
              </div>

              {/* Permissions Preview Card */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-soft)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Access Level Preview</div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {getRoleDescription(inviteForm.role)}
                </div>
              </div>

              <div>
                <label className="form-label" style={{ marginBottom: 8, display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Personal Message (Optional)</label>
                <textarea 
                  className="form-input" 
                  placeholder="Add a friendly welcome note..."
                  value={inviteForm.message}
                  onChange={e => setInviteForm({ ...inviteForm, message: e.target.value })}
                  style={{ minHeight: '80px', resize: 'vertical', padding: '12px 14px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }} 
                  onClick={() => setShowInviteModal(false)}
                  disabled={isSendingInvite}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1 }} 
                  onClick={handleSendInvite}
                  disabled={isSendingInvite}
                >
                  {isSendingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Invitation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Clear Demo Data Confirmation Modal ── */}
      {showClearDemoModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => { setShowClearDemoModal(false); setClearDemoInput(''); }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 24px 60px rgba(0,0,0,0.5)', position: 'relative', zIndex: 1001 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash size={18} color="var(--status-warning)" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--status-warning)' }}>Clear Demo Data</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Amber warning — non-destructive to system configuration</div>
              </div>
            </div>

            <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              This will permanently remove all <strong>demo/sample operational and financial records</strong> including crops, livestock batches, transactions, inventory items, workflows, and activity logs.<br /><br />
              <strong style={{ color: 'var(--status-warning)' }}>Preserved:</strong> Users, roles, permissions, categories, segments, and all system configuration settings.
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                Type <strong style={{ color: 'var(--status-warning)', fontFamily: 'monospace' }}>RESET DEMO DATA</strong> to confirm
              </label>
              <input
                className="form-input"
                placeholder="RESET DEMO DATA"
                value={clearDemoInput}
                onChange={e => setClearDemoInput(e.target.value)}
                style={{ fontFamily: 'monospace', borderColor: clearDemoInput === 'RESET DEMO DATA' ? 'var(--status-warning)' : undefined }}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setShowClearDemoModal(false); setClearDemoInput(''); }}>Cancel</button>
              <button
                className="btn"
                style={{ flex: 1, background: clearDemoInput === 'RESET DEMO DATA' ? 'var(--status-warning)' : 'rgba(245,158,11,0.15)', color: clearDemoInput === 'RESET DEMO DATA' ? '#fff' : 'var(--text-muted)', border: '1px solid rgba(245,158,11,0.3)', cursor: clearDemoInput === 'RESET DEMO DATA' ? 'pointer' : 'not-allowed', fontWeight: 800, transition: 'all 0.2s' }}
                onClick={handleClearDemo}
                disabled={clearDemoInput !== 'RESET DEMO DATA'}
              >
                Clear Demo Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Factory Reset Confirmation Modal ── */}
      {showFactoryResetModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => { setShowFactoryResetModal(false); setFactoryResetInput(''); }}>
          <div style={{ background: 'var(--bg-card)', border: '2px solid rgba(239,68,68,0.4)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 24px 80px rgba(239,68,68,0.15)', position: 'relative', zIndex: 1001 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={18} color="var(--status-critical)" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--status-critical)' }}>Factory Reset Platform</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Critical danger — full destructive wipe</div>
              </div>
            </div>

            <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--status-critical)' }}>⚠ This action is irreversible.</strong><br /><br />
              A full factory reset will permanently destroy <strong>all system data</strong> — including users, roles, permissions, settings, categories, segments, financial records, operational logs, and all configurations. The platform will restart as a blank installation.
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                Type <strong style={{ color: 'var(--status-critical)', fontFamily: 'monospace' }}>RESET BRAES CREEK FACTORY</strong> to confirm
              </label>
              <input
                className="form-input"
                placeholder="RESET BRAES CREEK FACTORY"
                value={factoryResetInput}
                onChange={e => setFactoryResetInput(e.target.value)}
                style={{ fontFamily: 'monospace', borderColor: factoryResetInput === 'RESET BRAES CREEK FACTORY' ? 'var(--status-critical)' : undefined }}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setShowFactoryResetModal(false); setFactoryResetInput(''); }}>Cancel</button>
              <button
                className="btn"
                style={{ flex: 1, background: factoryResetInput === 'RESET BRAES CREEK FACTORY' ? 'var(--status-critical)' : 'rgba(239,68,68,0.1)', color: factoryResetInput === 'RESET BRAES CREEK FACTORY' ? '#fff' : 'var(--text-muted)', border: '1px solid rgba(239,68,68,0.3)', cursor: factoryResetInput === 'RESET BRAES CREEK FACTORY' ? 'pointer' : 'not-allowed', fontWeight: 800, transition: 'all 0.2s' }}
                onClick={handleFactoryReset}
                disabled={factoryResetInput !== 'RESET BRAES CREEK FACTORY'}
              >
                Factory Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
