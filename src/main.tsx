import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// === ElevenLabs Voice (recommended for production) ===
// High quality, natural Brazilian Portuguese voice using ElevenLabs.
// 
// 1. Add ELEVENLABS_API_KEY in Vercel Environment Variables
// 2. (Optional) Add ELEVENLABS_VOICE_ID if you want a specific voice
// 3. Uncomment the two lines below
//
// Good voices for kids (Brazilian Portuguese):
// - "Alice" (very warm and clear)
// - "Isabela" 
// - "Rafael" (male, friendly)
//
// import { enableElevenLabsVoice } from './lib/audio/AudioManager'
// enableElevenLabsVoice()                    // uses default or ELEVENLABS_VOICE_ID
// enableElevenLabsVoice('your-voice-id-here') // force a specific voice

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)