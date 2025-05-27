
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { responses, primaryConcern } = await req.json();

    console.log('Generating insights for:', { primaryConcern, responseCount: Object.keys(responses).length });
    
    // Check if API key is available
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `You are a compassionate mental health assistant. A user has completed an assessment about their mental health concerns. Please analyze their responses and provide:

1. 2-3 personalized insights that reframe their challenges as strengths and show deep understanding
2. 3-4 specific, actionable next steps they can take
3. A supportive closing message

Primary concern: ${primaryConcern || 'Not specified'}
User responses: ${JSON.stringify(responses, null, 2)}

Please respond in JSON format:
{
  "insights": [
    {
      "title": "Insight title",
      "description": "Understanding their pattern",
      "reframe": "How this shows their strength"
    }
  ],
  "actionSteps": [
    {
      "title": "Step title", 
      "description": "What to do",
      "action": "Specific action they can take this week"
    }
  ],
  "supportiveMessage": "Encouraging message that validates their journey"
}

Be warm, understanding, and focus on their strengths. Avoid clinical language.`;

    console.log('Making OpenAI API call...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a compassionate mental health assistant that provides personalized, strength-based insights.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI API response received successfully');
    
    const aiResponse = data.choices[0].message.content;

    console.log('AI Response:', aiResponse);

    // Parse the JSON response from AI
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw AI response:', aiResponse);
      // Fallback response if parsing fails
      parsedResponse = {
        insights: [{
          title: "Your Self-Awareness is Remarkable",
          description: "Taking this assessment shows incredible self-awareness and courage to seek understanding about your inner world.",
          reframe: "This level of introspection is a superpower that will guide your healing journey."
        }],
        actionSteps: [{
          title: "Practice Self-Compassion",
          description: "Begin treating yourself with the same kindness you'd show a good friend",
          action: "When you notice self-criticism, pause and ask: 'What would I tell a friend in this situation?'"
        }],
        supportiveMessage: "You've taken an important step by seeking understanding. Every journey toward healing begins with this kind of brave self-reflection."
      };
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-assessment-insights function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate insights',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
