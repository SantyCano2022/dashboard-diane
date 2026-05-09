import { useState, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { parseExcelFile, generateTemplateExcel } from '../lib/excelParser';
import { formatCOP } from '../lib/taxEngine';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Search } from 'lucide-react';

export default function InvoicesPage() {
  const { invoices, addInvoices } = useApp();
  const [dragActive, setDragActive] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setParsing(true);
    setError('');
    setResult(null);
    try {
      const res = await parseExcelFile(file);
      setResult(res);
    } catch (err) {
      setError(err.message);
    }
    setParsing(false);
  }, []);

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInput(e) {
    const file = e.target.files[0];
    if (file) handleFile(file);
  }

  function confirmImport() {
    if (result?.invoices) {
      addInvoices(result.invoices);
      setResult(null);
    }
  }

  const filtered = invoices.filter(inv =>
    !search || inv.vendor_name?.toLowerCase().includes(search.toLowerCase()) ||
    inv.concept?.toLowerCase().includes(search.toLowerCase()) ||
    inv.invoice_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1>Facturas</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{invoices.length} facturas registradas</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={generateTemplateExcel}>
          <Download size={14} /> Descargar Plantilla
        </button>
      </div>

      {/* Upload zone */}
      <div
        className={`drop-zone ${dragActive ? 'active' : ''}`}
        style={{ marginBottom: 24 }}
        onDragOver={e => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input id="file-input" type="file" accept=".xlsx,.xls,.csv" onChange={handleInput} style={{ display: 'none' }} />
        <Upload size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
          {parsing ? 'Procesando...' : 'Arrastra un archivo Excel o haz clic para seleccionar'}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
          Formatos: .xlsx, .xls, .csv
        </p>
      </div>

      {/* Parse result */}
      {error && (
        <div className="glass-card" style={{ padding: 16, marginBottom: 20, borderColor: 'rgba(239,68,68,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#b91c1c' }}>
            <AlertCircle size={18} /> {error}
          </div>
        </div>
      )}

      {result && (
        <div className="glass-card" style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#047857', marginBottom: 12 }}>
            <CheckCircle size={18} />
            <span style={{ fontWeight: 600 }}>{result.parsedRows} facturas detectadas</span>
            {result.skippedRows > 0 && <span style={{ color: 'var(--text-muted)' }}>({result.skippedRows} filas omitidas)</span>}
          </div>
          <div style={{ overflowX: 'auto', maxHeight: 200, marginBottom: 12 }}>
            <table className="data-table">
              <thead><tr><th>Factura</th><th>Proveedor</th><th>Base</th><th>IVA</th></tr></thead>
              <tbody>
                {result.invoices.slice(0, 5).map(inv => (
                  <tr key={inv.id}>
                    <td>{inv.invoice_number}</td><td>{inv.vendor_name}</td>
                    <td style={{ textAlign: 'right' }}>{formatCOP(inv.base_amount)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCOP(inv.iva_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={confirmImport}>Importar {result.parsedRows} facturas</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setResult(null)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 16, position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input" placeholder="Buscar por proveedor, concepto o número..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
      </div>

      {/* Invoice table */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Factura</th><th>Fecha</th><th>Proveedor</th><th>Concepto</th>
                <th style={{ textAlign: 'right' }}>Base</th><th style={{ textAlign: 'right' }}>IVA</th>
                <th style={{ textAlign: 'right' }}>Retefuente</th><th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 25).map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inv.invoice_number}</td>
                  <td>{inv.date}</td>
                  <td>{inv.vendor_name}</td>
                  <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.concept}</td>
                  <td style={{ textAlign: 'right' }}>{formatCOP(inv.base_amount)}</td>
                  <td style={{ textAlign: 'right', color: '#047857' }}>{formatCOP(inv.iva_amount)}</td>
                  <td style={{ textAlign: 'right', color: '#b45309' }}>{formatCOP(inv.retefuente_amount)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>{formatCOP(inv.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 25 && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 12, textAlign: 'center' }}>Mostrando 25 de {filtered.length} facturas</p>}
      </div>
    </div>
  );
}
