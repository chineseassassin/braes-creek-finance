'use client'
import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { toast } from 'react-hot-toast'
import {
  Home, ClipboardList, Upload, Beef, Sprout, Package, Wrench,
  ChevronLeft, CheckCircle2, Camera, Clock, Wifi, WifiOff, Check,
  User, AlertTriangle
} from 'lucide-react'

type Screen = 'home'|'tasks'|'labor'|'receipt'|'livestock'|'crop'|'inventory'|'maintenance'

const ACTIONS = [
  { id:'tasks',       label:'My Tasks',        icon:ClipboardList, color:'#3b82f6', desc:'View assigned' },
  { id:'labor',       label:'Submit Labor',     icon:Clock,         color:'#22c55e', desc:'Log hours' },
  { id:'receipt',     label:'Upload Receipt',   icon:Upload,        color:'#f59e0b', desc:'Photo or file' },
  { id:'livestock',   label:'Livestock Update', icon:Beef,          color:'#ef4444', desc:'Health & count' },
  { id:'crop',        label:'Crop Update',      icon:Sprout,        color:'#10b981', desc:'Field status' },
  { id:'inventory',   label:'Inventory',        icon:Package,       color:'#8b5cf6', desc:'Stock levels' },
  { id:'maintenance', label:'Maintenance',      icon:Wrench,        color:'#f97316', desc:'Report issue' },
]

const TASKS = [
  { id:'t1', title:'Update cattle headcount',        due:'Due today',    priority:'high',   module:'Livestock' },
  { id:'t2', title:'Upload feed supply receipt',      due:'Due today',    priority:'medium', module:'Inventory' },
  { id:'t3', title:'Log morning labor hours',         due:'Due by 12:00', priority:'high',   module:'Labor' },
  { id:'t4', title:'Check irrigation – North field',  due:'Due tomorrow', priority:'low',    module:'Maintenance' },
]

const inp: React.CSSProperties = {
  width:'100%', height:56, padding:'0 16px',
  background:'var(--bg-card-elevated)', border:'1px solid var(--border-soft)',
  borderRadius:14, color:'var(--text-primary)', fontSize:16, outline:'none', boxSizing:'border-box'
}
const lbl: React.CSSProperties = {
  fontSize:11, fontWeight:800, color:'var(--text-muted)',
  textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6, display:'block'
}
const ta: React.CSSProperties = { ...inp, height:100, padding:'14px 16px', resize:'none' }

