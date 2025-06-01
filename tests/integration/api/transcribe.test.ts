import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, OPTIONS } from '../../../app/api/transcribe/route'
import { createMockAudioFile } from '../../utils/test-helpers'

// Mock dependencies
vi.mock('../../../app/lib/gemini-transcription-service', () => ({
  GeminiTranscriptionService: vi.fn().mockImplementation(() => ({
    validateApiKey: vi.fn(),
    transcribe: vi.fn()
  }))
}))

vi.mock('../../../app/lib/rate-limiter', () => ({
  checkRateLimit: vi.fn()
}))

import { GeminiTranscriptionService } from '../../../app/lib/gemini-transcription-service'
import { checkRateLimit } from '../../../app/lib/rate-limiter'

describe('/api/transcribe', () => {
  let mockValidateApiKey: any
  let mockTranscribe: any
  let mockCheckRateLimit: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockValidateApiKey = vi.fn()
    mockTranscribe = vi.fn()
    mockCheckRateLimit = checkRateLimit as any
    
    ;(GeminiTranscriptionService as any).mockImplementation(() => ({
      validateApiKey: mockValidateApiKey,
      transcribe: mockTranscribe
    }))
  })

  it('transcribes audio successfully', async () => {
    mockCheckRateLimit.mockReturnValue(true)
    mockValidateApiKey.mockResolvedValue(true)
    mockTranscribe.mockResolvedValue({
      segments: [
        {
          speaker: 'Speaker 1',
          text: 'Test transcription',
          timestamp: '00:00:00'
        }
      ],
      metadata: {
        duration: '00:00:10',
        speakerCount: 1,
        processedAt: new Date().toISOString()
      }
    })
    
    const formData = new FormData()
    const audioFile = createMockAudioFile('test.mp3')
    formData.append('audio', audioFile)
    formData.append('apiKey', 'test-api-key')
    formData.append('systemPrompt', 'Test prompt')
    formData.append('speakerCount', '2')
    
    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      body: formData
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.segments).toHaveLength(1)
    expect(data.segments[0].text).toBe('Test transcription')
    expect(mockTranscribe).toHaveBeenCalledTimes(1)
    const [file, options, callback] = mockTranscribe.mock.calls[0]
    
    expect(file.name).toBe('test.mp3')
    expect(file.type).toBe('audio/mp3')
    expect(options).toEqual({
      apiKey: 'test-api-key',
      systemPrompt: 'Test prompt',
      speakerCount: 2
    })
    expect(typeof callback).toBe('function')
  })

  it('returns 429 when rate limit exceeded', async () => {
    mockCheckRateLimit.mockReturnValue(false)
    
    const formData = new FormData()
    formData.append('audio', createMockAudioFile())
    formData.append('apiKey', 'test-api-key')
    
    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      body: formData
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(429)
    expect(data.error).toContain('Too many requests')
    expect(mockValidateApiKey).not.toHaveBeenCalled()
  })

  it('returns 400 when audio file is missing', async () => {
    mockCheckRateLimit.mockReturnValue(true)
    
    const formData = new FormData()
    formData.append('apiKey', 'test-api-key')
    
    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      body: formData
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(400)
    expect(data.error).toContain('Missing required fields')
  })

  it('returns 400 when API key is missing', async () => {
    mockCheckRateLimit.mockReturnValue(true)
    
    const formData = new FormData()
    formData.append('audio', createMockAudioFile())
    
    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      body: formData
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(400)
    expect(data.error).toContain('Missing required fields')
  })

  it('returns 400 for invalid audio file type', async () => {
    mockCheckRateLimit.mockReturnValue(true)
    
    const formData = new FormData()
    const textFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    formData.append('audio', textFile)
    formData.append('apiKey', 'test-api-key')
    
    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      body: formData
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid audio file type')
  })

  it('returns 401 for invalid API key', async () => {
    mockCheckRateLimit.mockReturnValue(true)
    mockValidateApiKey.mockResolvedValue(false)
    
    const formData = new FormData()
    formData.append('audio', createMockAudioFile())
    formData.append('apiKey', 'invalid-key')
    
    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      body: formData
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(401)
    expect(data.error).toBe('Invalid API key')
  })

  it('returns 500 when transcription fails', async () => {
    mockCheckRateLimit.mockReturnValue(true)
    mockValidateApiKey.mockResolvedValue(true)
    mockTranscribe.mockRejectedValue(new Error('Transcription failed'))
    
    const formData = new FormData()
    formData.append('audio', createMockAudioFile())
    formData.append('apiKey', 'test-api-key')
    
    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      body: formData
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(500)
    expect(data.error).toBe('Transcription failed')
  })

  it('uses default speaker count when not provided', async () => {
    mockCheckRateLimit.mockReturnValue(true)
    mockValidateApiKey.mockResolvedValue(true)
    mockTranscribe.mockResolvedValue({
      segments: [],
      metadata: {
        speakerCount: 2,
        processedAt: new Date().toISOString()
      }
    })
    
    const formData = new FormData()
    formData.append('audio', createMockAudioFile())
    formData.append('apiKey', 'test-api-key')
    // Don't provide speakerCount
    
    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      body: formData
    })
    
    await POST(request)
    
    expect(mockTranscribe).toHaveBeenCalledTimes(1)
    const [file, options, callback] = mockTranscribe.mock.calls[0]
    
    expect(file.name).toBe('test-audio.mp3')
    expect(file.type).toBe('audio/mp3')
    expect(options).toEqual({
      apiKey: 'test-api-key',
      speakerCount: 2, // Default value
      systemPrompt: null
    })
    expect(typeof callback).toBe('function')
  })

  it('handles OPTIONS request for CORS', async () => {
    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'OPTIONS'
    })
    
    const response = await OPTIONS(request)
    
    expect(response.status).toBe(200)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS')
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type')
  })

  it('accepts various audio formats', async () => {
    mockCheckRateLimit.mockReturnValue(true)
    mockValidateApiKey.mockResolvedValue(true)
    mockTranscribe.mockResolvedValue({
      segments: [],
      metadata: { speakerCount: 1, processedAt: new Date().toISOString() }
    })
    
    const audioFormats = [
      { ext: 'mp3', type: 'audio/mp3' },
      { ext: 'wav', type: 'audio/wav' },
      { ext: 'aiff', type: 'audio/aiff' },
      { ext: 'm4a', type: 'audio/x-m4a' },
      { ext: 'flac', type: 'audio/flac' }
    ]
    
    for (const format of audioFormats) {
      const formData = new FormData()
      const audioFile = createMockAudioFile(`test.${format.ext}`, 1024, format.type)
      formData.append('audio', audioFile)
      formData.append('apiKey', 'test-api-key')
      
      const request = new NextRequest('http://localhost:3000/api/transcribe', {
        method: 'POST',
        body: formData
      })
      
      const response = await POST(request)
      
      expect(response.status).toBe(200)
    }
  })
})