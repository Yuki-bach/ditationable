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
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t.numberOfSpeakers}
        </label>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => onSpeakerCountChange(count)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                speakerCount === count
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {count === 10 ? '10+' : count.toString()}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-500">
          {t.speakerCountNote}
        </p>
      </div>
    </div>
  )
}