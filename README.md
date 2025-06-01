# Dictationable

AI-powered audio transcription with speaker separation using Google Gemini API.

## Features

- 🎙️ Audio file transcription with speaker separation
- 🔊 Support for multiple audio formats (WAV, MP3, AIFF, AAC, OGG, FLAC)
- 👥 Automatic speaker identification and labeling
- ⏱️ Timestamp generation for each segment
- 🔒 Secure API key handling (in-memory only)
- 🐳 Docker-based development environment

## Prerequisites

- Docker Desktop installed
- Google Gemini API key

## Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd dictationable
```

2. Build and start the Docker container:
```bash
docker-compose up --build
```

3. Access the application at `http://localhost:3000`

## Usage

1. Enter your Gemini API key
2. Upload an audio file (max 9.5 hours)
3. Configure speaker count and system prompt (optional)
4. Click "Start Transcription"
5. Download results in TXT or JSON format

## Development Commands

```bash
# Start development server
docker-compose up

# Rebuild container
docker-compose build

# Stop container
docker-compose down

# View logs
docker-compose logs -f
```

## API Limitations

- Maximum audio length: 9.5 hours per request
- Maximum file size for inline processing: 20MB
- Larger files use Google Files API
- Audio is downsampled to 16 Kbps

## Security

- API keys are stored only in browser memory
- No data persistence or logging
- All processing happens in-memory
- HTTPS required for production