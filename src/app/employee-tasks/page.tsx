'use client'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { Clock, CheckCircle, AlertTriangle, FileText, ChevronRight } from 'lucide-react'

const ASSIGNED_TASKS = [
  { id: 1, title: 'Update Livestock Mortality', desc: 'Log today\'s mortality rates for Broiler House A.', due: 'Due in 2h 15m', status: 'pending', color: 'var(--status-warning)', rgb: '217, 119, 6' },
  { id: 2, title: 'Upload Feed Receipt', desc: 'Upload the scanned invoice for the latest Purina feed delivery.', due: 'Expired', status: 'missed', color: 'var(--status-critical)', rgb: '220, 38, 38' },
  { id: 3, title: 'Log Today\'s Labor Hours', desc: 'Submit timesheets for the harvesting crew.', due: 'Submitted', status: 'submitted', color: 'var(--status-success)', rgb: '21, 128, 61' }
]

export default function EmployeeTasksPage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Assigned Tasks" subtitle="Your temporary data-entry assignments" />
        <div className="page-container" style={{ maxWidth: 800, margin: '0 auto', padding: '32px 40px' }}>
          
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>Task Center</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Complete your assigned data-entry tasks before the deadline expires.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
             {ASSIGNED_TASKS.map(task => (
                <div key={task.id} style={{ 
                   background: 'var(--bg-card)', 
                   border: `1px solid ${task.status === 'pending' ? 'var(--status-warning-glow)' : task.status === 'missed' ? 'var(--status-critical-glow)' : 'var(--border-soft)'}`, 
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
                               {task.status}
                            </span>
                         </div>
                         <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{task.desc}</p>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: task.color }}>
                            {task.status === 'pending' && <Clock size={14} />}
                            {task.status === 'missed' && <AlertTriangle size={14} />}
                            {task.status === 'submitted' && <CheckCircle size={14} />}
                            {task.due}
                         </div>
                      </div>
                   </div>
                   
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {task.status === 'pending' && (
                         <button className="btn" style={{ background: 'var(--status-warning)', color: '#fff', border: 'none', fontWeight: 900, borderRadius: 10, padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>Start Task <ChevronRight size={16} style={{ marginLeft: 4 }} /></button>
                      )}
                      {task.status === 'missed' && (
                         <button className="btn btn-secondary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>Access Locked</button>
                      )}
                      {task.status === 'submitted' && (
                         <button className="btn btn-secondary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>Awaiting Approval</button>
                      )}
                   </div>
                </div>
             ))}
          </div>

        </div>
      </div>
    </div>
  )
}
