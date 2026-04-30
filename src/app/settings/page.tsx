'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { SAMPLE_SEGMENTS, SAMPLE_CATEGORIES } from '@/lib/sample-data'

const SETTING_TABS = ['General', 'Users & Access', 'Categories', 'Segments', 'Notifications', 'Audit Log']

const SAMPLE_USERS = [
  { id: 'user-1', name: 'Admin User', email: 'admin@agrofarm.tt', role: 'admin', lastLogin: '2024-12-10', status: 'active' },
  { id: 'user-2', name: 'Mary Joseph', email: 'mary@agrofarm.tt', role: 'manager', lastLogin: '2024-12-09', status: 'active' },
  { id: 'user-3', name: 'James Ali', email: 'james@agrofarm.tt', role: 'viewer', lastLogin: '2024-12-01', status: 'active' },
]

const SAMPLE_AUDIT = [
  { id: 1, user: 'Admin User', action: 'Created expense', table: 'expenses', record: 'exp-20', time: '2024-12-10 14:32' },
  { id: 2, user: 'Mary Joseph', action: 'Added labor entry', table: 'labor_entries', record: 'lab-8', time: '2024-12-09 09:15' },
  { id: 3, user: 'Admin User', action: 'Recorded loan payment', table: 'loan_payments', record: 'lp-5', time: '2024-11-10 11:00' },
  { id: 4, user: 'Admin User', action: 'Updated livestock unit', table: 'livestock_units', record: 'ls-1', time: '2024-11-05 16:20' },
  { id: 5, user: 'Mary Joseph', action: 'Added payroll record', table: 'payroll', record: 'pay-4', time: '2024-12-01 08:45' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General')
  const [farmName, setFarmName] = useState('Green Valley Agro Enterprise')
  const [currency, setCurrency] = useState('TTD')
  const [timezone, setTimezone] = useState('America/Port_of_Spain')
  const [showCatModal, setShowCatModal] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar
          title="Settings"
          subtitle="Configure your AgroFinance platform"
        />
        <div className="page-container">
          {/* Tab Bar */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 0 }}>
            {SETTING_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 18px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: activeTab === tab ? 700 : 400,
                  color: activeTab === tab ? '#4ade80' : 'var(--text-secondary)',
                  borderBottom: activeTab === tab ? '2px solid #16a34a' : '2px solid transparent',
                  transition: 'all 0.18s',
                  marginBottom: -1,
                }}
              >
                {tab}
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
                    <select className="form-select">
                      <option>January</option>
                      <option>April</option>
                      <option>October</option>
                    </select>
                  </div>
                  <button className="btn btn-primary">Save Changes</button>
                </div>
              </div>

              <div className="card">
                <div className="card-header"><div className="card-title">⚠️ Danger Zone</div></div>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>Export All Data</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Download a full backup of all farm data</div>
                    </div>
                    <button className="btn btn-secondary btn-sm">📥 Export</button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#f87171', fontSize: 13 }}>Reset All Data</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Permanently delete all records (irreversible)</div>
                    </div>
                    <button className="btn btn-danger btn-sm">🗑️ Reset</button>
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
                  <button className="btn btn-primary btn-sm">+ Invite User</button>
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
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#4ade80' }}>
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
                          <td><span className="badge" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', fontWeight: 800 }}>● Active</span></td>
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
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#4ade80', fontSize: 13, fontWeight: 600 }}>
                      <span style={{ fontSize: 14 }}>✔</span> Can add expenses
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#4ade80', fontSize: 13, fontWeight: 600 }}>
                      <span style={{ fontSize: 14 }}>✔</span> Can log payroll
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#4ade80', fontSize: 13, fontWeight: 600 }}>
                      <span style={{ fontSize: 14 }}>✔</span> Can update livestock
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#f87171', fontSize: 13, fontWeight: 600 }}>
                      <span style={{ fontSize: 14 }}>✖</span> Cannot delete data
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#f87171', fontSize: 13, fontWeight: 600 }}>
                      <span style={{ fontSize: 14 }}>✖</span> Cannot access settings
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#f87171', fontSize: 13, fontWeight: 600 }}>
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
                  <button className="btn btn-primary btn-sm" style={{ background: '#f59e0b', color: '#101010', border: 'none', fontWeight: 800 }}>+ New Task Access</button>
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
                        <td style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>Due in 2h 15m</td>
                        <td><span className="badge badge-warning">In Progress</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                             <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>Extend</button>
                             <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', color: '#f87171' }}>Revoke</button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="primary">James Ali</td>
                        <td style={{ fontSize: 12 }}>Upload Feed Receipt</td>
                        <td style={{ fontSize: 12, color: '#f87171', fontWeight: 600 }}>Expired (Yesterday)</td>
                        <td><span className="badge badge-danger">Missed</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                             <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>Reminder</button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="primary">Jane Doe</td>
                        <td style={{ fontSize: 12 }}>Log Today's Labor</td>
                        <td style={{ fontSize: 12, color: '#4ade80', fontWeight: 600 }}>Submitted</td>
                        <td><span className="badge badge-success">Reviewing</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                             <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', color: '#4ade80' }}>View</button>
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
                      <div key={mod} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: i === 0 ? '12px 12px 0 0' : i === 3 ? '0 0 12px 12px' : 0, borderBottom: i < 3 ? '1px solid var(--border-subtle)' : 'none' }}>
                         <div style={{ fontWeight: 600, fontSize: 13 }}>{mod}</div>
                         <label className="settings-switch">
                            <input type="checkbox" defaultChecked={true} />
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
                   <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Change Password</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>Last changed 45 days ago.</div>
                      <button className="btn btn-secondary" style={{ width: '100%', fontSize: 12 }}>Update Password</button>
                   </div>
                   <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Two-Factor Auth</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>Secure your account with 2FA.</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                         <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 800 }}>Enabled</span>
                         <label className="settings-switch"><input type="checkbox" defaultChecked /><span className="settings-slider"></span></label>
                      </div>
                   </div>
                   <div style={{ gridColumn: 'span 2', padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                         <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>Active Sessions</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Current login activity.</div>
                         </div>
                         <button className="btn btn-secondary" style={{ fontSize: 11, color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}>Logout All Sessions</button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                         <div>
                            <div style={{ fontSize: 12, fontWeight: 700 }}>MacBook Pro (Chrome)</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>New York, USA — IP: 192.168.1.1</div>
                         </div>
                         <div style={{ fontSize: 11, fontWeight: 600, color: '#4ade80' }}>Current Session</div>
                      </div>
                   </div>
                </div>
              </div>

              {/* SECTION 6 — DANGER ZONE UPGRADE */}
              <div className="card" style={{ border: '1px solid rgba(239, 68, 68, 0.3)', background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, transparent 100%)' }}>
                <div className="card-header" style={{ marginBottom: 16, borderBottom: '1px solid rgba(239, 68, 68, 0.1)', paddingBottom: 16 }}>
                  <div>
                     <div className="card-title" style={{ fontSize: 16, color: '#f87171' }}>Danger Zone</div>
                     <div style={{ fontSize: 12, color: '#fca5a5' }}>Destructive operations.</div>
                  </div>
                </div>
                <div style={{ padding: '8px 0' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                     <div>
                       <div style={{ fontWeight: 700, color: '#f87171', fontSize: 14, marginBottom: 4 }}>System Factory Reset</div>
                       <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          This will permanently delete all records, transactions, users, and logs.<br/>
                          <span style={{ fontWeight: 800, color: '#fca5a5' }}>Warning: 4,129 records will be destroyed.</span>
                       </div>
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 220 }}>
                        <input type="text" placeholder='Type "RESET" to confirm' className="form-input" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(0,0,0,0.2)' }} />
                        <button className="btn" style={{ background: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 800, padding: '10px' }}>PERMANENTLY RESET</button>
                     </div>
                   </div>
                </div>
              </div>

              <style jsx>{`
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
              `}</style>
            </div>
          )}

          {/* Categories */}
          {activeTab === 'Categories' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">🏷️ Expense Categories</div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowCatModal(true)}>+ Add Category</button>
              </div>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Category</th><th>Segment</th><th>Color</th><th>Actions</th></tr></thead>
                  <tbody>
                    {SAMPLE_CATEGORIES.map(cat => {
                      const seg = SAMPLE_SEGMENTS.find(s => s.id === cat.segment_id)
                      return (
                        <tr key={cat.id}>
                          <td className="primary">{cat.name}</td>
                          <td>
                            {seg && <span className="segment-dot"><span>{seg.icon}</span><span style={{ color: seg.color, fontSize: 12 }}>{seg.name.split('/')[0].trim()}</span></span>}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 16, height: 16, borderRadius: 4, background: cat.color }} />
                              <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{cat.color}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-secondary btn-sm">✏️ Edit</button>
                              <button className="btn btn-ghost btn-sm">🗑️</button>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {SAMPLE_SEGMENTS.map(seg => (
                <div key={seg.id} className="card" style={{ borderLeft: `4px solid ${seg.color}` }}>
                  <div className="card-body">
                    <div className="flex-between" style={{ marginBottom: 8 }}>
                      <div className="flex-center">
                        <span style={{ fontSize: 24 }}>{seg.icon}</span>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>{seg.name}</div>
                      </div>
                      <button className="btn btn-ghost btn-sm">✏️</button>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{seg.description}</div>
                  </div>
                </div>
              ))}
              <div
                className="card"
                style={{ borderStyle: 'dashed', borderColor: 'rgba(22,163,74,0.3)', cursor: 'pointer', background: 'rgba(22,163,74,0.02)' }}
              >
                <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 80, gap: 8 }}>
                  <span style={{ fontSize: 20, opacity: 0.4 }}>➕</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Add New Segment</span>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'Notifications' && (
            <div className="card" style={{ maxWidth: 600 }}>
              <div className="card-header"><div className="card-title">🔔 Notification Preferences</div></div>
              <div className="card-body">
                {[
                  { label: 'Overdue loan alerts', desc: 'Get notified when a loan payment is past due', def: true },
                  { label: 'Budget overrun warnings', desc: 'Alert when spending exceeds budget by more than 10%', def: true },
                  { label: 'Maintenance reminders', desc: 'Equipment service due date reminders', def: true },
                  { label: 'Payroll pending notices', desc: 'Reminder to process pending payroll records', def: false },
                  { label: 'Harvest countdown alerts', desc: 'Notify 30 days before expected harvest date', def: true },
                  { label: 'Weekly spend summary', desc: 'Email summary of weekly expenses every Monday', def: false },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</div>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked={item.def} style={{ opacity: 0, width: 0, height: 0 }} />
                      <span style={{
                        position: 'absolute', inset: 0, background: item.def ? '#16a34a' : 'var(--bg-elevated)',
                        borderRadius: 24, border: '1px solid var(--border-default)',
                        transition: 'background 0.2s'
                      }}>
                        <span style={{
                          position: 'absolute', top: 3, left: item.def ? 22 : 3, width: 16, height: 16,
                          background: 'white', borderRadius: '50%', transition: 'left 0.2s'
                        }} />
                      </span>
                    </label>
                  </div>
                ))}
                <button className="btn btn-primary" style={{ marginTop: 20 }}>Save Preferences</button>
              </div>
            </div>
          )}

          {/* Audit Log */}
          {activeTab === 'Audit Log' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">📋 Audit Trail</div>
                <button className="btn btn-secondary btn-sm">📥 Export Log</button>
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
    </div>
  )
}
