import OpenAI from "openai";
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function run() {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "user", content: "Say hello from the test script!" },
    ],
  });

  console.log(response.choices[0].message.content);
}

run();
