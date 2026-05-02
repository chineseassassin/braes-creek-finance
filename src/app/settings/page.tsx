'use client'
import { useState } from 'react'
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
  X
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
  const { theme, setTheme, currentUser } = useAppStore();
  const { categories, segments, addCategory, addSegment, deleteCategory } = useCategoryStore();
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
  const [showCatModal, setShowCatModal] = useState(false)
  const [newCat, setNewCat] = useState({ name: '', segment_id: '', color: '#22c55e' })

  const handleAddCategory = () => {
    if (!newCat.name || !newCat.segment_id) {
      toast.error('Please fill all required fields');
      return;
    }
    addCategory(newCat);
    setShowCatModal(false);
    setNewCat({ name: '', segment_id: '', color: '#22c55e' });
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
                  <div style={{ p: 10, borderRadius: 10, background: 'var(--status-success-glow)', color: 'var(--status-success)' }}>
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
                        <div style={{ p: 8, borderRadius: '50%', background: theme === 'dark' ? 'var(--status-success-glow)' : 'rgba(255,255,255,0.05)', color: theme === 'dark' ? 'var(--status-success)' : 'inherit' }}>
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
                        <div style={{ p: 8, borderRadius: '50%', background: theme === 'light' ? 'var(--status-success-glow)' : 'rgba(15, 23, 42, 0.05)', color: theme === 'light' ? 'var(--status-success)' : 'inherit' }}>
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
                  <div style={{ p: 10, borderRadius: 10, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-critical)' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--status-critical)', fontSize: 13 }}>Master Database Purge</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Irreversibly delete all organization data and configurations</div>
                    </div>
                    <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: 11, color: 'var(--status-critical)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => toast.error('Purge protocol requires level-3 biometric verification (mock).')}><Trash2 size={14} /> Purge All</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users & Access */}
          {activeTab === 'Users & Access' && (
            <div style={{ maxWidth: 840, display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* SECTION 1 — TEAM MANAGEMENT */}
              <div className="card">
                <div className="card-header" style={{ marginBottom: 16 }}>
                  <div>
                     <div className="card-title" style={{ fontSize: 16 }}>Team Management</div>
                     <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Manage your organization's members and their system access.</div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => toast.success('Invitation link generated and copied')}>+ Invite User</button>
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
                            <select className="form-select" style={{ padding: '6px 12px', fontSize: 12, minWidth: 140, background: 'var(--bg-card)' }} defaultValue={u.role === 'admin' ? 'Admin' : u.role === 'manager' ? 'Data Entry' : 'View Only'}>
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
              <div className="card">
                <div className="card-header" style={{ marginBottom: 16 }}>
                  <div>
                     <div className="card-title" style={{ fontSize: 16 }}>Smart Role Preview</div>
                     <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Capabilities granted to the selected role.</div>
                  </div>
                  <select className="form-select" style={{ width: 180, fontWeight: 700 }} defaultValue="Data Entry">
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

              {/* NEW SECTION — TEMPORARY ACCESS ASSIGNMENTS */}
              <div className="card">
                <div className="card-header" style={{ marginBottom: 16 }}>
                  <div>
                     <div className="card-title" style={{ fontSize: 16 }}>Temporary Access Assignments</div>
                     <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Grant limited-time access to specific entry tasks. Missed deadlines notify the owner.</div>
                  </div>
                  <button className="btn btn-primary btn-sm" style={{ background: '#f59e0b', color: '#101010', border: 'none', fontWeight: 800 }} onClick={() => toast.success('New temporary access token generated')}>+ New Task Access</button>
                </div>
                <div className="data-table-wrapper" style={{ overflow: 'visible' }}>
                  <table className="data-table">
                    <thead>
                      <tr><th>Employee</th><th>Task Preset</th><th>Deadline</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="primary">Mary Joseph</td>
                        <td style={{ fontSize: 12 }}>Update Livestock Mortality</td>
                        <td style={{ fontSize: 12, color: 'var(--status-warning)', fontWeight: 600 }}>Due in 2h 15m</td>
                        <td><span className="badge badge-warning">In Progress</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                             <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} onClick={() => toast.success('Deadline extended by 24 hours')}>Extend</button>
                             <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', color: '#f87171' }} onClick={() => toast.error('Access revoked for Mary Joseph')}>Revoke</button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="primary">James Ali</td>
                        <td style={{ fontSize: 12 }}>Upload Feed Receipt</td>
                        <td style={{ fontSize: 12, color: 'var(--status-critical)', fontWeight: 600 }}>Expired (Yesterday)</td>
                        <td><span className="badge badge-danger">Missed</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                             <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} onClick={() => toast.success('Reminder notification sent')}>Reminder</button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="primary">Jane Doe</td>
                        <td style={{ fontSize: 12 }}>Log Today's Labor</td>
                        <td style={{ fontSize: 12, color: 'var(--status-success)', fontWeight: 600 }}>Submitted</td>
                        <td><span className="badge badge-success">Reviewing</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                             <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', color: '#4ade80' }} onClick={() => toast.success('Reviewing submission...')}>View</button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 4 — MODULE ACCESS */}
              <div className="card">
                <div className="card-header" style={{ marginBottom: 16 }}>
                  <div>
                     <div className="card-title" style={{ fontSize: 16 }}>Module Access Defaults</div>
                     <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Enable or disable core system modules for non-admin users.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                   {['Expenses', 'Payroll', 'Livestock', 'Crops'].map((mod, i) => (
                      <div key={mod} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'var(--bg-card-elevated)', borderRadius: i === 0 ? '12px 12px 0 0' : i === 3 ? '0 0 12px 12px' : 0, borderBottom: i < 3 ? '1px solid var(--border-subtle)' : 'none' }}>
                         <div style={{ fontWeight: 600, fontSize: 13 }}>{mod}</div>
                         <label className="settings-switch">
                            <input type="checkbox" defaultChecked={true} onChange={(e) => toast.success(`${mod} module ${e.target.checked ? 'enabled' : 'disabled'} for team`)} />
                            <span className="settings-slider"></span>
                         </label>
                      </div>
                   ))}
                </div>
              </div>

              {/* SECTION 5 — SECURITY PANEL */}
              <div className="card">
                <div className="card-header" style={{ marginBottom: 16 }}>
                  <div>
                     <div className="card-title" style={{ fontSize: 16 }}>Security Panel</div>
                     <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Authentication and session management.</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                   <div style={{ padding: 20, background: 'var(--bg-card-elevated)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Change Password</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>Last changed 45 days ago.</div>
                      <button className="btn btn-secondary" style={{ width: '100%', fontSize: 12 }} onClick={() => toast.success('Password update link sent to your email')}>Update Password</button>
                   </div>
                   <div style={{ padding: 20, background: 'var(--bg-card-elevated)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Two-Factor Auth</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>Secure your account with 2FA.</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                         <span style={{ fontSize: 12, color: 'var(--status-success)', fontWeight: 800 }}>Enabled</span>
                         <label className="settings-switch"><input type="checkbox" defaultChecked onChange={(e) => toast.success(`Two-Factor Authentication ${e.target.checked ? 'activated' : 'deactivated'}`)} /><span className="settings-slider"></span></label>
                      </div>
                   </div>
                   <div style={{ gridColumn: 'span 2', padding: 20, background: 'var(--bg-card-elevated)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                         <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>Active Sessions</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Current login activity.</div>
                         </div>
                         <button className="btn btn-secondary" style={{ fontSize: 11, color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }} onClick={() => toast.success('Logged out all other active sessions')}>Logout All Sessions</button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                         <div>
                            <div style={{ fontSize: 12, fontWeight: 700 }}>MacBook Pro (Chrome)</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>New York, USA — IP: 192.168.1.1</div>
                         </div>
                         <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--status-success)' }}>Current Session</div>
                      </div>
                   </div>
                </div>
              </div>

              {/* SECTION 6 — DANGER ZONE UPGRADE */}
              <div className="card" style={{ border: '1px solid rgba(239, 68, 68, 0.3)', background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, transparent 100%)' }}>
                <div className="card-header" style={{ marginBottom: 16, borderBottom: '1px solid rgba(239, 68, 68, 0.1)', paddingBottom: 16 }}>
                  <div>
                     <div className="card-title" style={{ fontSize: 16, color: 'var(--status-critical)' }}>Danger Zone</div>
                     <div style={{ fontSize: 12, color: '#fca5a5' }}>Destructive operations.</div>
                  </div>
                </div>
                <div style={{ padding: '8px 0' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                     <div>
                       <div style={{ fontWeight: 700, color: 'var(--status-critical)', fontSize: 14, marginBottom: 4 }}>System Factory Reset</div>
                       <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          This will permanently delete all records, transactions, users, and logs.<br/>
                          <span style={{ fontWeight: 800, color: 'var(--status-warning)' }}>Warning: 4,129 records will be destroyed.</span>
                       </div>
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 220 }}>
                        <input type="text" placeholder='Type "RESET" to confirm' className="form-input" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(0,0,0,0.2)' }} />
                        <button className="btn" style={{ background: 'var(--status-critical)', color: '#fff', fontSize: 12, fontWeight: 800, padding: '10px' }} onClick={() => toast.error('Enter "RESET" and confirm with secondary password.')}>PERMANENTLY RESET</button>
                     </div>
                   </div>
                </div>
              </div>

              <style dangerouslySetInnerHTML={{__html: `
                 .settings-switch {
                    position: relative; display: inline-block; width: 36px; height: 20px;
                 }
                 .settings-switch input { opacity: 0; width: 0; height: 0; }
                 .settings-slider {
                    position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
                    background-color: rgba(255,255,255,0.1); transition: .4s; border-radius: 34px;
                 }
                 .settings-slider:before {
                    position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px;
                    background-color: white; transition: .4s; border-radius: 50%;
                 }
                 input:checked + .settings-slider { background-color: #22c55e; }
                 input:checked + .settings-slider:before { transform: translateX(16px); }
              `}} />
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
                <button className="btn-primary" style={{ padding: '10px 20px' }} onClick={() => setShowCatModal(true)}><Plus size={16} /> New Category</button>
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
                              <button className="btn-secondary" style={{ padding: '6px 10px' }} onClick={() => toast.error('Core system categories cannot be modified in trial mode.')}><Edit2 size={12}/></button>
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
                <button className="btn-primary" style={{ padding: '10px 20px' }} onClick={() => toast.success('Segment addition protocol initiated (Mock)')}><Plus size={16} /> New Segment</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {segments.map(seg => (
                  <div key={seg.id} className="card" style={{ borderLeft: `4px solid ${seg.color}`, padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                       <div style={{ fontSize: 32 }}>{seg.icon}</div>
                       <button className="btn-secondary" style={{ padding: '6px', borderRadius: 8 }} onClick={() => toast.success(`Editing segment: ${seg.name}`)}><Edit2 size={12}/></button>
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

      {/* Add Category Modal */}
      {showCatModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: 480, padding: '48px', position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 24 }}>
             <button onClick={() => setShowCatModal(false)} style={{ position: 'absolute', top: 32, right: 32, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
               <X size={24} />
             </button>
             
             <h2 style={{ fontSize: 22, fontWeight: 950, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>Register New Category</h2>
             <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 40 }}>Establish a new financial classification within your organization intelligence matrix.</p>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="form-group">
                   <label className="label-small" style={{ marginBottom: 10, display: 'block' }}>Category Nomenclature</label>
                   <input 
                     className="form-input" 
                     placeholder="e.g. Organic Pest Control" 
                     value={newCat.name}
                     onChange={e => setNewCat({...newCat, name: e.target.value})}
                   />
                </div>
                <div className="form-group">
                   <label className="label-small" style={{ marginBottom: 10, display: 'block' }}>Operational Segment Association</label>
                   <select 
                     className="form-select"
                     value={newCat.segment_id}
                     onChange={e => setNewCat({...newCat, segment_id: e.target.value})}
                   >
                      <option value="">Select Segment...</option>
                      {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                   </select>
                </div>
                <div className="form-group">
                   <label className="label-small" style={{ marginBottom: 10, display: 'block' }}>Visual Signature (Color)</label>
                   <div style={{ display: 'flex', gap: 10 }}>
                      {['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'].map(c => (
                         <button 
                           key={c} 
                           style={{ 
                             width: 32, height: 32, borderRadius: 8, background: c, cursor: 'pointer', 
                             border: newCat.color === c ? '2px solid #fff' : '1px solid rgba(255,255,255,0.1)',
                             boxShadow: newCat.color === c ? `0 0 12px ${c}` : 'none',
                             transition: 'all 0.2s'
                           }} 
                           onClick={() => setNewCat({...newCat, color: c})} 
                         />
                      ))}
                   </div>
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                   <button className="btn-secondary" style={{ flex: 1, padding: '14px' }} onClick={() => setShowCatModal(false)}>Cancel</button>
                   <button className="btn-primary" style={{ flex: 1, padding: '14px' }} onClick={handleAddCategory}>Register Category</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
