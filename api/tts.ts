export const config = {
  runtime: 'edge',
};

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Voz principal (narrativa / instruções) - Alice
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'Xb7hH8MSUJpSbSDYk0k2';

// Voz do Alfafa (mascote masculino, mais carinhoso e grave)
const ALFAFA_VOICE_ID = process.env.ELEVENLABS_ALFAFA_VOICE_ID || 'Xb7hH8MSUJpSbSDYk0k2'; // fallback para Alice por enquanto

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!ELEVENLABS_API_KEY) {
    console.error('ELEVENLABS_API_KEY not configured');
    return new Response('TTS service not configured', { status: 500 });
  }

  try {
    const { text, voice = 'default' } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response('Text is required', { status: 400 });
    }

    const targetVoiceId = voice === 'alfafa' ? ALFAFA_VOICE_ID : DEFAULT_VOICE_ID;

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
      return new Response('TTS generation failed', { status: 502 });
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('TTS proxy error:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return new Response('Internal server error', { status: 500 });
  }
}