import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import TranscriptionResultComponent from '../TranscriptionResult'
import { renderWithProviders } from '../../../tests/utils/test-helpers'
import { TranscriptionResult } from '../../lib/transcription-service'

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock document.createElement for download
const mockClick = vi.fn()
const mockCreateElement = vi.spyOn(document, 'createElement')

describe('TranscriptionResult', () => {
  const mockResult: TranscriptionResult = {
    segments: [
      {
        speaker: 'Speaker 1',
        text: 'Hello, this is the first segment.',
        timestamp: '00:00:00'
      },
      {
        speaker: 'Speaker 2',
        text: 'This is the second segment.',
        timestamp: '00:00:05'
      },
      {
        speaker: 'Speaker 1',
        text: 'And this is the third segment.',
        timestamp: '00:00:10'
      }
    ],
    metadata: {
      duration: '00:00:15',
      speakerCount: 2,
      processedAt: '2024-01-01T12:00:00Z'
    }
  }

  beforeEach(() => {
    mockClick.mockClear()
    mockCreateElement.mockClear()
    mockCreateElement.mockImplementation((tagName) => {
      if (tagName === 'a') {
        return { click: mockClick } as any
      }
      return document.createElement(tagName)
    })
  })

  it('renders transcription segments', () => {
    renderWithProviders(
      <TranscriptionResultComponent 
        result={mockResult} 
        audioFileName="test-audio.mp3" 
      />
    )
    
    expect(screen.getByText('Hello, this is the first segment.')).toBeInTheDocument()
    expect(screen.getByText('This is the second segment.')).toBeInTheDocument()
    expect(screen.getByText('And this is the third segment.')).toBeInTheDocument()
  })

  it('displays speaker names with colors', () => {
    renderWithProviders(
      <TranscriptionResultComponent 
        result={mockResult} 
        audioFileName="test-audio.mp3" 
      />
    )
    
    const speaker1Elements = screen.getAllByText('Speaker 1:')
    const speaker2Elements = screen.getAllByText('Speaker 2:')
    
    expect(speaker1Elements).toHaveLength(2)
    expect(speaker2Elements).toHaveLength(1)
    
    // Check that speakers have color classes
    speaker1Elements.forEach(el => {
      expect(el).toHaveClass('font-medium')
      expect(el.className).toMatch(/text-(blue|green|purple|orange|pink|indigo)-600/)
    })
  })

  it('shows timestamps for each segment', () => {
    renderWithProviders(
      <TranscriptionResultComponent 
        result={mockResult} 
        audioFileName="test-audio.mp3" 
      />
    )
    
    expect(screen.getByText('[00:00:00]')).toBeInTheDocument()
    expect(screen.getByText('[00:00:05]')).toBeInTheDocument()
    expect(screen.getByText('[00:00:10]')).toBeInTheDocument()
  })

  it('displays metadata information', () => {
    renderWithProviders(
      <TranscriptionResultComponent 
        result={mockResult} 
        audioFileName="test-audio.mp3" 
      />
    )
    
    expect(screen.getByText(/Duration.*00:00:15/)).toBeInTheDocument()
    expect(screen.getByText(/Speakers.*2/)).toBeInTheDocument()
    expect(screen.getByText(/Processed.*2024/)).toBeInTheDocument()
  })

  it('downloads as text when TXT button is clicked', () => {
    const mockBlob = vi.fn()
    global.Blob = mockBlob as any
    mockBlob.mockImplementation((content, options) => ({
      content,
      type: options.type
    }))
    
    renderWithProviders(
      <TranscriptionResultComponent 
        result={mockResult} 
        audioFileName="test-audio.mp3" 
      />
    )
    
    const txtButton = screen.getByText(/Download as TXT/i)
    fireEvent.click(txtButton)
    
    expect(mockBlob).toHaveBeenCalledWith(
      [expect.stringContaining('[00:00:00] Speaker 1: Hello, this is the first segment.')],
      { type: 'text/plain' }
    )
    expect(mockClick).toHaveBeenCalled()
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('downloads as JSON when JSON button is clicked', () => {
    const mockBlob = vi.fn()
    global.Blob = mockBlob as any
    mockBlob.mockImplementation((content, options) => ({
      content,
      type: options.type
    }))
    
    renderWithProviders(
      <TranscriptionResultComponent 
        result={mockResult} 
        audioFileName="test-audio.mp3" 
      />
    )
    
    const jsonButton = screen.getByText(/Download as JSON/i)
    fireEvent.click(jsonButton)
    
    expect(mockBlob).toHaveBeenCalledWith(
      [expect.stringContaining('"file": "test-audio.mp3"')],
      { type: 'application/json' }
    )
    expect(mockClick).toHaveBeenCalled()
  })

  it('groups segments by speaker in JSON download', () => {
    let capturedJson: string = ''
    const mockBlob = vi.fn()
    global.Blob = mockBlob as any
    mockBlob.mockImplementation((content) => {
      capturedJson = content[0]
      return {}
    })
    
    renderWithProviders(
      <TranscriptionResultComponent 
        result={mockResult} 
        audioFileName="test-audio.mp3" 
      />
    )
    
    const jsonButton = screen.getByText(/Download as JSON/i)
    fireEvent.click(jsonButton)
    
    const parsed = JSON.parse(capturedJson)
    expect(parsed.speakers).toHaveLength(2)
    expect(parsed.speakers[0].speaker_id).toBe('Speaker 1')
    expect(parsed.speakers[0].segments).toHaveLength(2)
    expect(parsed.speakers[1].speaker_id).toBe('Speaker 2')
    expect(parsed.speakers[1].segments).toHaveLength(1)
  })

  it('handles transcription without duration metadata', () => {
    const resultWithoutDuration = {
      ...mockResult,
      metadata: {
        speakerCount: 2,
        processedAt: '2024-01-01T12:00:00Z'
      }
    }
    
    renderWithProviders(
      <TranscriptionResultComponent 
        result={resultWithoutDuration} 
        audioFileName="test-audio.mp3" 
      />
    )
    
    expect(screen.queryByText(/Duration/)).not.toBeInTheDocument()
    expect(screen.getByText(/Speakers.*2/)).toBeInTheDocument()
  })

  it('applies correct color cycling for many speakers', () => {
    const manySpearkerResult: TranscriptionResult = {
      segments: Array.from({ length: 8 }, (_, i) => ({
        speaker: `Speaker ${i + 1}`,
        text: `Text from speaker ${i + 1}`,
        timestamp: `00:00:${String(i * 5).padStart(2, '0')}`
      })),
      metadata: {
        speakerCount: 8,
        processedAt: '2024-01-01T12:00:00Z'
      }
    }
    
    renderWithProviders(
      <TranscriptionResultComponent 
        result={manySpearkerResult} 
        audioFileName="test-audio.mp3" 
      />
    )
    
    // Check that colors cycle properly
    const speaker7 = screen.getByText('Speaker 7:')
    const speaker1 = screen.getByText('Speaker 1:')
    
    // Speaker 7 should have same color as Speaker 1 (index 6 % 6 = 0)
    expect(speaker7.className).toBe(speaker1.className)
  })
})