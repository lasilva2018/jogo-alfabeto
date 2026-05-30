import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// === ElevenLabs Voice (ativado) ===
import { enableElevenLabsVoice } from './lib/audio/AudioManager'

// Ativando voz de alta qualidade do ElevenLabs
// (a chave está configurada nas variáveis de ambiente do Vercel)
enableElevenLabsVoice()

// Se quiser usar uma voz específica, passe o voice_id:
// enableElevenLabsVoice('SEU_VOICE_ID_AQUI')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)