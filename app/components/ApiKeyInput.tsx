'use client'

interface ApiKeyInputProps {
  value: string
  onChange: (value: string) => void
}

export default function ApiKeyInput({ value, onChange }: ApiKeyInputProps) {
  return (
    <div>
      <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
        Gemini API Key
      </label>
      <input
        id="api-key"
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your Gemini API key"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <p className="mt-2 text-sm text-gray-500">
        Your API key is stored only in memory and never persisted
      </p>
    </div>
  )
}