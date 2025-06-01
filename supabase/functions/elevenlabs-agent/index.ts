
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
    const { action, agentId, message } = await req.json()

    if (!agentId) {
      throw new Error('Agent ID is required')
    }

    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured')
    }

    console.log('ElevenLabs agent action:', action, 'Agent ID:', agentId)

    if (action === 'initialize') {
      // Initialize conversation with the agent
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey,
        },
        body: JSON.stringify({
          agent_id: agentId
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('ElevenLabs agent initialization error:', errorText)
        throw new Error(`ElevenLabs agent error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('Agent initialized successfully:', data.conversation_id)

      return new Response(
        JSON.stringify({ 
          conversationId: data.conversation_id,
          status: 'initialized' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    } else if (action === 'message') {
      // Send message to agent and get response
      if (!message) {
        throw new Error('Message is required')
      }

      // For now, we'll use a simple approach - create a new conversation each time
      // In a production app, you'd want to maintain conversation state
      const initResponse = await fetch(`https://api.elevenlabs.io/v1/convai/conversations`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey,
        },
        body: JSON.stringify({
          agent_id: agentId
        }),
      })

      if (!initResponse.ok) {
        throw new Error('Failed to initialize conversation')
      }

      const initData = await initResponse.json()
      const conversationId = initData.conversation_id

      // Send message to the conversation
      const messageResponse = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/add_user_message`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey,
        },
        body: JSON.stringify({
          message: message
        }),
      })

      if (!messageResponse.ok) {
        const errorText = await messageResponse.text()
        console.error('ElevenLabs message error:', errorText)
        throw new Error(`ElevenLabs message error: ${messageResponse.status} - ${errorText}`)
      }

      const messageData = await messageResponse.json()
      
      // Get the agent's response
      const responseData = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/get_audio_response`, {
        method: 'GET',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': elevenLabsApiKey,
        },
      })

      if (!responseData.ok) {
        const errorText = await responseData.text()
        console.error('ElevenLabs response error:', errorText)
        throw new Error(`ElevenLabs response error: ${responseData.status} - ${errorText}`)
      }

      const audioBuffer = await responseData.arrayBuffer()
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)))

      console.log('Agent response generated successfully, audio length:', base64Audio.length)

      return new Response(
        JSON.stringify({ 
          audioContent: base64Audio,
          response: messageData.agent_response || "I understand and I'm here to help.",
          conversationId: conversationId
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    } else {
      throw new Error('Invalid action. Use "initialize" or "message"')
    }
  } catch (error) {
    console.error('Error in elevenlabs-agent function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
