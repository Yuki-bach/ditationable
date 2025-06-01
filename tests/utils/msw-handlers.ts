import { http, HttpResponse } from 'msw'
import { mockTranscriptionResponse } from './test-helpers'

export const handlers = [
  // Validate API key endpoint
  http.post('/api/validate-key', async ({ request }) => {
    const { apiKey } = await request.json()
    
    if (apiKey === 'test-gemini-api-key-123') {
      return HttpResponse.json({ valid: true })
    }
    
    return HttpResponse.json(
      { valid: false, error: 'Invalid API key' },
      { status: 401 }
    )
  }),

  // Transcribe endpoint
  http.post('/api/transcribe', async ({ request }) => {
    const formData = await request.formData()
    const file = formData.get('audio')
    const apiKey = formData.get('apiKey')
    
    if (!apiKey || apiKey !== 'test-gemini-api-key-123') {
      return HttpResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }
    
    if (!file || !(file instanceof File)) {
      return HttpResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return HttpResponse.json(mockTranscriptionResponse)
  }),

  // Google Gemini API mock
  http.post('https://generativelanguage.googleapis.com/*', () => {
    return HttpResponse.json({
      candidates: [{
        content: {
          parts: [{
            text: JSON.stringify(mockTranscriptionResponse)
          }]
        }
      }]
    })
  }),
]