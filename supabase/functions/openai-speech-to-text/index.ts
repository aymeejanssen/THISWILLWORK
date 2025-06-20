
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
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      throw new Error('No audio file provided')
    }

    console.log('Transcribing audio file:', audioFile.name, 'Size:', audioFile.size)

    // Create form data for OpenAI
    const openaiFormData = new FormData()
    openaiFormData.append('file', audioFile, 'audio.webm')
    openaiFormData.append('model', 'whisper-1')
    openaiFormData.append('language', 'nl') // Dutch language hint

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: openaiFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', errorText)
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('Transcription result:', result.text)

    return new Response(
      JSON.stringify({ text: result.text }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error in speech-to-text function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
