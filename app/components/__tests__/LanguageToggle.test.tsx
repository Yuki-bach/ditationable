import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import LanguageToggle from '../LanguageToggle'
import { renderWithProviders } from '../../../tests/utils/test-helpers'

describe('LanguageToggle', () => {
  it('renders both language buttons', () => {
    renderWithProviders(<LanguageToggle />)
    
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'JA' })).toBeInTheDocument()
  })

  it('highlights current language button', () => {
    renderWithProviders(<LanguageToggle />)
    
    // Default language is Japanese
    const jaButton = screen.getByRole('button', { name: 'JA' })
    const enButton = screen.getByRole('button', { name: 'EN' })
    
    expect(jaButton).toHaveClass('bg-blue-600', 'text-white')
    expect(enButton).toHaveClass('bg-white', 'text-gray-700')
  })

  it('switches language when button is clicked', () => {
    renderWithProviders(<LanguageToggle />)
    
    const enButton = screen.getByRole('button', { name: 'EN' })
    const jaButton = screen.getByRole('button', { name: 'JA' })
    
    // Click English button
    fireEvent.click(enButton)
    
    expect(enButton).toHaveClass('bg-blue-600', 'text-white')
    expect(jaButton).toHaveClass('bg-white', 'text-gray-700')
    
    // Click Japanese button
    fireEvent.click(jaButton)
    
    expect(jaButton).toHaveClass('bg-blue-600', 'text-white')
    expect(enButton).toHaveClass('bg-white', 'text-gray-700')
  })

  it('maintains language across component rerenders', () => {
    const { rerender } = renderWithProviders(<LanguageToggle />)
    
    // Switch to English
    const enButton = screen.getByRole('button', { name: 'EN' })
    fireEvent.click(enButton)
    
    expect(enButton).toHaveClass('bg-blue-600', 'text-white')
    
    // Rerender component
    rerender(<LanguageToggle />)
    
    // English should still be selected
    expect(screen.getByRole('button', { name: 'EN' })).toHaveClass('bg-blue-600', 'text-white')
    expect(screen.getByRole('button', { name: 'JA' })).toHaveClass('bg-white', 'text-gray-700')
  })

  it('applies hover styles to inactive button', () => {
    renderWithProviders(<LanguageToggle />)
    
    const enButton = screen.getByRole('button', { name: 'EN' })
    
    // Default state (Japanese selected, English inactive)
    expect(enButton).toHaveClass('hover:bg-gray-50')
    
    // After clicking English (now active)
    fireEvent.click(enButton)
    expect(enButton).not.toHaveClass('hover:bg-gray-50')
  })
})