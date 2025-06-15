
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('--- generate-assessment-insights function started ---');
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request for CORS preflight.');
    return new Response(null, { headers: corsHeaders });
  }
  console.log('Request received, method:', req.method);

  try {
    const payload = await req.json();
    console.log('Received payload:', payload);

    if (!payload) {
      throw new Error("Request payload is missing.");
    }

    const { responses, primaryConcern } = payload;
    
    // Defensive check
    if (typeof responses !== 'object' || responses === null) {
      console.error('Invalid "responses" data received:', responses);
      throw new Error('Received invalid or missing "responses" data.');
    }

    console.log('Generating insights for:', { primaryConcern, responseCount: Object.keys(responses).length });
    
    // Check if API key is available
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables. Please set OPENAI_API_KEY secret in Supabase project settings.');
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `You are a compassionate, expert psychologist analyzing a mental health assessment. Provide deep psychological insights that help the user understand their patterns and behaviors.

IMPORTANT: Look for these specific patterns and provide psychological education:

1. PARENTIFICATION/EARLY RESPONSIBILITY: If they mention having to be an adult too soon, being responsible for siblings, taking care of parents, or missing childhood - explain that this often leads to hyper-independence as a coping strategy. Help them understand that learning to trust others and accept help is part of human nature as we are social beings who thrive in community.

2. PEOPLE-PLEASING: If they struggle with saying no, fear disappointing others, or put others' needs first - explain that this often stems from childhood experiences where love felt conditional. Help them understand that healthy relationships involve mutual respect and that their needs matter too.

3. PERFECTIONISM: If they mention fear of failure, setting impossibly high standards, or feeling like they're never good enough - explain that perfectionism is often a protective mechanism against criticism or rejection, but it prevents authentic connection and growth.

4. EMOTIONAL SUPPRESSION: If they mention not expressing emotions, being the "strong one," or feeling uncomfortable with vulnerability - explain that emotional expression is healthy and necessary, and that suppressing emotions often leads to increased anxiety and disconnection.

5. HYPERVIGILANCE: If they mention being constantly alert, expecting the worst, or difficulty relaxing - explain that this is often a trauma response where the nervous system learned to stay alert for danger, even when safe.

Primary concern: ${primaryConcern || 'Not specified'}
User responses: ${JSON.stringify(responses, null, 2)}

Analyze their specific responses and provide:

1. 2-3 personalized psychological insights that:
   - Identify specific patterns in their responses
   - Explain the psychological mechanisms behind these patterns
   - Normalize their experiences by explaining how common these responses are
   - Reframe coping strategies compassionately (e.g., "Your hyper-independence shows incredible strength AND it's okay to let others support you too")

2. 3-4 specific, actionable steps based on psychological principles:
   - Include specific techniques they can practice
   - Focus on gradual, manageable changes
   - Include both self-compassion practices and behavioral changes

3. A supportive message that validates their courage in seeking understanding

Please respond in JSON format:
{
  "insights": [
    {
      "title": "Insight title that feels personal to them",
      "description": "Deep psychological understanding of their pattern",
      "reframe": "Compassionate reframe that honors their strength while opening new possibilities"
    }
  ],
  "actionSteps": [
    {
      "title": "Specific psychological technique or practice", 
      "description": "Why this helps psychologically",
      "action": "Concrete step they can take this week"
    }
  ],
  "supportiveMessage": "Validating message that acknowledges their journey and normalizes their experience"
}

Be warm, psychologically informed, and avoid clinical jargon. Focus on helping them understand themselves with compassion.

IMPORTANT: Respond with ONLY the JSON object, no additional text or markdown formatting.`;

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
          { role: 'system', content: 'You are an expert psychologist who provides compassionate, educational insights about mental health patterns and coping mechanisms. You help people understand their behaviors with warmth and scientific accuracy. Always respond with valid JSON only, no markdown or extra formatting.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    console.log(`OpenAI response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI API response received successfully');
    
    let aiResponse = data.choices[0].message.content;
    console.log('Raw AI Response:', aiResponse);

    // Clean up the AI response - remove markdown code blocks if present
    if (aiResponse.includes('```json')) {
      aiResponse = aiResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    }
    if (aiResponse.includes('```')) {
      aiResponse = aiResponse.replace(/```\s*/g, '');
    }
    
    // Trim whitespace
    aiResponse = aiResponse.trim();

    console.log('Cleaned AI Response:', aiResponse);

    // Parse the JSON response from AI
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
      console.log('Successfully parsed AI response.');
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Cleaned AI response that failed to parse:', aiResponse);
      
      console.log('Using fallback response due to parsing error.');
      // Fallback response if parsing fails
      parsedResponse = {
        insights: [{
          title: "Your Self-Awareness is a Superpower",
          description: "Taking this assessment shows remarkable courage and self-awareness. This willingness to look inward and seek understanding is the foundation of all personal growth and healing.",
          reframe: "Many people go through life without ever pausing to understand themselves. Your curiosity about your inner world is a strength that will guide your journey toward greater well-being."
        }],
        actionSteps: [{
          title: "Practice the 'Good Friend' Exercise",
          description: "When you notice self-criticism, ask yourself: 'What would I tell a dear friend in this exact situation?' This helps activate your compassionate mind.",
          action: "This week, try this exercise once a day when you catch yourself being self-critical. Write down what you would tell a friend, then offer that same kindness to yourself."
        }],
        supportiveMessage: "You've taken a brave step by seeking to understand yourself better. This journey of self-discovery takes courage, and every small insight you gain is meaningful progress. Remember, healing isn't linear, and you're exactly where you need to be right now."
      };
    }

    console.log('--- generate-assessment-insights function finished successfully ---');
    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('--- Error in generate-assessment-insights function ---:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate insights',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
