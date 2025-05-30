
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, X, Volume2, Mic, MicOff } from "lucide-react";
import { supabase } from '../integrations/supabase/client';

interface VoiceOnlyChatProps {
  onClose: () => void;
  userProfile?: any;
}

const VoiceOnlyChat = ({ onClose, userProfile }: VoiceOnlyChatProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('nova');
  const [conversationStarted, setConversationStarted] = useState(false);
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isProcessingRef = useRef(false);

  // OpenAI TTS voices
  const openAIVoices = [
    { id: 'nova', name: 'Nova (Warm & Empathetic)', description: 'Warm, caring female voice' },
    { id: 'alloy', name: 'Alloy (Neutral)', description: 'Balanced, professional voice' },
    { id: 'echo', name: 'Echo (Gentle)', description: 'Soft, gentle male voice' },
    { id: 'onyx', name: 'Onyx (Deep)', description: 'Deep, calming male voice' },
    { id: 'shimmer', name: 'Shimmer (Bright)', description: 'Bright, encouraging female voice' }
  ];

  const getPersonalizedGreeting = () => {
    if (!userProfile) {
      return "Hi there! I'm your AI wellness companion. I'm here to listen and support you through whatever you're experiencing. What's on your mind today?";
    }

    const name = userProfile.name || 'dear';
    const struggles = userProfile.currentStruggles?.join(', ') || 'what you\'re going through';
    
    return `Hi ${name}... I'm really glad you're here. I know it takes courage to reach out, especially when you're dealing with ${struggles}. I'm here to listen and support you. What's been on your mind lately?`;
  };

  // Sample AI responses for conversation flow
  const sampleResponses = [
    "I hear you, and that sounds really challenging. Take your time... I'm here to listen. Can you tell me more about what's been weighing on you?",
    "That must feel overwhelming at times. It's completely understandable to feel that way. What do you think has been the hardest part for you?",
    "Thank you for sharing that with me. It takes courage to open up about these feelings. How long have you been experiencing this?",
    "I can sense the strength it takes to talk about this. What kind of support do you feel you need right now?",
    "Those feelings are valid, and you're not alone in experiencing them. What helps you feel a little better when you're going through difficult moments?"
  ];

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        if (isProcessingRef.current) return;
        
        const transcript = event.results[0][0].transcript;
        console.log('Voice input received:', transcript);
        handleVoiceInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (!isProcessingRef.current && conversationStarted) {
          // Restart listening after a brief pause
          setTimeout(() => {
            if (!isSpeaking && conversationStarted) {
              startListening();
            }
          }, 1000);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, [conversationStarted, isSpeaking]);

  const speakText = async (text: string) => {
    if (isSpeaking) return;

    try {
      setIsSpeaking(true);
      isProcessingRef.current = true;
      console.log('Generating speech for:', text.substring(0, 50) + '...');

      // Stop any current audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text, 
          voice: selectedVoice 
        }
      });

      if (error) {
        console.error('TTS error:', error);
        setIsSpeaking(false);
        isProcessingRef.current = false;
        return;
      }

      if (data?.audioContent) {
        // Create audio from base64
        const audioBlob = new Blob([
          Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))
        ], { type: 'audio/mp3' });
        
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          isProcessingRef.current = false;
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
          
          // Restart listening after AI finishes speaking
          setTimeout(() => {
            if (conversationStarted) {
              startListening();
            }
          }, 500);
        };

        audio.onerror = () => {
          console.error('Audio playback error');
          setIsSpeaking(false);
          isProcessingRef.current = false;
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
        };

        await audio.play();
      } else {
        setIsSpeaking(false);
        isProcessingRef.current = false;
      }
    } catch (error) {
      console.error('Error generating speech:', error);
      setIsSpeaking(false);
      isProcessingRef.current = false;
    }
  };

  const handleVoiceInput = async (transcript: string) => {
    if (!transcript.trim()) return;
    
    console.log('Processing voice input:', transcript);
    
    // Stop listening while processing
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Simulate AI response
    setTimeout(() => {
      const randomResponse = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
      speakText(randomResponse);
    }, 800);
  };

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening && !isSpeaking && !isProcessingRef.current) {
      try {
        setIsListening(true);
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsListening(false);
      }
    }
  }, [isListening, isSpeaking]);

  const startConversation = async () => {
    setConversationStarted(true);
    
    // Speak the initial greeting
    const greeting = getPersonalizedGreeting();
    await speakText(greeting);
  };

  const endConversation = () => {
    setConversationStarted(false);
    setIsListening(false);
    setIsSpeaking(false);
    isProcessingRef.current = false;
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
  };

  const testVoice = () => {
    const testText = "Hi there! This is how I sound. I'm here to support you with warmth and understanding. Does this voice feel comfortable to you?";
    speakText(testText);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-xl h-[500px] flex flex-col">
        <CardHeader className="wellness-gradient text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-6 w-6" />
              Voice-Only Session
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <Badge className="bg-white/20 text-white border-white/30 w-fit">
            🎤 Pure Voice Mode - No Text
          </Badge>
          
          {/* Voice Selection */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-white/80">AI Voice:</span>
            <Select value={selectedVoice} onValueChange={setSelectedVoice} disabled={conversationStarted}>
              <SelectTrigger className="w-48 bg-white/20 border-white/30 text-white">
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {openAIVoices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    <div className="flex flex-col">
                      <span>{voice.name}</span>
                      <span className="text-xs text-gray-500">{voice.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!conversationStarted && (
              <Button 
                onClick={testVoice}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                disabled={isSpeaking}
              >
                <Volume2 className="h-4 w-4" />
                Test
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-purple-50/30 to-teal-50/30">
          {!conversationStarted ? (
            <div className="text-center space-y-6">
              <Button 
                onClick={startConversation}
                className="relative bg-gradient-to-br from-purple-500 via-pink-400 to-red-400 hover:from-purple-600 hover:via-pink-500 hover:to-red-500 text-white w-32 h-32 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transform transition-all duration-300 text-xl font-bold"
                disabled={isSpeaking}
              >
                {isSpeaking ? (
                  <div className="animate-pulse">
                    <Volume2 className="h-8 w-8" />
                  </div>
                ) : (
                  "Start"
                )}
              </Button>
              <p className="text-gray-600 text-lg">Tap to begin your voice conversation</p>
            </div>
          ) : (
            <div className="text-center space-y-8">
              {/* Dynamic Heartbeat Button */}
              <div className="relative">
                <Button
                  className={`w-40 h-40 rounded-full flex items-center justify-center shadow-2xl text-white transition-all duration-500 ${
                    isSpeaking 
                      ? 'bg-gradient-to-br from-green-400 to-blue-500 animate-pulse scale-110' 
                      : isListening 
                        ? 'bg-gradient-to-br from-red-400 to-pink-500 animate-pulse' 
                        : 'bg-gradient-to-br from-purple-400 to-indigo-500'
                  }`}
                  disabled
                >
                  <Heart className={`h-12 w-12 ${
                    isSpeaking || isListening ? 'animate-pulse' : ''
                  }`} />
                </Button>
                
                {/* Ripple effect */}
                {(isSpeaking || isListening) && (
                  <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xl font-semibold text-gray-800">
                  {isSpeaking ? "AI is speaking..." : isListening ? "Listening..." : "Waiting..."}
                </p>
                <p className="text-sm text-gray-600">
                  {isSpeaking ? "💚 Your AI companion is responding" : 
                   isListening ? "❤️ Share what's on your mind" : 
                   "💜 Ready for your voice"}
                </p>
              </div>

              <Button 
                onClick={endConversation}
                variant="outline"
                className="mt-8"
              >
                End Conversation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceOnlyChat;
