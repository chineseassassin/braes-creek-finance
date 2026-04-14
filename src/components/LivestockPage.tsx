'use client';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/data';

function LivestockCard({ unit }: { unit: import('@/lib/data').LivestockUnit }) {
  const costPerHead = unit.quantity > 0 ? unit.acquisition_cost / unit.quantity : 0;
  const valuePerHead = unit.quantity > 0 ? unit.current_value / unit.quantity : 0;
  const roi = unit.acquisition_cost > 0 ? ((unit.current_value - unit.acquisition_cost) / unit.acquisition_cost * 100) : 0;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{unit.animal_type}</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{unit.breed} · {unit.location}</p>
        </div>
        <div style={{ fontSize: 32, opacity: 0.8 }}>
          {unit.animal_type.includes('Broiler') ? '🐔' : unit.animal_type.includes('Layer') ? '🥚' : unit.animal_type.includes('Goat') ? '🐐' : unit.animal_type.includes('Pig') ? '🐷' : '🐄'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
        {[
          { label: 'Quantity', value: unit.quantity.toLocaleString(), color: 'var(--accent-blue)' },
          { label: 'Mortality', value: unit.mortality_qty.toLocaleString(), color: unit.mortality_qty > 0 ? 'var(--accent-red)' : 'var(--text-muted)' },
          { label: 'Acq. Date', value: unit.acquisition_date, color: 'var(--text-muted)' },
          { label: 'Pur. Date', value: unit.purchase_date, color: 'var(--text-muted)' },
          { label: 'Acquisition Cost', value: formatCurrency(unit.acquisition_cost), color: 'var(--text-primary)' },
          { label: 'Current Value', value: formatCurrency(unit.current_value), color: roi >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' },
          { label: 'Cost/Head', value: formatCurrency(costPerHead), color: 'var(--text-secondary)' },
          { label: 'Value/Head', value: formatCurrency(valuePerHead), color: 'var(--text-secondary)' },
          { label: 'Gross Profit', value: formatCurrency(unit.gross_profit || 0), color: 'var(--accent-teal)' },
          { label: 'Net Profit', value: formatCurrency(unit.net_profit || 0), color: 'var(--accent-green)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-secondary)', borderRadius: 6, padding: '8px 12px' }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {unit.slaughter_date && (
        <div style={{ background: 'rgba(239, 68, 68, 0.05)', borderRadius: 6, padding: '10px 12px', border: '1px solid rgba(239, 68, 68, 0.1)', marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: 'var(--accent-red)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>🪓 Slaughter Record</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-primary)' }}>
            <span><strong>Date:</strong> {unit.slaughter_date}</span>
            <span><strong>Qty:</strong> {unit.slaughter_qty}</span>
            <span><strong>Weight:</strong> {unit.slaughter_weight} lbs</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className={`badge ${roi >= 0 ? 'badge-green' : 'badge-red'}`}>
          ROI: {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
        </span>
        {unit.notes && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{unit.notes}</span>}
      </div>
    </div>
  );
}

export default function LivestockPage() {
  const { livestockUnits, expenses } = useAppStore();

  const totalHead = livestockUnits.reduce((s, u) => s + u.quantity, 0);
  const totalAcqCost = livestockUnits.reduce((s, u) => s + u.acquisition_cost, 0);
  const totalCurrentValue = livestockUnits.reduce((s, u) => s + u.current_value, 0);
  const livestockExpenses = expenses.filter(e => ['seg-001', 'seg-002', 'seg-003', 'seg-004', 'seg-005'].includes(e.segment_id));
  const totalOpCost = livestockExpenses.reduce((s, e) => s + e.amount, 0);

  const handleExport = () => {
    const headers = ['Type', 'Breed', 'Location', 'Qty', 'Mortality', 'Acq Date', 'Purchase Date', 'Acq Cost', 'Current Value', 'ROI %'];
    const rows = livestockUnits.map(u => {
      const roi = u.acquisition_cost > 0 ? ((u.current_value - u.acquisition_cost) / u.acquisition_cost * 100) : 0;
      return [
        `"${u.animal_type}"`,
        `"${u.breed}"`,
        `"${u.location}"`,
        u.quantity,
        u.mortality_qty,
        u.acquisition_date,
        u.purchase_date,
        u.acquisition_cost,
        u.current_value,
        roi.toFixed(1)
      ];
    });
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Braes_Creek_Livestock_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">🐄 Livestock Operations</div>
          <div className="page-subtitle">Track all animal units, values, and operating costs</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={handleExport}>📤 Export to Excel</button>
          <button className="btn btn-primary">+ Add Livestock</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi-card teal">
          <div className="kpi-icon">🐄</div>
          <div className="kpi-label">Total Head Count</div>
          <div className="kpi-value">{totalHead.toLocaleString()}</div>
          <div className="kpi-sub">{livestockUnits.length} animal types</div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-icon">💲</div>
          <div className="kpi-label">Total Acquisition Cost</div>
          <div className="kpi-value">{formatCurrency(totalAcqCost)}</div>
          <div className="kpi-sub">Original investment</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-icon">📈</div>
          <div className="kpi-label">Current Livestock Value</div>
          <div className="kpi-value">{formatCurrency(totalCurrentValue)}</div>
          <div className="kpi-sub">{((totalCurrentValue - totalAcqCost) / totalAcqCost * 100).toFixed(1)}% gain</div>
        </div>
        <div className="kpi-card amber">
          <div className="kpi-icon">💸</div>
          <div className="kpi-label">Operating Costs</div>
          <div className="kpi-value">{formatCurrency(totalOpCost)}</div>
          <div className="kpi-sub">Feed, vet, labor tracked</div>
        </div>
      </div>

      <div className="grid-auto">
        {livestockUnits.map(unit => <LivestockCard key={unit.id} unit={unit} />)}
      </div>

      {/* Cost breakdown by animal type */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">💸 Operating Expenses by Livestock Type</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Segment</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {livestockExpenses.sort((a, b) => b.date.localeCompare(a.date)).map(e => (
                <tr key={e.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{e.date}</td>
                  <td>{e.description}</td>
                  <td><span className="badge badge-gray">{e.category_name}</span></td>
                  <td style={{ fontSize: 12 }}>{e.segment_name}</td>
                  <td className="text-right font-bold" style={{ color: 'var(--accent-red)' }}>{formatCurrency(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
