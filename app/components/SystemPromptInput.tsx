'use client'

import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

interface SystemPromptInputProps {
  value: string
  onChange: (value: string) => void
}

const DEFAULT_PROMPT = `You are transcribing an audio file with multiple speakers. Please:
1. Identify and label different speakers (e.g., Speaker 1, Speaker 2)
2. Include timestamps in MM:SS format at the beginning of each speaker's segment
3. Maintain speaker consistency throughout the transcription
4. Format the output clearly with speaker labels and timestamps`

export default function SystemPromptInput({ value, onChange }: SystemPromptInputProps) {
  const { t } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleUseDefault = () => {
    onChange(DEFAULT_PROMPT)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="system-prompt" className="block text-sm font-medium text-gray-700">
          {t.systemPromptOptional}
        </label>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? t.hide : t.customize}
        </button>
      </div>
      
      {isExpanded && (
        <>
          <textarea
            id="system-prompt"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={6}
            placeholder="Enter custom instructions for the AI..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="mt-2 flex justify-between items-center">
            <p className="text-xs text-gray-500">
              {t.systemPromptNote}
            </p>
            <button
              type="button"
              onClick={handleUseDefault}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {t.useDefaultPrompt}
            </button>
          </div>
        </>
      )}
    </div>
  )
}