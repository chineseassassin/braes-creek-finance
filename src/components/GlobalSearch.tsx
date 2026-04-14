'use client';
import { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/data';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  page: string;
  icon: string;
  amount?: number;
}

export default function GlobalSearch({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const store = useAppStore();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    
    const items: SearchResult[] = [];

    // Search Expenses
    store.expenses?.forEach(e => {
      if (e.description.toLowerCase().includes(q) || e.vendor_name.toLowerCase().includes(q)) {
        items.push({
          id: e.id,
          type: 'Expense',
          title: e.description,
          subtitle: `${e.vendor_name} · ${e.date}`,
          page: 'expenses',
          icon: '💸',
          amount: e.amount
        });
      }
    });

    // Search Loans
    store.loans?.forEach(l => {
      if (l.lender_name.toLowerCase().includes(q) || l.purpose.toLowerCase().includes(q)) {
        items.push({
          id: l.id,
          type: 'Loan',
          title: l.lender_name,
          subtitle: l.purpose,
          page: 'loans',
          icon: '🏦',
          amount: l.remaining_balance
        });
      }
    });

    // Search Livestock
    store.livestockUnits?.forEach(u => {
      if (u.animal_type.toLowerCase().includes(q) || u.breed.toLowerCase().includes(q)) {
        items.push({
          id: u.id,
          type: 'Livestock',
          title: u.animal_type,
          subtitle: `${u.breed} · ${u.location}`,
          page: 'livestock',
          icon: '🐄'
        });
      }
    });

    // Search Crops
    store.cropTypes?.forEach(c => {
      if (c.name.toLowerCase().includes(q) || c.variety.toLowerCase().includes(q)) {
        items.push({
          id: c.id,
          type: 'Crop',
          title: c.name,
          subtitle: `${c.variety} · ${c.status}`,
          page: 'crops',
          icon: '🌿'
        });
      }
    });

    // Search Maintenance
    store.maintenanceRecords?.forEach(m => {
      if (m.equipment_name.toLowerCase().includes(q) || m.maintenance_type.toLowerCase().includes(q)) {
        items.push({
          id: m.id,
          type: 'Maintenance',
          title: m.equipment_name,
          subtitle: m.maintenance_type,
          page: 'maintenance',
          icon: '🔧',
          amount: m.cost
        });
      }
    });

    // Search Vendors
    store.vendors?.forEach(v => {
      if (v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q)) {
        items.push({
          id: v.id,
          type: 'Vendor',
          title: v.name,
          subtitle: v.category,
          page: 'vendors',
          icon: '🏪'
        });
      }
    });

    return items.slice(0, 8); // Limit to top 8 results
  }, [query, store]);

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(open => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (page: string) => {
    onNavigate(page);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      <div className="search-wrapper" style={{ flex: 1, maxWidth: '400px', position: 'relative' }} onClick={() => setIsOpen(true)}>
        <span className="search-icon" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 2, pointerEvents: 'none' }}>🔍</span>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 12px 8px 36px',
          color: 'var(--text-muted)',
          fontSize: '13px',
          cursor: 'text',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          Search platform...
          <span style={{ fontSize: '10px', padding: '2px 6px', background: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
            ⌘K
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="modal-overlay" style={{ alignItems: 'flex-start', paddingTop: '10vh' }} onClick={() => setIsOpen(false)}>
          <div className="modal" style={{ maxWidth: '600px', padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '18px', marginRight: '12px' }}>🔍</span>
              <input
                autoFocus
                type="text"
                placeholder="Type to search anything (expenses, loans, animals, crops...)"
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '16px'
                }}
              />
              <button 
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost btn-icon btn-sm"
              >✕</button>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px' }}>
              {!query ? (
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Frequent Pages</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {[
                      { id: 'expenses', label: 'Expenses', icon: '💸' },
                      { id: 'loans', label: 'Loans', icon: '🏦' },
                      { id: 'livestock', label: 'Livestock', icon: '🐄' },
                      { id: 'crops', label: 'Crops', icon: '🌿' },
                    ].map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => handleSelect(p.id)}
                        style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                      >
                        <span style={{ fontSize: '18px' }}>{p.icon}</span>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{p.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : results.length > 0 ? (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '8px 12px' }}>Search Results</div>
                  {results.map(res => (
                    <div 
                      key={res.id}
                      onClick={() => handleSelect(res.page)}
                      style={{ 
                        padding: '12px', 
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '14px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ 
                        width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-secondary)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' 
                      }}>
                        {res.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{res.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{res.type} · {res.subtitle}</div>
                      </div>
                      {res.amount !== undefined && (
                        <div style={{ fontSize: '14px', fontWeight: 700, color: res.type === 'Expense' ? 'var(--accent-red)' : 'var(--accent-blue)' }}>
                          {formatCurrency(res.amount)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>😕</div>
                  <div>No results found for "{query}"</div>
                </div>
              )}
            </div>
            
            <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Press <strong style={{ color: 'var(--text-secondary)' }}>Enter</strong> to select</span>
              <span><strong style={{ color: 'var(--text-secondary)' }}>Esc</strong> to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
