'use client'

import React, { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

const DEFAULT_PROMPT = `You are transcribing an audio file with multiple speakers. 

IMPORTANT: Return ONLY valid JSON in the exact format below, without any markdown formatting, code blocks, or additional text:

{
  "segments": [
    {
      "speaker": "Speaker 1",
      "timestamp": "00:00",
      "text": "Transcribed text here"
    },
    {
      "speaker": "Speaker 2", 
      "timestamp": "00:15",
      "text": "Next speaker's text"
    }
  ]
}

Rules:
1. Identify and label different speakers (Speaker 1, Speaker 2, etc.)
2. Include timestamps in MM:SS format for each segment
3. Maintain speaker consistency throughout
4. There are approximately {speakerCount} speakers in this audio
5. Return ONLY the JSON object, no other text or formatting`

interface SystemPromptInputProps {
  systemPrompt: string
  onSystemPromptChange: (value: string) => void
  userPrompt: string
  onUserPromptChange: (value: string) => void
  speakerCount: number
}

export default function SystemPromptInput({ 
  systemPrompt, 
  onSystemPromptChange, 
  userPrompt, 
  onUserPromptChange, 
  speakerCount 
}: SystemPromptInputProps) {
  const { t } = useLanguage()
  const [isSystemExpanded, setIsSystemExpanded] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Initialize with default prompt if empty
  React.useEffect(() => {
    if (!systemPrompt) {
      onSystemPromptChange(DEFAULT_PROMPT)
    }
  }, [systemPrompt, onSystemPromptChange])

  // Generate the actual prompt that will be sent
  const getActualPrompt = () => {
    const processedSystemPrompt = systemPrompt.replace('{speakerCount}', speakerCount.toString())
    if (userPrompt.trim()) {
      return `${processedSystemPrompt}\n\nAdditional context: ${userPrompt}`
    }
    return processedSystemPrompt
  }

  return (
    <div className="space-y-4">
      {/* User Prompt Section */}
      <div>
        <label htmlFor="user-prompt" className="block text-sm font-medium text-gray-700 mb-2">
          {t.backgroundInformation}
        </label>
        <textarea
          id="user-prompt"
          value={userPrompt}
          onChange={(e) => onUserPromptChange(e.target.value)}
          rows={3}
          placeholder={t.backgroundPlaceholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">
          {t.backgroundNote}
        </p>
      </div>

      {/* System Prompt Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="system-prompt" className="block text-sm font-medium text-gray-700">
            {t.systemPrompt} (Advanced)
          </label>
          <button
            type="button"
            onClick={() => setIsSystemExpanded(!isSystemExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isSystemExpanded ? t.hide : t.customize}
          </button>
        </div>
        
        {isSystemExpanded && (
          <>
            <textarea
              id="system-prompt"
              value={systemPrompt}
              onChange={(e) => onSystemPromptChange(e.target.value)}
              rows={8}
              placeholder="Enter custom instructions for the AI..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            <div className="mt-2 flex justify-between items-center">
              <p className="text-xs text-gray-500">
                {t.systemPromptNote} Use {'{speakerCount}'} to automatically insert the speaker count.
              </p>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-green-600 hover:text-green-800"
              >
                {showPreview ? t.hidePreview : t.showPreview}
              </button>
            </div>
          </>
        )}

        {showPreview && (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {t.actualPrompt} {speakerCount})
            </h4>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-white p-3 rounded border max-h-40 overflow-y-auto">
              {getActualPrompt()}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}