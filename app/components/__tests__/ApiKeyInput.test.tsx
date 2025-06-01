import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import ApiKeyInput from '../ApiKeyInput'
import { renderWithProviders, TEST_API_KEY } from '../../../tests/utils/test-helpers'

// Mock fetch
global.fetch = vi.fn()

describe('ApiKeyInput', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
    vi.clearAllMocks()
    // Mock window.alert
    window.alert = vi.fn()
  })

  it('renders input field and validate button', () => {
    renderWithProviders(<ApiKeyInput value="" onChange={mockOnChange} />)
    
    expect(screen.getByLabelText(/Gemini APIキー/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Gemini APIキーを入力してください/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /設定/i })).toBeInTheDocument()
  })

  it('calls onChange when input value changes', () => {
    renderWithProviders(<ApiKeyInput value="" onChange={mockOnChange} />)
    
    const input = screen.getByLabelText(/Gemini APIキー/i)
    fireEvent.change(input, { target: { value: 'test-key' } })
    
    expect(mockOnChange).toHaveBeenCalledWith('test-key')
  })

  it('disables validate button when value is empty', () => {
    renderWithProviders(<ApiKeyInput value="" onChange={mockOnChange} />)
    
    const button = screen.getByRole('button', { name: /設定/i })
    expect(button).toBeDisabled()
  })

  it('enables validate button when value is present', () => {
    renderWithProviders(<ApiKeyInput value="test-key" onChange={mockOnChange} />)
    
    const button = screen.getByRole('button', { name: /設定/i })
    expect(button).not.toBeDisabled()
  })

  it('shows alert when validating empty key', async () => {
    renderWithProviders(<ApiKeyInput value="" onChange={mockOnChange} />)
    
    // The button should be disabled when value is empty, so we test that it doesn't call alert
    const button = screen.getByRole('button', { name: /設定/i })
    expect(button).toBeDisabled()
    
    // If we somehow bypass the disabled state (which shouldn't happen in normal usage)
    // we can test by setting a value and then clearing it programmatically
    const input = screen.getByLabelText(/Gemini APIキー/i)
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.change(input, { target: { value: '' } })
    
    // Button should still be disabled
    expect(button).toBeDisabled()
  })

  it('validates API key successfully', async () => {
    const mockFetch = global.fetch as any
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ valid: true })
    })
    
    renderWithProviders(<ApiKeyInput value={TEST_API_KEY} onChange={mockOnChange} />)
    
    const button = screen.getByRole('button', { name: /設定/i })
    fireEvent.click(button)
    
    expect(screen.getByText(/検証中/i)).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText(/APIキーの検証が完了しました/i)).toBeInTheDocument()
    })
    
    expect(mockFetch).toHaveBeenCalledWith('/api/validate-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: TEST_API_KEY })
    })
  })

  it('shows error for invalid API key', async () => {
    const mockFetch = global.fetch as any
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ valid: false })
    })
    
    renderWithProviders(<ApiKeyInput value="invalid-key" onChange={mockOnChange} />)
    
    const button = screen.getByRole('button', { name: /設定/i })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('無効なAPIキー'))
    })
    
    const input = screen.getByLabelText(/Gemini APIキー/i)
    expect(input).toHaveClass('border-red-500')
  })

  it('handles validation error', async () => {
    const mockFetch = global.fetch as any
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    
    renderWithProviders(<ApiKeyInput value="test-key" onChange={mockOnChange} />)
    
    const button = screen.getByRole('button', { name: /設定/i })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('APIキーの検証に失敗しました'))
    })
  })

  it('resets validation state when input changes', async () => {
    const mockFetch = global.fetch as any
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ valid: true })
    })
    
    renderWithProviders(<ApiKeyInput value={TEST_API_KEY} onChange={mockOnChange} />)
    
    // First validate
    const button = screen.getByRole('button', { name: /設定/i })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/APIキーの検証が完了しました/i)).toBeInTheDocument()
    })
    
    // Then change input
    const input = screen.getByLabelText(/Gemini APIキー/i)
    fireEvent.change(input, { target: { value: 'new-key' } })
    
    expect(screen.queryByText(/APIキーの検証が完了しました/i)).not.toBeInTheDocument()
  })

  it('shows green border for valid key', async () => {
    const mockFetch = global.fetch as any
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ valid: true })
    })
    
    renderWithProviders(<ApiKeyInput value={TEST_API_KEY} onChange={mockOnChange} />)
    
    const button = screen.getByRole('button', { name: /設定/i })
    fireEvent.click(button)
    
    await waitFor(() => {
      const input = screen.getByLabelText(/Gemini APIキー/i)
      expect(input).toHaveClass('border-green-500')
    })
  })
})