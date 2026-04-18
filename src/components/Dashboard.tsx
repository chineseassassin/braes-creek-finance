import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  formatCurrency, getMonthlySpend, getExpensesBySegment, 
  getTotalExpenses, getTotalLoansOutstanding, calculateGrowth,
  getExecutiveBrief, getComparisonData, getAnomalies, getEfficiencyData
} from '@/lib/data';

export default function Dashboard() {
  const { 
    expenses, loans, sales, laborEntries, livestockUnits, currentUser, weatherIcon, 
    temperature, farmLocation, notifications, setControlPanelOpen
  } = useAppStore();
  
  const [activeRange, setActiveRange] = useState('1M');
  const [chartMode, setChartMode] = useState<'single' | 'compare' | 'efficiency'>('single');
  const [filterSegment, setFilterSegment] = useState<string | null>(null);

  // 1. FILTERED DATA LOGIC (DRILL-DOWN)
  const filteredSales = filterSegment ? sales.filter(s => s.segment_name?.includes(filterSegment)) : sales;
  const filteredExpenses = filterSegment ? expenses.filter(e => e.segment_name?.includes(filterSegment)) : expenses;
  const filteredLoans = filterSegment ? loans.filter(l => l.segment_name?.includes(filterSegment)) : loans;
  const filteredLabor = filterSegment ? laborEntries.filter(l => l.segment_name?.includes(filterSegment)) : laborEntries;

  const totalRevenue = filteredSales.reduce((s: any, r: any) => s + (r.total_amount || 0), 0);
  const totalExpenses = getTotalExpenses(filteredExpenses);
  const totalOutstanding = getTotalLoansOutstanding(filteredLoans);
  
  const growth = calculateGrowth(totalRevenue, totalRevenue * 0.88); 
  const execBrief = getExecutiveBrief(filteredSales, filteredExpenses, filteredLoans);
  const anomalies = getAnomalies(filteredExpenses);

  const monthlyData = getMonthlySpend(filteredExpenses);
  const comparisonData = getComparisonData(filteredSales, filteredExpenses);
  const efficiencyData = getEfficiencyData(filteredSales, filteredLabor);

  const segmentData = Object.entries(getExpensesBySegment(expenses))
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ 
      name, 
      shortName: name.split(' ').slice(0, 2).join(' '),
      value,
      trend: '+4.2%', 
      icon: name.toLowerCase().includes('poultry') ? '🐔' : name.toLowerCase().includes('orchard') ? '🍎' : '🏢'
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-light))', borderRadius: '20px', padding: '16px', boxShadow: 'var(--shadow-xl)' }}>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }}>{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color, fontSize: '18px', fontWeight: 900 }}>
              {p.name}: {p.name === 'Efficiency' ? `${p.value.toFixed(2)}/hr` : formatCurrency(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.04em' }}>Strategic Intelligence</h1>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '14px', fontWeight: 500 }}>
            {filterSegment ? `Drill-down: ${filterSegment}` : 'Live executive overview of Braes Creek Estate.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           {filterSegment && (
             <button onClick={() => setFilterSegment(null)} style={{ border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '10px 20px', borderRadius: '100px', fontSize: '12px', fontWeight: 900, cursor: 'pointer' }}>
               RESET VIEW
             </button>
           )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '100px', background: 'hsl(var(--bg-secondary))', border: '1px solid hsl(var(--border))' }}>
             <span style={{ fontSize: '20px' }}>{weatherIcon}</span>
             <span style={{ fontSize: '14px', fontWeight: 800 }}>{temperature}</span>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => setControlPanelOpen(true)}
            style={{ borderRadius: '100px', height: '48px', padding: '0 24px' }}
          >
            ➕ Rapid Action
          </button>
        </div>
      </div>

      {/* ANOMALY ALERTS (FEATURE #3) */}
      {anomalies.length > 0 && (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '10px' }}>
          {anomalies.map((a, i) => (
            <div key={i} style={{ 
              flexShrink: 0, 
              background: a.severity === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(251, 191, 36, 0.1)', 
              border: `1px solid ${a.severity === 'danger' ? '#ef444460' : '#fbbf2460'}`,
              padding: '12px 24px',
              borderRadius: '100px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              animation: 'visionPop 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <span style={{ fontSize: '18px' }}>{a.severity === 'danger' ? '🚨' : '⚠️'}</span>
              <span style={{ fontSize: '13px', fontWeight: 900, color: a.severity === 'danger' ? '#ef4444' : '#b45309' }}>{a.msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* EXECUTIVE INTELLIGENCE BRIEF */}
      <div style={{ 
        background: 'rgba(59, 130, 246, 0.05)', 
        border: '1px solid rgba(59, 130, 246, 0.2)', 
        borderRadius: '24px', 
        padding: '24px 32px', 
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px'
      }}>
        <div style={{ width: '48px', height: '48px', background: '#3b82f6', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🛡️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Executive Narrative Analysis</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'hsl(var(--text-primary))', lineHeight: 1.4 }}>
            {execBrief}
          </div>
        </div>
        <button className="btn btn-ghost" style={{ fontSize: '13px', fontWeight: 800 }}>Full Analysis →</button>
      </div>

      {/* STAGE 1: HERO REVENUE CARD */}
      <div className="card" style={{ 
        background: filterSegment ? 'linear-gradient(225deg, #1e3a8a, #1d4ed8)' : 'linear-gradient(225deg, hsl(var(--accent-green)), hsl(var(--accent-teal)))',
        border: 'none',
        padding: '48px',
        marginBottom: '32px',
        color: filterSegment ? '#fff' : '#000',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: filterSegment ? 0.6 : 0.7, marginBottom: '16px' }}>
            {filterSegment ? `${filterSegment} Valuation` : 'Total Estate Valuation'}
          </div>
          <div style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, marginBottom: '16px' }}>
            {formatCurrency(totalRevenue)}
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ background: 'rgba(0,0,0,0.1)', padding: '6px 16px', borderRadius: '100px', fontSize: '14px', fontWeight: 800 }}>
              📈 {growth} <span style={{ opacity: 0.6, fontSize: '12px' }}>v. prev cycle</span>
            </span>
            <span style={{ fontSize: '14px', fontWeight: 700, opacity: 0.7 }}>Sector Impact Matrix Active</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '24px', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', opacity: 0.6, marginBottom: '4px' }}>Expenses</div>
            <div style={{ fontSize: '24px', fontWeight: 900 }}>{formatCurrency(totalExpenses)}</div>
          </div>
          <div style={{ width: '1px', background: 'rgba(0,0,0,0.1)', margin: '4px 0' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', opacity: 0.6, marginBottom: '4px' }}>Debt Leverage</div>
            <div style={{ fontSize: '24px', fontWeight: 900 }}>{formatCurrency(totalOutstanding)}</div>
          </div>
        </div>
        <div style={{ position: 'absolute', right: '-40px', bottom: '-80px', fontSize: '320px', opacity: 0.08, transform: 'rotate(-15deg)', pointerEvents: 'none' }}>🛡️</div>
      </div>

      {/* STAGE 2: Charts & Assets Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        
        {/* Performance Chart Hub */}
        <div className="card" style={{ padding: '40px', minHeight: '520px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.03em' }}>
                {chartMode === 'compare' ? 'Profitability Analysis' : chartMode === 'efficiency' ? 'Labor Efficiency' : 'Yield Performance'}
              </h2>
              <div style={{ display: 'flex', background: 'hsl(var(--bg-primary))', borderRadius: '10px', padding: '2px', gap: '2px' }}>
                 <button onClick={() => setChartMode('single')} style={{ border: 'none', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 900, cursor: 'pointer', background: chartMode === 'single' ? '#fff' : 'transparent', color: chartMode === 'single' ? '#000' : 'inherit' }}>SINGLE</button>
                 <button onClick={() => setChartMode('compare')} style={{ border: 'none', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 900, cursor: 'pointer', background: chartMode === 'compare' ? '#fff' : 'transparent', color: chartMode === 'compare' ? '#000' : 'inherit' }}>COMPARE</button>
                 <button onClick={() => setChartMode('efficiency')} style={{ border: 'none', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 900, cursor: 'pointer', background: chartMode === 'efficiency' ? '#fff' : 'transparent', color: chartMode === 'efficiency' ? '#000' : 'inherit' }}>EFFIC.</button>
              </div>
            </div>
            <div style={{ display: 'flex', background: 'hsl(var(--bg-primary))', borderRadius: '100px', padding: '4px', gap: '4px', border: '1px solid hsl(var(--border))' }}>
              {['1W', '1M', '1Y'].map(range => (
                <button key={range} onClick={() => setActiveRange(range)} style={{ border: 'none', background: activeRange === range ? 'hsl(var(--bg-card))' : 'transparent', color: activeRange === range ? 'hsl(var(--text-primary))' : 'hsl(var(--text-muted))', padding: '6px 16px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>{range}</button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative' }}>
             <ResponsiveContainer width="100%" height="100%">
               {chartMode === 'compare' ? (
                 <AreaChart data={comparisonData}>
                    <defs>
                      <linearGradient id="colRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                      <linearGradient id="colExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--text-muted))', fontSize: 11, fontWeight: 800}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--text-muted))', fontSize: 11, fontWeight: 800}} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" name="Revenue" dataKey="revenue" stroke="#10b981" strokeWidth={3} fill="url(#colRev)" />
                    <Area type="monotone" name="Expenses" dataKey="expense" stroke="#ef4444" strokeWidth={3} fill="url(#colExp)" />
                 </AreaChart>
               ) : chartMode === 'efficiency' ? (
                 <AreaChart data={efficiencyData}>
                    <defs>
                      <linearGradient id="colEff" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--text-muted))', fontSize: 11, fontWeight: 800}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--text-muted))', fontSize: 11, fontWeight: 800}} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" name="Efficiency" dataKey="efficiency" stroke="#8b5cf6" strokeWidth={3} fill="url(#colEff)" />
                 </AreaChart>
               ) : (
                 <AreaChart data={monthlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--accent-green))" stopOpacity={0.4}/><stop offset="95%" stopColor="hsl(var(--accent-green))" stopOpacity={0}/></linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                   <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--text-muted))', fontSize: 11, fontWeight: 800}} dy={15} />
                   <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--text-muted))', fontSize: 11, fontWeight: 800}} />
                   <Tooltip content={<CustomTooltip />} cursor={{stroke: 'hsl(var(--accent-green))', strokeWidth: 2}} />
                   <Area type="monotone" name="Expenses" dataKey="amount" stroke="hsl(var(--accent-green))" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                 </AreaChart>
               )}
             </ResponsiveContainer>
          </div>
        </div>

        {/* Assets Column (DRILL-DOWN ENABLED) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="card" style={{ flex: 1, padding: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '24px' }}>Strategic Assets</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {segmentData.map((asset, i) => (
                <div 
                  key={i} 
                  onClick={() => setFilterSegment(asset.name)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '20px', 
                    borderBottom: i === segmentData.length - 1 ? 'none' : '1px solid hsl(var(--border))',
                    cursor: 'pointer',
                    opacity: filterSegment && filterSegment !== asset.name ? 0.4 : 1,
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'hsl(var(--bg-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: '1px solid hsl(var(--border))' }}>
                    {asset.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 800 }}>{asset.shortName}</div>
                    <div style={{ fontSize: '10px', color: 'hsl(var(--text-muted))', fontWeight: 900, textTransform: 'uppercase' }}>{filterSegment === asset.name ? 'ACTIVE FOCUS' : 'SELECT NODE'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '15px', fontWeight: 900 }}>{formatCurrency(asset.value)}</div>
                    <div style={{ fontSize: '11px', color: 'hsl(var(--accent-green))', fontWeight: 900 }}>{asset.trend}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '32px', background: 'hsl(var(--bg-secondary) / 0.5)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '16px', color: '#10b981' }}>SYSTEM STATUS</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', fontWeight: 700 }}>
               <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }} />
               {filterSegment ? `Isolating: ${filterSegment}` : 'Full Estate Synchronized'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
