import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Building2, Plus, Check, Trash2 } from 'lucide-react';

export default function CompaniesPage() {
  const { companies, activeCompany, setActiveCompany, addCompany } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', nit: '', tax_regime: 'common', city: 'Bogotá' });

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.nit) return;
    addCompany(form);
    setForm({ name: '', nit: '', tax_regime: 'common', city: 'Bogotá' });
    setShowForm(false);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1>Empresas</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gestión multi-empresa para contadores</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          <Plus size={14} /> Nueva Empresa
        </button>
      </div>

      {/* New company form */}
      {showForm && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: '0.95rem' }}>Agregar Empresa</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label htmlFor="company-name">Razón Social</label>
                <input id="company-name" className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Empresa SAS" required />
              </div>
              <div>
                <label htmlFor="company-nit">NIT</label>
                <input id="company-nit" className="input" value={form.nit} onChange={e => setForm({ ...form, nit: e.target.value })} placeholder="900.123.456-7" required />
              </div>
              <div>
                <label htmlFor="company-regime">Régimen Tributario</label>
                <select id="company-regime" className="input" value={form.tax_regime} onChange={e => setForm({ ...form, tax_regime: e.target.value })}>
                  <option value="common">Régimen Común</option>
                  <option value="simplified">Régimen Simplificado</option>
                </select>
              </div>
              <div>
                <label htmlFor="company-city">Ciudad</label>
                <input id="company-city" className="input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Bogotá" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button type="submit" className="btn btn-primary btn-sm">Guardar</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Company list */}
      <div style={{ display: 'grid', gap: 12 }}>
        {companies.map(company => (
          <div
            key={company.id}
            className="glass-card"
            style={{
              padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: 16,
              cursor: 'pointer',
              borderColor: activeCompany?.id === company.id ? '#bfdbfe' : undefined,
              background: activeCompany?.id === company.id ? '#eff6ff' : undefined,
              borderWidth: 1, borderStyle: 'solid',
            }}
            onClick={() => setActiveCompany(company)}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: activeCompany?.id === company.id ? '#2563eb' : '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Building2 size={20} style={{ color: activeCompany?.id === company.id ? '#ffffff' : 'var(--text-muted)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{company.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                NIT: {company.nit} · {company.tax_regime === 'common' ? 'Régimen Común' : 'Simplificado'} · {company.city}
              </div>
            </div>
            {activeCompany?.id === company.id && (
              <span className="badge badge-success"><Check size={12} /> Activa</span>
            )}
          </div>
        ))}

        {companies.length === 0 && (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
            <Building2 size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
            <p style={{ color: 'var(--text-secondary)' }}>No hay empresas registradas</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Agrega tu primera empresa para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
}
