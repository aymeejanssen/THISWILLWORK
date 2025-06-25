import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { responses, primaryConcern, prompt, context, systemPrompt, maxTokens = 200 } = req.body || {};

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  // Build the prompt depending on provided fields
  let messages;
  if (responses) {
    const basePrompt = `You are a compassionate, expert psychologist analyzing a mental health assessment.\nPrimary concern: ${primaryConcern || 'Not specified'}\nUser responses: ${JSON.stringify(responses)}`;
    messages = [
      { role: 'system', content: 'You are an expert psychologist providing short insights in JSON.' },
      { role: 'user', content: basePrompt }
    ];
  } else {
    messages = [
      { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
      { role: 'user', content: context ? `${context}\nUser: ${prompt}` : prompt }
    ];
  }

  try {
    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: maxTokens
      })
    });

    const data = await aiRes.json();
    if (!aiRes.ok) {
      return res.status(aiRes.status).json(data);
    }

    const content = data.choices[0]?.message?.content || '';
    return res.status(200).json(responses ? JSON.parse(content) : { response: content.trim() });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'OpenAI request failed' });
  }
}
