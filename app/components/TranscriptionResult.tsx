'use client'

import { TranscriptionResult } from '../lib/transcription-service'
import { useLanguage } from '../contexts/LanguageContext'

interface TranscriptionResultProps {
  result: TranscriptionResult
  audioFileName: string
}

export default function TranscriptionResultComponent({ 
  result, 
  audioFileName 
}: TranscriptionResultProps) {
  const { t } = useLanguage()
  const downloadAsText = () => {
    const text = result.segments.map(segment => 
      `[${segment.timestamp}] ${segment.speaker}: ${segment.text}`
    ).join('\n\n')
    
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${audioFileName.replace(/\.[^/.]+$/, '')}_transcription.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAsJson = () => {
    const json = JSON.stringify({
      file: audioFileName,
      metadata: result.metadata,
      speakers: groupSegmentsBySpeaker(result.segments)
    }, null, 2)
    
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${audioFileName.replace(/\.[^/.]+$/, '')}_transcription.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const groupSegmentsBySpeaker = (segments: typeof result.segments) => {
    const speakers = new Map<string, typeof segments>()
    
    segments.forEach(segment => {
      if (!speakers.has(segment.speaker)) {
        speakers.set(segment.speaker, [])
      }
      speakers.get(segment.speaker)!.push(segment)
    })
    
    return Array.from(speakers.entries()).map(([speaker, segments]) => ({
      speaker_id: speaker,
      segments: segments.map(({ timestamp, text }) => ({ timestamp, text }))
    }))
  }

  const getSpeakerColor = (speaker: string) => {
    const colors = [
      'text-blue-600',
      'text-green-600',
      'text-purple-600',
      'text-orange-600',
      'text-pink-600',
      'text-indigo-600'
    ]
    const index = parseInt(speaker.match(/\d+/)?.[0] || '0') - 1
    return colors[index % colors.length]
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t.transcriptionResult}</h2>
          <div className="space-x-2">
            <button
              onClick={downloadAsText}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {t.downloadAsTxt}
            </button>
            <button
              onClick={downloadAsJson}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t.downloadAsJson}
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          {result.metadata.duration && <p>{t.duration}: {result.metadata.duration}</p>}
          <p>{t.speakers}: {result.metadata.speakerCount}</p>
          <p>{t.processed}: {new Date(result.metadata.processedAt).toLocaleString()}</p>
        </div>
        
        <div className="border-t pt-4 max-h-96 overflow-y-auto">
          {result.segments.map((segment, index) => (
            <div key={index} className="mb-3">
              <div className="flex items-start space-x-3">
                <span className="text-xs text-gray-500 font-mono mt-1">
                  [{segment.timestamp}]
                </span>
                <div className="flex-1">
                  <span className={`font-medium ${getSpeakerColor(segment.speaker)}`}>
                    {segment.speaker}:
                  </span>
                  <p className="text-gray-700 mt-1">{segment.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}