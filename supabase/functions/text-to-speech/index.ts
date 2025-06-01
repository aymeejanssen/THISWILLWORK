
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voice, provider = 'google' } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    console.log('Generating speech for text:', text.substring(0, 100), '...')
    console.log('Using voice:', voice, 'Provider:', provider)

    if (provider === 'elevenlabs') {
      const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
      if (!elevenLabsApiKey) {
        throw new Error('ElevenLabs API key not configured')
      }

      // Use ElevenLabs for more human-like voices
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + (voice || '9BWtsMINqrJLrRacOk9x'), {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.2,
            use_speaker_boost: true
          }
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('ElevenLabs API error:', errorText)
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`)
      }

      const audioBuffer = await response.arrayBuffer()
      
      // Convert ArrayBuffer to base64 safely
      const uint8Array = new Uint8Array(audioBuffer)
      let binaryString = ''
      const chunkSize = 8192
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize)
        binaryString += String.fromCharCode.apply(null, Array.from(chunk))
      }
      
      const base64Audio = btoa(binaryString)

      console.log('ElevenLabs speech generated successfully, audio length:', base64Audio.length)

      return new Response(
        JSON.stringify({ audioContent: base64Audio }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    } else {
      // Use Google TTS with improved settings for more natural speech
      const googleApiKey = Deno.env.get('GOOGLE_API_KEY')
      if (!googleApiKey) {
        throw new Error('Google API key not configured')
      }

      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            text: text
          },
          voice: {
            languageCode: 'en-US',
            name: voice || 'en-US-Neural2-F',
            ssmlGender: voice?.includes('F') || voice?.includes('H') ? 'FEMALE' : 'MALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.95,
            pitch: -1.0,
            volumeGainDb: 0.0,
            effectsProfileId: ['headphone-class-device']
          }
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Google TTS API error:', errorText)
        throw new Error(`Google TTS API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      if (!data.audioContent) {
        throw new Error('No audio content received from Google TTS')
      }

      console.log('Google speech generated successfully, audio length:', data.audioContent.length)

      return new Response(
        JSON.stringify({ audioContent: data.audioContent }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }
  } catch (error) {
    console.error('Error in text-to-speech function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
