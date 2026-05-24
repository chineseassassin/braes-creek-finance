'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { Toaster, toast } from 'react-hot-toast'
import { useAppStore } from '@/store/useAppStore'
import { useCropStore } from '@/store/useCropStore'
import { useLivestockStore } from '@/store/useLivestockStore'
import { useInventoryStore } from '@/store/useInventoryStore'
import { useDashboardStore } from '@/store/useDashboardStore'
import {
  Sprout, Beef, Clock, DollarSign, Upload, Package, AlertTriangle,
  CheckCircle, ChevronRight, X, Send, ClipboardList, Zap, Plus,
  Wifi, WifiOff, Smartphone, Info, RefreshCw, LogOut
} from 'lucide-react'

// ─── constants ───────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0]

const CROP_TYPES = ['Cassava', 'Sweet Potatoes', 'Tomatoes', 'Cucumber', 'Bell Peppers', 'Sorrel', 'Scotch Bonnets', 'Other']
const ANIMAL_TYPES = ['Broiler Chicken', 'Layer Chicken', 'Goat', 'Pig', 'Cattle', 'Other']
const CONDITIONS  = ['Excellent', 'Good', 'Fair', 'Poor', 'Critical']
const EXPENSE_CATS = ['Feed', 'Medicine / Vaccine', 'Fertilizer / Chemicals', 'Fuel', 'Equipment', 'Repairs', 'Other']
const INV_CATS    = ['Feed', 'Fertilizer', 'Medicine / Vaccine', 'Fuel / Diesel', 'Building Materials', 'Tools', 'Other']
const INC_TYPES   = ['Animal Mortality', 'Crop Damage', 'Equipment Failure', 'Safety Hazard', 'Theft / Loss', 'Disease / Pest', 'Other']
const TASK_TYPES  = ['Crop Field Work', 'Livestock Care', 'Equipment Maintenance', 'Harvesting', 'Feeding Run', 'Pen Cleaning', 'Irrigation', 'Other']

const ASSIGNED_TASKS = [
  { id: 't1', action_id: 'livestock', label: 'AM Feed Run — Broiler House A',      segment: 'Poultry Management', priority: 'high',   dueTime: '08:00 AM' },
  { id: 't2', action_id: 'crop',      label: 'Tomato Field Irrigation Check',       segment: 'Crop Production',    priority: 'medium', dueTime: '10:00 AM' },
  { id: 't3', action_id: 'livestock', label: 'Goat Pen Cleaning & Count',           segment: 'Goat Rearing',       priority: 'medium' },
  { id: 't4', action_id: 'labor',     label: 'Log Morning Labour Hours',            segment: 'General Estate',     priority: 'high',   dueTime: '12:00 PM' },
  { id: 't5', action_id: 'inventory', label: 'Stock Level Check — Feed Store',      segment: 'General Estate',     priority: 'low'    },
]

