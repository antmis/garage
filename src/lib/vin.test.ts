import { describe, expect, it } from 'vitest'
import { checkVin, computeCheckDigit, hasValidCheckDigit, isValidVinFormat, normalizeVin } from './vin'

// The worked example in 49 CFR 565.25 (check digit 'X', remainder 10).
const CFR_EXAMPLE = '1M8GDM9AXKP042788'

describe('normalizeVin', () => {
  it('trims, strips spaces and dashes, uppercases', () => {
    expect(normalizeVin('  1m8gdm9a-xkp 042788 ')).toBe(CFR_EXAMPLE)
  })
})

describe('isValidVinFormat', () => {
  it('accepts 17 allowed characters', () => {
    expect(isValidVinFormat(CFR_EXAMPLE)).toBe(true)
  })
  it.each(['1M8GDM9AXKP04278', '1M8GDM9AXKP0427880', '1M8GDM9AXKP04278O', '1M8GDM9AXKP04278I', 'QM8GDM9AXKP042788'])(
    'rejects %s',
    (vin) => expect(isValidVinFormat(vin)).toBe(false),
  )
})

describe('check digit (49 CFR 565.25)', () => {
  it('computes X for the regulation example', () => {
    expect(computeCheckDigit(CFR_EXAMPLE)).toBe('X')
    expect(hasValidCheckDigit(CFR_EXAMPLE)).toBe(true)
  })
  it('validates the all-ones VIN (sum 89, remainder 1)', () => {
    expect(hasValidCheckDigit('11111111111111111')).toBe(true)
  })
  it('flags a wrong check digit', () => {
    expect(hasValidCheckDigit('1M8GDM9A1KP042788')).toBe(false)
  })
})

describe('checkVin', () => {
  it('reports a failed check digit as a warning, not an error', () => {
    expect(checkVin('1M8GDM9A1KP042788')).toEqual({ ok: true, vin: '1M8GDM9A1KP042788', checkDigitWarning: true })
  })
  it('passes a valid VIN with no warning', () => {
    expect(checkVin(CFR_EXAMPLE)).toEqual({ ok: true, vin: CFR_EXAMPLE, checkDigitWarning: false })
  })
  it('errors on empty and malformed input', () => {
    expect(checkVin('  ')).toMatchObject({ ok: false, error: 'empty' })
    expect(checkVin('ABC')).toMatchObject({ ok: false, error: 'format' })
  })
})
