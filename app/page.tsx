'use client'

import { useState } from 'react'
import FileUpload from './components/FileUpload'
import ApiKeyInput from './components/ApiKeyInput'
import SystemPromptInput from './components/SystemPromptInput'
import TranscriptionSettings from './components/TranscriptionSettings'
import TranscriptionResultComponent from './components/TranscriptionResult'
import ProgressIndicator from './components/ProgressIndicator'
import LanguageToggle from './components/LanguageToggle'
import { TranscriptionResult } from './lib/transcription-service'
import { useLanguage } from './contexts/LanguageContext'

export default function Home() {
  const { t } = useLanguage()
  const [apiKey, setApiKey] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [userPrompt, setUserPrompt] = useState('')
  const [speakerCount, setSpeakerCount] = useState(2)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [result, setResult] = useState<TranscriptionResult | null>(null)

  const handleTranscribe = async () => {
    if (!apiKey || !audioFile) {
      alert(t.provideApiKeyAndFile)
      return
    }
    
    setIsProcessing(true)
    setProgress(0)
    setProgressMessage(t.checkingFileSize)
    
    try {
      const formData = new FormData()
      formData.append('audio', audioFile)
      formData.append('apiKey', apiKey)
      // Combine system and user prompts
      const finalSystemPrompt = systemPrompt.replace('{speakerCount}', speakerCount.toString())
      const combinedPrompt = userPrompt.trim() 
        ? `${finalSystemPrompt}\n\nAdditional context: ${userPrompt}`
        : finalSystemPrompt
      formData.append('systemPrompt', combinedPrompt)
      formData.append('speakerCount', speakerCount.toString())
      
      setProgress(30)
      setProgressMessage(t.uploadingAudio)
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })
      
      setProgress(60)
      setProgressMessage(t.processingTranscription)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t.transcriptionFailed)
      }
      
      const result = await response.json()
      console.log('Transcription result:', result)
      
      setProgress(90)
      setProgressMessage(t.finalizing)
      
      setResult(result as TranscriptionResult)
      setProgress(100)
      setProgressMessage(t.complete)
      
    } catch (error) {
      console.error('Transcription error:', error)
      alert(error instanceof Error ? error.message : t.transcriptionFailed)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="relative mb-8">
          <div className="absolute top-0 right-0">
            <LanguageToggle />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.appTitle}</h1>
            <p className="text-lg text-gray-600">{t.appDescription}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{t.apiConfiguration}</h2>
            <ApiKeyInput value={apiKey} onChange={setApiKey} />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{t.audioFile}</h2>
            <FileUpload onFileSelect={setAudioFile} />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{t.transcriptionSettings}</h2>
            <TranscriptionSettings 
              speakerCount={speakerCount}
              onSpeakerCountChange={setSpeakerCount}
            />
            <div className="mt-4">
              <SystemPromptInput 
                systemPrompt={systemPrompt}
                onSystemPromptChange={setSystemPrompt}
                userPrompt={userPrompt}
                onUserPromptChange={setUserPrompt}
                speakerCount={speakerCount} 
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleTranscribe}
              disabled={isProcessing || !apiKey || !audioFile}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? t.processing : t.startTranscription}
            </button>
          </div>
          
          {result && audioFile && (
            <TranscriptionResultComponent 
              result={result} 
              audioFileName={audioFile.name} 
            />
          )}
        </div>
      </div>
      
      {isProcessing && (
        <ProgressIndicator progress={progress} message={progressMessage} />
      )}
    </main>
  )
}