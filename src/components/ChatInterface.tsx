
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, User, X, Heart, Mic, MicOff, Volume2, Headphones, Edit } from "lucide-react";
import { supabase } from '../integrations/supabase/client';
import VoiceOnlyChat from './VoiceOnlyChat';

interface ChatInterfaceProps {
  onClose: () => void;
  userProfile?: any;
}

const ChatInterface = ({ onClose, userProfile }: ChatInterfaceProps) => {
  const [chatMode, setChatMode] = useState<'select' | 'text' | 'voice'>('select');
  const [isListening, setIsListening] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('nova');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // OpenAI TTS voices - 5 best options
  const openAIVoices = [
    { id: 'nova', name: 'Nova (Warm & Empathetic)', description: 'Warm, caring female voice' },
    { id: 'alloy', name: 'Alloy (Neutral)', description: 'Balanced, professional voice' },
    { id: 'echo', name: 'Echo (Gentle)', description: 'Soft, gentle male voice' },
    { id: 'onyx', name: 'Onyx (Deep)', description: 'Deep, calming male voice' },
    { id: 'shimmer', name: 'Shimmer (Bright)', description: 'Bright, encouraging female voice' }
  ];

  const getPersonalizedGreeting = () => {
    if (!userProfile) {
      return ""; // No greeting for trial users
    }

    const name = userProfile.name || 'dear';
    const struggles = userProfile.currentStruggles?.join(', ') || 'what you\'re going through';
    
    return `Hi ${name}... I'm really glad you're here. I know it takes courage to reach out, especially when you're dealing with ${struggles}. There's no pressure here - just take your time and share whatever feels right for you today. What's been on your mind lately?`;
  };

  const initialGreeting = getPersonalizedGreeting();
  const [messages, setMessages] = useState(() => {
    if (initialGreeting) {
      return [{
        type: 'ai',
        content: initialGreeting,
        timestamp: new Date()
      }];
    }
    return [];
  });
  const [inputMessage, setInputMessage] = useState('');

  const sampleResponses = [
    "That sounds really tough... I can hear how much this is weighing on you. Work burnout is exhausting in so many ways. What's been the hardest part for you lately?",
    "I'm really sorry you're going through this with relationships. That kind of pain runs deep, doesn't it? You're being so brave by talking about it. Tell me more about what you're feeling...",
    "Questions about who we are can feel so heavy sometimes. It's like you're searching for yourself while the world keeps moving around you. What's been coming up for you about this?",
    "Those doubts can be so loud, can't they? Like a voice that just won't quiet down. But you know what? You showed up here today, and that tells me something important about your strength. What's that voice been telling you?"
  ];

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');

        if (event.results[event.results.length - 1].isFinal) {
          handleSendMessage(transcript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    // Speak the initial greeting if there's a greeting
    if (initialGreeting && chatMode === 'text') {
      setTimeout(() => {
        speakText(initialGreeting);
      }, 1500);
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
  }, [chatMode]);

  const speakText = async (text: string) => {
    if (isSpeaking) return;

    try {
      setIsSpeaking(true);
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
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
        };

        audio.onerror = () => {
          console.error('Audio playback error');
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
        };

        await audio.play();
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('Error generating speech:', error);
      setIsSpeaking(false);
    }
  };

  const testVoice = () => {
    const testText = "Hi there! This is how I sound. I'm here to support you with warmth and understanding. Does this voice feel comfortable to you?";
    speakText(testText);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSendMessage = (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim()) return;

    const newUserMessage = {
      type: 'user' as const,
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');

    // Simulate AI response with more natural conversation flow
    setTimeout(() => {
      const randomResponse = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
      const aiResponse = {
        type: 'ai' as const,
        content: randomResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      
      // Speak the AI response
      setTimeout(() => {
        speakText(randomResponse);
      }, 500);
    }, 1200);
  };

  // Show voice-only chat if voice mode is selected
  if (chatMode === 'voice') {
    return <VoiceOnlyChat onClose={onClose} userProfile={userProfile} />;
  }

  // Show mode selection screen
  if (chatMode === 'select') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardHeader className="wellness-gradient text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-6 w-6" />
                Choose Your Experience
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How would you like to connect?</h3>
              <p className="text-gray-600">Choose the mode that feels most comfortable for you</p>
            </div>

            <Button
              onClick={() => setChatMode('voice')}
              className="w-full h-20 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex flex-col items-center justify-center space-y-2"
            >
              <Headphones className="h-6 w-6" />
              <span className="font-semibold">Talk Only</span>
              <span className="text-xs opacity-90">Pure voice conversation - no text</span>
            </Button>

            <Button
              onClick={() => setChatMode('text')}
              variant="outline"
              className="w-full h-20 flex flex-col items-center justify-center space-y-2 border-2 hover:bg-gray-50"
            >
              <Edit className="h-6 w-6" />
              <span className="font-semibold">Write & Speak</span>
              <span className="text-xs text-gray-600">Text with voice responses</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Text chat mode (existing functionality)
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="wellness-gradient text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-6 w-6" />
              {userProfile?.name ? `MindEase & ${userProfile.name}` : 'MindEase AI Companion'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <Badge className="bg-white/20 text-white border-white/30 w-fit">
              {userProfile ? 'Personalized Support Session' : 'Demo Mode - Experience the conversation'}
            </Badge>
            <Badge className="bg-green-500/80 text-white border-white/30">
              🎤 Voice Mode
            </Badge>
          </div>
          
          {/* Voice Selection */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-white/80">AI Voice:</span>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
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
            <Button 
              onClick={testVoice}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              disabled={isSpeaking}
            >
              <Volume2 className="h-4 w-4" />
              {isSpeaking ? 'Speaking...' : 'Test'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-purple-50/30 to-teal-50/30">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.type === 'user' 
                    ? 'bg-wellness-purple text-white ml-auto' 
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}>
                  <div className="flex items-start gap-2 mb-1">
                    {message.type === 'ai' ? (
                      <Heart className="h-4 w-4 text-wellness-purple mt-0.5 flex-shrink-0" />
                    ) : (
                      <User className="h-4 w-4 text-white mt-0.5 flex-shrink-0" />
                    )}
                    <div className="text-sm whitespace-pre-line">{message.content}</div>
                  </div>
                </div>
              </div>
            ))}
            {isSpeaking && (
              <div className="flex justify-start">
                <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-2xl max-w-xs">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Volume2 className="h-4 w-4 animate-pulse" />
                    <span className="text-sm">Speaking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 border-t bg-white">
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-2 items-center">
                <Button
                  onClick={isListening ? stopListening : startListening}
                  className={`rounded-full w-16 h-16 ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-wellness-purple hover:bg-wellness-purple/90'
                  }`}
                  disabled={isSpeaking}
                >
                  {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
              </div>
              <p className="text-sm text-gray-600 text-center">
                {isSpeaking ? 'AI is speaking...' : isListening ? 'Listening... Tap to stop' : 'Tap to speak your thoughts'}
              </p>
              
              <div className="flex gap-2 w-full">
                <Input
                  placeholder={userProfile ? "Or type what's on your heart..." : "Or type your message... (This is a demo)"}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                  disabled={isSpeaking}
                />
                <Button 
                  onClick={() => handleSendMessage()}
                  className="bg-wellness-purple hover:bg-wellness-purple/90"
                  disabled={isSpeaking}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              {userProfile ? 'Your conversations are private and secure.' : 'This is a demo. In the real app, conversations are private and secure.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;
