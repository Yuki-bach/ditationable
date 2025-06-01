import { describe, it, expect } from 'vitest'
import { translations, getTranslation } from '../i18n'

describe('i18n', () => {
  describe('getTranslation', () => {
    it('returns English translations for "en" language', () => {
      const t = getTranslation('en')
      
      expect(t.title).toBe('Dictationable')
      expect(t.subtitle).toBe('AI-Powered Audio Transcription with Speaker Diarization')
      expect(t.validate).toBe('Set')
      expect(t.geminiApiKey).toBe('Gemini API Key')
    })

    it('returns Japanese translations for "ja" language', () => {
      const t = getTranslation('ja')
      
      expect(t.title).toBe('Dictationable')
      expect(t.subtitle).toBe('AI音声認識による話者分離機能付き文字起こし')
      expect(t.validate).toBe('設定')
      expect(t.geminiApiKey).toBe('Gemini APIキー')
    })

    it('defaults to Japanese for invalid language', () => {
      const t = getTranslation('invalid' as any)
      
      // Should return Japanese translations
      expect(t.subtitle).toBe('AI音声認識による話者分離機能付き文字起こし')
    })
  })

  describe('translations object', () => {
    it('has matching keys for all languages', () => {
      const enKeys = Object.keys(translations.en).sort()
      const jaKeys = Object.keys(translations.ja).sort()
      
      expect(enKeys).toEqual(jaKeys)
    })

    it('contains all required translation keys', () => {
      const requiredKeys = [
        'title',
        'subtitle',
        'geminiApiKey',
        'apiKeyPlaceholder',
        'validate',
        'validating',
        'apiKeyNote',
        'apiKeyValidated',
        'invalidApiKey',
        'failedToValidateApiKey',
        'selectAudioFile',
        'clickToUpload',
        'dragAndDrop',
        'supportedFormats',
        'maxDuration',
        'willUseFilesApi',
        'invalidFileFormat',
        'speakerCount',
        'contextInfo',
        'contextPlaceholder',
        'systemPrompt',
        'transcribe',
        'transcribing',
        'result',
        'downloadTxt',
        'downloadJson',
        'generatedBy',
        'speaker',
        'text',
        'time',
      ]
      
      for (const key of requiredKeys) {
        expect(translations.en).toHaveProperty(key)
        expect(translations.ja).toHaveProperty(key)
      }
    })

    it('has non-empty translations for all keys', () => {
      for (const lang of ['en', 'ja'] as const) {
        const langTranslations = translations[lang]
        for (const [key, value] of Object.entries(langTranslations)) {
          expect(value).toBeTruthy()
          expect(typeof value).toBe('string')
        }
      }
    })
  })
})