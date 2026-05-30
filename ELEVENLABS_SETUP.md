# ElevenLabs Voice Integration

This app supports high-quality voice using **ElevenLabs** (much better than browser SpeechSynthesis for children).

## 1. Get your ElevenLabs credentials

1. Go to [ElevenLabs](https://elevenlabs.io)
2. Copy your API Key (Settings → API Keys)
3. Choose or create a good Brazilian Portuguese voice (recommended for 4-year-olds):
   - Warm, clear, friendly female or male voices work best.
   - Examples that usually work well: "Bella", "Rachel", or custom cloned voices.

## 2. Add the environment variables on Vercel

In your Vercel project:

1. Go to **Settings → Environment Variables**
2. Add:
   - **Name**: `ELEVENLABS_API_KEY`
   - **Value**: sua chave do ElevenLabs
   - **Environment**: Production + Preview

Opcional (mas recomendado):
- **Name**: `ELEVENLABS_VOICE_ID`
- **Value**: O ID da voz que você quer usar

**Voz recomendada para o jogo (crianças de 4 anos):**
- `Xb7hH8MSUJpSbSDYk0k2` → Alice (Português Brasileiro, voz quente, clara e carinhosa)

Se você deixar sem definir `ELEVENLABS_VOICE_ID`, o app já vai usar a Alice por padrão.

## 3. Enable ElevenLabs in the app

Open `src/main.tsx` and uncomment these two lines:

```ts
import { enableElevenLabsVoice } from './lib/audio/AudioManager'
enableElevenLabsVoice() 
```

You can pass a specific voice ID:

```ts
enableElevenLabsVoice('your-voice-id-here')
```

## 4. Redeploy

After adding the env var and enabling the function, redeploy the project.

The app will now use ElevenLabs for all character speech while keeping the cute synthesized sounds for success/mistake feedback.

## Fallback

If ElevenLabs fails for any reason (no internet, quota, etc.), the app automatically falls back to the browser's SpeechSynthesis.

## Cost Tips

- ElevenLabs is usage-based.
- The app already caches a lot via service worker.
- For production, consider using a cheaper/faster model (Flash v2.5) if latency becomes an issue.

---

Done! The integration is already prepared in the code. You just need to flip the switch and add your key.