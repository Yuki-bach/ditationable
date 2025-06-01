import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

export interface AudioSegment {
  file: File
  startTime: number
  endTime: number
  index: number
}

export class AudioProcessor {
  private ffmpeg: FFmpeg | null = null
  private loaded = false

  async initialize(): Promise<void> {
    if (this.loaded) return

    this.ffmpeg = new FFmpeg()
    
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
    
    // Load ffmpeg.wasm
    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    })
    
    this.loaded = true
  }

  async getAudioDuration(file: File): Promise<number> {
    // Use Web Audio API to get duration
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const arrayBuffer = await file.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    return audioBuffer.duration
  }

  async splitAudio(
    file: File, 
    maxDurationSeconds: number = 34200, // 9.5 hours
    onProgress?: (progress: number) => void
  ): Promise<AudioSegment[]> {
    if (!this.ffmpeg || !this.loaded) {
      await this.initialize()
    }

    const duration = await this.getAudioDuration(file)
    
    // If file is within limits, return as-is
    if (duration <= maxDurationSeconds) {
      return [{
        file,
        startTime: 0,
        endTime: duration,
        index: 0
      }]
    }

    // Calculate number of segments needed
    const segmentCount = Math.ceil(duration / maxDurationSeconds)
    const segmentDuration = maxDurationSeconds

    // Write input file to ffmpeg virtual file system
    const inputFileName = 'input' + this.getFileExtension(file.name)
    const fileData = await file.arrayBuffer()
    await this.ffmpeg!.writeFile(inputFileName, new Uint8Array(fileData))

    const segments: AudioSegment[] = []

    for (let i = 0; i < segmentCount; i++) {
      const startTime = i * segmentDuration
      const outputFileName = `segment_${i.toString().padStart(3, '0')}.wav`
      
      // Use ffmpeg to extract segment
      await this.ffmpeg!.exec([
        '-i', inputFileName,
        '-ss', startTime.toString(),
        '-t', segmentDuration.toString(),
        '-acodec', 'pcm_s16le',
        '-ar', '16000', // 16kHz as per Gemini requirements
        '-ac', '1', // Mono
        outputFileName
      ])

      // Read the output file
      const data = await this.ffmpeg!.readFile(outputFileName)
      const blob = new Blob([data], { type: 'audio/wav' })
      const segmentFile = new File([blob], outputFileName, { type: 'audio/wav' })

      segments.push({
        file: segmentFile,
        startTime,
        endTime: Math.min(startTime + segmentDuration, duration),
        index: i
      })

      // Update progress
      if (onProgress) {
        onProgress((i + 1) / segmentCount * 100)
      }

      // Clean up output file
      await this.ffmpeg!.deleteFile(outputFileName)
    }

    // Clean up input file
    await this.ffmpeg!.deleteFile(inputFileName)

    return segments
  }

  private getFileExtension(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase()
    return ext ? `.${ext}` : '.wav'
  }

  async cleanup(): void {
    if (this.ffmpeg) {
      this.ffmpeg.terminate()
      this.ffmpeg = null
      this.loaded = false
    }
  }
}