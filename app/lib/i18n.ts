export type Language = 'en' | 'ja'

export interface Translations {
  // App title and description
  appTitle: string
  appDescription: string
  
  // Navigation and sections
  apiConfiguration: string
  audioFile: string
  transcriptionSettings: string
  
  // API Key section
  geminiApiKey: string
  apiKeyPlaceholder: string
  apiKeyNote: string
  validate: string
  validating: string
  apiKeyValidated: string
  invalidApiKey: string
  
  // File upload
  clickToUpload: string
  dragAndDrop: string
  supportedFormats: string
  maxDuration: string
  willUseFilesApi: string
  invalidFileFormat: string
  
  // Transcription settings
  numberOfSpeakers: string
  speakerCountNote: string
  systemPrompt: string
  systemPromptOptional: string
  customize: string
  hide: string
  systemPromptNote: string
  useDefaultPrompt: string
  
  // Processing
  startTranscription: string
  processing: string
  processingAudio: string
  checkingFileSize: string
  uploadingAudio: string
  processingTranscription: string
  finalizing: string
  complete: string
  
  // Results
  transcriptionResult: string
  downloadAsTxt: string
  downloadAsJson: string
  duration: string
  speakers: string
  processed: string
  
  // Errors
  provideApiKeyAndFile: string
  transcriptionFailed: string
  failedToValidateApiKey: string
  tooManyRequests: string
  
  // Language
  language: string
  english: string
  japanese: string
  
  // Preview
  showPreview: string
  hidePreview: string
  actualPrompt: string
  
  // User prompt
  backgroundInformation: string
  backgroundPlaceholder: string
  backgroundNote: string
}

