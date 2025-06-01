'use client'

import { useLanguage } from '../contexts/LanguageContext'

interface TranscriptionSettingsProps {
  speakerCount: number
  onSpeakerCountChange: (count: number) => void
}

export default function TranscriptionSettings({ 
  speakerCount, 
  onSpeakerCountChange 
}: TranscriptionSettingsProps) {
  const { t } = useLanguage()
  
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="speaker-count" className="block text-sm font-medium text-gray-700 mb-2">
          {t.numberOfSpeakers}
        </label>
        <div className="flex items-center space-x-4">
          <input
            id="speaker-count"
            type="range"
            min="1"
            max="10"
            value={speakerCount}
            onChange={(e) => onSpeakerCountChange(Number(e.target.value))}
            className="flex-1"
          />
          <span className="w-12 text-center font-medium text-gray-900">
            {speakerCount}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {t.speakerCountNote}
        </p>
      </div>
    </div>
  )
}