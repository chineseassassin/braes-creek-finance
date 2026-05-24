'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { Clock, CheckCircle, AlertTriangle, FileText, ChevronRight, X, Upload, ClipboardList, LogOut } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { useAppStore } from '@/store/useAppStore'

const INITIAL_TASKS = [
  { id: 1, title: 'Update Livestock Mortality', desc: 'Log today\'s mortality rates for Broiler House A.', due: 'Due in 2h 15m', status: 'pending', color: 'var(--status-warning)', rgb: '217, 119, 6' },
  { id: 2, title: 'Upload Feed Receipt', desc: 'Upload the scanned invoice for the latest Purina feed delivery.', due: 'Expired', status: 'missed', color: 'var(--status-critical)', rgb: '220, 38, 38' },
  { id: 3, title: 'Log Today\'s Labor Hours', desc: 'Submit timesheets for the harvesting crew.', due: 'Submitted', status: 'submitted', color: 'var(--status-success)', rgb: '21, 128, 61' }
]

export default function EmployeeTasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleStartTask = (task: any) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
    setShowSuccess(false);
    
    // Update task status to IN_PROGRESS
    if (task.status === 'pending') {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'in_progress' } : t));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create pending approval request / Route submission to Approval Center
    useAppStore.getState().emitSystemEvent({
      type: 'creation', 
      severity: 'info', 
      module: 'Approval Center',
      message: `Pending Approval: ${selectedTask.title} submitted by worker.`,
      metadata: { task_id: selectedTask.id }
    });

    // Change task status to SUBMITTED
    setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, status: 'submitted' } : t));
    setShowSuccess(true);
  };

  const handleCloseModal = () => {
    setTaskModalOpen(false);
    setShowSuccess(false);
  };

  return (
    <div className="app-shell">
      <Toaster position="top-right" />
      <Sidebar />
      <div className="main-content">
        <Topbar title="Assigned Tasks" subtitle="Your temporary data-entry assignments" />
        <div className="page-container" style={{ maxWidth: 800, margin: '0 auto', padding: '32px 40px' }}>
          
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>Task Center</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Complete your assigned data-entry tasks before the deadline expires.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
             {tasks.map(task => (
                <div key={task.id} style={{ 
                   background: 'var(--bg-card)', 
                   border: `1px solid ${task.status === 'pending' || task.status === 'in_progress' ? 'var(--status-warning-glow)' : task.status === 'missed' ? 'var(--status-critical-glow)' : 'var(--border-soft)'}`, 
                   borderRadius: 16, padding: 24, 
                   display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                   boxShadow: 'var(--shadow-soft)',
                   opacity: task.status === 'missed' ? 0.8 : 1
                }}>
                   <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ 
                         width: 48, height: 48, borderRadius: 12, 
                         background: `rgba(${task.rgb}, 0.18)`, 
                         display: 'flex', alignItems: 'center', justifyContent: 'center' 
                      }}>
                         <FileText size={20} color={task.color} />
                      </div>
                      <div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{task.title}</h3>
                            <span style={{ fontSize: 10, fontWeight: 950, padding: '4px 10px', borderRadius: 6, textTransform: 'uppercase', background: `rgba(${task.rgb}, 0.15)`, color: task.color, border: `1px solid rgba(${task.rgb}, 0.1)` }}>
                               {task.status.replace('_', ' ')}
                            </span>
                         </div>
                         <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{task.desc}</p>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: task.color }}>
                            {(task.status === 'pending' || task.status === 'in_progress') && <Clock size={14} />}
                            {task.status === 'missed' && <AlertTriangle size={14} />}
                            {task.status === 'submitted' && <CheckCircle size={14} />}
                            {task.due}
                         </div>
                      </div>
                   </div>
                   
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {task.status === 'pending' && (
                         <button onClick={() => handleStartTask(task)} className="btn" style={{ background: 'var(--status-warning)', color: '#fff', border: 'none', fontWeight: 900, borderRadius: 10, padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                           Start Task <ChevronRight size={16} style={{ marginLeft: 4 }} />
                         </button>
                      )}
                      {task.status === 'in_progress' && (
                         <button onClick={() => handleStartTask(task)} className="btn" style={{ background: 'var(--status-info)', color: '#fff', border: 'none', fontWeight: 900, borderRadius: 10, padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                           Continue Task <ChevronRight size={16} style={{ marginLeft: 4 }} />
                         </button>
                      )}
                      {task.status === 'missed' && (
                         <button className="btn btn-secondary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>Access Locked</button>
                      )}
                      {task.status === 'submitted' && (
                         <button className="btn btn-secondary" disabled style={{ opacity: 0.5, cursor: 'not-allowed', color: 'var(--status-success)', borderColor: 'var(--status-success)' }}>Awaiting Approval</button>
                      )}
                   </div>
                </div>
             ))}
          </div>

        </div>
      </div>

      {/* Task Modal / Drawer */}
      {taskModalOpen && selectedTask && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Overlay click to close */}
          <div onClick={handleCloseModal} style={{ position: 'absolute', inset: 0, cursor: 'pointer' }} />
          
          <div className="card" style={{ width: 500, background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 16, padding: 32, position: 'relative', zIndex: 1001, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>{selectedTask.title}</h2>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            {showSuccess ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--status-success-glow)', border: '2px solid var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle size={28} color="var(--status-success)" />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Task Submitted</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>Submission received — awaiting approval</div>
                <button onClick={handleCloseModal} className="btn-primary" style={{ padding: '12px 32px', margin: '0 auto' }}>Done</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                <div className="form-group">
                  <label style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Broiler House</label>
                  <select className="form-input" required style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', borderRadius: 10, color: 'var(--text-primary)' }}>
                    <option value="">Select House...</option>
                    <option value="House A">House A</option>
                    <option value="House B">House B</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Date</label>
                    <input type="date" className="form-input" defaultValue={new Date().toISOString().split('T')[0]} required style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', borderRadius: 10, color: 'var(--text-primary)' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Mortality Count</label>
                    <input type="number" min="0" placeholder="0" className="form-input" required style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', borderRadius: 10, color: 'var(--text-primary)' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Cause / Notes</label>
                  <textarea placeholder="Observations, suspected cause..." rows={3} className="form-input" required style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-card-elevated)', border: '1px solid var(--border-soft)', borderRadius: 10, color: 'var(--text-primary)', resize: 'vertical' }} />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Photo Upload (Optional)</label>
                  <label style={{ padding: '24px', background: 'var(--bg-card-elevated)', border: '1px dashed var(--border-soft)', borderRadius: 10, textAlign: 'center', cursor: 'pointer', display: 'block', margin: 0 }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          toast.success(`Attached ${e.target.files[0].name}`);
                        }
                      }} 
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <Upload size={18} color="var(--text-muted)" />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Click to upload image</span>
                    </div>
                  </label>
                </div>

                <div style={{ marginTop: 8 }}>
                  <button type="submit" className="btn-primary" style={{ width: '100%', padding: 14, justifyContent: 'center' }}>
                    Submit Update
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Sticky Bottom Action Bar for Mobile ── */}
      <div className="mobile-bottom-bar">
        <button className="mobile-bottom-bar-btn" onClick={() => router.push('/worker-hub')}>
          <ClipboardList size={20} />
          <span>Worker Hub</span>
        </button>
        <button className="mobile-bottom-bar-btn active" onClick={() => router.push('/employee-tasks')}>
          <CheckCircle size={20} />
          <span>My Tasks</span>
        </button>
        <button className="mobile-bottom-bar-btn" onClick={() => router.push('/login')}>
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>

      {/* ── Mobile First CSS Injector ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 767px) {
          aside {
            display: none !important;
          }
          .main-content {
            margin-left: 0 !important;
            padding: 16px 16px 88px 16px !important;
          }
          .topbar {
            padding: 12px 16px !important;
            margin-bottom: 16px !important;
          }
          .page-container {
            padding: 0 !important;
          }
          /* Sticky Bottom Action Bar */
          .mobile-bottom-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 64px;
            background: rgba(20, 20, 20, 0.96);
            backdrop-filter: blur(16px);
            border-top: 1px solid var(--border-soft);
            display: flex !important;
            align-items: center;
            justify-content: space-around;
            padding-bottom: env(safe-area-inset-bottom, 0px);
            z-index: 999;
            box-shadow: 0 -4px 30px rgba(0,0,0,0.5);
          }
          .mobile-bottom-bar-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 8px 12px;
            transition: all 0.2s;
            font-family: inherit;
          }
          .mobile-bottom-bar-btn.active {
            color: var(--status-success);
          }
          .mobile-bottom-bar-btn span {
            font-size: 10px;
            font-weight: 800;
          }
          /* Large touch targets on mobile */
          .btn-primary, button {
            min-height: 48px;
          }
          .card {
            margin: 0;
            border-radius: 20px 20px 0 0 !important;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            max-width: 100% !important;
            max-height: 85vh;
            overflow-y: auto;
            animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        }
        @media (min-width: 768px) {
          .mobile-bottom-bar {
            display: none !important;
          }
        }
      ` }} />
    </div>
  )
}
