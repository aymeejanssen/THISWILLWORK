import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff, Volume2, VolumeX, Settings, Home, PhoneOff } from 'lucide-react';
import { RealtimeAgent, RealtimeSession } from '@openai/agents-realtime';
import { RealtimeAgent, RealtimeSession } from '@openai/agents-realtime';

document.getElementById('startBtn').addEventListener('click', async () => {
  const agent = new RealtimeAgent({
    name: 'Mynd Ease',
    instructions: 'You provide mental health support, emotional insight, and resilience coaching in a calm, supportive voice.',
  });

  const tokenResponse = await fetch("http://localhost:3000/session");
  const data = await tokenResponse.json();
  const session = new RealtimeSession(agent, {
    model: "gpt-4o-realtime-preview-2025-06-03",
  });

  await session.connect({
    apiKey: data.client_secret.value,
  });
});

const openAIVoices = [
  { id: 'alloy', name: 'Alloy', description: 'Balanced, natural voice' },
  { id: 'echo', name: 'Echo', description: 'Clear, articulate voice' },
  { id: 'fable', name: 'Fable', description: 'Warm, engaging voice' },
  { id: 'onyx', name: 'Onyx', description: 'Deep, confident voice' },
  { id: 'nova', name: 'Nova', description: 'Bright, energetic voice' },
  { id: 'shimmer', name: 'Shimmer', description: 'Gentle, soothing voice' },
];

const VoiceOnlyChat = () => {
  const navigate = useNavigate();
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [currentStatus, setCurrentStatus] = useState('Choose your AI voice and start');
  const [session, setSession] = useState<RealtimeSession | null>(null);

  const startRealtimeSession = async () => {
    try {
      const agent = new RealtimeAgent({
        name: 'Assistant',
        instructions: 'You provide mental health assistance, companionship, and advice.',
      });

      const newSession = new RealtimeSession(agent);

      const res = await fetch('/api/session');
      const data = await res.json();
      const ephemeralKey = data.client_secret.value;

      await newSession.connect({ apiKey: ephemeralKey });

      console.log('✅ Realtime session started');

      // You can store session in state or route to VoiceOnlyChat if needed
    } catch (error) {
      console.error('Realtime session error:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-gradient-to-br from-purple-50 to-pink-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-purple-600">
              <Home className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-white text-xs">🤖</span>
              </div>
              <CardTitle className="text-xl font-bold text-purple-700">
                AI Voice Chat
              </CardTitle>
            </div>
            <Button variant="ghost" size="icon" className="text-purple-600">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Button onClick={startRealtimeSession} className="w-full py-3 bg-purple-600 text-white rounded-lg">
            Talk to AI now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceOnlyChat;


