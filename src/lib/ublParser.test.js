import { describe, it, expect, beforeAll } from 'vitest';
import { parseUblXml } from './ublParser';

// Polyfill DOMParser para entorno Node (Vitest sin jsdom)
beforeAll(async () => {
  if (typeof globalThis.DOMParser === 'undefined') {
    const { DOMParser } = await import('@xmldom/xmldom').catch(() => ({ DOMParser: null }));
    if (DOMParser) globalThis.DOMParser = DOMParser;
  }
});

const SAMPLE_INVOICE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2">
  <cbc:ID>FE-12345</cbc:ID>
  <cbc:IssueDate>2025-03-15</cbc:IssueDate>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="9" schemeAgencyID="195">900123456</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>Tecnologias Andinas SAS</cbc:Name>
      </cac:PartyName>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="COP">1000000.00</cbc:LineExtensionAmount>
    <cbc:PayableAmount currencyID="COP">1190000.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="COP">190000.00</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="COP">1000000.00</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="COP">190000.00</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:Percent>19.00</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>01</cbc:ID>
          <cbc:Name>IVA</cbc:Name>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cac:Item>
      <cbc:Description>Servicios de consultoria empresarial</cbc:Description>
    </cac:Item>
  </cac:InvoiceLine>
</Invoice>`;

const SAMPLE_CREDIT_NOTE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<CreditNote xmlns="urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2"
            xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
            xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2">
  <cbc:ID>NC-001</cbc:ID>
  <cbc:IssueDate>2025-03-20</cbc:IssueDate>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID>900123456</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>Tecnologias Andinas SAS</cbc:Name>
      </cac:PartyName>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="COP">200000.00</cbc:LineExtensionAmount>
    <cbc:PayableAmount currencyID="COP">238000.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:CreditNoteLine>
    <cbc:ID>1</cbc:ID>
    <cac:Item>
      <cbc:Description>Devolucion parcial servicios</cbc:Description>
    </cac:Item>
  </cac:CreditNoteLine>
</CreditNote>`;

describe('parseUblXml — Invoice de venta', () => {
  it('parsea factura UBL 2.1 estándar', () => {
    if (typeof DOMParser === 'undefined') return; // skip si no hay DOMParser
    const r = parseUblXml(SAMPLE_INVOICE_XML);
    expect(r.invoice_number).toBe('FE-12345');
    expect(r.date).toBe('2025-03-15');
    expect(r.vendor_name).toContain('Tecnologias');
    expect(r.vendor_nit).toBe('900123456');
    expect(r.base_amount).toBe(1000000);
    expect(r.iva_rate).toBe(19);
    expect(r.type).toBe('sale');
    expect(r.concept).toContain('consultoria');
  });

  it('marca _source como ubl', () => {
    if (typeof DOMParser === 'undefined') return;
    const r = parseUblXml(SAMPLE_INVOICE_XML);
    expect(r._source).toBe('ubl');
  });

  it('captura total payable del XML', () => {
    if (typeof DOMParser === 'undefined') return;
    const r = parseUblXml(SAMPLE_INVOICE_XML);
    expect(r._xml_total).toBe(1190000);
  });
});

describe('parseUblXml — Nota crédito', () => {
  it('detecta CreditNote y marca type=credit_note', () => {
    if (typeof DOMParser === 'undefined') return;
    const r = parseUblXml(SAMPLE_CREDIT_NOTE_XML);
    expect(r.type).toBe('credit_note');
    expect(r.invoice_number).toBe('NC-001');
    // Notas crédito invierten signo
    expect(r.base_amount).toBeLessThanOrEqual(0);
  });
});

describe('parseUblXml — errores', () => {
  it('rechaza XML vacío', () => {
    expect(() => parseUblXml('')).toThrow(/vac/i);
  });

  it('rechaza XML inválido', () => {
    if (typeof DOMParser === 'undefined') return;
    expect(() => parseUblXml('<<<not xml>>>')).toThrow();
  });

  it('rechaza no-string', () => {
    expect(() => parseUblXml(null)).toThrow();
    expect(() => parseUblXml(undefined)).toThrow();
  });
});
