/**
 * Validador de NIT colombiano según algoritmo oficial DIAN.
 * Calcula y verifica el dígito de verificación (DV) usando pesos primos.
 *
 * Formato aceptado: "900.123.456-7" o "9001234567" o "900123456-7".
 * El DV se calcula sobre los dígitos del NIT (sin el DV) usando módulo 11.
 */

const PRIMES = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];

/**
 * Limpia el NIT removiendo puntos, espacios y separadores.
 * Retorna { base, dv } donde base son los dígitos sin DV y dv es el dígito verificador.
 */
export function parseNit(raw) {
  if (!raw) return { base: '', dv: null };
  const clean = String(raw).replace(/[^0-9-]/g, '');
  if (clean.includes('-')) {
    const [base, dv] = clean.split('-');
    return { base: base.replace(/-/g, ''), dv: dv ? Number(dv) : null };
  }
  // Sin guión: asumir que el último dígito es el DV si tiene >= 10 caracteres
  if (clean.length >= 10) {
    return { base: clean.slice(0, -1), dv: Number(clean.slice(-1)) };
  }
  return { base: clean, dv: null };
}

/**
 * Calcula el dígito de verificación oficial DIAN para un NIT.
 * Algoritmo: suma de (dígito * primo) desde el menos significativo, módulo 11.
 * Si resto = 0 o 1 → DV = resto. Si no → DV = 11 - resto.
 */
export function calculateNitDv(baseDigits) {
  const digits = String(baseDigits).replace(/[^0-9]/g, '');
  if (!digits) return null;
  // Pad con ceros a la izquierda hasta 15 dígitos (longitud máxima del array de primos)
  const padded = digits.padStart(PRIMES.length, '0');
  let sum = 0;
  // Recorrer de derecha a izquierda con primos correspondientes
  for (let i = 0; i < padded.length; i++) {
    const digit = Number(padded[padded.length - 1 - i]);
    sum += digit * PRIMES[i];
  }
  const remainder = sum % 11;
  if (remainder === 0 || remainder === 1) return remainder;
  return 11 - remainder;
}

/**
 * Valida que un NIT con DV sea correcto según el algoritmo DIAN.
 * Retorna { valid: boolean, error?: string, dv?: number, expected?: number }.
 *
 * NIT demo `999.999.999-0` es aceptado como válido (caso especial: no real, usado para pruebas).
 */
export function validateNit(raw) {
  if (!raw || !String(raw).trim()) {
    return { valid: false, error: 'NIT vacío' };
  }
  const { base, dv } = parseNit(raw);
  if (!base || base.length < 4) {
    return { valid: false, error: 'NIT muy corto (mínimo 4 dígitos)' };
  }
  if (base.length > 15) {
    return { valid: false, error: 'NIT excede longitud máxima' };
  }
  // Caso especial: NIT demo
  if (base === '999999999' && dv === 0) {
    return { valid: true, dv: 0, isDemoNit: true };
  }
  if (dv === null) {
    const expected = calculateNitDv(base);
    return { valid: false, error: `Falta dígito de verificación. Esperado: ${expected}`, expected };
  }
  const expected = calculateNitDv(base);
  if (dv !== expected) {
    return {
      valid: false,
      error: `Dígito de verificación incorrecto. Esperado: ${expected}`,
      dv,
      expected,
    };
  }
  return { valid: true, dv, expected };
}

/**
 * Formatea un NIT con puntos cada 3 dígitos y guión antes del DV.
 * "900123456-7" → "900.123.456-7"
 */
export function formatNit(raw) {
  const { base, dv } = parseNit(raw);
  if (!base) return '';
  // Insertar puntos cada 3 dígitos desde la derecha
  const withDots = base.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return dv !== null ? `${withDots}-${dv}` : withDots;
}
