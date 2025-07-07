import React from 'react';
import { RealtimeAgent, RealtimeSession } from '@openai/agents-realtime';

export const TalkToAIButton = () => {
  const startRealtimeSession = async () => {
    try {
      const agent = new RealtimeAgent({
        name: 'Assistant',
        instructions: 'You provide mental health assistance, companionship, and advice.',
      });

      const newSession = new RealtimeSession(agent);

      const res = await fetch('/api/session');
      const data = await res.json();
      const ephemeralKey = data.client_secret?.value;

      if (!ephemeralKey) {
        throw new Error("Missing ephemeral key from /api/session response.");
      }

      await newSession.connect({ apiKey: ephemeralKey });

      console.log('✅ Realtime session started');
      // Optional: route or set state here
    } catch (error) {
      console.error('Realtime session error:', error);
    }
  };

  return (
    <button
      onClick={startRealtimeSession}
      className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-lg mt-6 block mx-auto"
    >
      🎙️ Talk to AI Now
    </button>
  );
};
