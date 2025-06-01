'use client'

import { useState } from 'react'

interface ApiKeyInputProps {
  value: string
  onChange: (value: string) => void
}

export default function ApiKeyInput({ value, onChange }: ApiKeyInputProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)

  const handleValidate = async () => {
    if (!value) {
      alert('Please enter an API key')
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
        alert('Invalid API key. Please check and try again.')
      }
    } catch (error) {
      console.error('Validation error:', error)
      alert('Failed to validate API key')
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div>
      <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
        Gemini API Key
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
          placeholder="Enter your Gemini API key"
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
          {isValidating ? 'Validating...' : 'Validate'}
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        Your API key is stored only in memory and never persisted
      </p>
      {isValid === true && (
        <p className="mt-1 text-sm text-green-600">✓ API key validated successfully</p>
      )}
    </div>
  )
}