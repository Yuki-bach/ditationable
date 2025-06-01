import { describe, it, expect } from 'vitest'
import { translations, getTranslation } from '../i18n'

describe('i18n', () => {
  it('returns correct translations for supported languages', () => {
    const enTranslation = getTranslation('en')
    const jaTranslation = getTranslation('ja')
    
    expect(enTranslation.appTitle).toBe('Dictationable')
    expect(jaTranslation.appTitle).toBe('Dictationable')
    expect(enTranslation.validate).toBe('Set')
    expect(jaTranslation.validate).toBe('設定')
  })

  it('falls back to Japanese for invalid language', () => {
    const fallbackTranslation = getTranslation('invalid' as any)
    const jaTranslation = getTranslation('ja')
    
    expect(fallbackTranslation).toEqual(jaTranslation)
  })

  it('has matching keys for all languages', () => {
    const enKeys = Object.keys(translations.en).sort()
    const jaKeys = Object.keys(translations.ja).sort()
    
    expect(enKeys).toEqual(jaKeys)
  })
})