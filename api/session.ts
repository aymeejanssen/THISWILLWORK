export default async function handler(req: Request): Promise<Response> {
  try {
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview",
        modalities: ["audio", "text"],
        instructions: "You provide mental health assistance, companionship, and advice.",
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("❌ OpenAI Error:", text);
      return new Response(text, { status: response.status });
    }

    return new Response(text, { status: 200 });
  } catch (err) {
    console.error("💥 Unexpected Error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
