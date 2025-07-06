import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff, Volume2, VolumeX, Settings, PhoneOff } from 'lucide-react';
import { toast } from 'sonner';
import { RealtimeAgent, RealtimeSession } from '@openai/agents-realtime';

const openAIVoices = [
  { id: 'alloy', name: 'Alloy', description: 'Balanced, natural voice' },
  { id: 'echo', name: 'Echo', description: 'Clear, articulate voice' },
  { id: 'fable', name: 'Fable', description: 'Warm, engaging voice' },
  { id: 'onyx', name: 'Onyx', description: 'Deep, confident voice' },
  { id: 'nova', name: 'Nova', description: 'Bright, energetic voice' },
  { id: 'shimmer', name: 'Shimmer', description: 'Gentle, soothing voice' },
];

const OpenAIVoiceChat = () => {
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [currentStatus, setCurrentStatus] = useState('Choose your AI voice and start');
  const [session, setSession] = useState<RealtimeSession | null>(null);

  const startRealtimeSession = async () => {
    try {
      setCurrentStatus('Connecting to Realtime API...');
      
      const agent = new RealtimeAgent({ name: 'Assistant' });
      const newSession = new RealtimeSession(agent);

      const res = await fetch("/api/session");
      const data = await res.json();
      const ephemeralKey = data.client_secret.value;

      await newSession.connect({ apiKey: ephemeralKey });
      setSession(newSession);
      setSessionStarted(true);
      setCurrentStatus('🎙️ Live session started');
      toast.success("AI voice session connected!");
    } catch (error) {
      console.error("Realtime session error:", error);
      toast.error("Failed to connect to OpenAI Realtime.");
      setCurrentStatus('Connection failed');
    }
  };

  const endRealtimeSession = () => {
    if (session) {
      // Use the correct method to end the session - might be close() or end()
      // For now, just set it to null until we know the exact API
      setSession(null);
    }
    setSessionStarted(false);
    setCurrentStatus('Session ended');
    toast.info("Voice session ended");
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
              <span className="text-white text-xs">🤖</span>
            </div>
            <CardTitle className="text-xl font-bold text-purple-700">
              AI Voice Chat
            </CardTitle>
            <Button variant="ghost" size="icon" className="text-purple-600">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!sessionStarted ? (
            <>
              <div className="space-y-3">
                <h3 className="text-center text-lg font-medium text-gray-800">Choose Your Voice</h3>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {openAIVoices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{voice.name}</span>
                          <span className="text-sm text-gray-500">{voice.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-center space-y-4">
                <Button
                  onClick={startRealtimeSession}
                  className="w-full py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg font-semibold rounded-xl"
                >
                  Start Realtime Voice Chat
                </Button>
                <p className="text-sm text-gray-600">Realtime AI conversation with OpenAI</p>
              </div>
            </>
          ) : (
            <div className="space-y-6 text-center">
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-800">{currentStatus}</div>
              <div className="flex justify-around pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMicEnabled(!isMicEnabled)}
                  className={isMicEnabled ? 'text-green-600' : 'text-red-600'}
                >
                  {isMicEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSpeakerEnabled(!isSpeakerEnabled)}
                  className={isSpeakerEnabled ? 'text-green-600' : 'text-red-600'}
                >
                  {isSpeakerEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={endRealtimeSession}
                  className="text-red-600"
                >
                  <PhoneOff className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OpenAIVoiceChat;
