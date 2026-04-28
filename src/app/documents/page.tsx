'use client'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'

const SAMPLE_DOCS = [
  { id: 1, name: 'Q4 2024 Loan Agreement - First Citizens Bank.pdf', type: 'pdf', size: '2.4 MB', date: '2024-03-15', category: 'Loans', tags: ['loan', 'bank'] },
  { id: 2, name: 'November Electricity Bill.pdf', type: 'pdf', size: '348 KB', date: '2024-11-01', category: 'Utilities', tags: ['utility', 'recurring'] },
  { id: 3, name: 'AgriStar Invoice - Broiler Feed.pdf', type: 'pdf', size: '520 KB', date: '2024-11-02', category: 'Feed', tags: ['feed', 'invoice'] },
  { id: 4, name: 'Payroll Oct-Nov 2024.xlsx', type: 'xlsx', size: '1.1 MB', date: '2024-12-01', category: 'Payroll', tags: ['payroll', 'spreadsheet'] },
  { id: 5, name: 'Farm Property Tax Receipt.pdf', type: 'pdf', size: '210 KB', date: '2024-12-08', category: 'Business', tags: ['tax', 'property'] },
  { id: 6, name: 'Tractor Maintenance Report.pdf', type: 'pdf', size: '890 KB', date: '2024-11-18', category: 'Maintenance', tags: ['equipment', 'maintenance'] },
  { id: 7, name: 'Caribbean Dev Fund Loan Agreement.pdf', type: 'pdf', size: '3.2 MB', date: '2023-08-10', category: 'Loans', tags: ['loan', 'agreement'] },
  { id: 8, name: 'Crop Planting Schedule 2025.xlsx', type: 'xlsx', size: '640 KB', date: '2024-12-15', category: 'Crops', tags: ['crops', 'planning'] },
]

const FILE_ICONS: Record<string, string> = { pdf: '📄', xlsx: '📊', jpg: '🖼️', png: '🖼️', docx: '📝' }
const CAT_COLORS: Record<string, string> = {
  Loans: '#3b82f6', Utilities: '#06b6d4', Feed: '#10b981', Payroll: '#6366f1',
  Business: '#8b5cf6', Maintenance: '#d97706', Crops: '#22c55e'
}

export default function DocumentsPage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar
          title="Documents"
          subtitle="Receipts, invoices, agreements, and attachments"
          actions={
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm">📥 Import CSV</button>
              <button className="btn btn-primary btn-sm">📤 Upload</button>
            </div>
          }
        />
        <div className="page-container">
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
            <div className="kpi-card" style={{ '--kpi-color': '#3b82f6' } as any}>
              <div className="kpi-label">Total Documents</div>
              <div className="kpi-value">{SAMPLE_DOCS.length}</div>
              <div className="kpi-sub">files stored</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#ef4444' } as any}>
              <div className="kpi-label">PDFs</div>
              <div className="kpi-value">{SAMPLE_DOCS.filter(d => d.type === 'pdf').length}</div>
              <div className="kpi-sub">receipts & agreements</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#10b981' } as any}>
              <div className="kpi-label">Spreadsheets</div>
              <div className="kpi-value">{SAMPLE_DOCS.filter(d => d.type === 'xlsx').length}</div>
              <div className="kpi-sub">data files</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#8b5cf6' } as any}>
              <div className="kpi-label">Categories</div>
              <div className="kpi-value">{new Set(SAMPLE_DOCS.map(d => d.category)).size}</div>
              <div className="kpi-sub">document types</div>
            </div>
          </div>

          {/* Upload Zone */}
          <div style={{
            border: '2px dashed rgba(22,163,74,0.3)',
            borderRadius: 16,
            padding: '32px',
            textAlign: 'center',
            background: 'rgba(22,163,74,0.03)',
            marginBottom: 20,
            cursor: 'pointer',
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📂</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Drag & drop files here, or click to browse
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Supports PDF, XLSX, DOCX, JPG, PNG · Max 20MB per file
            </div>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>Choose Files</button>
          </div>

          {/* Document Table */}
          <div className="card">
            <div className="filter-bar">
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input className="search-input" placeholder="Search documents…" />
              </div>
              <select className="form-select" style={{ width: 'auto', padding: '7px 28px 7px 10px', fontSize: 12 }}>
                <option>All Categories</option>
                {Array.from(new Set(SAMPLE_DOCS.map(d => d.category))).map(c => <option key={c}>{c}</option>)}
              </select>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>{SAMPLE_DOCS.length} documents</span>
            </div>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Category</th>
                    <th>Tags</th>
                    <th>Date</th>
                    <th>Size</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_DOCS.map(doc => (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 20 }}>{FILE_ICONS[doc.type] ?? '📄'}</span>
                          <span className="primary" style={{ fontSize: 13 }}>{doc.name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                          background: `${CAT_COLORS[doc.category] ?? '#888'}20`,
                          color: CAT_COLORS[doc.category] ?? '#888'
                        }}>{doc.category}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {doc.tags.map(tag => (
                            <span key={tag} className="badge badge-neutral" style={{ fontSize: 10 }}>{tag}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{doc.date}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{doc.size}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm">👁️ View</button>
                          <button className="btn btn-ghost btn-sm">📥</button>
                          <button className="btn btn-ghost btn-sm">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
