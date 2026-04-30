"use client";

import { useState } from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Bell, X, Check, Trash2, Plus, AlertCircle, Info, FileText } from 'lucide-react';
import Link from 'next/link';

export default function NotificationCenter() {
  const { 
    notifications, isPanelOpen, togglePanel, setPanelOpen, 
    getUnreadCount, deleteNotification, clearAll, markAsRead, markAsCompleted, addNotification 
  } = useNotificationStore();

  const unreadCount = getUnreadCount();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    category: 'General',
    priority: 'info' as any,
    dueDate: '',
    amount: ''
  });

  const handleAdd = (e: any) => {
    e.preventDefault();
    addNotification({
      title: formData.title,
      message: formData.message,
      category: formData.category,
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
      amount: formData.amount ? Number(formData.amount) : undefined,
    });
    setIsAddModalOpen(false);
    setFormData({ title: '', message: '', category: 'General', priority: 'info', dueDate: '', amount: '' });
  };

  const priorityColors = {
    critical: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    task: '#39C86A'
  };

  return (
    <>
      <button onClick={togglePanel} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', display: 'flex', padding: 8, borderRadius: '50%', background: '#222222' }}>
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: -2, right: -2, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 10, padding: '2px 5px', border: '2px solid #222' }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Slide-over Panel */}
      {isPanelOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
          {/* Overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }} onClick={() => setPanelOpen(false)} />
          
          {/* Panel */}
          <div className="notification-panel" style={{ 
            position: 'absolute', top: 0, right: 0, bottom: 0, width: 400, background: '#141414', borderLeft: '1px solid #333', 
            boxShadow: '-10px 0 40px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column',
            animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
             {/* Header */}
             <div style={{ padding: '24px', borderBottom: '1px solid #222', display: 'flex', flexDirection: 'column', gap: 16 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', margin: 0 }}>Notifications</h2>
                   <p style={{ fontSize: 12, color: '#8a8a8e', margin: '4px 0 0 0' }}>Business alerts, reminders, and upcoming actions</p>
                 </div>
                 <button onClick={() => setPanelOpen(false)} style={{ background: 'none', border: 'none', color: '#8a8a8e', cursor: 'pointer', padding: 4 }}><X size={20}/></button>
               </div>
               
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <button onClick={() => setIsAddModalOpen(true)} className="btn-primary" style={{ padding: '6px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={14}/> Add Notification</button>
                 {notifications.length > 0 && (
                   <button onClick={() => { if(window.confirm('Clear all notifications?')) clearAll(); }} style={{ background: 'none', border: 'none', color: '#8a8a8e', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>Clear All</button>
                 )}
               </div>
             </div>

             {/* List */}
             <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
               {notifications.length === 0 ? (
                 <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                   <div style={{ width: 48, height: 48, background: '#222', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                     <Bell size={24} color="#8a8a8e" />
                   </div>
                   <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 8 }}>No notifications right now</div>
                   <div style={{ fontSize: 13, color: '#8a8a8e', marginBottom: 20, lineHeight: 1.5 }}>System monitoring is active. New alerts, reminders, and tasks will appear here.</div>
                   <button onClick={() => setIsAddModalOpen(true)} className="btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>Add Notification</button>
                 </div>
               ) : (
                 notifications.map(n => (
                   <div key={n.id} onClick={() => { if(!n.read) markAsRead(n.id); }} style={{ background: '#1a1a1a', border: `1px solid ${n.read ? '#2a2a2a' : '#333'}`, borderRadius: 12, padding: 16, position: 'relative', opacity: n.status === 'completed' ? 0.6 : 1, transition: 'all 0.2s', cursor: n.read ? 'default' : 'pointer' }}>
                     <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
                       {n.priority === 'task' && n.status !== 'completed' && (
                         <button onClick={(e) => { e.stopPropagation(); markAsCompleted(n.id); }} style={{ background: 'none', border: 'none', color: '#39C86A', cursor: 'pointer', padding: 4 }} title="Mark Complete"><Check size={14}/></button>
                       )}
                       <button onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }} title="Delete"><Trash2 size={14}/></button>
                     </div>
                     
                     <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                       <div style={{ background: `${priorityColors[n.priority]}22`, color: priorityColors[n.priority], fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
                         {n.priority}
                       </div>
                       <div style={{ fontSize: 10, color: '#8a8a8e', fontWeight: 600 }}>{n.category}</div>
                       {!n.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', marginLeft: 'auto', marginRight: 40 }} />}
                     </div>
                     
                     <div style={{ fontSize: 14, fontWeight: 600, color: n.status === 'completed' ? '#8a8a8e' : '#fff', marginBottom: 4, paddingRight: 40, textDecoration: n.status === 'completed' ? 'line-through' : 'none' }}>{n.title}</div>
                     <div style={{ fontSize: 12, color: '#8a8a8e', marginBottom: 12, lineHeight: 1.4 }}>{n.message}</div>
                     
                     {(n.dueDate || n.amount) && (
                       <div style={{ display: 'flex', gap: 16, background: '#222', padding: '8px 12px', borderRadius: 6, fontSize: 11 }}>
                         {n.amount && <div style={{ color: '#fff', fontWeight: 600 }}>Amount: <span style={{ color: priorityColors[n.priority] }}>${n.amount.toLocaleString()}</span></div>}
                         {n.dueDate && <div style={{ color: '#fff', fontWeight: 600 }}>Due: <span style={{ color: '#8a8a8e' }}>{n.dueDate}</span></div>}
                       </div>
                     )}

                     {n.category === 'Loan Payment' && (
                       <div style={{ marginTop: 12 }}>
                         <Link href="/finance" onClick={() => setPanelOpen(false)} style={{ fontSize: 11, color: '#39C86A', fontWeight: 600, textDecoration: 'none' }}>View Loan →</Link>
                       </div>
                     )}
                   </div>
                 ))
               )}
             </div>
          </div>
        </div>
      )}

      {/* Add Notification Modal */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }} onClick={() => setIsAddModalOpen(false)} />
          <div className="card" style={{ position: 'relative', width: 440, padding: 32, background: '#1a1a1a', border: '1px solid #333', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 1 }}>
            <button onClick={() => setIsAddModalOpen(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#8a8a8e', cursor: 'pointer' }}><X size={20}/></button>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
               Add Notification
            </div>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#8a8a8e', marginBottom: 8 }}>Title</label>
                <input autoFocus required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="form-input" placeholder="e.g. Loan payment due today" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#8a8a8e', marginBottom: 8 }}>Message / Notes</label>
                <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="form-input" placeholder="Additional details..." rows={3} style={{ resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#8a8a8e', marginBottom: 8 }}>Category</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="form-input">
                    <option>Loan Payment</option>
                    <option>Task</option>
                    <option>Expense Reminder</option>
                    <option>Livestock</option>
                    <option>Crops</option>
                    <option>Equipment</option>
                    <option>Payroll</option>
                    <option>General</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#8a8a8e', marginBottom: 8 }}>Priority</label>
                  <select required value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})} className="form-input">
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                    <option value="task">Task</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#8a8a8e', marginBottom: 8 }}>Due Date (Optional)</label>
                  <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="form-input" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#8a8a8e', marginBottom: 8 }}>Amount (Optional)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: 12, color: '#8a8a8e', fontSize: 14 }}>$</span>
                    <input type="number" step="0.01" min="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="form-input" style={{ paddingLeft: 24 }} placeholder="0.00" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-ghost" style={{ padding: '10px 20px' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}>Save Notification</button>
              </div>

            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @media (max-width: 768px) {
          .notification-panel {
            width: 100% !important;
            top: auto !important;
            height: 85vh;
            border-left: none !important;
            border-top: 1px solid #333;
            border-radius: 24px 24px 0 0;
            animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}} />
    </>
  );
}
