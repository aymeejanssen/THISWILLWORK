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
    const { action, audio, text, assessmentResponses } = await req.json();
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // New action: Start personalized session based on assessment
    if (action === 'start_session') {
      console.log('Starting personalized session with assessment data:', assessmentResponses);

      // Create a personalized opening based on assessment responses
      let personalizedPrompt = `You are a warm, empathetic AI therapist starting an intake session. Based on the user's assessment responses, provide a personalized opening that:

1. Briefly acknowledges 1-2 key themes from their responses 
2. Shows understanding and validation
3. Asks one thoughtful follow-up question to explore their experience further
4. Keep it conversational and under 100 words since it will be spoken aloud

Assessment responses: ${JSON.stringify(assessmentResponses)}

Create a warm, personalized opening that makes them feel heard and understood.`;

      const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: personalizedPrompt
            }
          ],
          max_tokens: 150,
          temperature: 0.8,
        }),
      });

      if (!chatResponse.ok) {
        throw new Error(`GPT-4 API error: ${await chatResponse.text()}`);
      }

      const chatResult = await chatResponse.json();
      const personalizedOpening = chatResult.choices[0]?.message?.content || 'Hello! I\'ve reviewed your assessment and I\'m here to support you. What would you like to explore together today?';
      
      console.log('Personalized opening:', personalizedOpening);

      return new Response(
        JSON.stringify({ response: personalizedOpening }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Speech-to-Text (Whisper)
    if (action === 'transcribe') {
      console.log('Transcribing audio with Whisper...');
      
      // Convert base64 to blob
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
        throw new Error(`Whisper API error: ${await transcribeResponse.text()}`);
      }

      const transcribeResult = await transcribeResponse.json();
      console.log('Transcription result:', transcribeResult.text);

      return new Response(
        JSON.stringify({ text: transcribeResult.text }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Generate GPT-4 response (upgraded from GPT-4o)
    if (action === 'chat') {
      console.log('Generating GPT-4 response for:', text);

      const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a warm, empathetic AI therapist. Keep your responses conversational, supportive, and under 80 words since they will be spoken aloud. Focus on being present and helping the person process their thoughts and feelings.'
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 120,
          temperature: 0.8,
        }),
      });

      if (!chatResponse.ok) {
        throw new Error(`GPT-4 API error: ${await chatResponse.text()}`);
      }

      const chatResult = await chatResponse.json();
      const aiResponse = chatResult.choices[0]?.message?.content || 'I hear you. Tell me more about what you\'re feeling.';
      console.log('GPT-4 response:', aiResponse);

      return new Response(
        JSON.stringify({ response: aiResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Text-to-Speech with Nova voice
    if (action === 'speak') {
      console.log('Converting text to speech with Nova voice:', text.substring(0, 50) + '...');

      const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1-hd',
          input: text,
          voice: 'nova',
          response_format: 'mp3',
          speed: 1.0,
        }),
      });

      if (!ttsResponse.ok) {
        throw new Error(`TTS API error: ${await ttsResponse.text()}`);
      }

      // Convert audio to base64
      const audioBuffer = await ttsResponse.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

      console.log('TTS audio generated successfully with Nova voice');

      return new Response(
        JSON.stringify({ audioContent: base64Audio }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action specified');

  } catch (error) {
    console.error('OpenAI Voice Chat error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
