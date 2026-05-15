import { useState, useMemo, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { formatCOP } from '../lib/taxEngine';
import { validateNit, formatNit, calculateNitDv, parseNit } from '../lib/nitValidator';
import {
  Building2,
  Plus,
  Check,
  Trash2,
  Sparkles,
  FileText,
  RefreshCw,
  AlertCircle,
  Download,
  Upload,
  Lightbulb,
} from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function CompaniesPage() {
  const {
    companies,
    activeCompany,
    setActiveCompany,
    addCompany,
    deleteCompany,
    allInvoices,
    restoreDemoData,
    showToast,
    exportBackup,
    importBackup,
  } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    nit: '',
    tax_regime: 'common',
    city: 'Bogotá',
    withDemoData: true,
  });
  const [nitError, setNitError] = useState('');
  const [nitSuggestion, setNitSuggestion] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const importInputRef = useRef(null);

  const invoiceCounts = useMemo(() => {
    const counts = {};
    allInvoices.forEach(inv => {
      counts[inv.company_id] = (counts[inv.company_id] || 0) + 1;
    });
    return counts;
  }, [allInvoices]);

  const totalByCompany = useMemo(() => {
    const totals = {};
    allInvoices.forEach(inv => {
      totals[inv.company_id] = (totals[inv.company_id] || 0) + (Number(inv.base_amount) || 0);
    });
    return totals;
  }, [allInvoices]);

  function handleNitChange(value) {
    setForm({ ...form, nit: value });
    if (value) {
      const result = validateNit(value);
      setNitError(result.valid ? '' : result.error);
      // Auto-sugerencia de DV si user escribe NIT sin guión
      const { base, dv } = parseNit(value);
      if (base && base.length >= 7 && dv === null) {
        const expectedDv = calculateNitDv(base);
        setNitSuggestion({ base, dv: expectedDv, formatted: formatNit(`${base}-${expectedDv}`) });
      } else {
        setNitSuggestion(null);
      }
    } else {
      setNitError('');
      setNitSuggestion(null);
    }
  }

  function acceptNitSuggestion() {
    if (nitSuggestion) {
      setForm(prev => ({ ...prev, nit: nitSuggestion.formatted }));
      setNitError('');
      setNitSuggestion(null);
    }
  }

  function handleImportClick() {
    importInputRef.current?.click();
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    importBackup(file).catch(() => {
      /* toast ya mostrado */
    });
    e.target.value = '';
  }

  function handleNitBlur() {
    if (form.nit) {
      const formatted = formatNit(form.nit);
      if (formatted !== form.nit) {
        setForm(prev => ({ ...prev, nit: formatted }));
      }
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.nit) return;
    const nitResult = validateNit(form.nit);
    if (!nitResult.valid) {
      setNitError(nitResult.error);
      showToast(`NIT inválido: ${nitResult.error}`, 'error');
      return;
    }
    const newCompany = addCompany(
      { name: form.name, nit: formatNit(form.nit), tax_regime: form.tax_regime, city: form.city },
      { withDemoData: form.withDemoData }
    );
    setActiveCompany(newCompany);
    setForm({ name: '', nit: '', tax_regime: 'common', city: 'Bogotá', withDemoData: true });
    setNitError('');
    setShowForm(false);
  }

  function handleDeleteConfirm() {
    if (confirmDelete) deleteCompany(confirmDelete.id);
    setConfirmDelete(null);
  }

  function handleRestoreConfirm() {
    restoreDemoData();
    setConfirmRestore(false);
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
          <h1>Empresas</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {companies.length} empresa{companies.length !== 1 ? 's' : ''} · Multi-tenant para
            contadores
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            ref={importInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            style={{ display: 'none' }}
          />
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleImportClick}
            title="Importar backup JSON"
          >
            <Upload size={14} /> Importar
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={exportBackup}
            title="Exportar backup JSON"
            disabled={companies.length === 0}
          >
            <Download size={14} /> Backup
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setConfirmRestore(true)}>
            <RefreshCw size={14} /> Restaurar Demo
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={14} /> Nueva Empresa
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: '0.95rem' }}>Agregar Empresa</h3>
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
              }}
            >
              <div>
                <label htmlFor="company-name">Razón Social</label>
                <input
                  id="company-name"
                  className="input"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Empresa SAS"
                  required
                />
              </div>
              <div>
                <label htmlFor="company-nit">NIT</label>
                <input
                  id="company-nit"
                  className="input"
                  value={form.nit}
                  onChange={e => handleNitChange(e.target.value)}
                  onBlur={handleNitBlur}
                  placeholder="900.123.456-7"
                  required
                  style={nitError ? { borderColor: '#dc2626' } : undefined}
                />
                {nitError && !nitSuggestion && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      marginTop: 4,
                      color: '#dc2626',
                      fontSize: '0.75rem',
                    }}
                  >
                    <AlertCircle size={12} /> {nitError}
                  </div>
                )}
                {nitSuggestion && (
                  <button
                    type="button"
                    onClick={acceptNitSuggestion}
                    style={{
                      marginTop: 6,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 10px',
                      background: 'var(--accent-primary-glow)',
                      border: '1px solid var(--accent-primary)',
                      borderRadius: 6,
                      color: 'var(--accent-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left',
                    }}
                  >
                    <Lightbulb size={12} /> DV sugerido: <strong>{nitSuggestion.dv}</strong> → click
                    para aplicar{' '}
                    <code style={{ marginLeft: 'auto', fontFamily: 'ui-monospace, monospace' }}>
                      {nitSuggestion.formatted}
                    </code>
                  </button>
                )}
              </div>
              <div>
                <label htmlFor="company-regime">Régimen Tributario</label>
                <select
                  id="company-regime"
                  className="input"
                  value={form.tax_regime}
                  onChange={e => setForm({ ...form, tax_regime: e.target.value })}
                >
                  <option value="common">Régimen Común</option>
                  <option value="simplified">Régimen Simplificado</option>
                </select>
              </div>
              <div>
                <label htmlFor="company-city">Ciudad</label>
                <input
                  id="company-city"
                  className="input"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  placeholder="Bogotá"
                />
              </div>
            </div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginTop: 16,
                padding: '12px 14px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={form.withDemoData}
                onChange={e => setForm({ ...form, withDemoData: e.target.checked })}
              />
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                }}
              >
                <Sparkles size={14} /> Generar 20 facturas demo para esta empresa
              </span>
            </label>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={!!nitError}>
                Guardar
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setShowForm(false);
                  setNitError('');
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

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
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="glass-card"
            style={{ padding: 24, maxWidth: 440, width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: 8 }}>Eliminar empresa</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 8 }}>
              ¿Eliminar <strong>{confirmDelete.name}</strong>?
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 20 }}>
              Se eliminarán también las {invoiceCounts[confirmDelete.id] || 0} facturas asociadas.
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setConfirmDelete(null)}>
                Cancelar
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleDeleteConfirm}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmRestore && (
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
          onClick={() => setConfirmRestore(false)}
        >
          <div
            className="glass-card"
            style={{ padding: 24, maxWidth: 440, width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: 8 }}>Restaurar datos demo</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 8 }}>
              Esto reemplazará <strong>todas</strong> tus empresas y facturas con los datos demo
              iniciales:
            </p>
            <ul
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
                marginBottom: 20,
                paddingLeft: 20,
              }}
            >
              <li>Empresa "Demo Tech SAS" (NIT 999.999.999-0)</li>
              <li>50 facturas distribuidas en 6 meses</li>
            </ul>
            <p style={{ color: '#b91c1c', fontSize: '0.82rem', marginBottom: 20, fontWeight: 500 }}>
              Las {companies.length} empresa{companies.length !== 1 ? 's' : ''} y{' '}
              {allInvoices.length} factura{allInvoices.length !== 1 ? 's' : ''} actuales se
              perderán.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setConfirmRestore(false)}>
                Cancelar
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleRestoreConfirm}>
                Restaurar
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {companies.map(company => {
          const isActive = activeCompany?.id === company.id;
          const invCount = invoiceCounts[company.id] || 0;
          const total = totalByCompany[company.id] || 0;
          return (
            <div
              key={company.id}
              className="glass-card"
              style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                cursor: 'pointer',
                borderColor: isActive ? 'var(--accent-primary)' : undefined,
                background: isActive ? 'var(--accent-primary-glow)' : undefined,
                borderWidth: 1,
                borderStyle: 'solid',
              }}
              onClick={() => setActiveCompany(company)}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: isActive ? 'var(--accent-primary)' : 'var(--bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Building2
                  size={20}
                  style={{ color: isActive ? '#ffffff' : 'var(--text-muted)' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  {company.name}
                  {isActive && (
                    <span className="badge badge-success">
                      <Check size={12} /> Activa
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  NIT: {company.nit} ·{' '}
                  {company.tax_regime === 'common' ? 'Régimen Común' : 'Simplificado'} ·{' '}
                  {company.city}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    marginTop: 8,
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <FileText size={12} /> {invCount} facturas
                  </span>
                  {total > 0 && (
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                      Facturado: {formatCOP(total)}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();
                  setConfirmDelete(company);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: 8,
                  borderRadius: 6,
                  flexShrink: 0,
                }}
                onMouseOver={e => {
                  e.currentTarget.style.color = '#dc2626';
                  e.currentTarget.style.background = 'var(--accent-danger-glow)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'none';
                }}
                aria-label="Eliminar empresa"
                title="Eliminar empresa"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}

        {companies.length === 0 && (
          <EmptyState
            variant="companies"
            title="No hay empresas registradas"
            description="Agrega tu primera empresa para empezar a gestionar facturas, o restaura los datos demo para explorar la app con datos de muestra."
            action={{ icon: Plus, label: 'Nueva Empresa', onClick: () => setShowForm(true) }}
            secondaryAction={{
              icon: RefreshCw,
              label: 'Restaurar Demo',
              onClick: () => setConfirmRestore(true),
            }}
          />
        )}
      </div>
    </div>
  );
}
