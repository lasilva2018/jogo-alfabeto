import { ElevenLabsProvider } from './ElevenLabsProvider'

export type FeedbackType = 'success' | 'mistake' | 'encourage'

interface AudioProvider {
  speak(text: string, options?: { rate?: number; pitch?: number; voice?: 'default' | 'alfafa' }): Promise<void>
  playFeedback(type: FeedbackType): Promise<void>
  cancel(): void
}

/**
 * AudioManager
 * 
 * Abstração central de áudio para o jogo.
 * Suporta tanto SpeechSynthesis (fallback) quanto ElevenLabs (alta qualidade).
 */
class AudioManager {
  private provider: AudioProvider

  constructor(provider: AudioProvider) {
    this.provider = provider
  }

  async speakLetter(letter: string, example?: string) {
    const text = example 
      ? `Letra ${letter}. ${example}.`
      : `Letra ${letter}.`
    
    await this.provider.speak(text, { rate: 0.92, pitch: 1.05 })
  }

  async speakPhrase(phrase: string) {
    await this.provider.speak(phrase, { rate: 0.95, pitch: 1.02 })
  }

  // Métodos específicos para o Alfafa (usa voz masculina quando disponível)
  async speakAsAlfafa(text: string) {
    await this.provider.speak(text, { rate: 0.95, pitch: 0.95, voice: 'alfafa' })
  }

  async speakLetterAsAlfafa(letter: string, example?: string) {
    const text = example 
      ? `Letra ${letter}! ${example} começa com a letra ${letter}.`
      : `A letra é ${letter}!`
    
    await this.provider.speak(text, { rate: 0.93, pitch: 0.92, voice: 'alfafa' })
  }

  async playSuccess() {
    await this.provider.playFeedback('success')
  }

  async playMistake() {
    await this.provider.playFeedback('mistake')
  }

  async playEncourage() {
    await this.provider.playFeedback('encourage')
  }

  cancel() {
    this.provider.cancel()
  }
}

// ============================================
// Implementação atual: Browser Speech + Web Audio
// ============================================

class BrowserSpeechProvider implements AudioProvider {
  private audioCtx: AudioContext | null = null

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return this.audioCtx
  }

  async speak(text: string, options: { rate?: number; pitch?: number; voice?: string } = {}) {
    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis não disponível')
      return
    }

    return new Promise<void>((resolve) => {
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'pt-BR'
      utterance.rate = options.rate ?? 0.95
      utterance.pitch = options.pitch ?? 1.05
      utterance.volume = 1

      utterance.onend = () => resolve()
      utterance.onerror = () => resolve()

      window.speechSynthesis.speak(utterance)
    })
  }

  async playFeedback(type: FeedbackType) {
    const ctx = this.getAudioContext()
    const now = ctx.currentTime

    if (type === 'success') {
      // Arpejo alegre (Dó - Mi - Sol - Dó agudo)
      const notes = [523.25, 659.25, 783.99, 1046.5]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const filter = ctx.createBiquadFilter()

        osc.type = 'sine'
        osc.frequency.value = freq
        filter.type = 'lowpass'
        filter.frequency.value = 1800

        gain.gain.value = 0
        gain.gain.setValueAtTime(0, now + i * 0.09)
        gain.gain.linearRampToValueAtTime(0.28, now + i * 0.09 + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.45)

        osc.connect(filter)
        filter.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + i * 0.09)
        osc.stop(now + i * 0.09 + 0.55)
      })
    } else if (type === 'mistake') {
      // Som suave de "ops" (dois tons descendentes suaves)
      const notes = [392, 329.6]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.value = freq

        gain.gain.value = 0
        gain.gain.setValueAtTime(0, now + i * 0.18)
        gain.gain.linearRampToValueAtTime(0.18, now + i * 0.18 + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.38)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + i * 0.18)
        osc.stop(now + i * 0.18 + 0.45)
      })
    } else {
      // Encourage - som neutro e carinhoso
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.value = 620

      gain.gain.value = 0
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.2, now + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.4)
    }
  }

  cancel() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }
}

// ============================================
// Factory + Singleton
// ============================================

let currentManager: AudioManager

// Default: Browser Speech (fallback)
const browserProvider = new BrowserSpeechProvider()
currentManager = new AudioManager(browserProvider)

export function getAudioManager(): AudioManager {
  return currentManager
}

// Call this once (e.g. in main.tsx) to enable ElevenLabs
export function enableElevenLabsVoice(voiceId?: string) {
  const elevenProvider = new ElevenLabsProvider({ voiceId })
  currentManager = new AudioManager(elevenProvider)
  console.log('%c[Audio] ElevenLabs provider enabled', 'color:#22c55e')
}

// Legacy export (still works, but may be stale after switching providers)
export const audioManager = currentManager

export default audioManager