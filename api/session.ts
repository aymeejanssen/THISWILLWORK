import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing OpenAI API key" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/ephemeral_keys", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        purpose: "agents.realtime"
      })
    });

    const data = await response.json();
    return res.status(200).json({ client_secret: { value: data.secret } });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create ephemeral key" });
  }
}

