import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import FileUpload from '../FileUpload'
import { renderWithProviders, createMockAudioFile } from '../../../tests/utils/test-helpers'

describe('FileUpload', () => {
  const mockOnFileSelect = vi.fn()

  beforeEach(() => {
    mockOnFileSelect.mockClear()
  })

  it('renders upload area initially', () => {
    renderWithProviders(<FileUpload onFileSelect={mockOnFileSelect} />)
    
    expect(screen.getByText(/クリックしてアップロード/i)).toBeInTheDocument()
    expect(screen.getByText(/またはドラッグ&ドロップ/i)).toBeInTheDocument()
    expect(screen.getByText(/WAV, MP3, AIFF, AAC, OGG, FLAC, M4A/i)).toBeInTheDocument()
  })

  it('accepts valid audio file formats', async () => {
    renderWithProviders(<FileUpload onFileSelect={mockOnFileSelect} />)
    
    const validFormats = ['mp3', 'wav', 'aiff', 'aac', 'ogg', 'flac', 'm4a']
    
    for (const format of validFormats) {
      const file = createMockAudioFile(`test.${format}`, 1024 * 1024, `audio/${format}`)
      const input = screen.getByLabelText(/クリックしてアップロード/i).parentElement?.querySelector('input[type="file"]') as HTMLInputElement
      
      fireEvent.change(input, { target: { files: [file] } })
      
      expect(mockOnFileSelect).toHaveBeenCalledWith(file)
      expect(screen.getByText(`test.${format}`)).toBeInTheDocument()
      
      // Reset for next iteration
      fireEvent.click(screen.getByRole('button'))
      mockOnFileSelect.mockClear()
    }
  })

  it('rejects invalid file formats', () => {
    renderWithProviders(<FileUpload onFileSelect={mockOnFileSelect} />)
    
    const file = createMockAudioFile('test.txt', 1024, 'text/plain')
    const input = screen.getByLabelText(/クリックしてアップロード/i).parentElement?.querySelector('input[type="file"]') as HTMLInputElement
    
    fireEvent.change(input, { target: { files: [file] } })
    
    expect(mockOnFileSelect).toHaveBeenCalledWith(null)
    expect(screen.getByText(/無効なファイル形式です/i)).toBeInTheDocument()
  })

  it('displays file size correctly', () => {
    renderWithProviders(<FileUpload onFileSelect={mockOnFileSelect} />)
    
    // Test KB display
    const smallFile = createMockAudioFile('small.mp3', 512 * 1024) // 512 KB
    const input = screen.getByLabelText(/クリックしてアップロード/i).parentElement?.querySelector('input[type="file"]') as HTMLInputElement
    
    fireEvent.change(input, { target: { files: [smallFile] } })
    expect(screen.getByText('512.0 KB')).toBeInTheDocument()
    
    // Reset
    fireEvent.click(screen.getByRole('button'))
    
    // Test MB display
    const largeFile = createMockAudioFile('large.mp3', 5 * 1024 * 1024) // 5 MB
    fireEvent.change(input, { target: { files: [largeFile] } })
    expect(screen.getByText('5.0 MB')).toBeInTheDocument()
  })

  it('shows Files API notice for large files', () => {
    renderWithProviders(<FileUpload onFileSelect={mockOnFileSelect} />)
    
    const largeFile = createMockAudioFile('large.mp3', 25 * 1024 * 1024) // 25 MB
    const input = screen.getByLabelText(/クリックしてアップロード/i).parentElement?.querySelector('input[type="file"]') as HTMLInputElement
    
    fireEvent.change(input, { target: { files: [largeFile] } })
    
    expect(screen.getByText(/Files APIを使用/i)).toBeInTheDocument()
  })

  it('removes file when remove button is clicked', () => {
    renderWithProviders(<FileUpload onFileSelect={mockOnFileSelect} />)
    
    const file = createMockAudioFile('test.mp3')
    const input = screen.getByLabelText(/クリックしてアップロード/i).parentElement?.querySelector('input[type="file"]') as HTMLInputElement
    
    fireEvent.change(input, { target: { files: [file] } })
    expect(screen.getByText('test.mp3')).toBeInTheDocument()
    
    const removeButton = screen.getByRole('button')
    fireEvent.click(removeButton)
    
    expect(mockOnFileSelect).toHaveBeenLastCalledWith(null)
    expect(screen.queryByText('test.mp3')).not.toBeInTheDocument()
    expect(screen.getByText(/クリックしてアップロード/i)).toBeInTheDocument()
  })

  it('clears error when valid file is selected', () => {
    renderWithProviders(<FileUpload onFileSelect={mockOnFileSelect} />)
    
    const input = screen.getByLabelText(/クリックしてアップロード/i).parentElement?.querySelector('input[type="file"]') as HTMLInputElement
    
    // First, cause an error
    const invalidFile = createMockAudioFile('test.txt', 1024, 'text/plain')
    fireEvent.change(input, { target: { files: [invalidFile] } })
    expect(screen.getByText(/無効なファイル形式です/i)).toBeInTheDocument()
    
    // Then select a valid file
    const validFile = createMockAudioFile('test.mp3')
    fireEvent.change(input, { target: { files: [validFile] } })
    
    expect(screen.queryByText(/無効なファイル形式です/i)).not.toBeInTheDocument()
    expect(screen.getByText('test.mp3')).toBeInTheDocument()
  })
})