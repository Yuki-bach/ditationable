import { GoogleGenerativeAI } from '@google/generative-ai'
import { TranscriptionService, TranscriptionResult, TranscriptionOptions, TranscriptionSegment } from './transcription-service'
import { AudioProcessor } from './audio-processor'

const DEFAULT_SYSTEM_PROMPT = `You are transcribing an audio file with multiple speakers. Please:
1. Identify and label different speakers (e.g., Speaker 1, Speaker 2)
2. Include timestamps in MM:SS format at the beginning of each speaker's segment
3. Maintain speaker consistency throughout the transcription
4. Format the output clearly with speaker labels and timestamps
5. Return the transcription in the following JSON format:
{
  "segments": [
    {
      "speaker": "Speaker 1",
      "timestamp": "00:00",
      "text": "Transcribed text here"
    }
  ]
}`

export class GeminiTranscriptionService extends TranscriptionService {
  private genAI: GoogleGenerativeAI | null = null
  private audioProcessor = new AudioProcessor()

  async transcribe(
    audioFile: File,
    options: TranscriptionOptions,
    onProgress?: (progress: number, message: string) => void
  ): Promise<TranscriptionResult> {
    try {
      // Initialize Gemini AI with the provided API key
      this.genAI = new GoogleGenerativeAI(options.apiKey)
      
      // Initialize audio processor
      onProgress?.(0, 'Initializing audio processor...')
      await this.audioProcessor.initialize()
      
      // Check audio duration
      onProgress?.(10, 'Checking audio duration...')
      const duration = await this.audioProcessor.getAudioDuration(audioFile)
      const maxDurationSeconds = 9.5 * 60 * 60 // 9.5 hours
      
      if (duration > maxDurationSeconds) {
        // Split audio file
        onProgress?.(20, 'Splitting audio file...')
        const segments = await this.audioProcessor.splitAudio(
          audioFile, 
          maxDurationSeconds,
          (progress) => onProgress?.(20 + progress * 0.3, `Splitting audio: ${Math.round(progress)}%`)
        )
        
        // Process each segment
        const allResults: TranscriptionSegment[] = []
        for (let i = 0; i < segments.length; i++) {
          const segment = segments[i]
          onProgress?.(50 + (i / segments.length) * 40, `Processing segment ${i + 1} of ${segments.length}...`)
          
          const result = await this.processSegment(segment.file, segment.startTime, options)
          allResults.push(...result.segments)
        }
        
        onProgress?.(90, 'Finalizing transcription...')
        return {
          segments: allResults,
          metadata: {
            duration: this.formatTimestamp(duration),
            speakerCount: options.speakerCount,
            processedAt: new Date().toISOString()
          }
        }
      } else {
        // Process as single file
        onProgress?.(50, 'Processing audio file...')
        const fileSizeInMB = audioFile.size / (1024 * 1024)
        
        if (fileSizeInMB <= 20) {
          const audioData = await this.fileToBase64(audioFile)
          return await this.processInline(audioData, audioFile.type, options)
        } else {
          return await this.processWithFilesAPI(audioFile, options)
        }
      }
    } catch (error) {
      console.error('Transcription error:', error)
      throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      // Clean up
      await this.audioProcessor.cleanup()
    }
  }

  private async processSegment(
    segmentFile: File,
    startTimeOffset: number,
    options: TranscriptionOptions
  ): Promise<TranscriptionResult> {
    const audioData = await this.fileToBase64(segmentFile)
    const result = await this.processInline(audioData, segmentFile.type, options)
    
    // Adjust timestamps to account for segment offset
    const adjustedSegments = result.segments.map(segment => {
      const [minutes, seconds] = segment.timestamp.split(':').map(Number)
      const totalSeconds = minutes * 60 + seconds + startTimeOffset
      return {
        ...segment,
        timestamp: this.formatTimestamp(totalSeconds)
      }
    })
    
    return {
      ...result,
      segments: adjustedSegments
    }
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
      
      // Test the API key with a simple request
      const result = await model.generateContent('Test')
      return !!result.response
    } catch (error) {
      return false
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // Remove data URL prefix to get just the base64 data
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = error => reject(error)
    })
  }

  private async processInline(
    audioData: string,
    mimeType: string,
    options: TranscriptionOptions
  ): Promise<TranscriptionResult> {
    const model = this.genAI!.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      systemInstruction: options.systemPrompt || DEFAULT_SYSTEM_PROMPT
    })

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: audioData
        }
      },
      `Please transcribe this audio file. There are approximately ${options.speakerCount} speakers.`
    ])

    const response = await result.response
    const text = response.text()
    
    // Parse the JSON response
    try {
      const parsed = JSON.parse(text)
      return {
        segments: parsed.segments || [],
        metadata: {
          speakerCount: options.speakerCount,
          processedAt: new Date().toISOString()
        }
      }
    } catch (parseError) {
      // Fallback: attempt to parse as plain text
      return this.parseTextResponse(text, options.speakerCount)
    }
  }

  private async processWithFilesAPI(
    audioFile: File,
    options: TranscriptionOptions
  ): Promise<TranscriptionResult> {
    // TODO: Implement Files API upload and processing
    // This will be implemented when we have more details about the Files API
    throw new Error('Files API processing not yet implemented')
  }

  private parseTextResponse(text: string, speakerCount: number): TranscriptionResult {
    // Basic text parsing fallback
    const segments: TranscriptionSegment[] = []
    const lines = text.split('\n').filter(line => line.trim())
    
    let currentSpeaker = 'Speaker 1'
    let currentTimestamp = '00:00'
    
    for (const line of lines) {
      // Try to extract speaker and timestamp patterns
      const speakerMatch = line.match(/^(Speaker \d+|Person \d+|S\d+):/i)
      const timestampMatch = line.match(/\[?(\d{1,2}:\d{2})\]?/)
      
      if (speakerMatch) {
        currentSpeaker = speakerMatch[1]
      }
      
      if (timestampMatch) {
        currentTimestamp = timestampMatch[1]
      }
      
      // Extract the actual text
      let text = line
      if (speakerMatch) {
        text = text.replace(speakerMatch[0], '').trim()
      }
      if (timestampMatch) {
        text = text.replace(timestampMatch[0], '').trim()
      }
      
      if (text) {
        segments.push({
          speaker: currentSpeaker,
          timestamp: currentTimestamp,
          text
        })
      }
    }
    
    return {
      segments,
      metadata: {
        speakerCount,
        processedAt: new Date().toISOString()
      }
    }
  }
}