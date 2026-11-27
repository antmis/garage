// VIN rules shared by the browser (src/lib/vin.ts re-exports this file) and the vehicle-data Edge Function.
// Keep it dependency-free and import-free: Deno and Vite both load it as-is.
// Source: 49 CFR Part 565 (17 characters; I, O, Q never used; check digit at position 9 per 565.25).

const VIN_FORMAT = /^[A-HJ-NPR-Z0-9]{17}$/

/** Trims, strips spaces and dashes, uppercases. Does not validate. */
export function normalizeVin(input: string): string {
  return input.replace(/[\s-]+/g, '').toUpperCase()
}

/** 17 characters from the allowed set (no I, O or Q). Expects a normalized VIN. */
export function isValidVinFormat(vin: string): boolean {
  return VIN_FORMAT.test(vin)
}

// 49 CFR 565.25 Table IV (transliteration) and Table V (position weights).
const TRANSLITERATION: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
}
const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]

/** The check digit (position 9) the rest of the VIN implies: '0'-'9' or 'X'. Null when the format is invalid. */
export function computeCheckDigit(vin: string): string | null {
  if (!isValidVinFormat(vin)) return null
  let sum = 0
  for (let i = 0; i < 17; i++) {
    const c = vin[i]
    const value = c >= '0' && c <= '9' ? Number(c) : TRANSLITERATION[c]
    sum += value * WEIGHTS[i]
  }
  const remainder = sum % 11
  return remainder === 10 ? 'X' : String(remainder)
}

/**
 * True when position 9 matches. Only North American-market vehicles must carry a valid check digit, so a
 * failure is a warning to show, never a reason to block saving (imported motorcycles can legitimately fail).
 */
export function hasValidCheckDigit(vin: string): boolean {
  const expected = computeCheckDigit(vin)
  return expected !== null && vin[8] === expected
}

export type VinCheck =
  | { ok: true; vin: string; checkDigitWarning: boolean }
  | { ok: false; vin: string; error: 'empty' | 'format' }

/** Normalizes and validates in one step; the shape both the form and the Edge Function act on. */
export function checkVin(input: string): VinCheck {
  const vin = normalizeVin(input)
  if (vin.length === 0) return { ok: false, vin, error: 'empty' }
  if (!isValidVinFormat(vin)) return { ok: false, vin, error: 'format' }
  return { ok: true, vin, checkDigitWarning: !hasValidCheckDigit(vin) }
}
