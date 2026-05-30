import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// === ElevenLabs Voice (ativado) ===
import { enableElevenLabsVoice } from './lib/audio/AudioManager'

// Voz de alta qualidade do ElevenLabs ativada
// (a chave está nas variáveis de ambiente do Vercel)
// Por padrão está usando a voz "Alice" (ótima para crianças)
enableElevenLabsVoice()

// Se quiser trocar a voz, passe o Voice ID:
// enableElevenLabsVoice('SEU_VOICE_ID_AQUI')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)