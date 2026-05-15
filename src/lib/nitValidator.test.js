import { describe, it, expect } from 'vitest';
import { parseNit, calculateNitDv, validateNit, formatNit } from './nitValidator';

describe('parseNit', () => {
  it('separa base y DV en formato con guión', () => {
    expect(parseNit('900.123.456-7')).toEqual({ base: '900123456', dv: 7 });
  });

  it('separa base y DV sin puntos', () => {
    expect(parseNit('900123456-7')).toEqual({ base: '900123456', dv: 7 });
  });

  it('asume último dígito es DV si tiene >=10 caracteres sin guión', () => {
    expect(parseNit('9001234567')).toEqual({ base: '900123456', dv: 7 });
  });

  it('si <10 dígitos sin guión, no infiere DV', () => {
    expect(parseNit('900123')).toEqual({ base: '900123', dv: null });
  });

  it('NIT vacío retorna base vacía', () => {
    expect(parseNit('')).toEqual({ base: '', dv: null });
    expect(parseNit(null)).toEqual({ base: '', dv: null });
  });
});

describe('calculateNitDv — algoritmo oficial DIAN', () => {
  // Casos reales: empresas conocidas con DVs públicos validables
  it('NIT 8001978001 (Bancolombia) → DV correcto', () => {
    // Bancolombia NIT 890.903.938-8 (real público)
    expect(calculateNitDv('890903938')).toBe(8);
  });

  it('NIT 800197268-4 (Ecopetrol) → DV correcto', () => {
    expect(calculateNitDv('800197268')).toBe(4);
  });

  it('NIT con caracteres no numéricos se limpia', () => {
    expect(calculateNitDv('890.903.938')).toBe(8);
  });

  it('NIT vacío retorna null', () => {
    expect(calculateNitDv('')).toBe(null);
    expect(calculateNitDv(null)).toBe(null);
  });

  it('NIT de 4 dígitos calcula DV consistente', () => {
    const dv = calculateNitDv('1234');
    expect(typeof dv).toBe('number');
    expect(dv).toBeGreaterThanOrEqual(0);
    expect(dv).toBeLessThanOrEqual(11);
  });
});

describe('validateNit', () => {
  it('NIT Bancolombia válido (890.903.938-8)', () => {
    const result = validateNit('890.903.938-8');
    expect(result.valid).toBe(true);
  });

  it('NIT Ecopetrol válido (800.197.268-4)', () => {
    const result = validateNit('800.197.268-4');
    expect(result.valid).toBe(true);
  });

  it('NIT con DV incorrecto falla con esperado', () => {
    const result = validateNit('890.903.938-1');
    expect(result.valid).toBe(false);
    expect(result.expected).toBe(8);
    expect(result.error).toMatch(/incorrecto/i);
  });

  it('NIT demo 999.999.999-0 es aceptado como caso especial', () => {
    const result = validateNit('999.999.999-0');
    expect(result.valid).toBe(true);
    expect(result.isDemoNit).toBe(true);
  });

  it('NIT vacío falla', () => {
    expect(validateNit('').valid).toBe(false);
    expect(validateNit('   ').valid).toBe(false);
  });

  it('NIT muy corto falla', () => {
    const result = validateNit('123');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/corto/i);
  });

  it('NIT sin DV falla pero retorna esperado', () => {
    const result = validateNit('890903938');
    expect(result.valid).toBe(false);
    expect(result.expected).toBe(8);
    expect(result.error).toMatch(/dígito.*verificación/i);
  });
});

describe('formatNit', () => {
  it('añade puntos cada 3 dígitos', () => {
    expect(formatNit('900123456-7')).toBe('900.123.456-7');
  });

  it('respeta cuando ya está formateado', () => {
    expect(formatNit('900.123.456-7')).toBe('900.123.456-7');
  });

  it('formatea sin DV si no se proporciona', () => {
    expect(formatNit('900123456')).toBe('900.123.456');
  });

  it('NIT vacío retorna string vacío', () => {
    expect(formatNit('')).toBe('');
    expect(formatNit(null)).toBe('');
  });
});
