'use client'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { Clock, CheckCircle, AlertTriangle, FileText, ChevronRight } from 'lucide-react'

const ASSIGNED_TASKS = [
  { id: 1, title: 'Update Livestock Mortality', desc: 'Log today\'s mortality rates for Broiler House A.', due: 'Due in 2h 15m', status: 'pending', color: '#f59e0b' },
  { id: 2, title: 'Upload Feed Receipt', desc: 'Upload the scanned invoice for the latest Purina feed delivery.', due: 'Expired', status: 'missed', color: '#f87171' },
  { id: 3, title: 'Log Today\'s Labor Hours', desc: 'Submit timesheets for the harvesting crew.', due: 'Submitted', status: 'submitted', color: '#4ade80' }
]

export default function EmployeeTasksPage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Assigned Tasks" subtitle="Your temporary data-entry assignments" />
        <div className="page-container" style={{ maxWidth: 800, margin: '0 auto', padding: '32px 40px' }}>
          
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-text-primary)', marginBottom: 8 }}>Task Center</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Complete your assigned data-entry tasks before the deadline expires.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
             {ASSIGNED_TASKS.map(task => (
                <div key={task.id} style={{ 
                   background: 'var(--bg-card)', 
                   border: `1px solid ${task.status === 'pending' ? 'rgba(245, 158, 11, 0.3)' : task.status === 'missed' ? 'rgba(248, 113, 113, 0.3)' : 'var(--border-subtle)'}`, 
                   borderRadius: 16, padding: 24, 
                   display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                   opacity: task.status === 'missed' ? 0.6 : 1
                }}>
                   <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ 
                         width: 48, height: 48, borderRadius: 12, 
                         background: `rgba(${task.color === '#f59e0b' ? '245,158,11' : task.color === '#f87171' ? '248,113,113' : '74,222,128'}, 0.1)`, 
                         display: 'flex', alignItems: 'center', justifyContent: 'center' 
                      }}>
                         <FileText size={20} color={task.color} />
                      </div>
                      <div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)' }}>{task.title}</h3>
                            <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 6, textTransform: 'uppercase', background: `rgba(${task.color === '#f59e0b' ? '245,158,11' : task.color === '#f87171' ? '248,113,113' : '74,222,128'}, 0.1)`, color: task.color }}>
                               {task.status}
                            </span>
                         </div>
                         <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>{task.desc}</p>
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
                         <button className="btn btn-primary" style={{ background: '#f59e0b', color: '#101010', border: 'none', fontWeight: 800 }}>Start Task <ChevronRight size={16} style={{ marginLeft: 4 }} /></button>
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
