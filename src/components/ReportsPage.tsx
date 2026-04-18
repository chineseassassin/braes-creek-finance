'use client';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const { expenses, loans, laborEntries, payroll, loanPayments, sales } = useAppStore();

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalPayroll = payroll.reduce((s, p) => s + p.net_pay, 0);
  const totalLabor = laborEntries.reduce((s, l) => s + l.total_cost, 0);
  const totalLoanRepaid = loanPayments.reduce((s, p) => s + p.amount, 0);

  // P&L Summary
  const revenue = sales.reduce((s, r) => s + (r.total_amount || 0), 0);
  const totalCosts = totalExpenses + totalPayroll;
  const grossProfit = revenue - totalCosts;
  const loanInterest = loans.reduce((s, l) => s + (l.principal * l.interest_rate / 100), 0);
  const netProfit = grossProfit - loanInterest;

  // Monthly breakdown
  const byMonth: Record<string, { expenses: number; payroll: number; revenue: number }> = {};
   expenses.forEach(e => {
    const m = e.date.substring(0, 7);
    if (!byMonth[m]) byMonth[m] = { expenses: 0, payroll: 0, revenue: 0 };
    byMonth[m].expenses += e.amount;
  });
  payroll.forEach(p => {
    const m = p.period_end.substring(0, 7);
    if (!byMonth[m]) byMonth[m] = { expenses: 0, payroll: 0, revenue: 0 };
    byMonth[m].payroll += p.net_pay;
  });
  sales.forEach(s => {
    const m = s.date.substring(0, 7);
    if (!byMonth[m]) byMonth[m] = { expenses: 0, payroll: 0, revenue: 0 };
    byMonth[m].revenue += (s.total_amount || 0);
  });
  const monthlyData = Object.entries(byMonth).sort().map(([month, data]) => ({ month, ...data, totalCosts: data.expenses + data.payroll }));

  // Category totals
  const catTotals: Record<string, number> = {};
  expenses.forEach(e => { catTotals[e.category_name] = (catTotals[e.category_name] || 0) + e.amount; });
  const topCategories = Object.entries(catTotals).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const segTotals: Record<string, number> = {};
  expenses.forEach(e => { segTotals[e.segment_name] = (segTotals[e.segment_name] || 0) + e.amount; });
  const segData = Object.entries(segTotals).sort((a, b) => b[1] - a[1]).map(([name, amount]) => ({ name: name.split('/')[0].trim().split(' ').slice(0, 2).join(' '), amount }));

  const handleExportCSV = () => {
    let csv = "Braes Creek Estate - Financial Report\\n\\n";
    csv += "Profit & Loss Summary\\n";
    csv += `Estimated Revenue,${revenue}\\n`;
    csv += `Total Expenses,${totalExpenses}\\n`;
    csv += `Total Payroll,${totalPayroll}\\n`;
    csv += `Gross Profit,${grossProfit}\\n`;
    csv += `Net Profit,${netProfit}\\n\\n`;

    csv += "Cash Flow Summary\\n";
    csv += `Operating Expenses,-${totalExpenses}\\n`;
    csv += `Payroll,-${totalPayroll}\\n`;
    csv += `Labor (contract),-${totalLabor}\\n`;
    csv += `Loan Repayments,-${totalLoanRepaid}\\n`;
    csv += `Net Cash Flow,${revenue - totalExpenses - totalPayroll - totalLoanRepaid}\\n\\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `braes_creek_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">📋 Reports & Analytics</div>
          <div className="page-subtitle">Profit & loss, cash flow, and business performance reports</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={() => window.print()}>🖨 Print</button>
          <button className="btn btn-outline btn-sm" onClick={() => window.print()}>📤 Export PDF</button>
          <button className="btn btn-outline btn-sm" onClick={handleExportCSV}>📊 Export CSV</button>
        </div>
      </div>

      {/* P&L Summary */}
      <div className="card" style={{ marginBottom: 16, background: 'linear-gradient(135deg, #0f2447 0%, #151e2d 100%)', borderColor: '#1e3a5f' }}>
        <div className="card-title" style={{ fontSize: 18 }}>📊 Profit & Loss Summary (2025 YTD)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
          {[
            { label: 'Estimated Revenue', value: formatCurrency(revenue), color: 'hsl(var(--accent-green))', icon: '📈' },
            { label: 'Total Expenses', value: `(${formatCurrency(totalExpenses)})`, color: 'hsl(var(--accent-red))', icon: '💸' },
            { label: 'Total Payroll', value: `(${formatCurrency(totalPayroll)})`, color: 'hsl(var(--accent-amber))', icon: '💰' },
            { label: 'Gross Profit', value: formatCurrency(grossProfit), color: grossProfit >= 0 ? 'hsl(var(--accent-green))' : 'hsl(var(--accent-red))', icon: '🏦' },
            { label: 'Loan Interest', value: `(${formatCurrency(loanInterest)})`, color: 'hsl(var(--accent-red))', icon: '📉' },
            { label: 'Net Profit', value: formatCurrency(netProfit), color: netProfit >= 0 ? 'hsl(var(--accent-green))' : 'hsl(var(--accent-red))', icon: netProfit >= 0 ? '✅' : '⚠️' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '16px' }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 11, color: 'hsl(var(--text-muted))', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        {/* Monthly Spend */}
        <div className="card">
          <div className="card-title">📅 Monthly Spend Breakdown</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--text-muted))', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--text-muted))', fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                <Bar dataKey="expenses" name="Operating" fill="rgba(255,255,255,0.2)" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="payroll" name="Payroll" fill="rgba(255,255,255,0.1)" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Segment */}
        <div className="card">
          <div className="card-title">🏢 Expenses by Business Segment</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segData} layout="vertical" margin={{ top: 5, right: 10, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis type="number" tick={{ fill: 'hsl(var(--text-muted))', fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(var(--text-secondary))', fontSize: 11 }} width={80} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                <Bar dataKey="amount" name="Expenses" fill="rgba(255,255,255,0.15)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title">🏆 Top Expense Categories</div>
          {topCategories.map(([cat, amount], i) => (
            <div key={cat} className="stat-row">
              <span className="stat-label"><span style={{ color: 'hsl(var(--text-muted))', fontSize: 12, width: 20, display: 'inline-block' }}>#{i + 1}</span>{cat}</span>
              <span className="stat-value" style={{ color: 'hsl(var(--accent-red))' }}>{formatCurrency(amount)}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">📊 Cash Flow Summary</div>
          {[
            { label: 'Estimated Revenue', value: formatCurrency(revenue), color: 'hsl(var(--accent-green))' },
            { label: 'Operating Expenses', value: `-${formatCurrency(totalExpenses)}`, color: 'hsl(var(--accent-red))' },
            { label: 'Payroll', value: `-${formatCurrency(totalPayroll)}`, color: 'hsl(var(--accent-amber))' },
            { label: 'Labor (contract)', value: `-${formatCurrency(totalLabor)}`, color: 'hsl(var(--accent-amber))' },
            { label: 'Loan Repayments', value: `-${formatCurrency(totalLoanRepaid)}`, color: 'hsl(var(--accent-red))' },
            { label: 'Net Cash Flow', value: formatCurrency(revenue - totalExpenses - totalPayroll - totalLoanRepaid), color: 'hsl(var(--accent-blue))' },
          ].map(row => (
            <div key={row.label} className="stat-row">
              <span className="stat-label">{row.label}</span>
              <span className="stat-value" style={{ color: row.color }}>{row.value}</span>
            </div>
          ))}

          <div className="divider" />

          <div className="card-title" style={{ marginBottom: 12 }}>🔔 Loan Repayment Summary</div>
          {loans.map(loan => (
            <div key={loan.id} className="stat-row">
              <span className="stat-label" style={{ maxWidth: 180 }}>{loan.lender_name}</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: loan.status === 'overdue' ? 'hsl(var(--accent-red))' : 'hsl(var(--text-primary))', fontSize: 13 }}>{formatCurrency(loan.remaining_balance)}</div>
                <div style={{ fontSize: 11, color: 'hsl(var(--text-muted))' }}>remaining</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
