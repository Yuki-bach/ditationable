import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { LanguageProvider } from '@/contexts/LanguageContext'

// Custom render function that includes providers
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return <LanguageProvider>{children}</LanguageProvider>
  }

  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Mock audio file creator
export const createMockAudioFile = (
  name: string = 'test-audio.mp3',
  size: number = 1024 * 1024, // 1MB
  type: string = 'audio/mp3'
): File => {
  const blob = new Blob(['a'.repeat(size)], { type })
  return new File([blob], name, { type })
}

// Mock Gemini API response
export const mockTranscriptionResponse = {
  segments: [
    {
      speaker: 'Speaker 1',
      text: 'Hello, this is a test transcription.',
      startTime: 0,
      endTime: 5000,
    },
    {
      speaker: 'Speaker 2',
      text: 'Yes, this is working correctly.',
      startTime: 5000,
      endTime: 10000,
    },
  ],
}

// Mock API key
export const TEST_API_KEY = 'test-gemini-api-key-123'

// Wait helper
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))