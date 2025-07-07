export default async function handler(req: any, res: any) {
  try {
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2025-06-03",
        voice: "nova",
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Error creating ephemeral key:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