export const translations: Record<Language, Translations> = {
  en: {
    // App title and description
    appTitle: 'Dictationable',
    appDescription: 'AI-powered audio transcription with speaker separation',
    
    // Navigation and sections
    apiConfiguration: 'API Configuration',
    audioFile: 'Audio File',
    transcriptionSettings: 'Transcription Settings',
    
    // API Key section
    geminiApiKey: 'Gemini API Key',
    apiKeyPlaceholder: 'Enter your Gemini API key',
    apiKeyNote: 'Your API key is stored only in memory and never persisted',
    validate: 'Set',
    validating: 'Validating...',
    apiKeyValidated: '✓ API key validated successfully',
    invalidApiKey: 'Invalid API key. Please check and try again.',
    
    // File upload
    clickToUpload: 'Click to upload',
    dragAndDrop: 'or drag and drop',
    supportedFormats: 'WAV, MP3, AIFF, AAC, OGG, FLAC, M4A',
    maxDuration: 'MAX. 9.5 hours',
    willUseFilesApi: '(Will use Files API)',
    invalidFileFormat: 'Invalid file format. Please select a WAV, MP3, AIFF, AAC, OGG, FLAC, or M4A file.',
    
    // Transcription settings
    numberOfSpeakers: 'Number of Speakers',
    speakerCountNote: 'Specify the expected number of speakers for better separation accuracy',
    systemPrompt: 'System Prompt',
    systemPromptOptional: 'System Prompt (Optional)',
    customize: 'Customize',
    hide: 'Hide',
    systemPromptNote: 'Customize how the AI processes and formats the transcription',
    useDefaultPrompt: 'Use default prompt',
    
    // Processing
    startTranscription: 'Start Transcription',
    processing: 'Processing...',
    processingAudio: 'Processing Audio',
    checkingFileSize: 'Checking file size...',
    uploadingAudio: 'Uploading audio file...',
    processingTranscription: 'Processing transcription...',
    finalizing: 'Finalizing...',
    complete: 'Complete!',
    
    // Results
    transcriptionResult: 'Transcription Result',
    downloadAsTxt: 'Download as TXT',
    downloadAsJson: 'Download as JSON',
    duration: 'Duration',
    speakers: 'Speakers',
    processed: 'Processed',
    
    // Errors
    provideApiKeyAndFile: 'Please provide an API key and select an audio file',
    transcriptionFailed: 'Failed to transcribe audio',
    failedToValidateApiKey: 'Failed to validate API key',
    tooManyRequests: 'Too many requests. Please try again later.',
    
    // Language
    language: 'Language',
    english: 'English',
    japanese: '日本語',
    
    // Preview
    showPreview: 'Show Preview',
    hidePreview: 'Hide Preview',
    actualPrompt: 'Actual Prompt (with speaker count:',
    
    // User prompt
    backgroundInformation: 'Background Information (Optional)',
    backgroundPlaceholder: 'Provide context about this audio file (e.g., meeting type, participants, topic, etc.)',
    backgroundNote: 'Add any background information that might help improve transcription accuracy'
  },
  ja: {
    // App title and description
    appTitle: 'Dictationable',
    appDescription: 'AI音声認識による話者分離機能付き文字起こし',
    
    // Navigation and sections
    apiConfiguration: 'API設定',
    audioFile: '音声ファイル',
    transcriptionSettings: '文字起こし設定',
    
    // API Key section
    geminiApiKey: 'Gemini APIキー',
    apiKeyPlaceholder: 'Gemini APIキーを入力してください',
    apiKeyNote: 'APIキーはメモリ内のみに保存され、永続化されません',
    validate: '設定',
    validating: '検証中...',
    apiKeyValidated: '✓ APIキーの検証が完了しました',
    invalidApiKey: '無効なAPIキーです。確認してやり直してください。',
    
    // File upload
    clickToUpload: 'クリックしてアップロード',
    dragAndDrop: 'またはドラッグ&ドロップ',
    supportedFormats: 'WAV, MP3, AIFF, AAC, OGG, FLAC, M4A',
    maxDuration: '最大9.5時間',
    willUseFilesApi: '(Files APIを使用)',
    invalidFileFormat: '無効なファイル形式です。WAV、MP3、AIFF、AAC、OGG、FLAC、M4Aファイルを選択してください。',
    
    // Transcription settings
    numberOfSpeakers: '話者数',
    speakerCountNote: '話者分離の精度向上のため、予想される話者数を指定してください',
    systemPrompt: 'システムプロンプト',
    systemPromptOptional: 'システムプロンプト（任意）',
    customize: 'カスタマイズ',
    hide: '非表示',
    systemPromptNote: 'AIが文字起こしを処理・フォーマットする方法をカスタマイズ',
    useDefaultPrompt: 'デフォルトプロンプトを使用',
    
    // Processing
    startTranscription: '文字起こし開始',
    processing: '処理中...',
    processingAudio: '音声処理中',
    checkingFileSize: 'ファイルサイズを確認中...',
    uploadingAudio: '音声ファイルをアップロード中...',
    processingTranscription: '文字起こし処理中...',
    finalizing: '最終処理中...',
    complete: '完了！',
    
    // Results
    transcriptionResult: '文字起こし結果',
    downloadAsTxt: 'TXTでダウンロード',
    downloadAsJson: 'JSONでダウンロード',
    duration: '長さ',
    speakers: '話者',
    processed: '処理日時',
    
    // Errors
    provideApiKeyAndFile: 'APIキーを入力し、音声ファイルを選択してください',
    transcriptionFailed: '音声の文字起こしに失敗しました',
    failedToValidateApiKey: 'APIキーの検証に失敗しました',
    tooManyRequests: 'リクエストが多すぎます。しばらく経ってから再試行してください。',
    
    // Language
    language: '言語',
    english: 'English',
    japanese: '日本語',
    
    // Preview
    showPreview: 'プレビュー表示',
    hidePreview: 'プレビュー非表示',
    actualPrompt: '実際のプロンプト（話者数:',
    
    // User prompt
    backgroundInformation: '背景情報（任意）',
    backgroundPlaceholder: 'この音声ファイルの背景情報を入力（例：会議の種類、参加者、話題など）',
    backgroundNote: '文字起こしの精度向上に役立つ背景情報を追加してください'
  }
}

export function getTranslation(language: Language): Translations {
  return translations[language] || translations.ja
}