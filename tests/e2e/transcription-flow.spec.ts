import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Transcription Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('displays initial UI elements', async ({ page }) => {
    // Check title
    await expect(page.locator('h1')).toContainText('Dictationable')
    
    // Check API key input
    await expect(page.getByLabel(/Gemini API Key/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Set/i })).toBeVisible()
    
    // Check file upload area
    await expect(page.getByText(/Click to upload/i)).toBeVisible()
    
    // Check language toggle
    await expect(page.getByRole('button', { name: 'EN' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'JA' })).toBeVisible()
  })

  test('switches language', async ({ page }) => {
    // Default is Japanese
    await expect(page.getByRole('button', { name: 'JA' })).toHaveClass(/bg-blue-600/)
    
    // Switch to English
    await page.getByRole('button', { name: 'EN' }).click()
    
    // Check UI updated to English
    await expect(page.getByRole('button', { name: 'EN' })).toHaveClass(/bg-blue-600/)
    await expect(page.getByText('AI-Powered Audio Transcription')).toBeVisible()
    
    // Switch back to Japanese
    await page.getByRole('button', { name: 'JA' }).click()
    
    // Check UI updated to Japanese
    await expect(page.getByText('AI音声認識による話者分離')).toBeVisible()
  })

  test('validates API key', async ({ page }) => {
    // Try to validate empty key
    await page.getByRole('button', { name: /Set|設定/i }).click()
    
    // Should show alert
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('入力してください')
      dialog.accept()
    })
    
    // Enter API key
    await page.getByLabel(/Gemini API Key|Gemini APIキー/i).fill('test-api-key')
    
    // Mock API response
    await page.route('/api/validate-key', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ valid: true })
      })
    })
    
    await page.getByRole('button', { name: /Set|設定/i }).click()
    
    // Check success message
    await expect(page.getByText(/validated successfully|検証されました/i)).toBeVisible()
  })

  test('uploads audio file', async ({ page }) => {
    // Create test audio file
    const filePath = path.join(__dirname, '../fixtures/test-audio.mp3')
    
    // Upload file
    await page.setInputFiles('input[type="file"]', filePath)
    
    // Check file info displayed
    await expect(page.getByText('test-audio.mp3')).toBeVisible()
    
    // Remove file
    await page.getByRole('button', { name: /×|✕/i }).click()
    
    // Check file removed
    await expect(page.getByText('test-audio.mp3')).not.toBeVisible()
    await expect(page.getByText(/Click to upload/i)).toBeVisible()
  })

  test('shows error for invalid file format', async ({ page }) => {
    // Create test text file
    const filePath = path.join(__dirname, '../fixtures/test.txt')
    
    // Upload file
    await page.setInputFiles('input[type="file"]', filePath)
    
    // Check error message
    await expect(page.getByText(/Invalid file format|無効なファイル形式/i)).toBeVisible()
  })

  test('complete transcription workflow', async ({ page }) => {
    // Mock API responses
    await page.route('/api/validate-key', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ valid: true })
      })
    })
    
    await page.route('/api/transcribe', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          segments: [
            {
              speaker: 'Speaker 1',
              text: 'This is a test transcription.',
              timestamp: '00:00:00'
            },
            {
              speaker: 'Speaker 2',
              text: 'The transcription is working correctly.',
              timestamp: '00:00:05'
            }
          ],
          metadata: {
            duration: '00:00:10',
            speakerCount: 2,
            processedAt: new Date().toISOString()
          }
        })
      })
    })
    
    // Enter API key
    await page.getByLabel(/Gemini API Key|Gemini APIキー/i).fill('test-api-key')
    await page.getByRole('button', { name: /Set|設定/i }).click()
    
    // Upload file
    const filePath = path.join(__dirname, '../fixtures/test-audio.mp3')
    await page.setInputFiles('input[type="file"]', filePath)
    
    // Set speaker count
    await page.getByLabel(/Speaker count|話者数/i).selectOption('2')
    
    // Add context
    await page.getByLabel(/Context information|背景情報/i).fill('Test context')
    
    // Start transcription
    await page.getByRole('button', { name: /Transcribe|文字起こし開始/i }).click()
    
    // Check transcription in progress
    await expect(page.getByText(/Transcribing|文字起こし中/i)).toBeVisible()
    
    // Wait for results
    await expect(page.getByText('This is a test transcription.')).toBeVisible()
    await expect(page.getByText('The transcription is working correctly.')).toBeVisible()
    
    // Check metadata
    await expect(page.getByText(/Duration.*00:00:10/)).toBeVisible()
    await expect(page.getByText(/Speakers.*2/)).toBeVisible()
    
    // Test download buttons
    await expect(page.getByRole('button', { name: /Download as TXT/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Download as JSON/i })).toBeVisible()
  })

  test('handles transcription error', async ({ page }) => {
    // Mock API responses
    await page.route('/api/validate-key', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ valid: true })
      })
    })
    
    await page.route('/api/transcribe', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Transcription failed' })
      })
    })
    
    // Set up transcription
    await page.getByLabel(/Gemini API Key|Gemini APIキー/i).fill('test-api-key')
    await page.getByRole('button', { name: /Set|設定/i }).click()
    
    const filePath = path.join(__dirname, '../fixtures/test-audio.mp3')
    await page.setInputFiles('input[type="file"]', filePath)
    
    // Start transcription
    await page.getByRole('button', { name: /Transcribe|文字起こし開始/i }).click()
    
    // Check error message
    await expect(page.getByText('Transcription failed')).toBeVisible()
  })

  test('respects speaker count setting', async ({ page }) => {
    // Set speaker count to 3
    await page.getByLabel(/Speaker count|話者数/i).selectOption('3')
    
    // Verify selection
    await expect(page.getByLabel(/Speaker count|話者数/i)).toHaveValue('3')
  })

  test('allows system prompt customization', async ({ page }) => {
    // Click to show system prompt
    await page.getByText(/System Prompt|システムプロンプト/i).click()
    
    // Check textarea is visible
    const promptTextarea = page.locator('textarea[placeholder*="system prompt"]')
    await expect(promptTextarea).toBeVisible()
    
    // Modify prompt
    await promptTextarea.fill('Custom transcription instructions')
    
    // Verify value
    await expect(promptTextarea).toHaveValue('Custom transcription instructions')
  })
})