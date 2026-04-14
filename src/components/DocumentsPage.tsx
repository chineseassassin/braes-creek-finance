'use client';
import { useState, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { DOCUMENT_CATEGORIES, Document } from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';

export default function DocumentsPage() {
  const { documents, addDocument, deleteDocument, currentUser, addAuditLog } = useAppStore();
  const [search, setSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = documents.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      const newDoc: Document = {
        id: `doc-${uuidv4().slice(0, 8)}`,
        name: file.name,
        type: file.type,
        category: 'Other',
        upload_date: new Date().toISOString().split('T')[0],
        file_size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        url: '#',
        uploaded_by: currentUser.name
      };

      addDocument(newDoc);
      addAuditLog({
        id: uuidv4(),
        user_name: currentUser.name,
        action: 'UPLOAD',
        table_name: 'documents',
        record_id: newDoc.id,
        details: `Uploaded document: ${file.name}`,
        timestamp: new Date().toISOString()
      });
      
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 1500);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">📁 Documents</div>
          <div className="page-subtitle">Secure storage for contracts, receipts, and legal papers</div>
        </div>
        <div className="page-actions">
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileUpload}
          />
          <button 
            className="btn btn-primary" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? '⌛ Uploading...' : '📎 Upload Document'}
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrapper" style={{ flex: 1 }}>
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search documents by name or category..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Category</th>
              <th>Date Uploaded</th>
              <th>Size</th>
              <th>Uploaded By</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>📁</div>
                  <h3>No documents found</h3>
                  <p>Upload your first file to get started</p>
                </td>
              </tr>
            ) : filtered.map(doc => (
              <tr key={doc.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>
                      {doc.name.endsWith('.pdf') ? '📕' : doc.name.endsWith('.docx') ? '📘' : '📄'}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{doc.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{doc.type}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge badge-gray">{doc.category}</span>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{doc.upload_date}</td>
                <td style={{ fontSize: '12px' }}>{doc.file_size}</td>
                <td style={{ fontSize: '12px' }}>{doc.uploaded_by}</td>
                <td className="text-right">
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button className="btn btn-ghost btn-sm btn-icon" title="Download">⬇️</button>
                    <button 
                      className="btn btn-ghost btn-sm btn-icon" 
                      style={{ color: 'var(--accent-red)' }}
                      onClick={() => deleteDocument(doc.id)}
                    >🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
