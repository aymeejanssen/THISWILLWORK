import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX, PhoneOff, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { RealtimeAgent, RealtimeSession } from '@openai/agents-realtime';

const OpenAIVoiceChat = () => {
  const [session, setSession] = useState<RealtimeSession | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [currentStatus, setCurrentStatus] = useState('Ready to start conversation');

  const startConversation = async () => {
    try {
      setCurrentStatus("Connecting to OpenAI Realtime...");
      const agent = new RealtimeAgent({
        name: "Companion",
        instructions: "You are a kind, emotionally intelligent mental wellness coach. Speak aloud with short, supportive answers.",
        voice: "nova"
      });

      const newSession = new RealtimeSession(agent);

      const res = await fetch("/api/session");
      const data = await res.json();
      const ephemeralKey = data.client_secret.value;

      await newSession.connect({ apiKey: ephemeralKey });

      setSession(newSession);
      setSessionStarted(true);
      setCurrentStatus("🎙️ Live conversation started. Speak freely.");
      toast.success("Voice chat session connected.");
    } catch (error) {
      console.error("❌ Realtime API error:", error);
      toast.error("Failed to connect to voice session.");
      setCurrentStatus("Connection failed");
    }
  };

  const endConversation = () => {
    if (session) {
      session.disconnect();
      setSession(null);
    }
    setSessionStarted(false);
    setCurrentStatus("Conversation ended");
    toast.info("Voice chat session ended.");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-gradient-to-br from-purple-50 to-pink-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-700">
            Natural Voice Chat
          </CardTitle>
          <p className="text-sm text-gray-600">
            Speak naturally — AI listens and responds aloud
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {!sessionStarted ? (
            <div className="text-center space-y-4">
              <Button
                onClick={startConversation}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xl font-bold"
              >
                <Phone className="h-8 w-8" />
              </Button>
              <p className="text-gray-600">Click to begin live AI conversation</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status */}
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 font-medium">{currentStatus}</p>
              </div>

              {/* Controls */}
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
                  onClick={endConversation}
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

