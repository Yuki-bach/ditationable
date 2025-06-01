'use client'

import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

interface ApiKeyInputProps {
  value: string
  onChange: (value: string) => void
}

export default function ApiKeyInput({ value, onChange }: ApiKeyInputProps) {
  const { t } = useLanguage()
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)

  const handleValidate = async () => {
    if (!value) {
      alert(t.geminiApiKey + ' を入力してください')
      return
    }

    setIsValidating(true)
    try {
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: value })
      })
      
      const result = await response.json()
      setIsValid(result.valid)
      
      if (!result.valid) {
        alert(t.invalidApiKey)
      }
    } catch (error) {
      console.error('Validation error:', error)
      alert(t.failedToValidateApiKey)
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div>
      <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
        {t.geminiApiKey}
      </label>
      <div className="flex space-x-2">
        <input
          id="api-key"
          type="password"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setIsValid(null)
          }}
          placeholder={t.apiKeyPlaceholder}
          className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isValid === false ? 'border-red-500' : 
            isValid === true ? 'border-green-500' : 
            'border-gray-300'
          }`}
        />
        <button
          onClick={handleValidate}
          disabled={isValidating || !value}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isValidating ? t.validating : t.validate}
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        {t.apiKeyNote}
      </p>
      {isValid === true && (
        <p className="mt-1 text-sm text-green-600">{t.apiKeyValidated}</p>
      )}
    </div>
  )
}