import { GoogleGenerativeAI } from '@google/generative-ai'
import { TranscriptionService, TranscriptionResult, TranscriptionOptions, TranscriptionSegment } from './transcription-service'

const DEFAULT_SYSTEM_PROMPT = `You are transcribing an audio file with multiple speakers. 

IMPORTANT: Return ONLY valid JSON in the exact format below, without any markdown formatting, code blocks, or additional text:

{
  "segments": [
    {
      "speaker": "Speaker 1",
      "timestamp": "00:00",
      "text": "Transcribed text here"
    },
    {
      "speaker": "Speaker 2", 
      "timestamp": "00:15",
      "text": "Next speaker's text"
    }
  ]
}

Rules:
1. Identify and label different speakers (Speaker 1, Speaker 2, etc.)
2. Include timestamps in MM:SS format for each segment
3. Maintain speaker consistency throughout
4. Return ONLY the JSON object, no other text or formatting`

export class GeminiTranscriptionService extends TranscriptionService {
  private genAI: GoogleGenerativeAI | null = null

  async transcribe(
    audioFile: File,
    options: TranscriptionOptions,
    onProgress?: (progress: number, message: string) => void
  ): Promise<TranscriptionResult> {
    try {
      // Initialize Gemini AI with the provided API key
      this.genAI = new GoogleGenerativeAI(options.apiKey)
      
      // Check file size first (simpler approach for server-side)
      onProgress?.(10, 'Checking file size...')
      const fileSizeInMB = audioFile.size / (1024 * 1024)
      
      if (fileSizeInMB <= 20) {
        // Process inline for files under 20MB
        onProgress?.(30, 'Processing audio file...')
        const audioData = await this.fileToBase64(audioFile)
        return await this.processInline(audioData, audioFile.type, options)
      } else {
        // For larger files, use Files API (splitting will be handled client-side in future)
        onProgress?.(30, 'Processing large audio file...')
        return await this.processWithFilesAPI(audioFile, options)
      }
    } catch (error) {
      console.error('Transcription error:', error)
      throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
    // Use arrayBuffer instead of FileReader for Node.js compatibility
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // Convert to base64 using Buffer (Node.js environment)
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(uint8Array).toString('base64')
    }
    
    // Fallback for browser environment (shouldn't reach here in server-side)
    const binaryString = Array.from(uint8Array)
      .map(byte => String.fromCharCode(byte))
      .join('')
    return btoa(binaryString)
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
    
    // Try to extract JSON from markdown code blocks
    let jsonContent = text
    
    // Remove markdown code block formatting
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim()
    }
    
    // Parse the JSON response
    try {
      const parsed = JSON.parse(jsonContent)
      return {
        segments: parsed.segments || [],
        metadata: {
          speakerCount: options.speakerCount,
          processedAt: new Date().toISOString()
        }
      }
    } catch (parseError) {
      console.log('JSON parsing failed, falling back to text parsing. Original text:', text)
      // Fallback: attempt to parse as plain text
      return this.parseTextResponse(text, options.speakerCount)
    }
  }

  private async processWithFilesAPI(
    audioFile: File,
    options: TranscriptionOptions
  ): Promise<TranscriptionResult> {
    try {
      // For now, convert large files to base64 and process inline
      // This is a temporary solution until proper Files API implementation
      console.log('Processing large file with base64 conversion...')
      
      const audioData = await this.fileToBase64(audioFile)
      return await this.processInline(audioData, audioFile.type, options)
    } catch (error) {
      console.error('Files API error:', error)
      throw new Error(`Failed to process large file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private parseTextResponse(text: string, speakerCount: number): TranscriptionResult {
    console.log('Parsing text response:', text)
    
    // If text contains what looks like broken JSON parsing, try to reconstruct
    if (text.includes('"segments"') || text.includes('"speaker"')) {
      // Try to extract the actual transcribed text from the broken JSON display
      const textMatch = text.match(/"text":\s*"([^"]+)"/g)
      if (textMatch) {
        const extractedTexts = textMatch.map(match => {
          const textContent = match.match(/"text":\s*"([^"]+)"/)?.[1]
          return textContent?.replace(/\\"/g, '"') || ''
        }).filter(t => t.length > 0)
        
        if (extractedTexts.length > 0) {
          // Combine all extracted text into segments
          const combinedText = extractedTexts.join(' ')
          return {
            segments: [{
              speaker: 'Speaker 1',
              timestamp: '00:00',
              text: combinedText
            }],
            metadata: {
              speakerCount,
              processedAt: new Date().toISOString()
            }
          }
        }
      }
    }
    
    // Basic text parsing fallback
    const segments: TranscriptionSegment[] = []
    const lines = text.split('\n').filter(line => line.trim())
    
    let currentSpeaker = 'Speaker 1'
    let currentTimestamp = '00:00'
    let textParts: string[] = []
    
    for (const line of lines) {
      // Skip JSON-like lines
      if (line.trim().match(/^[{}\[\]",]$/) || line.includes('"segments"') || line.includes('"speaker"')) {
        continue
      }
      
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
      let lineText = line
      if (speakerMatch) {
        lineText = lineText.replace(speakerMatch[0], '').trim()
      }
      if (timestampMatch) {
        lineText = lineText.replace(timestampMatch[0], '').trim()
      }
      
      if (lineText && !lineText.match(/^[{}\[\]",]$/)) {
        textParts.push(lineText)
      }
    }
    
    // If we found text parts, combine them
    if (textParts.length > 0) {
      segments.push({
        speaker: currentSpeaker,
        timestamp: currentTimestamp,
        text: textParts.join(' ')
      })
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