import { RealtimeAgent } from '@openai/agents-realtime';

const agent = new RealtimeAgent({
  name: 'Your Mental Health Assistant',
  instructions: 'You provide mental health support, psychological insights and constructive feedback with advise.',
});
import { RealtimeSession } from '@openai/agents-realtime';

const session = new RealtimeSession(agent, {
  model: 'gpt-4o-realtime-preview-2025-06-03',
});
await session.connect({ apiKey: '<client-api-key>' });