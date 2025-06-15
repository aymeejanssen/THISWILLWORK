
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('--- ai-chat function started ---');
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log('Received payload:', payload);

    if (!payload || !payload.prompt) {
      throw new Error("Request payload is missing a 'prompt'.");
    }

    const { prompt, context, systemPrompt } = payload;
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not found.');
      throw new Error('OpenAI API key not configured');
    }

    const messages = [];
    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    } else {
        messages.push({ role: 'system', content: 'You are a helpful assistant.' });
    }

    if (context) {
        // A simple way to add history. For more complex scenarios, this could be parsed into multiple messages.
        const history = context.split('\n').slice(-10).join('\n'); // Limit context size
        messages.push({ role: 'user', content: `Here is the recent conversation history:\n${history}` });
    }

    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: payload.maxTokens || 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('--- ai-chat function finished successfully ---');
    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('--- Error in ai-chat function ---:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate response',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
