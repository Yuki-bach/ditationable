'use client'

import { useState, useRef } from 'react'

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
}

const ACCEPTED_FORMATS = '.wav,.mp3,.aiff,.aac,.ogg,.flac,.m4a'
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

export default function FileUpload({ onFileSelect }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    
    if (file) {
      setError('')
      
      // Validate file type
      const extension = file.name.toLowerCase().split('.').pop()
      const validExtensions = ['wav', 'mp3', 'aiff', 'aac', 'ogg', 'flac', 'm4a']
      if (!extension || !validExtensions.includes(extension)) {
        setError('Invalid file format. Please select a WAV, MP3, AIFF, AAC, OGG, FLAC, or M4A file.')
        setSelectedFile(null)
        onFileSelect(null)
        return
      }
      
      setSelectedFile(file)
      onFileSelect(file)
    } else {
      setSelectedFile(null)
      onFileSelect(null)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    onFileSelect(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FORMATS}
        onChange={handleFileSelect}
        className="hidden"
        id="audio-file-input"
      />
      
      {!selectedFile ? (
        <label
          htmlFor="audio-file-input"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">WAV, MP3, AIFF, AAC, OGG, FLAC, M4A (MAX. 9.5 hours)</p>
          </div>
        </label>
      ) : (
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {formatFileSize(selectedFile.size)}
                {selectedFile.size > MAX_FILE_SIZE && (
                  <span className="text-yellow-600 ml-2">(Will use Files API)</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemoveFile}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}