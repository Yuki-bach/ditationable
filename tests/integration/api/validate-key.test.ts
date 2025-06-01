import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../../../app/api/validate-key/route'

// Mock the GeminiTranscriptionService
vi.mock('../../../app/lib/gemini-transcription-service', () => ({
  GeminiTranscriptionService: vi.fn().mockImplementation(() => ({
    validateApiKey: vi.fn()
  }))
}))

import { GeminiTranscriptionService } from '../../../app/lib/gemini-transcription-service'

describe('/api/validate-key', () => {
  let mockValidateApiKey: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockValidateApiKey = vi.fn()
    ;(GeminiTranscriptionService as any).mockImplementation(() => ({
      validateApiKey: mockValidateApiKey
    }))
  })

  it('validates API key successfully', async () => {
    mockValidateApiKey.mockResolvedValue(true)
    
    const request = new NextRequest('http://localhost:3000/api/validate-key', {
      method: 'POST',
      body: JSON.stringify({ apiKey: 'valid-api-key' })
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toEqual({ valid: true })
    expect(mockValidateApiKey).toHaveBeenCalledWith('valid-api-key')
  })

  it('returns invalid for invalid API key', async () => {
    mockValidateApiKey.mockResolvedValue(false)
    
    const request = new NextRequest('http://localhost:3000/api/validate-key', {
      method: 'POST',
      body: JSON.stringify({ apiKey: 'invalid-api-key' })
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toEqual({ valid: false })
  })

  it('returns 400 when API key is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/validate-key', {
      method: 'POST',
      body: JSON.stringify({})
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'API key is required' })
    expect(mockValidateApiKey).not.toHaveBeenCalled()
  })

  it('returns 500 when validation throws error', async () => {
    mockValidateApiKey.mockRejectedValue(new Error('Network error'))
    
    const request = new NextRequest('http://localhost:3000/api/validate-key', {
      method: 'POST',
      body: JSON.stringify({ apiKey: 'test-key' })
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to validate API key' })
  })

  it('handles malformed JSON gracefully', async () => {
    const request = new NextRequest('http://localhost:3000/api/validate-key', {
      method: 'POST',
      body: 'invalid json'
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to validate API key' })
  })
})