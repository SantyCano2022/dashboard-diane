import { useState, useCallback, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { parseExcelFile, generateTemplateExcel, exportInvoicesToExcel } from '../lib/excelParser';
import { parseMultipleUblFiles } from '../lib/ublParser';
import { formatCOP, getInvoiceTypeMeta, INVOICE_TYPES } from '../lib/taxEngine';
import { detectDuplicates } from '../lib/smartSuggestions';
import InvoiceEditModal from '../components/InvoiceEditModal';
import {
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Search,
  Trash2,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  FileCode,
} from 'lucide-react';
import EmptyState from '../components/EmptyState';

const PAGE_SIZE = 15;

export default function InvoicesPage() {
  const {
    invoices,
    addInvoices,
    deleteInvoice,
    deleteInvoices,
    updateInvoice,
    activeCompany,
    showToast,
  } = useApp();
  const [dragActive, setDragActive] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleFile = useCallback(
    async file => {
      if (!file) return;
      setParsing(true);
      setError('');
      setResult(null);
      try {
        const res = await parseExcelFile(file);
        // Detectar duplicados contra facturas ya cargadas
        const { duplicates, unique } = detectDuplicates(res.invoices, invoices);
        setResult({ ...res, duplicates, unique });
      } catch (err) {
        setError(err.message);
      }
      setParsing(false);
    },
    [invoices]
  );

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

  async function handleXmlInput(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setParsing(true);
    setError('');
    setResult(null);
    try {
      const { invoices: parsed, errors } = await parseMultipleUblFiles(files);
      if (parsed.length === 0) {
        throw new Error(
          'Ningún XML válido encontrado' + (errors.length > 0 ? `: ${errors[0].error}` : '')
        );
      }
      const { duplicates, unique } = detectDuplicates(parsed, invoices);
      setResult({
        invoices: parsed,
        parsedRows: parsed.length,
        skippedRows: errors.length,
        suggestionsCount: 0,
        duplicates,
        unique,
        source: 'xml',
        xmlErrors: errors,
      });
    } catch (err) {
      setError(err.message);
    }
    setParsing(false);
    e.target.value = '';
  }

  function confirmImport(skipDuplicates = false) {
    if (!result?.invoices) return;
    const toImport = skipDuplicates ? result.unique : [...result.unique, ...result.duplicates];
    if (toImport.length === 0) {
      showToast('No hay facturas para importar', 'warning');
      setResult(null);
      return;
    }
    addInvoices(toImport);
    setResult(null);
  }

  const months = useMemo(() => {
    const set = new Set();
    invoices.forEach(inv => {
      if (inv.date) set.add(inv.date.substring(0, 7));
    });
    return Array.from(set).sort().reverse();
  }, [invoices]);

  const filtered = useMemo(() => {
    return invoices.filter(inv => {
      if (monthFilter !== 'all' && !inv.date?.startsWith(monthFilter)) return false;
      if (typeFilter !== 'all' && (inv.type || 'sale') !== typeFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        inv.vendor_name?.toLowerCase().includes(q) ||
        inv.concept?.toLowerCase().includes(q) ||
        inv.invoice_number?.toLowerCase().includes(q)
      );
    });
  }, [invoices, search, monthFilter, typeFilter]);

  const typeCounts = useMemo(() => {
    const counts = { sale: 0, purchase: 0, credit_note: 0 };
    invoices.forEach(inv => {
      counts[inv.type || 'sale'] = (counts[inv.type || 'sale'] || 0) + 1;
    });
    return counts;
  }, [invoices]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageInvoices = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );

  function toggleSelected(id) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllPage() {
    const allSelected = pageInvoices.every(inv => selected.has(inv.id));
    setSelected(prev => {
      const next = new Set(prev);
      if (allSelected) pageInvoices.forEach(inv => next.delete(inv.id));
      else pageInvoices.forEach(inv => next.add(inv.id));
      return next;
    });
  }

  function handleBulkDelete() {
    if (selected.size === 0) return;
    deleteInvoices(Array.from(selected));
    setSelected(new Set());
    setConfirmDelete(false);
  }

  function handleExport() {
    if (filtered.length === 0) return;
    const company = activeCompany?.name?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'export';
    const period = monthFilter === 'all' ? 'todos' : monthFilter;
    exportInvoicesToExcel(filtered, `facturas_${company}_${period}.xlsx`);
    showToast(`${filtered.length} facturas exportadas`, 'success');
  }

  function handleSaveEdit(patch) {
    if (editing) {
      updateInvoice(editing.id, patch);
      showToast('Factura actualizada', 'success');
      setEditing(null);
    }
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1>Facturas</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {filtered.length} de {invoices.length} facturas · {activeCompany?.name || 'Sin empresa'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleExport}
            disabled={filtered.length === 0}
            title="Exportar Excel"
          >
            <FileDown size={14} /> Exportar Excel
          </button>
          <button className="btn btn-secondary btn-sm" onClick={generateTemplateExcel}>
            <Download size={14} /> Plantilla
          </button>
        </div>
      </div>

      {/* Upload zones — Excel + XML UBL */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          className={`drop-zone ${dragActive ? 'active' : ''}`}
          onDragOver={e => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleInput}
            style={{ display: 'none' }}
          />
          <Upload size={36} style={{ color: 'var(--text-muted)', marginBottom: 10 }} />
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>
            {parsing ? 'Procesando...' : 'Excel · arrastra o clic'}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 4 }}>
            .xlsx · .xls · .csv
          </p>
        </div>

        <div
          className="drop-zone"
          onClick={() => document.getElementById('xml-input').click()}
          style={{ cursor: 'pointer' }}
        >
          <input
            id="xml-input"
            type="file"
            accept=".xml"
            multiple
            onChange={handleXmlInput}
            style={{ display: 'none' }}
          />
          <FileCode size={36} style={{ color: '#2563eb', marginBottom: 10 }} />
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>
            XML Factura Electrónica DIAN
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 4 }}>
            UBL 2.1 · Múltiples archivos
          </p>
        </div>
      </div>

      {/* Parse result */}
      {error && (
        <div
          className="glass-card"
          style={{ padding: 16, marginBottom: 20, borderColor: 'rgba(239,68,68,0.3)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#b91c1c' }}>
            <AlertCircle size={18} /> {error}
          </div>
        </div>
      )}

      {result && (
        <div className="glass-card" style={{ padding: 20, marginBottom: 24 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#047857',
              marginBottom: 8,
            }}
          >
            <CheckCircle size={18} />
            <span style={{ fontWeight: 600 }}>{result.parsedRows} facturas detectadas</span>
            {result.skippedRows > 0 && (
              <span style={{ color: 'var(--text-muted)' }}>
                ({result.skippedRows} filas omitidas)
              </span>
            )}
          </div>

          {/* Smart insights: duplicados + sugerencias */}
          {(result.duplicates?.length > 0 || result.suggestionsCount > 0) && (
            <div style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.duplicates?.length > 0 && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'var(--accent-secondary-glow)',
                    border: '1px solid #fcd34d',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: '0.85rem',
                    color: '#92400e',
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <strong>
                      {result.duplicates.length} factura{result.duplicates.length > 1 ? 's' : ''}{' '}
                      duplicada{result.duplicates.length > 1 ? 's' : ''}
                    </strong>{' '}
                    ya existen en el sistema (mismo número + proveedor + fecha). Puedes importar
                    solo las {result.unique.length} nuevas o todas (incluyendo duplicadas).
                  </div>
                </div>
              )}
              {result.suggestionsCount > 0 && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'var(--accent-primary-glow)',
                    border: '1px solid #bfdbfe',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: '0.85rem',
                    color: '#1e40af',
                  }}
                >
                  <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <strong>
                      {result.suggestionsCount} actividad{result.suggestionsCount > 1 ? 'es' : ''}{' '}
                      auto-sugerida{result.suggestionsCount > 1 ? 's' : ''}
                    </strong>{' '}
                    a partir del concepto (honorarios, software, transporte, etc). Puedes editar
                    cada factura después de importar.
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ overflowX: 'auto', maxHeight: 200, marginBottom: 12 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Factura</th>
                  <th>Proveedor</th>
                  <th>Base</th>
                  <th>IVA</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {result.invoices.slice(0, 5).map(inv => {
                  const isDup = result.duplicates?.some(d => d.id === inv.id);
                  return (
                    <tr key={inv.id}>
                      <td>{inv.invoice_number}</td>
                      <td>{inv.vendor_name}</td>
                      <td style={{ textAlign: 'right' }}>{formatCOP(inv.base_amount)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCOP(inv.iva_amount)}</td>
                      <td>
                        {isDup ? (
                          <span className="badge badge-warning">Duplicada</span>
                        ) : inv._suggested ? (
                          <span className="badge badge-info">Sugerencia</span>
                        ) : (
                          <span className="badge badge-success">Nueva</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {result.duplicates?.length > 0 ? (
              <>
                <button className="btn btn-primary btn-sm" onClick={() => confirmImport(true)}>
                  Importar solo {result.unique.length} nuevas
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => confirmImport(false)}>
                  Importar todas ({result.parsedRows})
                </button>
              </>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => confirmImport(false)}>
                Importar {result.parsedRows} facturas
              </button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={() => setResult(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Type tabs */}
      {invoices.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {[
            { v: 'all', l: `Todas (${invoices.length})`, color: 'var(--accent-primary)' },
            { v: 'sale', l: `Ventas (${typeCounts.sale})`, color: INVOICE_TYPES.sale.color },
            {
              v: 'purchase',
              l: `Compras (${typeCounts.purchase})`,
              color: INVOICE_TYPES.purchase.color,
            },
            {
              v: 'credit_note',
              l: `Notas Crédito (${typeCounts.credit_note})`,
              color: INVOICE_TYPES.credit_note.color,
            },
          ].map(t => (
            <button
              key={t.v}
              onClick={() => {
                setTypeFilter(t.v);
                setPage(1);
              }}
              style={{
                padding: '7px 14px',
                borderRadius: 999,
                border:
                  typeFilter === t.v ? `1.5px solid ${t.color}` : '1px solid var(--border-subtle)',
                background: typeFilter === t.v ? t.color : 'var(--bg-card)',
                color: typeFilter === t.v ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              {t.l}
            </button>
          ))}
        </div>
      )}

      {/* Empty state cuando no hay ninguna factura */}
      {invoices.length === 0 && (
        <EmptyState
          variant="invoices"
          title="No hay facturas registradas"
          description="Arrastra un archivo Excel arriba o descarga la plantilla para ver el formato esperado. Cada factura calcula impuestos automáticamente."
          action={{ icon: Download, label: 'Descargar Plantilla', onClick: generateTemplateExcel }}
        />
      )}

      {/* Filters bar */}
      {invoices.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              className="input"
              placeholder="Buscar proveedor, concepto, número..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ paddingLeft: 36 }}
            />
          </div>
          <select
            className="input"
            value={monthFilter}
            onChange={e => {
              setMonthFilter(e.target.value);
              setPage(1);
            }}
            style={{ width: 'auto', minWidth: 180 }}
            aria-label="Filtrar por mes"
          >
            <option value="all">Todos los meses</option>
            {months.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: 12,
            background: 'var(--accent-primary-glow)',
            border: '1px solid var(--accent-primary)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.88rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
            {selected.size} factura{selected.size > 1 ? 's' : ''} seleccionada
            {selected.size > 1 ? 's' : ''}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelected(new Set())}>
              Cancelar
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={14} /> Eliminar
            </button>
          </div>
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 16,
          }}
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="glass-card"
            style={{ padding: 24, maxWidth: 400, width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: 8 }}>Eliminar facturas</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
              ¿Eliminar {selected.size} factura{selected.size > 1 ? 's' : ''}? Esta acción no se
              puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setConfirmDelete(false)}>
                Cancelar
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice table (solo si hay facturas) */}
      {invoices.length > 0 && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input
                      type="checkbox"
                      checked={
                        pageInvoices.length > 0 && pageInvoices.every(inv => selected.has(inv.id))
                      }
                      onChange={toggleSelectAllPage}
                      aria-label="Seleccionar todas"
                    />
                  </th>
                  <th>Tipo</th>
                  <th>Factura</th>
                  <th>Fecha</th>
                  <th>Proveedor/Cliente</th>
                  <th>Concepto</th>
                  <th style={{ textAlign: 'right' }}>Base</th>
                  <th style={{ textAlign: 'right' }}>IVA</th>
                  <th style={{ textAlign: 'right' }}>Retefuente</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th style={{ width: 90 }}></th>
                </tr>
              </thead>
              <tbody>
                {pageInvoices.map(inv => {
                  const meta = getInvoiceTypeMeta(inv.type);
                  return (
                    <tr
                      key={inv.id}
                      style={
                        selected.has(inv.id)
                          ? { background: 'var(--accent-primary-glow)' }
                          : undefined
                      }
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.has(inv.id)}
                          onChange={() => toggleSelected(inv.id)}
                          aria-label={`Seleccionar ${inv.invoice_number}`}
                        />
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: meta.bg,
                            color: meta.color,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                          }}
                        >
                          {meta.short}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {inv.invoice_number}
                      </td>
                      <td>{inv.date}</td>
                      <td>{inv.vendor_name}</td>
                      <td
                        style={{
                          maxWidth: 180,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {inv.concept}
                      </td>
                      <td style={{ textAlign: 'right' }}>{formatCOP(inv.base_amount)}</td>
                      <td style={{ textAlign: 'right', color: '#047857' }}>
                        {formatCOP(inv.iva_amount)}
                      </td>
                      <td style={{ textAlign: 'right', color: '#b45309' }}>
                        {formatCOP(inv.retefuente_amount)}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {formatCOP(inv.total)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            onClick={() => setEditing(inv)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--text-muted)',
                              padding: 4,
                              borderRadius: 4,
                            }}
                            onMouseOver={e =>
                              (e.currentTarget.style.color = 'var(--accent-primary)')
                            }
                            onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                            aria-label="Editar factura"
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => deleteInvoice(inv.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--text-muted)',
                              padding: 4,
                              borderRadius: 4,
                            }}
                            onMouseOver={e => (e.currentTarget.style.color = '#dc2626')}
                            onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                            aria-label="Eliminar factura"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {pageInvoices.length === 0 && (
                  <tr>
                    <td
                      colSpan={11}
                      style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}
                    >
                      {invoices.length === 0
                        ? 'Sin facturas. Carga un Excel para empezar.'
                        : 'No hay facturas que coincidan con los filtros.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {editing && (
            <InvoiceEditModal
              invoice={editing}
              onSave={handleSaveEdit}
              onClose={() => setEditing(null)}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Página {currentPage} de {totalPages} · {filtered.length} resultados
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={14} /> Anterior
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
