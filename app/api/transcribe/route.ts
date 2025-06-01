import { NextRequest, NextResponse } from 'next/server'
import { GeminiTranscriptionService } from '@/app/lib/gemini-transcription-service'
import { checkRateLimit } from '@/app/lib/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip, 5, 300000)) { // 5 requests per 5 minutes
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
    const formData = await request.formData()
    
    const audioFile = formData.get('audio') as File
    const apiKey = formData.get('apiKey') as string
    const systemPrompt = formData.get('systemPrompt') as string
    const speakerCount = parseInt(formData.get('speakerCount') as string || '2')
    
    if (!audioFile || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields: audio file and API key' },
        { status: 400 }
      )
    }
    
    // Validate file type
    const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/aiff', 'audio/aac', 'audio/ogg', 'audio/flac', 'audio/mp4', 'audio/x-m4a']
    if (!validTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { error: 'Invalid audio file type' },
        { status: 400 }
      )
    }
    
    const service = new GeminiTranscriptionService()
    
    // Validate API key
    const isValid = await service.validateApiKey(apiKey)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }
    
    // Transcribe audio with progress tracking
    const result = await service.transcribe(
      audioFile, 
      {
        apiKey,
        systemPrompt,
        speakerCount
      },
      (progress, message) => {
        // Progress tracking is handled client-side for now
        console.log(`Progress: ${progress}% - ${message}`)
      }
    )
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}