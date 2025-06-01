export interface TranscriptionSegment {
  speaker: string
  timestamp: string
  text: string
}

export interface TranscriptionResult {
  segments: TranscriptionSegment[]
  metadata: {
    duration?: string
    speakerCount: number
    processedAt: string
  }
}

export interface TranscriptionOptions {
  apiKey: string
  systemPrompt?: string
  speakerCount: number
}

export abstract class TranscriptionService {
  abstract transcribe(
    audioFile: File,
    options: TranscriptionOptions
  ): Promise<TranscriptionResult>
  
  abstract validateApiKey(apiKey: string): Promise<boolean>
  
  protected formatTimestamp(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}