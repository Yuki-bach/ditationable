'use client'

import { useState } from 'react'
import FileUpload from './components/FileUpload'
import ApiKeyInput from './components/ApiKeyInput'
import SystemPromptInput from './components/SystemPromptInput'
import TranscriptionSettings from './components/TranscriptionSettings'

export default function Home() {
  const [apiKey, setApiKey] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [speakerCount, setSpeakerCount] = useState(2)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleTranscribe = async () => {
    if (!apiKey || !audioFile) {
      alert('Please provide an API key and select an audio file')
      return
    }
    
    setIsProcessing(true)
    // TODO: Implement transcription logic
    setIsProcessing(false)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dictationable</h1>
          <p className="text-lg text-gray-600">AI-powered audio transcription with speaker separation</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
            <ApiKeyInput value={apiKey} onChange={setApiKey} />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Audio File</h2>
            <FileUpload onFileSelect={setAudioFile} />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Transcription Settings</h2>
            <TranscriptionSettings 
              speakerCount={speakerCount}
              onSpeakerCountChange={setSpeakerCount}
            />
            <div className="mt-4">
              <SystemPromptInput value={systemPrompt} onChange={setSystemPrompt} />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleTranscribe}
              disabled={isProcessing || !apiKey || !audioFile}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Start Transcription'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}