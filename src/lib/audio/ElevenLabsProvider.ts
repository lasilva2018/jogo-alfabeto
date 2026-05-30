import type { FeedbackType } from './AudioManager';

interface AudioProvider {
  speak(text: string, options?: { rate?: number; pitch?: number }): Promise<void>
  playFeedback(type: FeedbackType): Promise<void>
  cancel(): void
}

interface ElevenLabsOptions {
  voiceId?: string;
}

type VoiceType = 'default' | 'alfafa';

/**
 * ElevenLabs Provider
 * 
 * Calls our Vercel API route which proxies to ElevenLabs.
 * Much higher quality and natural voice than browser SpeechSynthesis.
 */
export class ElevenLabsProvider implements AudioProvider {
  private audio: HTMLAudioElement | null = null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_options: ElevenLabsOptions = {}) {
    // Options can be used later for voice configuration
  }

  private getAudioElement(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio();
    }
    return this.audio;
  }

  async speak(text: string, opts?: { rate?: number; pitch?: number; voice?: VoiceType }): Promise<void> {
    const audio = this.getAudioElement();
    const voiceType = opts?.voice || 'default';

    console.log('%c[ElevenLabs] Tentando falar via ElevenLabs...', 'color:#22c55e', { text: text.substring(0, 80), voiceType });

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: voiceType,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'sem corpo');
        console.error('%c[ElevenLabs] Falha na API (status ' + response.status + ')', 'color:#ef4444', errorBody);
        console.warn('%c[ElevenLabs] Caindo para voz do navegador (fallback)', 'color:#f59e0b');
        return this.fallbackToBrowserSpeech(text);
      }

      console.log('%c[ElevenLabs] Resposta OK da API, tocando áudio...', 'color:#22c55e');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      return new Promise((resolve) => {
        audio.src = url;
        audio.onended = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          console.warn('Audio playback error, falling back');
          this.fallbackToBrowserSpeech(text).then(resolve);
        };
        audio.play().catch((err) => {
          console.warn('Audio play failed', err);
          this.fallbackToBrowserSpeech(text).then(resolve);
        });
      });
    } catch (error) {
      console.error('%c[ElevenLabs] Erro no fetch para /api/tts', 'color:#ef4444', error);
      console.warn('%c[ElevenLabs] Caindo para voz do navegador (fallback por exceção)', 'color:#f59e0b');
      return this.fallbackToBrowserSpeech(text);
    }
  }

  private async fallbackToBrowserSpeech(text: string): Promise<void> {
    console.log('%c[ElevenLabs] Usando fallback do navegador (SpeechSynthesis)', 'color:#f59e0b');

    if (!('speechSynthesis' in window)) {
      console.error('%c[ElevenLabs] SpeechSynthesis não disponível neste navegador', 'color:#ef4444');
      return;
    }

    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }

  async playFeedback(type: FeedbackType): Promise<void> {
    // Keep using the nice synthesized feedback sounds (Web Audio)
    // We can keep this even with ElevenLabs for consistency
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    if (type === 'success') {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.value = freq;
        filter.type = 'lowpass';
        filter.frequency.value = 1800;

        gain.gain.value = 0;
        gain.gain.setValueAtTime(0, now + i * 0.09);
        gain.gain.linearRampToValueAtTime(0.28, now + i * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.45);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.55);
      });
    } else if (type === 'mistake') {
      const notes = [392, 329.6];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.value = 0;
        gain.gain.setValueAtTime(0, now + i * 0.18);
        gain.gain.linearRampToValueAtTime(0.18, now + i * 0.18 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.38);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.18);
        osc.stop(now + i * 0.18 + 0.45);
      });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 620;
      gain.gain.value = 0;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  }

  cancel(): void {
    const audio = this.audio;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}