export default function MobileFieldMode() {
  const [isMobile, setIsMobile]   = useState(false)
  const [screen, setScreen]       = useState<Screen>('home')
  const [isOnline, setIsOnline]   = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [laborF, setLaborF]       = useState({ date: new Date().toISOString().split('T')[0], task_type:'', hours:'', notes:'' })
  const [lsF, setLsF]             = useState({ animal_type:'', change:'', health:'healthy', notes:'' })
  const [cropF, setCropF]         = useState({ crop:'', field:'', status:'', notes:'' })
  const [invF, setInvF]           = useState({ item:'', qty:'', unit:'kg', notes:'' })
  const [maintF, setMaintF]       = useState({ equipment:'', issue:'', severity:'medium', notes:'' })
  const [rcptNotes, setRcptNotes] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const { currentUser, logEmployeeSubmission, emitSystemEvent } = useAppStore()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const on  = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    setIsOnline(navigator.onLine)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  if (!isMobile) return null

  const goHome = () => { setScreen('home'); setSubmitted(false) }

  const submit = (module: string, data: Record<string, string>) => {
    if (!isOnline) {
      const drafts = JSON.parse(localStorage.getItem('field-drafts') || '[]')
      drafts.push({ module, data, ts: new Date().toISOString() })
      localStorage.setItem('field-drafts', JSON.stringify(drafts))
      toast.error('Offline — saved as draft. Will sync when connected.')
      return
    }
    logEmployeeSubmission(module, 'update', 'task', `field-${Date.now()}`, data)
    emitSystemEvent({ type:'update', severity:'info', module, message:`${currentUser.name} submitted ${module} field report`, metadata: data })
    setSubmitted(true)
    toast.success('Submitted for owner approval ✓')
    setTimeout(goHome, 2500)
  }

  /* ── Shared sub-components ── */
  const Header = ({ title }: { title: string }) => (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 20px', borderBottom:'1px solid var(--border-soft)', background:'var(--bg-card-elevated)', flexShrink:0 }}>
      <button onClick={goHome} style={{ width:40, height:40, borderRadius:12, background:'var(--bg-surface)', border:'1px solid var(--border-soft)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-primary)' }}>
        <ChevronLeft size={20}/>
      </button>
      <h2 style={{ fontSize:17, fontWeight:900, color:'var(--text-primary)', margin:0 }}>{title}</h2>
    </div>
  )

  const SubmitBtn = ({ label, onPress }: { label: string; onPress: () => void }) => (
    <div style={{ padding:'16px 20px', background:'var(--bg-surface)', borderTop:'1px solid var(--border-soft)', flexShrink:0 }}>
      <button onClick={onPress} style={{ width:'100%', height:56, background:'var(--status-success)', color:'#fff', border:'none', borderRadius:16, fontSize:16, fontWeight:900, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
        <CheckCircle2 size={20}/> {label}
      </button>
    </div>
  )

  const Success = ({ module }: { module: string }) => (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center' }}>
      <div style={{ width:80, height:80, borderRadius:'50%', background:'var(--status-success-glow)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:24, border:'2px solid var(--status-success)' }}>
        <CheckCircle2 size={40} color="var(--status-success)"/>
      </div>
      <h2 style={{ fontSize:22, fontWeight:900, color:'var(--text-primary)', marginBottom:8 }}>Submitted!</h2>
      <p style={{ fontSize:14, color:'var(--text-muted)', lineHeight:1.6, marginBottom:24 }}>
        Your {module} report is pending<br/><strong style={{ color:'var(--status-success)' }}>owner approval.</strong>
      </p>
      <button onClick={goHome} style={{ padding:'16px 32px', background:'var(--status-success)', color:'#fff', border:'none', borderRadius:16, fontSize:15, fontWeight:800, cursor:'pointer' }}>Back to Field Menu</button>
    </div>
  )

  /* ── Screens ── */
  const HomeScreen = () => (
    <div style={{ flex:1, overflowY:'auto' }}>
      <div style={{ padding:'20px 20px 0' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:800, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Field Mode</div>
            <div style={{ fontSize:20, fontWeight:900, color:'var(--text-primary)' }}>Hey, {currentUser.name.split(' ')[0]} 👋</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:20, background: isOnline ? 'var(--status-success-glow)' : 'var(--status-critical-glow)', border:`1px solid ${isOnline ? 'var(--status-success)' : 'var(--status-critical)'}` }}>
            {isOnline ? <Wifi size={12} color="var(--status-success)"/> : <WifiOff size={12} color="var(--status-critical)"/>}
            <span style={{ fontSize:10, fontWeight:900, color: isOnline ? 'var(--status-success)' : 'var(--status-critical)' }}>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
        </div>
        <div style={{ background:'var(--bg-card-elevated)', border:'1px solid var(--border-soft)', borderRadius:16, padding:'14px 16px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase' }}>Today</div>
            <div style={{ fontSize:14, fontWeight:800, color:'var(--text-primary)' }}>{new Date().toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:24, fontWeight:900, color:'var(--status-warning)' }}>3</div>
            <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:700 }}>Tasks Due</div>
          </div>
        </div>
        <div style={{ fontSize:11, fontWeight:900, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Quick Actions</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, padding:'0 20px 120px' }}>
        {ACTIONS.map(a => {
          const Icon = a.icon
          return (
            <button key={a.id} onClick={() => setScreen(a.id as Screen)} style={{ padding:'18px 14px', background:'var(--bg-card)', border:'1px solid var(--border-soft)', borderRadius:18, cursor:'pointer', textAlign:'left', display:'flex', flexDirection:'column', gap:10, minHeight:100 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:`${a.color}22`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon size={20} color={a.color}/>
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:800, color:'var(--text-primary)', marginBottom:2 }}>{a.label}</div>
                <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:600 }}>{a.desc}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  const TasksScreen = () => (
    <>
      <Header title="My Tasks"/>
      <div style={{ flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:10 }}>
        {TASKS.map(t => (
          <div key={t.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border-soft)', borderRadius:16, padding:18, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:800, color:'var(--text-primary)', marginBottom:6 }}>{t.title}</div>
              <div style={{ display:'flex', gap:8 }}>
                <span style={{ fontSize:10, fontWeight:800, padding:'3px 8px', borderRadius:20, background: t.priority==='high' ? 'var(--status-critical-glow)' : t.priority==='medium' ? 'var(--status-warning-glow)' : 'var(--status-success-glow)', color: t.priority==='high' ? 'var(--status-critical)' : t.priority==='medium' ? 'var(--status-warning)' : 'var(--status-success)' }}>{t.priority.toUpperCase()}</span>
                <span style={{ fontSize:10, color:'var(--text-muted)', fontWeight:600 }}>{t.due}</span>
              </div>
            </div>
            <button onClick={() => { toast.success(`"${t.title}" marked complete`); logEmployeeSubmission(t.module,'update','task',t.id,{completed:true}) }} style={{ width:44, height:44, borderRadius:14, background:'var(--status-success-glow)', border:'1px solid var(--status-success)', color:'var(--status-success)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', marginLeft:10, flexShrink:0 }}>
              <Check size={20}/>
            </button>
          </div>
        ))}
      </div>
    </>
  )

  const LaborScreen = () => submitted ? <Success module="Labor"/> : (
    <>
      <Header title="Submit Labor"/>
      <div style={{ flex:1, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:18 }}>
        <div><label style={lbl}>Date</label><input type="date" style={inp} value={laborF.date} onChange={e=>setLaborF(p=>({...p,date:e.target.value}))}/></div>
        <div><label style={lbl}>Task Type</label>
          <select style={inp} value={laborF.task_type} onChange={e=>setLaborF(p=>({...p,task_type:e.target.value}))}>
            <option value="">Select task type...</option>
            {['Livestock Care','Crop Maintenance','Equipment Operation','Harvesting','Irrigation','Feed & Supplies','General Farm Work'].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Hours Worked</label><input type="number" min="0" max="24" step="0.5" placeholder="e.g. 8" style={inp} value={laborF.hours} onChange={e=>setLaborF(p=>({...p,hours:e.target.value}))}/></div>
        <div><label style={lbl}>Notes</label><textarea style={ta} placeholder="Any details..." value={laborF.notes} onChange={e=>setLaborF(p=>({...p,notes:e.target.value}))}/></div>
      </div>
      <SubmitBtn label="Submit Labor Report" onPress={()=>{ if(!laborF.task_type||!laborF.hours){toast.error('Fill task type and hours');return} submit('Labor',laborF) }}/>
    </>
  )

  const ReceiptScreen = () => submitted ? <Success module="Receipt"/> : (
    <>
      <Header title="Upload Receipt"/>
      <div style={{ flex:1, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:18 }}>
        <div onClick={()=>fileRef.current?.click()} style={{ border:'2px dashed var(--status-success)', borderRadius:20, padding:'36px 20px', textAlign:'center', cursor:'pointer', background:'var(--status-success-glow)' }}>
          <Camera size={36} color="var(--status-success)" style={{ margin:'0 auto 10px' }}/>
          <div style={{ fontSize:15, fontWeight:800, color:'var(--text-primary)', marginBottom:4 }}>Tap to capture or upload</div>
          <div style={{ fontSize:12, color:'var(--text-muted)' }}>Photo, PDF, or file</div>
        </div>
        <input ref={fileRef} type="file" accept="image/*,.pdf,.xlsx,.csv" capture="environment" style={{display:'none'}} onChange={e=>{ if(e.target.files?.[0]) toast.success(`File ready: ${e.target.files[0].name}`) }}/>
        <div><label style={lbl}>Notes</label><textarea style={ta} placeholder="Describe the receipt..." value={rcptNotes} onChange={e=>setRcptNotes(e.target.value)}/></div>
      </div>
      <SubmitBtn label="Submit Receipt" onPress={()=>submit('Reports',{notes:rcptNotes})}/>
    </>
  )

  const LivestockScreen = () => submitted ? <Success module="Livestock"/> : (
    <>
      <Header title="Livestock Update"/>
      <div style={{ flex:1, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:18 }}>
        <div><label style={lbl}>Animal Type</label>
          <select style={inp} value={lsF.animal_type} onChange={e=>setLsF(p=>({...p,animal_type:e.target.value}))}>
            <option value="">Select type...</option>
            {['Cattle','Goats','Sheep','Poultry','Pigs','Other'].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Count Change (+/-)</label><input type="number" placeholder="e.g. -2 or +5" style={inp} value={lsF.change} onChange={e=>setLsF(p=>({...p,change:e.target.value}))}/></div>
        <div><label style={lbl}>Health Status</label>
          <select style={inp} value={lsF.health} onChange={e=>setLsF(p=>({...p,health:e.target.value}))}>
            {['healthy','sick','injured','deceased','quarantined'].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Notes</label><textarea style={ta} placeholder="Observations..." value={lsF.notes} onChange={e=>setLsF(p=>({...p,notes:e.target.value}))}/></div>
      </div>
      <SubmitBtn label="Submit Livestock Report" onPress={()=>{ if(!lsF.animal_type){toast.error('Select animal type');return} submit('Livestock',lsF) }}/>
    </>
  )

  const CropScreen = () => submitted ? <Success module="Crop"/> : (
    <>
      <Header title="Crop Update"/>
      <div style={{ flex:1, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:18 }}>
        <div><label style={lbl}>Crop Name</label>
          <select style={inp} value={cropF.crop} onChange={e=>setCropF(p=>({...p,crop:e.target.value}))}>
            <option value="">Select crop...</option>
            {['Corn','Soya','Coffee','Cocoa','Cassava','Plantain','Vegetables','Other'].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Field / Location</label><input style={inp} placeholder="e.g. North Field B" value={cropF.field} onChange={e=>setCropF(p=>({...p,field:e.target.value}))}/></div>
        <div><label style={lbl}>Status</label>
          <select style={inp} value={cropF.status} onChange={e=>setCropF(p=>({...p,status:e.target.value}))}>
            <option value="">Select status...</option>
            {['Growing - Healthy','Growing - Needs Attention','Ready for Harvest','Issue Detected','Harvested'].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Notes</label><textarea style={ta} placeholder="Field observations..." value={cropF.notes} onChange={e=>setCropF(p=>({...p,notes:e.target.value}))}/></div>
      </div>
      <SubmitBtn label="Submit Crop Report" onPress={()=>{ if(!cropF.crop||!cropF.status){toast.error('Fill crop and status');return} submit('Crops',cropF) }}/>
    </>
  )

  const InventoryScreen = () => submitted ? <Success module="Inventory"/> : (
    <>
      <Header title="Inventory Update"/>
      <div style={{ flex:1, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:18 }}>
        <div><label style={lbl}>Item</label>
          <select style={inp} value={invF.item} onChange={e=>setInvF(p=>({...p,item:e.target.value}))}>
            <option value="">Select item...</option>
            {['Diesel Fuel','Fertilizer','Pesticide','Animal Feed','Seeds','Water','Medical Supplies','Other'].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div><label style={lbl}>Quantity</label><input type="number" min="0" placeholder="0" style={inp} value={invF.qty} onChange={e=>setInvF(p=>({...p,qty:e.target.value}))}/></div>
          <div><label style={lbl}>Unit</label>
            <select style={inp} value={invF.unit} onChange={e=>setInvF(p=>({...p,unit:e.target.value}))}>
              {['kg','L','bags','units','tonnes'].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div><label style={lbl}>Notes</label><textarea style={ta} placeholder="Stock notes..." value={invF.notes} onChange={e=>setInvF(p=>({...p,notes:e.target.value}))}/></div>
      </div>
      <SubmitBtn label="Submit Inventory Update" onPress={()=>{ if(!invF.item||!invF.qty){toast.error('Fill item and quantity');return} submit('Inventory',invF) }}/>
    </>
  )

  const MaintenanceScreen = () => submitted ? <Success module="Maintenance"/> : (
    <>
      <Header title="Maintenance Log"/>
      <div style={{ flex:1, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:18 }}>
        <div><label style={lbl}>Equipment</label>
          <select style={inp} value={maintF.equipment} onChange={e=>setMaintF(p=>({...p,equipment:e.target.value}))}>
            <option value="">Select equipment...</option>
            {['Tractor','Generator','Irrigation Pump','Vehicle','Harvester','Storage Tank','Other'].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Issue Description</label><input style={inp} placeholder="Brief description..." value={maintF.issue} onChange={e=>setMaintF(p=>({...p,issue:e.target.value}))}/></div>
        <div><label style={lbl}>Severity</label>
          <select style={inp} value={maintF.severity} onChange={e=>setMaintF(p=>({...p,severity:e.target.value}))}>
            {['low','medium','high','critical'].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Notes</label><textarea style={ta} placeholder="Additional details..." value={maintF.notes} onChange={e=>setMaintF(p=>({...p,notes:e.target.value}))}/></div>
      </div>
      <SubmitBtn label="Log Maintenance Issue" onPress={()=>{ if(!maintF.equipment||!maintF.issue){toast.error('Fill equipment and issue');return} submit('Infrastructure',maintF) }}/>
    </>
  )

  const screenMap: Record<Screen, React.ReactNode> = {
    home:        <HomeScreen/>,
    tasks:       <TasksScreen/>,
    labor:       <LaborScreen/>,
    receipt:     <ReceiptScreen/>,
    livestock:   <LivestockScreen/>,
    crop:        <CropScreen/>,
    inventory:   <InventoryScreen/>,
    maintenance: <MaintenanceScreen/>,
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, background:'var(--bg-body)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {screenMap[screen]}

      {/* Bottom Nav — only on home */}
      {screen === 'home' && (
        <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'var(--bg-card-elevated)', borderTop:'1px solid var(--border-soft)', display:'grid', gridTemplateColumns:'repeat(3,1fr)', padding:'8px 0 env(safe-area-inset-bottom, 8px)' }}>
          {[
            { label:'Home',   icon:<Home size={22}/>,         active:true },
            { label:'Tasks',  icon:<ClipboardList size={22}/>, active:false, fn:()=>setScreen('tasks') },
            { label:'Profile',icon:<User size={22}/>,          active:false, fn:()=>toast('Profile settings available on desktop') },
          ].map(b=>(
            <button key={b.label} onClick={b.fn} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'8px 0', background:'none', border:'none', cursor:'pointer', color: b.active ? 'var(--status-success)' : 'var(--text-muted)' }}>
              {b.icon}
              <span style={{ fontSize:10, fontWeight:800 }}>{b.label}</span>
            </button>
          ))}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html:`
        @media (max-width: 767px) {
          aside { display: none !important; }
          .main-content { margin-left: 0 !important; }
        }
        select { -webkit-appearance: none; }
        input[type=date], input[type=number], select, textarea {
          -webkit-appearance: none; font-family: inherit;
        }
      `}}/>
    </div>
  )
}
