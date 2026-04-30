'use client'
import { useState, useMemo } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { FileText, CheckCircle, XCircle, Clock, AlertTriangle, PenSquare, DollarSign, Sprout, TrendingDown, Eye } from 'lucide-react'
import { useWorkflowStore } from '@/store/useWorkflowStore'
import { useAppStore } from '@/store/useAppStore'
import { useDashboardStore } from '@/store/useDashboardStore'
import { toast, Toaster } from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

export default function ApprovalsPage() {
  const { approvals, updateApprovalStatus } = useWorkflowStore()
  const { emitSystemEvent } = useAppStore()
  const { updateTransactionStatus } = useDashboardStore()
  const [activeTab, setActiveTab] = useState('Pending')
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  // FILTER LOGIC
  const filteredRecords = useMemo(() => {
    return approvals.filter(a => {
      if (activeTab === 'Pending') return a.status === 'pending'
      if (activeTab === 'Approved') return a.status === 'approved'
      if (activeTab === 'Rejected') return a.status === 'rejected'
      return false
    })
  }, [approvals, activeTab])

  // ICON MAPPING
  const getIcon = (type: string) => {
    switch (type) {
      case 'expense': return TrendingDown
      case 'loan': return DollarSign
      case 'labor': return PenSquare
      case 'livestock': return Sprout
      default: return FileText
    }
  }

  const handleApprove = (id: string) => {
    const req = approvals.find(a => a.id === id)
    if (!req) return

    updateApprovalStatus(id, 'approved', 'Verified by Admin')
    
    // Sync to Dashboard store if it's an expense or labor
    if (req.entity_type === 'expense' || req.entity_type === 'labor') {
       updateTransactionStatus(req.entity_id, 'approved');
    }

    toast.success('Submission approved', {
      style: { background: '#101010', color: '#fff', border: '1px solid var(--color-primary)' }
    })
  }

  const handleReject = (id: string) => {
    const req = approvals.find(a => a.id === id)
    if (!req) return

    updateApprovalStatus(id, 'rejected', 'Declined by Admin')
    
    // Sync to Dashboard store if it's an expense or labor
    if (req.entity_type === 'expense' || req.entity_type === 'labor') {
       updateTransactionStatus(req.entity_id, 'rejected');
    }

    toast.error('Submission rejected', {
      style: { background: '#101010', color: '#fff', border: '1px solid #f87171' }
    })
  }

  return (
    <div className="app-shell">
      <Toaster position="top-right" />
      <Sidebar />
      <div className="main-content">
        <Topbar title="Approval Center" subtitle="Admin Control — Financial Impact Gateway" />
        <div className="page-container" style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 40px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', marginBottom: 8 }}>Pending Approvals</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Review and approve employee submissions before they impact analytics and AI models.</p>
            </div>
            <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.05)', padding: 6, borderRadius: 12 }}>
              {['Pending', 'Approved', 'Rejected'].map(t => (
                <button 
                  key={t}
                  onClick={() => setActiveTab(t)}
                  style={{
                    padding: '8px 16px', fontSize: 13, fontWeight: activeTab === t ? 700 : 500,
                    background: activeTab === t ? 'var(--color-primary)' : 'transparent',
                    color: activeTab === t ? '#101010' : 'var(--color-text-muted)',
                    borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
             {filteredRecords.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: activeTab === 'Pending' ? '#4ade80' : 'var(--color-text-muted)', background: activeTab === 'Pending' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255,255,255,0.02)', borderRadius: 16, border: activeTab === 'Pending' ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid var(--border-subtle)' }}>
                   {activeTab === 'Pending' ? (
                     <>
                       <CheckCircle size={32} style={{ margin: '0 auto 16px' }} />
                       <h3 style={{ fontSize: 16, fontWeight: 700 }}>All Caught Up</h3>
                       <p style={{ fontSize: 13, opacity: 0.8 }}>No pending submissions awaiting your approval.</p>
                     </>
                   ) : (
                     `No ${activeTab.toLowerCase()} history found.`
                   )}
                </div>
             ) : filteredRecords.map(r => {
               const Icon = getIcon(r.entity_type);
               const userName = r.requester_id.split('-')[1] || 'User';
               return (
                <div key={r.id} style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24, transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                     <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <Icon size={20} color="var(--color-text-primary)" />
                        </div>
                        <div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>{r.entity_type} Submission</span>
                              <span style={{ 
                                fontSize: 10, padding: '4px 8px', 
                                background: r.status === 'pending' ? 'rgba(234, 179, 8, 0.1)' : (r.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'), 
                                color: r.status === 'pending' ? '#eab308' : (r.status === 'approved' ? '#4ade80' : '#f87171'), 
                                borderRadius: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' 
                              }}>
                                {r.status}
                              </span>
                           </div>
                           <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Batch Record #{r.entity_id}</span> 
                              <span style={{ margin: '0 8px' }}>•</span> Priority: <span style={{ fontWeight: 800, color: r.priority === 'urgent' ? '#ef4444' : '#fbbf24' }}>{r.priority}</span>
                           </div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--color-text-muted)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                 <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#000', fontWeight: 900 }}>{userName[0].toUpperCase()}</div>
                                 {userName.charAt(0).toUpperCase() + userName.slice(1)} <span style={{ opacity: 0.5 }}>(Operator)</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={12} /> {formatDistanceToNow(new Date(r.created_at))} ago
                              </div>
                           </div>
                        </div>
                     </div>
                     {r.status === 'pending' && (
                       <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => setSelectedRequest(r)} className="btn btn-secondary btn-sm" style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)' }}><Eye size={14} /> View</button>
                          <button onClick={() => handleReject(r.id)} className="btn btn-secondary btn-sm" style={{ padding: '8px 12px', color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.3)', background: 'transparent' }}><XCircle size={14} /> Reject</button>
                          <button onClick={() => handleApprove(r.id)} className="btn btn-primary btn-sm" style={{ padding: '8px 16px', background: '#22c55e', color: '#101010', fontWeight: 800, border: 'none' }}><CheckCircle size={14} /> Approve</button>
                       </div>
                     )}
                  </div>
                </div>
               )
             })}
          </div>

          {/* Simple Details Modal */}
          {selectedRequest && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
              <div style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border)', borderRadius: 24, width: '100%', maxWidth: 500, overflow: 'hidden' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0 }}>Submission Intelligence</h3>
                  <button onClick={() => setSelectedRequest(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><XCircle size={24} /></button>
                </div>
                <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Module</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>{selectedRequest.entity_type}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Priority</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: selectedRequest.priority === 'urgent' ? '#ef4444' : '#fbbf24' }}>{selectedRequest.priority.toUpperCase()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Reference ID</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>#{selectedRequest.entity_id}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Status</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#eab308' }}>PENDING REVIEW</div>
                    </div>
                  </div>
                  
                  <div style={{ height: 1, background: 'var(--color-border)' }} />
                  
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Operator Notes</div>
                    <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                      This submission requires administrative verification for fiscal accuracy. No attachments provided.
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                    <button onClick={() => { handleReject(selectedRequest.id); setSelectedRequest(null); }} style={{ flex: 1, height: 44, borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.3)', background: 'transparent', color: '#ef4444', fontWeight: 800, cursor: 'pointer' }}>Decline Submission</button>
                    <button onClick={() => { handleApprove(selectedRequest.id); setSelectedRequest(null); }} style={{ flex: 1, height: 44, borderRadius: 12, border: 'none', background: '#22c55e', color: '#101010', fontWeight: 800, cursor: 'pointer' }}>Approve Entry</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
