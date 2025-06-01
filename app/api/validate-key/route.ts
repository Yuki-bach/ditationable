import { NextRequest, NextResponse } from 'next/server'
import { GeminiTranscriptionService } from '../../lib/gemini-transcription-service'

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      )
    }
    
    const service = new GeminiTranscriptionService()
    const isValid = await service.validateApiKey(apiKey)
    
    return NextResponse.json({ valid: isValid })
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate API key' },
      { status: 500 }
    )
  }
}