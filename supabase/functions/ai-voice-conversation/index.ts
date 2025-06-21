
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, audio, text } = await req.json();
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Processing request with action:', action);

    // Step 1: Speech-to-Text (gpt-4o transcribe)
    if (action === 'transcribe') {
      console.log('Transcribing audio with gpt-4o...');
      
      const binaryString = atob(audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const formData = new FormData();
      const audioBlob = new Blob([bytes], { type: 'audio/webm' });
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');

      const transcribeResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: formData,
      });

      if (!transcribeResponse.ok) {
        throw new Error(`Transcription error: ${await transcribeResponse.text()}`);
      }

      const transcribeResult = await transcribeResponse.json();
      console.log('Transcription result:', transcribeResult.text);

      return new Response(
        JSON.stringify({ text: transcribeResult.text }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Generate response with gpt-4.1
    if (action === 'chat') {
      console.log('Generating response with gpt-4.1 for:', text);

      const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful, warm AI assistant. Keep your responses conversational and under 100 words since they will be spoken aloud. Be natural and engaging in your speech.'
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!chatResponse.ok) {
        throw new Error(`Chat API error: ${await chatResponse.text()}`);
      }

      const chatResult = await chatResponse.json();
      const aiResponse = chatResult.choices[0]?.message?.content || 'I apologize, I did not understand that.';
      console.log('GPT-4.1 response:', aiResponse);

      return new Response(
        JSON.stringify({ response: aiResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Text-to-Speech with gpt-4o-mini-tts
    if (action === 'speak') {
      console.log('Converting text to speech with gpt-4o-mini-tts:', text.substring(0, 50) + '...');

      const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: 'nova',
          response_format: 'mp3',
        }),
      });

      if (!ttsResponse.ok) {
        throw new Error(`TTS API error: ${await ttsResponse.text()}`);
      }

      const audioBuffer = await ttsResponse.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

      console.log('TTS audio generated successfully');

      return new Response(
        JSON.stringify({ audioContent: base64Audio }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action specified');

  } catch (error) {
    console.error('AI Voice Conversation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
