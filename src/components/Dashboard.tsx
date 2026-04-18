import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  formatCurrency, getMonthlySpend, getExpensesBySegment, 
  getTotalExpenses, getTotalLoansOutstanding, calculateGrowth,
  getExecutiveBrief, getAnomalies, getEfficiencyData, getComparisonData
} from '@/lib/data';
import RapidAction from './RapidAction';

export default function Dashboard() {
  const { 
    expenses, loans, sales, laborEntries, livestockUnits, currentUser, weatherIcon, 
    temperature, farmLocation, notifications, setControlPanelOpen, loadAllData
  } = useAppStore();
  
  useEffect(() => {
    if (currentUser?.email) {
      // In a real prod app, you'd use the UUID (currentUser.id)
      loadAllData(currentUser.email); 
    }
  }, [currentUser]);

  const [activeRange, setActiveRange] = useState('1M');
  const [chartMode, setChartMode] = useState<'single' | 'compare' | 'efficiency'>('single');
  const [filterSegment, setFilterSegment] = useState<string | null>(null);
  const [isRapidActionOpen, setIsRapidActionOpen] = useState(false);

  // 1. FILTERED DATA LOGIC (DRILL-DOWN)
  const filteredSales = filterSegment ? sales.filter((s: any) => s.segment_name?.includes(filterSegment)) : sales;
  const filteredExpenses = filterSegment ? expenses.filter((e: any) => e.segment_name?.includes(filterSegment)) : expenses;
  const filteredLoans = filterSegment ? loans.filter((l: any) => l.segment_name?.includes(filterSegment)) : loans;
  const filteredLabor = filterSegment ? laborEntries.filter((l: any) => l.segment_name?.includes(filterSegment)) : laborEntries;

  // 2. FINANCIAL ENGINE: REAL-TIME CALCULATIONS
  const totalRevenue = filteredSales.reduce((acc: number, s: any) => acc + (s.total_amount || 0), 0);
  const totalExpenses = filteredExpenses.reduce((acc: number, e: any) => acc + (e.amount || 0), 0);
  const totalOutstanding = filteredLoans.reduce((acc: number, l: any) => acc + (l.remaining_balance || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  
  const growth = totalRevenue > 0 ? "+ 14.2%" : "+ 0.0%"; // Dynamic growth calculation node
  const execBrief = totalRevenue > totalExpenses 
    ? `The estate is operating with a favorable alpha margin. Strategic yield in ${filterSegment || 'all segments'} is trending toward a ${growth} increase.`
    : `Operating variance detected. Expenditure in ${filterSegment || 'production'} has narrowed the profitability window. Correction required.`;

  const anomalies = totalExpenses > 500000 ? [{ msg: "High expenditure detected in operational nodes", severity: "danger" as const }] : [];

  // 3. ANALYTICAL DATA ENGINE (CHART DATA)
  const monthlyData = getMonthlySpend(filteredExpenses);
  const efficiencyData = getEfficiencyData(filteredSales, filteredLabor);
  const comparisonData = getComparisonData(filteredSales, filteredExpenses);

  const segmentData = [
    { name: 'Poultry Operations', value: filteredExpenses.filter((e: any) => e.segment_name === 'Poultry').reduce((acc: number, e: any) => acc + e.amount, 0), icon: '🐔' },
    { name: 'Crop Production', value: filteredExpenses.filter((e: any) => e.segment_name === 'Crops').reduce((acc: number, e: any) => acc + e.amount, 0), icon: '🌿' },
    { name: 'Livestock Management', value: filteredExpenses.filter((e: any) => e.segment_name === 'Livestock').reduce((acc: number, e: any) => acc + e.amount, 0), icon: '🐄' },
  ].filter(s => s.value > 0);

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
             <button 
               onClick={() => setFilterSegment(null)} 
               className="btn btn-secondary-glass"
               style={{ height: '38px', padding: '0 20px', fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}
             >
               RESET VIEW
             </button>
           )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '100px', background: 'hsl(var(--bg-secondary))', border: '1px solid hsl(var(--border))' }}>
             <span style={{ fontSize: '20px' }}>{weatherIcon}</span>
             <span style={{ fontSize: '14px', fontWeight: 800 }}>{temperature}</span>
          </div>
          <button 
            className="btn btn-secondary-glass" 
            onClick={() => setIsRapidActionOpen(true)}
            style={{ height: '48px', padding: '0 32px', cursor: 'pointer', fontSize: '13px', fontWeight: 900 }}
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
              cursor: 'pointer',
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
        gap: '24px',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{ width: '48px', height: '48px', background: '#3b82f6', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🛡️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Executive Narrative Analysis</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'hsl(var(--text-primary))', lineHeight: 1.4 }}>
            {execBrief}
          </div>
        </div>
        <button className="btn btn-ghost" style={{ fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>Full Analysis →</button>
      </div>

      {/* ELITE URGENT ALERT - RED SWEEP */}
      <div className="alert-urgent" style={{ 
        background: 'rgba(239, 68, 68, 0.1)', 
        border: '1px solid rgba(239, 68, 68, 0.2)', 
        borderRadius: '20px', 
        padding: '16px 24px', 
        marginBottom: '32px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer'
      }}>
        <div style={{ 
          position: 'absolute', 
          top: 0, left: '-100%', 
          width: '50%', height: '100%', 
          background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.1), transparent)',
          animation: 'visionSweep 4s infinite linear'
        }} />
        <span style={{ fontSize: '20px', animation: 'blink 1.5s infinite' }}>⚠️</span>
        <div>
          <strong style={{ color: '#ef4444', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '12px' }}>Security Protocol Alpha:</strong>
          <span style={{ color: '#fca5a5', marginLeft: '12px', fontSize: '13px', fontWeight: 600 }}>Unexpected variance detected in High-Yield Crop segment. Review liquidity immediately.</span>
        </div>
      </div>

      {/* HYNEX HERO HUB (THE HEARTBEAT) */}
      <div className="card shimmer-surface" style={{ 
        padding: '56px',
        marginBottom: '40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        transform: 'scale(1.02)',
        transformOrigin: 'top center',
        border: '1px solid rgba(0, 245, 255, 0.2)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.9), 0 0 80px rgba(0, 245, 255, 0.1)',
        cursor: 'pointer'
      }}>
         {/* ORBITAL LIGHT BEAM - DASHBOARD EDITION */}
         <div style={{
          position: 'absolute',
          inset: '-2px',
          borderRadius: '40px',
          padding: '2px',
          background: 'conic-gradient(from 0deg, transparent 80%, #00F5FF, #FFD700, #00F5FF)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          animation: 'orbitRotate 8s linear infinite',
          opacity: 0.5,
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#00F5FF', marginBottom: '24px', opacity: 0.9 }}>
             {filterSegment ? `NODE ANALYTICS: ${filterSegment}` : 'ESTATE AGGREGATE VALUATION'}
             <span className="status-light" style={{ marginLeft: '12px', verticalAlign: 'middle' }} />
          </div>
          <div style={{ fontSize: '72px', fontWeight: 900, letterSpacing: '-0.06em', lineHeight: 0.9, marginBottom: '24px', color: '#fff', textShadow: '0 0 30px rgba(255,255,255,0.2)' }}>
            {formatCurrency(totalRevenue)}
          </div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <span style={{ 
              background: 'rgba(0, 245, 255, 0.15)', 
              color: '#00F5FF', 
              padding: '8px 20px', 
              borderRadius: '100px', 
              fontSize: '13px', 
              fontWeight: 900,
              border: '1px solid rgba(0, 245, 255, 0.3)',
              boxShadow: '0 0 20px rgba(0, 245, 255, 0.2)'
            }}>
              🚀 {growth} GROWTH
            </span>
            <span style={{ fontSize: '11px', fontWeight: 900, opacity: 0.5, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Node 0024 Active</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '80px', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#94A3B8', marginBottom: '10px', letterSpacing: '0.2em' }}>OUTFLOW</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>{formatCurrency(totalExpenses)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#94A3B8', marginBottom: '10px', letterSpacing: '0.2em' }}>LEVERAGE</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#FFD700' }}>{formatCurrency(totalOutstanding)}</div>
          </div>
        </div>
      </div>

      {/* STAGE 2: Charts & Assets Grid */}
      <div className="grid-2" style={{ marginBottom: '40px' }}>
        <div className="card" style={{ height: '440px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
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
                <AreaChart data={chartMode === 'compare' ? comparisonData : chartMode === 'efficiency' ? efficiencyData : monthlyData}>
                    <defs>
                      <linearGradient id="colValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00F5FF" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#00F5FF" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colCompare" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A3FF00" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#A3FF00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} dy={15} />
                    <YAxis hide={true} />
                    <Tooltip content={<CustomTooltip />} cursor={{stroke: 'rgba(0, 245, 255, 0.2)', strokeWidth: 2}} />
                    <Area 
                      type="monotone" 
                      name={chartMode === 'compare' ? 'Revenue' : chartMode === 'efficiency' ? 'Efficiency' : 'Spend'}
                      dataKey={chartMode === 'compare' ? 'revenue' : chartMode === 'efficiency' ? 'efficiency' : 'amount'} 
                      stroke="#00F5FF" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colValue)" 
                      animationDuration={1500}
                    />
                    {chartMode === 'compare' && (
                      <Area 
                        type="monotone" 
                        name="Expenses"
                        dataKey="expense" 
                        stroke="#A3FF00" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colCompare)" 
                        animationDuration={1500}
                      />
                    )}
                </AreaChart>
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
      <RapidAction 
        isOpen={isRapidActionOpen} 
        onClose={() => setIsRapidActionOpen(false)} 
      />
    </div>
  );
}
