'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/data';

interface ControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ControlPanel({ isOpen, onClose }: ControlPanelProps) {
  const { 
    expenses, sales, livestockUnits, 
    selectedItem, setSelectedItem 
  } = useAppStore();

  const [editForm, setEditForm] = useState<any>(null);

  const totalRevenue = sales.reduce((s: any, r: any) => s + (r.total_amount || 0), 0);
  const totalExpenses = expenses.reduce((s: any, r: any) => s + (r.amount || 0), 0);

  useEffect(() => {
    if (selectedItem) {
      setEditForm({ ...selectedItem });
    } else {
      setEditForm(null);
    }
  }, [selectedItem]);

  if (!isOpen) return null;

  const handleSave = () => {
    alert(`System Auth: Changes committed for ${editForm.description || editForm.lender_name}.`);
    setSelectedItem(null);
  };

  const stations = [
    { id: 'dashboard', icon: '🏰', label: 'HQ' },
    { id: 'pl', icon: '🔬', label: 'Finance' },
    { id: 'livestock', icon: '🐔', label: 'Poultry' },
    { id: 'crops', icon: '🍎', label: 'Yield' },
    { id: 'settings', icon: '⚙️', label: 'System' },
  ];

  return (
    <div 
      className="vision-overlay" 
      style={{ 
        zIndex: 10000, position: 'fixed', inset: 0,
        background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(40px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px'
      }}
      onClick={() => { setSelectedItem(null); onClose(); }}
    >
      <div style={{ display: 'flex', gap: '48px', alignItems: 'center', maxWidth: '1100px', width: '100%', position: 'relative' }}>
        
        {/* NAV DOCK */}
        {!selectedItem && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '100px',
            padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '32px',
            animation: 'visionPop 0.4s ease'
          }} onClick={e => e.stopPropagation()}>
            {stations.map(s => (
              <button key={s.id} onClick={() => { if ((window as any).__onNavigate) (window as any).__onNavigate(s.id); onClose(); }} 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                <span style={{ fontSize: '28px' }}>{s.icon}</span>
                <span style={{ fontSize: '10px', fontWeight: 900, color: '#fff', opacity: 0.5 }}>{s.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* MAIN PANEL */}
        <div 
          style={{
            flex: 1, background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(60px)',
            border: '1px solid rgba(255, 255, 255, 0.4)', borderRadius: '64px',
            padding: '64px', position: 'relative', minHeight: '600px', display: 'flex', flexDirection: 'column',
            boxShadow: '0 120px 240px rgba(0,0,0,0.4)', animation: 'visionPop 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden'
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Subtle Dynamic Glint */}
          <div style={{ position: 'absolute', top: 0, left: '-100%', width: '40%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)', transform: 'skewX(-45deg)', animation: 'visionSweep 12s infinite linear', pointerEvents: 'none' }} />

          {selectedItem ? (
            <div style={{ animation: 'visionPop 0.5s ease' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: '#60a5fa', marginBottom: '8px' }}>SMART INSPECTOR V4.2</div>
                    <h2 style={{ fontSize: '36px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em' }}>Edit Ledger Record</h2>
                  </div>
                  <button onClick={() => setSelectedItem(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '12px 24px', borderRadius: '100px', cursor: 'pointer', fontWeight: 900 }}>DISCARD</button>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                  <div className="inspector-field">
                     <label style={labelStyle}>DESCRIPTION / LENDER</label>
                     <input 
                        type="text" 
                        value={editForm?.description || editForm?.lender_name || ''} 
                        onChange={e => setEditForm({ ...editForm, description: e.target.value, lender_name: e.target.value })}
                        style={inputStyle}
                        autoFocus
                     />
                  </div>
                  <div className="inspector-field">
                     <label style={labelStyle}>VALUATION (JMD)</label>
                     <input 
                        type="number" 
                        value={editForm?.amount || editForm?.principal || ''} 
                        onChange={e => setEditForm({ ...editForm, amount: parseFloat(e.target.value), principal: parseFloat(e.target.value) })}
                        style={inputStyle}
                     />
                  </div>
                  <div className="inspector-field" style={{ gridColumn: 'span 2' }}>
                     <label style={labelStyle}>EXECUTIVE REMARKS</label>
                     <textarea 
                        value={editForm?.notes || ''} 
                        onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                        style={{ ...inputStyle, minHeight: '140px', resize: 'none' }}
                     />
                  </div>
               </div>

               <div style={{ marginTop: '56px' }}>
                  <button 
                    onClick={handleSave}
                    style={{ width: '100%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', border: 'none', padding: '24px', borderRadius: '32px', fontSize: '18px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 20px 40px rgba(37, 99, 235, 0.4)' }}>
                    COMMIT UPDATES TO SYSTEM
                  </button>
               </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '56px', position: 'relative' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#fff', opacity: 0.5, letterSpacing: '0.25em', marginBottom: '8px' }}>SYSTEM OS V.7</div>
                  <h1 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-0.06em', color: '#fff' }}>HQ Command</h1>
                </div>
                <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '56px', height: '56px', borderRadius: '28px', cursor: 'pointer', fontSize: '24px' }}>✕</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr 1.2fr', gap: '40px', marginBottom: '56px', position: 'relative' }}>
                
                {/* ACTIVITY CAPSULES */}
                <div style={telemetryCard}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                     <span style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>Health Index</span>
                     <span style={{ fontSize: '11px', fontWeight: 900, padding: '6px 16px', background: '#fff', color: '#000', borderRadius: '100px' }}>STABLE</span>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', padding: '0 10px' }}>
                     {[45, 80, 55, 100, 70, 90, 60].map((h, i) => (
                       <div key={i} style={{ width: '22px', height: `${h}%`, background: 'rgba(255,255,255,0.03)', borderRadius: '100px', position: 'relative', overflow: 'hidden' }}>
                         <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to top, #3b82f6, #60a5fa)', borderRadius: '100px', opacity: 0.8 }} />
                       </div>
                     ))}
                   </div>
                </div>

                {/* QUICK DATA CLOUD */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                   {[
                     { icon: '💎', val: '8.4%', label: 'Purity' },
                     { icon: '⚡', val: '0.4ms', label: 'Sync' },
                     { icon: '🛰️', val: 'ACTIVE', label: 'Nodes' }
                   ].map((s, i) => (
                     <div key={i} style={{ ...telemetryCard, padding: '24px', flex: 1, display: 'flex', alignItems: 'center', gap: '20px' }}>
                       <div style={{ width: '52px', height: '52px', background: 'rgba(255,255,255,0.1)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{s.icon}</div>
                       <div>
                         <div style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>{s.val}</div>
                         <div style={{ fontSize: '10px', fontWeight: 900, color: '#fff', opacity: 0.4 }}>{s.label}</div>
                       </div>
                     </div>
                   ))}
                </div>

                {/* CIRCULAR INTEL */}
                <div style={telemetryCard}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                     <span style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>Yield Flow</span>
                     <span style={{ fontSize: '12px', fontWeight: 900, opacity: 0.3 }}>CORE</span>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                     <div style={{ width: '130px', height: '130px', borderRadius: '50%', border: '12px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRightColor: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 900, color: '#fff' }}>
                       84%
                     </div>
                     <div style={{ flex: 1 }}>
                       <div>
                         <div style={{ fontSize: '11px', color: '#fff', opacity: 0.4, fontWeight: 900 }}>REVENUE</div>
                         <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>{formatCurrency(totalRevenue)}</div>
                       </div>
                     </div>
                   </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '48px', position: 'relative' }}>
                <div>
                  <h3 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '32px', color: '#fff' }}>Directives</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                      { label: 'Asset Node Link', status: 'ACTIVE', color: '#fbbf24' },
                      { label: 'Relay Integrity', status: 'OK', color: '#10b981' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '20px 32px', borderRadius: '100px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color }} />
                        <span style={{ flex: 1, fontSize: '17px', fontWeight: 900, color: '#fff' }}>{item.label}</span>
                        <span style={{ fontSize: '10px', fontWeight: 900, color: item.color, background: 'rgba(255,255,255,0.05)', padding: '6px 16px', borderRadius: '100px', border: `1px solid ${item.color}40` }}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '48px', padding: '40px', border: '1px solid rgba(255,255,255,0.1)' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                       <span style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>Flux Output</span>
                       <span style={{ fontSize: '11px', fontWeight: 900, color: '#10b981' }}>9.8V</span>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>⚡</div>
                        <div>
                          <div style={{ fontSize: '32px', fontWeight: 900, color: '#fff' }}>98.4%</div>
                          <div style={{ fontSize: '13px', fontWeight: 900, color: '#fff', opacity: 0.3 }}>SIGNAL</div>
                        </div>
                     </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes visionPop {
          from { opacity: 0; transform: translateY(140px) scale(0.9) rotateX(20deg); filter: blur(40px); }
          to { opacity: 1; transform: translateY(0) scale(1) rotateX(0); filter: blur(0); }
        }
        @keyframes visionSweep {
          0% { left: -100%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.05)', 
  border: '1px solid rgba(255,255,255,0.15)', padding: '24px', 
  borderRadius: '24px', color: '#fff', fontSize: '20px', 
  fontWeight: 900, outline: 'none'
};

const labelStyle = { 
  display: 'block', fontSize: '11px', fontWeight: 900, 
  opacity: 0.5, marginBottom: '12px', letterSpacing: '0.1em' 
};

const telemetryCard = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '48px',
  padding: '40px'
};
