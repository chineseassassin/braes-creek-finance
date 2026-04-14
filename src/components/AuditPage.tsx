'use client';
import { useAppStore } from '@/lib/store';

export default function AuditPage() {
  const { auditLogs } = useAppStore();

  const actionColors: Record<string, string> = {
    CREATE: 'badge-green',
    UPDATE: 'badge-blue',
    DELETE: 'badge-red',
  };

  const handleExport = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Table', 'Details'];
    const rows = auditLogs.map(l => [
      new Date(l.timestamp).toLocaleString(),
      l.user_name,
      l.action,
      l.table_name,
      `"${l.details.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Braes_Creek_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">🔍 Audit Trail</div>
          <div className="page-subtitle">Full log of all actions by users — who did what and when</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={handleExport}>📤 Export Log</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Record Type</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {[...auditLogs].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.user_name}</td>
                  <td><span className={`badge ${actionColors[log.action] || 'badge-gray'}`}>{log.action}</span></td>
                  <td style={{ fontSize: 12 }}>{log.table_name}</td>
                  <td style={{ fontSize: 13, maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
