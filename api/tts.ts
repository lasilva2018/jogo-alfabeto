import type { VercelRequest, VercelResponse } from '@vercel/node';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Voz principal (narrativa / instruções) - Alice
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'Xb7hH8MSUJpSbSDYk0k2';

// Voz do Alfafa (mascote masculino, mais carinhoso e grave)
const ALFAFA_VOICE_ID = process.env.ELEVENLABS_ALFAFA_VOICE_ID || 'Xb7hH8MSUJpSbSDYk0k2'; // fallback para Alice por enquanto

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!ELEVENLABS_API_KEY) {
    console.error('ELEVENLABS_API_KEY not configured');
    return res.status(500).json({ error: 'TTS service not configured' });
  }

  try {
    const { text, voice = 'default' } = req.body; // 'default' | 'alfafa'

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const targetVoiceId = voice === 'alfafa' ? ALFAFA_VOICE_ID : ELEVENLABS_VOICE_ID;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.85,
            style: 0.2,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      return res.status(502).json({ error: 'TTS generation failed' });
    }

    const audioBuffer = await response.arrayBuffer();

    // Set proper headers for audio
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // Cache for 1 year (text is deterministic)

    return res.status(200).send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('TTS proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}