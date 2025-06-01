'use client'

import { useLanguage } from '../contexts/LanguageContext'
import { Language } from '../lib/i18n'

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage()

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">{t.language}:</span>
      <div className="flex rounded-lg border border-gray-300 overflow-hidden">
        <button
          onClick={() => handleLanguageChange('en')}
          className={`px-3 py-1 text-sm transition-colors ${
            language === 'en'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {t.english}
        </button>
        <button
          onClick={() => handleLanguageChange('ja')}
          className={`px-3 py-1 text-sm transition-colors ${
            language === 'ja'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {t.japanese}
        </button>
      </div>
    </div>
  )
}