// ─── shared modal shell ───────────────────────────────────────────────────────
function Modal({ title, subtitle, icon, onClose, children }: {
  title: string; subtitle?: string; icon: React.ReactNode
  onClose: () => void; children: React.ReactNode
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--status-success-glow)', border: '1px solid var(--status-success)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>{icon}</div>
            <div>
              <div className="modal-title">{title}</div>
              {subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8 }}>
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── success screen ───────────────────────────────────────────────────────────
function SuccessScreen({ message, onClose, isOffline = false }: { message: string; onClose: () => void; isOffline?: boolean }) {
  return (
    <div className="success-anim" style={{ padding: '48px 32px', textAlign: 'center', animation: 'scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%', background: isOffline ? 'var(--status-warning-glow)' : 'var(--status-success-glow)',
        border: `2px solid ${isOffline ? 'var(--status-warning)' : 'var(--status-success)'}`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 24px'
      }}>
        {isOffline ? <Clock size={28} color="var(--status-warning)" /> : <CheckCircle size={28} color="var(--status-success)" />}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
        {isOffline ? 'Offline Draft Saved' : 'Task Completed'}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>{message}</div>
      <div style={{
        fontSize: 12,
        color: isOffline ? 'var(--status-warning)' : 'var(--status-info)',
        fontWeight: 700,
        marginTop: 12,
        marginBottom: 24,
        padding: '10px',
        background: isOffline ? 'var(--status-warning-glow)' : 'var(--status-info-glow)',
        borderRadius: 8,
        border: `1px solid ${isOffline ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)'}`
      }}>
        {isOffline ? 'Offline Draft — Saved locally to phone' : 'Submission Received — Routed to Approval Center'}
      </div>
      <button className="btn-primary" onClick={onClose} style={{ padding: '12px 40px', margin: '0 auto' }}>Done</button>
      <style>{`
        @keyframes scaleUp {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ─── shared store wrapper ─────────────────────────────────────────────────────
const executeAsWorker = async (action: () => Promise<void>) => {
  const store = useAppStore.getState();
  const prevUser = store.currentUser;
  store.setCurrentUser({ ...prevUser, role: 'data-entry' });
  try {
    await action();
  } finally {
    store.setCurrentUser(prevUser);
  }
}

// ─── Crop Update ──────────────────────────────────────────────────────────────
function CropModal({ onClose, onSubmit, isOffline }: { onClose: () => void; onSubmit: (payload: any, label: string) => void; isOffline: boolean }) {
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({ field: '', crop: CROP_TYPES[0], qty: '', unit: 'kg', condition: 'Good', notes: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name: form.crop,
      variety: `Field: ${form.field}`,
      planting_date: today(),
      expected_harvest: today(),
      area_acres: 0,
      input_costs: 0,
      labor_cost: 0,
      status: 'growing',
      workflow_status: 'pending',
      notes: `Qty: ${form.qty}${form.unit} | Condition: ${form.condition} | ${form.notes}`,
    }
    onSubmit(payload, `Crop update: ${form.crop} at ${form.field || 'Field'}`)
    setDone(true)
  }

  if (done) return <SuccessScreen message={isOffline ? `Crop update for ${form.crop} saved locally as draft.` : `Crop update for ${form.crop} queued for owner approval.`} onClose={onClose} isOffline={isOffline} />

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="form-group">
        <label className="form-label">Field / Location</label>
        <input className="form-input" placeholder="e.g. North Field, Block A" value={form.field} onChange={e => setForm(f => ({ ...f, field: e.target.value }))} required />
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Crop</label>
          <select className="form-select" value={form.crop} onChange={e => setForm(f => ({ ...f, crop: e.target.value }))}>
            {CROP_TYPES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Condition</label>
          <select className="form-select" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}>
            {CONDITIONS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Quantity</label>
          <input type="number" className="form-input" placeholder="0" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label className="form-label">Unit</label>
          <select className="form-select" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
            {['kg', 'lbs', 'bags', 'crates', 'acres'].map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Notes (optional)</label>
        <textarea className="form-input" rows={2} style={{ height: 'auto', padding: '10px 14px', resize: 'vertical' }} placeholder="Observations, issues..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>
      <button type="submit" className="btn-primary" style={{ width: '100%', padding: 14 }}>
        <Send size={15} /> {isOffline ? 'Save Offline Draft' : 'Submit Crop Update'}
      </button>
    </form>
  )
}

// ─── Livestock Update ─────────────────────────────────────────────────────────
function LivestockModal({ onClose, onSubmit, isOffline }: { onClose: () => void; onSubmit: (payload: any, label: string) => void; isOffline: boolean }) {
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({ type: ANIMAL_TYPES[0], count: '', mortality: '', feed: '', feedUnit: 'kg', condition: 'Good', notes: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      animal_type: form.type as any,
      batch_name: `Daily Update — ${new Date().toLocaleDateString()}`,
      quantity: parseInt(form.count) || 0,
      purchase_date: today(),
      purchase_cost: 0,
      current_value: 0,
      mortality_count: parseInt(form.mortality) || 0,
      feed_cost_daily: 0,
      notes: `Condition: ${form.condition} | Feed: ${form.feed}${form.feedUnit} | Mortality: ${form.mortality || 0} | ${form.notes}`,
      workflow_status: 'pending',
    }
    onSubmit(payload, `Livestock update: ${form.type} (Count: ${form.count})`)
    setDone(true)
  }

  if (done) return <SuccessScreen message={isOffline ? `Livestock update for ${form.type} saved locally as draft.` : `Livestock update for ${form.type} queued for owner approval.`} onClose={onClose} isOffline={isOffline} />

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Animal Type</label>
          <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            {ANIMAL_TYPES.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Condition</label>
          <select className="form-select" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}>
            {CONDITIONS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Count (Head)</label>
          <input type="number" className="form-input" placeholder="0" value={form.count} onChange={e => setForm(f => ({ ...f, count: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label className="form-label">Mortality (0 if none)</label>
          <input type="number" className="form-input" placeholder="0" value={form.mortality} onChange={e => setForm(f => ({ ...f, mortality: e.target.value }))} />
        </div>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Feed Used Today</label>
          <input type="number" className="form-input" placeholder="0" value={form.feed} onChange={e => setForm(f => ({ ...f, feed: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label className="form-label">Unit</label>
          <select className="form-select" value={form.feedUnit} onChange={e => setForm(f => ({ ...f, feedUnit: e.target.value }))}>
            {['kg', 'lbs', 'bags'].map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Notes (optional)</label>
        <textarea className="form-input" rows={2} style={{ height: 'auto', padding: '10px 14px', resize: 'vertical' }} placeholder="Health observations, abnormal behavior..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>
      <button type="submit" className="btn-primary" style={{ width: '100%', padding: 14 }}>
        <Send size={15} /> {isOffline ? 'Save Offline Draft' : 'Submit Livestock Update'}
      </button>
    </form>
  )
}

// ─── Labor Hours ──────────────────────────────────────────────────────────────
function LaborModal({ onClose, onSubmit, isOffline }: { onClose: () => void; onSubmit: (payload: any, label: string) => void; isOffline: boolean }) {
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    workerName: '', taskType: TASK_TYPES[0], date: today(),
    startTime: '07:00', endTime: '15:00', notes: ''
  })

  const calcHours = () => {
    const [sh, sm] = form.startTime.split(':').map(Number)
    const [eh, em] = form.endTime.split(':').map(Number)
    return Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60)
  }
  const hours = calcHours()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      type: 'expense',
      amount: hours * 1200, // Mock JMD 1200/hr
      category: 'Payroll',
      description: `Labor: ${form.workerName} - ${form.taskType} (${hours.toFixed(1)} hrs)`,
      date: form.date,
      status: 'pending',
      notes: form.notes
    }
    onSubmit(payload, `Log Hours: ${form.workerName} (${hours.toFixed(1)} hrs)`)
    setDone(true)
  }

  if (done) return <SuccessScreen message={isOffline ? `${hours.toFixed(1)} hrs for ${form.workerName} saved locally as draft.` : `${hours.toFixed(1)} hrs logged for ${form.workerName}. Queued for payroll approval.`} onClose={onClose} isOffline={isOffline} />

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="form-group">
        <label className="form-label">Worker Name</label>
        <input className="form-input" placeholder="Full name" value={form.workerName} onChange={e => setForm(f => ({ ...f, workerName: e.target.value }))} required />
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Task Type</label>
          <select className="form-select" value={form.taskType} onChange={e => setForm(f => ({ ...f, taskType: e.target.value }))}>
            {TASK_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date</label>
          <input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <div className="form-group">
          <label className="form-label">Start</label>
          <input type="time" className="form-input" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label className="form-label">End</label>
          <input type="time" className="form-input" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label className="form-label">Total Hours</label>
          <div className="form-input" style={{ display: 'flex', alignItems: 'center', fontWeight: 800, color: 'var(--status-success)' }}>
            {hours.toFixed(1)} hrs
          </div>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Notes (optional)</label>
        <input className="form-input" placeholder="Task details, location..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>
      <button type="submit" className="btn-primary" style={{ width: '100%', padding: 14 }}>
        <Send size={15} /> {isOffline ? 'Save Offline Draft' : 'Log Hours'}
      </button>
    </form>
  )
}

// ─── Expense ──────────────────────────────────────────────────────────────────
function ExpenseModal({ onClose, onSubmit, isOffline }: { onClose: () => void; onSubmit: (payload: any, label: string) => void; isOffline: boolean }) {
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({ category: EXPENSE_CATS[0], amount: '', vendor: '', desc: '', date: today() })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      type: 'expense',
      amount: parseFloat(form.amount) || 0,
      category: form.category,
      description: form.desc || form.category,
      date: form.date,
      reference: form.vendor,
      status: 'pending',
      created_by: 'worker-submission',
    }
    onSubmit(payload, `Expense: JMD ${parseFloat(form.amount).toLocaleString()} (${form.category})`)
    setDone(true)
  }

  if (done) return <SuccessScreen message={isOffline ? `Expense of JMD ${parseFloat(form.amount).toLocaleString()} saved locally as draft.` : `Expense of JMD ${parseFloat(form.amount).toLocaleString()} queued for owner approval.`} onClose={onClose} isOffline={isOffline} />

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date</label>
          <input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Amount (JMD)</label>
        <input type="number" className="form-input" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
      </div>
      <div className="form-group">
        <label className="form-label">Vendor / Supplier</label>
        <input className="form-input" placeholder="e.g. Agro Grace, Kingston Farm Supplies" value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} required />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <input className="form-input" placeholder="What was purchased / paid for?" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
      </div>
      <button type="submit" className="btn-primary" style={{ width: '100%', padding: 14 }}>
        <Send size={15} /> {isOffline ? 'Save Offline Draft' : 'Submit Expense'}
      </button>
    </form>
  )
}

// ─── Receipt Upload ───────────────────────────────────────────────────────────
function ReceiptModal({ onClose, onSubmit, isOffline }: { onClose: () => void; onSubmit: (payload: any, label: string) => void; isOffline: boolean }) {
  const [done, setDone] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [form, setForm] = useState({ desc: '', amount: '', vendor: '', date: today() })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      type: 'expense',
      amount: parseFloat(form.amount) || 0,
      category: 'Other',
      description: `Receipt: ${fileName || file?.name || 'Uploaded File'} - ${form.desc}`,
      date: form.date,
      reference: form.vendor,
      status: 'pending',
    }
    onSubmit(payload, `Receipt: ${form.desc} (JMD ${parseFloat(form.amount).toLocaleString()})`)
    setDone(true)
  }

  if (done) return <SuccessScreen message={isOffline ? `Receipt "${fileName || file?.name || 'File'}" saved locally as draft.` : `Receipt "${fileName || file?.name || 'File'}" queued for owner review.`} onClose={onClose} isOffline={isOffline} />

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Drop zone */}
      <label style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        border: `2px dashed ${file || fileName ? 'var(--status-success)' : 'var(--border-strong)'}`,
        borderRadius: 14, padding: '28px 16px', cursor: 'pointer',
        background: file || fileName ? 'var(--status-success-glow)' : 'var(--bg-surface)',
        transition: 'all 0.2s',
      }}>
        <Upload size={26} color={file || fileName ? 'var(--status-success)' : 'var(--text-muted)'} />
        <span style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: file || fileName ? 'var(--status-success)' : 'var(--text-muted)' }}>
          {fileName || file?.name || 'Tap to upload receipt'}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>JPG, PNG, PDF</span>
        <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => {
          const uploaded = e.target.files?.[0] || null;
          if (uploaded) {
            setFile(uploaded);
            setFileName(uploaded.name);
          }
        }} required={!fileName} />
      </label>
      <div className="form-group">
        <label className="form-label">Description</label>
        <input className="form-input" placeholder="e.g. Broiler feed purchase, vet visit" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} required />
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Amount (JMD)</label>
          <input type="number" className="form-input" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Receipt Date</label>
          <input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Vendor / Store</label>
        <input className="form-input" placeholder="e.g. Agro Grace, Hi-Pro" value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} />
      </div>
      <button type="submit" className="btn-primary" style={{ width: '100%', padding: 14 }}>
        <Send size={15} /> {isOffline ? 'Save Offline Draft' : 'Upload Receipt'}
      </button>
    </form>
  )
}

// ─── Inventory Update ─────────────────────────────────────────────────────────
function InventoryModal({ onClose, onSubmit, isOffline }: { onClose: () => void; onSubmit: (payload: any, label: string) => void; isOffline: boolean }) {
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({ item: '', category: INV_CATS[0], qty: '', unit: 'bags', action: 'used', notes: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      itemName: form.item,
      category: form.category as any,
      quantity: parseInt(form.qty) || 0,
      unit: form.unit,
      reorderThreshold: 0,
      criticalThreshold: 0,
      unitCost: 0,
      vendorName: '',
      workflow_status: 'pending',
      notes: `${form.action === 'used' ? 'Used' : 'Restocked'} ${form.qty} ${form.unit}. ${form.notes}`,
    }
    onSubmit(payload, `Inventory: ${form.action === 'used' ? 'Used' : 'Restocked'} ${form.qty} ${form.unit} of ${form.item}`)
    setDone(true)
  }

  if (done) return <SuccessScreen message={isOffline ? `Inventory update for ${form.item} saved locally as draft.` : `Inventory update for ${form.item} queued for owner review.`} onClose={onClose} isOffline={isOffline} />

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="form-group">
        <label className="form-label">Item Name</label>
        <input className="form-input" placeholder="e.g. Broiler Starter, NPK 12-12-17" value={form.item} onChange={e => setForm(f => ({ ...f, item: e.target.value }))} required />
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {INV_CATS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Action</label>
          <select className="form-select" value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value }))}>
            <option value="used">Used / Consumed</option>
            <option value="restocked">Restocked / Received</option>
          </select>
        </div>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Quantity</label>
          <input type="number" className="form-input" placeholder="0" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label className="form-label">Unit</label>
          <select className="form-select" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
            {['bags', 'kg', 'liters', 'units', 'vials', 'packs'].map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Notes (optional)</label>
        <input className="form-input" placeholder="Supplier, batch number, condition..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>
      <button type="submit" className="btn-primary" style={{ width: '100%', padding: 14 }}>
        <Send size={15} /> {isOffline ? 'Save Offline Draft' : 'Submit Inventory Update'}
      </button>
    </form>
  )
}

// ─── Incident Report ──────────────────────────────────────────────────────────
function IncidentModal({ onClose, onSubmit, isOffline }: { onClose: () => void; onSubmit: (payload: any, label: string) => void; isOffline: boolean }) {
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({ type: INC_TYPES[0], severity: 'Medium', location: '', desc: '', action: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      category: 'system',
      severity: form.severity === 'High' ? 'critical' : form.severity === 'Medium' ? 'warning' : 'info',
      priority_score: form.severity === 'High' ? 95 : form.severity === 'Medium' ? 75 : 50,
      title: `Incident: ${form.type}`,
      message: `${form.desc} (Location: ${form.location})`,
      why_it_matters: 'Worker-reported incident requiring immediate attention.',
      recommended_action: form.action || 'Investigate and resolve.',
    }
    onSubmit(payload, `Incident Report: ${form.type} (${form.severity})`)
    setDone(true)
  }

  const sevColor = { High: 'var(--status-critical)', Medium: 'var(--status-warning)', Low: 'var(--status-success)' }[form.severity] || 'var(--text-primary)'

  if (done) return <SuccessScreen message={isOffline ? `Incident saved locally as draft. Will alert owner immediately when online.` : "Incident report filed. Owner has been immediately notified."} onClose={onClose} isOffline={isOffline} />

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertTriangle size={16} />
        <span style={{ fontSize: 12, fontWeight: 700 }}>
          {isOffline ? 'Offline Mode: Will immediately alert owner once connected.' : 'This report will immediately alert the estate owner.'}
        </span>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Incident Type</label>
          <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            {INC_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Severity</label>
          <select className="form-select" style={{ borderColor: sevColor, color: sevColor }} value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Location / Area</label>
        <input className="form-input" placeholder="e.g. Broiler House B, North Field" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required />
      </div>
      <div className="form-group">
        <label className="form-label">What Happened?</label>
        <textarea className="form-input" rows={3} style={{ height: 'auto', padding: '10px 14px', resize: 'vertical' }} placeholder="Describe clearly what happened..." value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} required />
      </div>
      <div className="form-group">
        <label className="form-label">Action Already Taken (if any)</label>
        <textarea className="form-input" rows={2} style={{ height: 'auto', padding: '10px 14px', resize: 'vertical' }} placeholder="What steps have you already taken?" value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value }))} />
      </div>
      <button type="submit" className="btn-primary" style={{ width: '100%', padding: 14, background: 'var(--status-critical)', color: '#fff' }}>
        <AlertTriangle size={15} /> {isOffline ? 'Save Offline Incident Draft' : 'File Incident Report'}
      </button>
    </form>
  )
}

// ─── Action card config ───────────────────────────────────────────────────────
const CARDS = [
  { id: 'crop',      label: 'Log Crop Update',      sub: 'Yield, condition & field status',   Icon: Sprout,        color: 'var(--status-success)',  glow: 'rgba(34,197,94,0.12)',  action: 'Start Task'  },
  { id: 'livestock', label: 'Log Livestock Update',  sub: 'Count, mortality & feed usage',     Icon: Beef,          color: 'var(--status-warning)',  glow: 'rgba(245,158,11,0.12)', action: 'Start Task' },
  { id: 'labor',     label: 'Log Labor Hours',       sub: 'Worker name, time & task',          Icon: Clock,         color: 'var(--status-info)',     glow: 'rgba(59,130,246,0.12)', action: 'Submit Entry' },
  { id: 'expense',   label: 'Add Expense',           sub: 'Category, amount & vendor',         Icon: DollarSign,    color: '#9ca3af',                glow: 'rgba(156,163,175,0.12)', action: 'Submit Entry'},
  { id: 'receipt',   label: 'Upload Receipt',        sub: 'Attach invoice or image',           Icon: Upload,        color: '#a855f7',                glow: 'rgba(168,85,247,0.12)', action: 'Submit Entry' },
  { id: 'inventory', label: 'Inventory Update',      sub: 'Log stock usage or restock',        Icon: Package,       color: 'var(--status-warning)',  glow: 'rgba(245,158,11,0.10)', action: 'Continue Task' },
  { id: 'incident',  label: 'Report Incident',       sub: 'Flag hazards, losses & issues',     Icon: AlertTriangle, color: 'var(--status-critical)', glow: 'rgba(239,68,68,0.12)',  action: 'Submit Entry'  },
]

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WorkerHubPage() {
  const router = useRouter()
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [tasksDone, setTasksDone] = useState<Set<string>>(new Set())
  
  // PWA and Offline states
  const [isOnline, setIsOnline] = useState<boolean>(true)
  const [draftsList, setDraftsList] = useState<any[]>([])
  const [showInstallPrompt, setShowInstallPrompt] = useState<boolean>(true)
  const [installGuideOpen, setInstallGuideOpen] = useState<boolean>(false)
  const [activeInstallTab, setActiveInstallTab] = useState<'ios' | 'android'>('ios')

  const { currentUser, switchRole } = useAppStore()

  const close = () => setActiveModal(null)

  const toggleTask = (id: string) => {
    setTasksDone(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  // Load drafts and set online listeners
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine)
      const list = JSON.parse(localStorage.getItem('worker-drafts') || '[]')
      setDraftsList(list)

      const updateOnline = () => {
        setIsOnline(true)
        syncDrafts()
      }
      const updateOffline = () => {
        setIsOnline(false)
      }

      window.addEventListener('online', updateOnline)
      window.addEventListener('offline', updateOffline)

      // Auto-trigger sync on mount if online and drafts exist
      if (navigator.onLine && list.length > 0) {
        syncDrafts()
      }

      return () => {
        window.removeEventListener('online', updateOnline)
        window.removeEventListener('offline', updateOffline)
      }
    }
  }, [])

  const syncDrafts = async () => {
    const list = JSON.parse(localStorage.getItem('worker-drafts') || '[]')
    if (list.length === 0) return

    const toastId = toast.loading(`Syncing ${list.length} offline draft(s)...`)

    try {
      await executeAsWorker(async () => {
        for (const draft of list) {
          if (draft.type === 'crop') {
            await useCropStore.getState().addCrop(draft.payload)
          } else if (draft.type === 'livestock') {
            await useLivestockStore.getState().addUnit(draft.payload)
          } else if (draft.type === 'labor') {
            await useDashboardStore.getState().addTransaction(draft.payload)
          } else if (draft.type === 'expense') {
            await useDashboardStore.getState().addTransaction(draft.payload)
          } else if (draft.type === 'receipt') {
            await useDashboardStore.getState().addTransaction(draft.payload)
          } else if (draft.type === 'inventory') {
            await useInventoryStore.getState().addItem(draft.payload)
          } else if (draft.type === 'incident') {
            const { useAlertStore } = require('@/store/useAlertStore')
            await useAlertStore.getState().addAlert(draft.payload)
          }
        }
      })

      localStorage.removeItem('worker-drafts')
      setDraftsList([])
      toast.dismiss(toastId)
      toast.success(`Synced ${list.length} field drafts to approval center!`)
    } catch (err) {
      console.error(err)
      toast.dismiss(toastId)
      toast.error('Sync failed. Will retry when connection improves.')
    }
  }

  const handleModalSubmit = async (payload: any, label: string) => {
    const type = activeModal as any
    if (!type) return

    if (!navigator.onLine) {
      // Save offline draft
      const newDraft = {
        id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        label,
        payload,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      const updated = [...draftsList, newDraft]
      localStorage.setItem('worker-drafts', JSON.stringify(updated))
      setDraftsList(updated)
      toast.success('Saved locally as offline draft.')
    } else {
      // Standard Online submission
      await executeAsWorker(async () => {
        if (type === 'crop') {
          await useCropStore.getState().addCrop(payload)
        } else if (type === 'livestock') {
          await useLivestockStore.getState().addUnit(payload)
        } else if (type === 'labor') {
          await useDashboardStore.getState().addTransaction(payload)
        } else if (type === 'expense') {
          await useDashboardStore.getState().addTransaction(payload)
        } else if (type === 'receipt') {
          await useDashboardStore.getState().addTransaction(payload)
        } else if (type === 'inventory') {
          await useInventoryStore.getState().addItem(payload)
        } else if (type === 'incident') {
          const { useAlertStore } = require('@/store/useAlertStore')
          await useAlertStore.getState().addAlert(payload)
        }
      })
    }
  }

  const priorityStyle = {
    high:   { color: 'var(--status-critical)', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)'  },
    medium: { color: 'var(--status-warning)',  bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
    low:    { color: 'var(--status-success)',  bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.25)'  },
  } as const

  return (
    <div className="app-shell">
      <Toaster position="top-right" toastOptions={{ style: { background: 'var(--bg-card-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-soft)' } }} />
      <Sidebar />

      <div className="main-content">
        <Topbar title="Worker Data Entry Hub" subtitle="Field Operations Interface — All submissions route to Approval Center" />

        <div className="page-container" style={{ maxWidth: 960, margin: '0 auto' }}>

          {/* 🛠️ Admin Sandbox & Role Switcher */}
          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'data-entry') && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-soft)',
              borderRadius: 14,
              padding: '12px 18px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                  🛠️ Sandbox Mode:
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: currentUser.role === 'data-entry' ? 'var(--status-success)' : 'var(--status-info)' }}>
                  {currentUser.role === 'data-entry' ? 'Mary Operator (Data Entry Mode)' : 'Peter Admin (Estate Owner)'}
                </span>
              </div>
              <button 
                onClick={() => switchRole(currentUser.role === 'admin' ? 'data-entry' : 'admin')} 
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 11,
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                Switch to {currentUser.role === 'admin' ? 'Data Entry UX' : 'Owner Control UX'}
              </button>
            </div>
          )}

          {/* 📱 PWA Install Prompt Guidance */}
          {showInstallPrompt && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(16, 185, 129, 0.04) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.22)',
              borderRadius: 16,
              padding: '16px 20px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              boxShadow: 'var(--shadow-soft)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--status-success-glow)', border: '1px solid var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Smartphone size={20} color="var(--status-success)" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Add Worker Hub to your home screen</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Access Worker Hub from your phone in the field like a native app.</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button 
                  onClick={() => setInstallGuideOpen(true)} 
                  className="btn-primary" 
                  style={{ padding: '8px 16px', fontSize: 12, borderRadius: 10, background: 'var(--status-success)', color: 'var(--text-inverse)' }}
                >
                  Install Guide
                </button>
                <button onClick={() => setShowInstallPrompt(false)} style={{ padding: 6, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* 📡 Connection Status Banner */}
          {!isOnline && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 16,
              padding: '16px 20px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: 'var(--shadow-soft)'
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--status-warning-glow)', border: '1px solid var(--status-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <WifiOff size={20} color="var(--status-warning)" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Offline Mode Active</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Internet connection dropped. Submissions will be saved locally as Offline Drafts and auto-synced when connection returns.</div>
              </div>
            </div>
          )}

          {/* 📥 Offline Draft Queue */}
          {draftsList.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RefreshCw size={14} className="animate-spin" color="var(--status-warning)" />
                  <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', color: 'var(--status-warning)', textTransform: 'uppercase' }}>
                    Offline Draft Queue
                  </span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--status-warning)' }}>
                  {draftsList.length} draft(s) pending sync
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {draftsList.map(draft => (
                  <div key={draft.id} style={{
                    background: 'var(--bg-card-elevated)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: 14,
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{draft.label}</span>
                        <span style={{ fontSize: 10, fontWeight: 950, color: 'var(--status-warning)', background: 'var(--status-warning-glow)', padding: '2px 8px', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)', textTransform: 'uppercase' }}>
                          Offline Draft
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Saved locally at {draft.timestamp}</div>
                    </div>
                    {isOnline && (
                      <button 
                        onClick={() => syncDrafts()} 
                        style={{
                          padding: '6px 12px',
                          fontSize: 11,
                          fontWeight: 800,
                          color: 'var(--status-success)',
                          background: 'var(--status-success-glow)',
                          border: '1px solid rgba(34,197,94,0.3)',
                          borderRadius: 8,
                          cursor: 'pointer'
                        }}
                      >
                        Sync
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Today's Tasks ── */}
          <section style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClipboardList size={15} color="var(--text-muted)" />
                <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Today's Assigned Tasks
                </span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: tasksDone.size === ASSIGNED_TASKS.length ? 'var(--status-success)' : 'var(--text-muted)' }}>
                {tasksDone.size} / {ASSIGNED_TASKS.length} complete
              </span>
            </div>
            
            <div style={{ width: '100%', height: 4, background: 'var(--border-soft)', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
              <div style={{ 
                width: `${(tasksDone.size / ASSIGNED_TASKS.length) * 100}%`, 
                height: '100%', 
                background: 'var(--status-success)', 
                borderRadius: 2, 
                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
              }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ASSIGNED_TASKS.map(task => {
                const done = tasksDone.has(task.id)
                const pStyle = priorityStyle[task.priority as keyof typeof priorityStyle]
                return (
                  <button key={task.id} onClick={() => setActiveModal(task.action_id)} style={{
                    width: '100%', textAlign: 'left',
                    background: done ? 'var(--status-success-glow)' : 'var(--bg-card)',
                    border: `1px solid ${done ? 'var(--status-success)' : 'var(--border-soft)'}`,
                    borderRadius: 14, padding: '14px 18px',
                    display: 'flex', alignItems: 'center', gap: 14,
                    cursor: 'pointer', transition: 'all 0.2s', opacity: done ? 0.65 : 1
                  }}>
                    <div onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }} style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      border: `2px solid ${done ? 'var(--status-success)' : 'var(--border-strong)'}`,
                      background: done ? 'var(--status-success)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                      {done && <CheckCircle size={14} color="var(--text-inverse)" />}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>{task.label}</span>
                        {task.dueTime && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 800, color: 'var(--status-critical)', background: 'var(--status-critical-glow)', padding: '2px 8px', borderRadius: 12 }}>
                            <Clock size={10} /> Due {task.dueTime}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{task.segment}</div>
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 10, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', color: pStyle.color, background: pStyle.bg, border: `1px solid ${pStyle.border}` }}>
                      {task.priority}
                    </span>
                    <ChevronRight size={16} color="var(--text-muted)" style={{ opacity: 0.5, marginLeft: 8 }} />
                  </button>
                )
              })}
            </div>
          </section>

          {/* ── Action Cards ── */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Zap size={14} color="var(--text-muted)" />
              <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Operational Actions
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {CARDS.map(card => (
                <button key={card.id} onClick={() => setActiveModal(card.id)} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-soft)',
                  borderRadius: 18, padding: '22px 20px',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  gap: 12, textAlign: 'left', cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: 'var(--shadow-soft)', position: 'relative', overflow: 'hidden',
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.borderColor = card.color
                    el.style.transform = 'translateY(-3px)'
                    el.style.boxShadow = `var(--shadow-medium), 0 0 24px ${card.glow}`
                    el.style.background = 'var(--bg-card-elevated)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.borderColor = 'var(--border-soft)'
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = 'var(--shadow-soft)'
                    el.style.background = 'var(--bg-card)'
                  }}
                >
                  {/* glow orb */}
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: card.glow, filter: 'blur(24px)', pointerEvents: 'none' }} />

                  <div style={{ width: 46, height: 46, borderRadius: 14, background: card.glow, border: `1px solid ${card.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, flexShrink: 0 }}>
                    <card.Icon size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{card.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{card.sub}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, color: card.color, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {card.action} <ChevronRight size={12} />
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* ── Info Notice ── */}
          <div style={{ marginTop: 40, padding: '16px 20px', background: 'var(--status-info-glow)', border: '1px solid var(--status-info)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Zap size={16} color="var(--status-info)" style={{ flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--status-info)' }}>Connected System — </span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>All submissions flow to the <strong>Approval Center</strong> for owner review before being recorded in Crops, Livestock, Finance, and Inventory modules.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Bottom Action Bar for Mobile ── */}
      <div className="mobile-bottom-bar">
        <button className="mobile-bottom-bar-btn active" onClick={() => router.push('/worker-hub')}>
          <ClipboardList size={20} />
          <span>Worker Hub</span>
        </button>
        <button className="mobile-bottom-bar-btn" onClick={() => router.push('/employee-tasks')}>
          <CheckCircle size={20} />
          <span>My Tasks</span>
        </button>
        <button className="mobile-bottom-bar-btn" onClick={() => router.push('/login')}>
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>

      {/* ── Modals ── */}
      {activeModal === 'crop'      && <Modal title="Log Crop Update"      subtitle="Field condition & yield" icon={<Sprout size={17} color="var(--status-success)" />}  onClose={close}><CropModal onClose={close} onSubmit={handleModalSubmit} isOffline={!isOnline} /></Modal>}
      {activeModal === 'livestock' && <Modal title="Log Livestock Update"  subtitle="Daily count & feed log"  icon={<Beef size={17} color="var(--status-warning)" />}   onClose={close}><LivestockModal onClose={close} onSubmit={handleModalSubmit} isOffline={!isOnline} /></Modal>}
      {activeModal === 'labor'     && <Modal title="Log Labor Hours"       subtitle="Worker time tracking"    icon={<Clock size={17} color="var(--status-info)" />}      onClose={close}><LaborModal onClose={close} onSubmit={handleModalSubmit} isOffline={!isOnline} /></Modal>}
      {activeModal === 'expense'   && <Modal title="Add Expense"           subtitle="Pending owner approval"  icon={<DollarSign size={17} color="var(--text-secondary)" />} onClose={close}><ExpenseModal onClose={close} onSubmit={handleModalSubmit} isOffline={!isOnline} /></Modal>}
      {activeModal === 'receipt'   && <Modal title="Upload Receipt"        subtitle="Attach invoice or image" icon={<Upload size={17} color="var(--status-ai)" />}       onClose={close}><ReceiptModal onClose={close} onSubmit={handleModalSubmit} isOffline={!isOnline} /></Modal>}
      {activeModal === 'inventory' && <Modal title="Inventory Update"      subtitle="Log usage or restock"    icon={<Package size={17} color="var(--status-warning)" />}  onClose={close}><InventoryModal onClose={close} onSubmit={handleModalSubmit} isOffline={!isOnline} /></Modal>}
      {activeModal === 'incident'  && <Modal title="Report Incident"       subtitle="Immediately alerts owner" icon={<AlertTriangle size={17} color="var(--status-critical)" />} onClose={close}><IncidentModal onClose={close} onSubmit={handleModalSubmit} isOffline={!isOnline} /></Modal>}

      {/* ── PWA Install Guide Modal ── */}
      {installGuideOpen && (
        <Modal 
          title="PWA Install Guide" 
          subtitle="Add Braes Creek Worker to your home screen" 
          icon={<Smartphone size={17} color="var(--status-success)" />} 
          onClose={() => setInstallGuideOpen(false)}
        >
          <div style={{ padding: '16px 24px' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-soft)', marginBottom: 20 }}>
              <button 
                onClick={() => setActiveInstallTab('ios')} 
                style={{
                  flex: 1, padding: '12px', background: 'none', border: 'none',
                  borderBottom: activeInstallTab === 'ios' ? '2px solid var(--status-success)' : 'none',
                  color: activeInstallTab === 'ios' ? 'var(--status-success)' : 'var(--text-muted)',
                  fontWeight: 800, fontSize: 13, cursor: 'pointer'
                }}
              >
                 iPhone (Safari)
              </button>
              <button 
                onClick={() => setActiveInstallTab('android')} 
                style={{
                  flex: 1, padding: '12px', background: 'none', border: 'none',
                  borderBottom: activeInstallTab === 'android' ? '2px solid var(--status-success)' : 'none',
                  color: activeInstallTab === 'android' ? 'var(--status-success)' : 'var(--text-muted)',
                  fontWeight: 800, fontSize: 13, cursor: 'pointer'
                }}
              >
                🤖 Android (Chrome)
              </button>
            </div>

            {activeInstallTab === 'ios' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: 'var(--text-primary)', flexShrink: 0 }}>1</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Open **Safari** and navigate to this Worker Hub on your iPhone.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: 'var(--text-primary)', flexShrink: 0 }}>2</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Tap the **Share** button (box with an arrow pointing up) in Safari's bottom toolbar.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: 'var(--text-primary)', flexShrink: 0 }}>3</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Scroll down and select **Add to Home Screen**.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: 'var(--text-primary)', flexShrink: 0 }}>4</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Tap **Add** in the top right. The app icon will now appear on your home screen!
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: 'var(--text-primary)', flexShrink: 0 }}>1</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Open **Google Chrome** and navigate to this Worker Hub on your Android device.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: 'var(--text-primary)', flexShrink: 0 }}>2</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Tap the **Menu** button (3 dots) in Chrome's top right corner.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: 'var(--text-primary)', flexShrink: 0 }}>3</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Tap **Add to Home screen** or **Install app**.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: 'var(--text-primary)', flexShrink: 0 }}>4</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Confirm by tapping **Add** or **Install** to add the web app to your home screen and app drawer.
                  </div>
                </div>
              </div>
            )}
            <button className="btn-primary" onClick={() => setInstallGuideOpen(false)} style={{ width: '100%', padding: 14, marginTop: 24 }}>
              Got It
            </button>
          </div>
        </Modal>
      )}

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
          .modal {
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
