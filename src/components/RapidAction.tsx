'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';

interface RapidActionProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RapidAction({ isOpen, onClose }: RapidActionProps) {
  const { addExpense, addSalesRecord } = useAppStore();
  const [activeTab, setActiveTab] = useState<'expense' | 'income' | 'livestock'>('expense');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form States
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Production');
  const [segment, setSegment] = useState('Poultry');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        date: new Date().toISOString().split('T')[0],
        amount: parseFloat(amount),
        category_name: category,
        segment_name: segment,
        description,
        status: 'paid'
      };

      if (activeTab === 'expense') {
        await addExpense(payload as any);
      } else if (activeTab === 'income') {
        await addSalesRecord({ ...payload, item_name: description, unit_price: parseFloat(amount), quantity: 1 } as any);
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        // Reset
        setAmount('');
        setDescription('');
      }, 1500);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      cursor: 'pointer'
    }} onClick={onClose}>
      <div 
        className="card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '500px',
          background: 'rgba(15, 23, 42, 0.98)',
          padding: '40px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 60px rgba(255, 255, 255, 0.02)',
          cursor: 'default',
          borderRadius: '24px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Rapid Action Hub</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px' }}>
          {(['expense', 'income', 'livestock'] as const).map(t => (
            <button 
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '11px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                background: activeTab === t ? 'hsl(var(--btn-primary-bg))' : 'transparent',
                color: activeTab === t ? '#fff' : '#94A3B8',
                transition: '0.3s'
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'hsl(var(--text-muted))', marginBottom: '8px', textTransform: 'uppercase' }}>Value (USD)</label>
            <input 
              type="number" 
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', color: '#fff', fontSize: '16px', fontWeight: 900 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'hsl(var(--text-muted))', marginBottom: '8px', textTransform: 'uppercase' }}>Description / Item</label>
            <input 
              type="text" 
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Organic Feed Batch #12"
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', color: '#fff', fontSize: '14px', fontWeight: 700 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: '#94A3B8', marginBottom: '8px', textTransform: 'uppercase' }}>Strategic Segment</label>
              <select 
                value={segment}
                onChange={e => setSegment(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', color: '#fff', fontSize: '12px', fontWeight: 700 }}
              >
                <option value="Poultry">Poultry Nodes</option>
                <option value="Crops">Crop Systems</option>
                <option value="Livestock">Livestock Hub</option>
                <option value="Admin">Headquarters</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: '#94A3B8', marginBottom: '8px', textTransform: 'uppercase' }}>Analytical Category</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', color: '#fff', fontSize: '12px', fontWeight: 700 }}
              >
                <option value="Production">Operational</option>
                <option value="Maintenance">Infrastructure</option>
                <option value="Labor">Tactical Personnel</option>
                <option value="Assets">Capital Assets</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || success}
            className="btn btn-primary"
            style={{
              padding: '20px',
              marginTop: '12px',
              width: '100%',
              fontSize: '14px',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              background: success ? '#10b981' : undefined
            }}
          >
            {success ? '✓ TRANSACTION ENCRYPTED' : (loading ? 'INGESTING DATA...' : `CONFIRM ${activeTab.toUpperCase()}`)}
          </button>
        </form>
      </div>
    </div>
  );
}
