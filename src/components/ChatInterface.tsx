import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, User, X, Heart, Mic, MicOff, Type, Volume2 } from "lucide-react";

interface ChatInterfaceProps {
  onClose: () => void;
  userProfile?: any;
}

const ChatInterface = ({ onClose, userProfile }: ChatInterfaceProps) => {
  const [isListening, setIsListening] = useState(false);
  const [useVoice, setUseVoice] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

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

  // Initialize speech recognition and synthesis
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

    speechSynthesisRef.current = window.speechSynthesis;

    // Load available voices
    const loadVoices = () => {
      if (speechSynthesisRef.current) {
        const voices = speechSynthesisRef.current.getVoices();
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
        setAvailableVoices(englishVoices);
        
        // Auto-select a good motherly voice if none selected
        if (!selectedVoice && englishVoices.length > 0) {
          const motherlyVoices = englishVoices.filter(voice => 
            voice.name.includes('Samantha') || 
            voice.name.includes('Victoria') ||
            voice.name.includes('Karen') ||
            voice.name.includes('Susan') ||
            voice.name.includes('Fiona') ||
            voice.name.includes('Female')
          );
          
          const femaleVoices = englishVoices.filter(voice => 
            voice.name.toLowerCase().includes('female') ||
            (!voice.name.toLowerCase().includes('male') && !voice.name.toLowerCase().includes('man'))
          );
          
          if (motherlyVoices.length > 0) {
            setSelectedVoice(motherlyVoices[0].name);
          } else if (femaleVoices.length > 0) {
            setSelectedVoice(femaleVoices[0].name);
          } else if (englishVoices.length > 0) {
            setSelectedVoice(englishVoices[0].name);
          }
        }
      }
    };

    loadVoices();
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.onvoiceschanged = loadVoices;
    }

    // Speak the initial greeting if voice is enabled and there's a greeting
    if (useVoice && speechSynthesisRef.current && initialGreeting) {
      setTimeout(() => {
        speakText(initialGreeting);
      }, 1000); // Longer delay to ensure voices are loaded
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  const speakText = (text: string) => {
    if (speechSynthesisRef.current && useVoice) {
      speechSynthesisRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Make voice soothing and motherly
      utterance.rate = 0.75;
      utterance.pitch = 0.9;
      utterance.volume = 0.85;
      
      // Use selected voice
      if (selectedVoice) {
        const voice = availableVoices.find(v => v.name === selectedVoice);
        if (voice) {
          utterance.voice = voice;
        }
      }
      
      console.log('Using voice:', utterance.voice?.name || 'default');
      speechSynthesisRef.current.speak(utterance);
    }
  };

  const testVoice = () => {
    speakText("Hi there! This is how I sound. I'm here to support you with warmth and understanding.");
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
      
      // Speak the AI response if voice is enabled
      if (useVoice) {
        setTimeout(() => {
          speakText(randomResponse);
        }, 300);
      }
    }, 1200);
  };

  const toggleInputMode = () => {
    setUseVoice(!useVoice);
    if (isListening) {
      stopListening();
    }
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
  };

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
            <Badge className={`${useVoice ? 'bg-green-500/80' : 'bg-blue-500/80'} text-white border-white/30`}>
              {useVoice ? '🎤 Voice Mode' : '⌨️ Text Mode'}
            </Badge>
          </div>
          
          {/* Voice Selection */}
          {useVoice && availableVoices.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-white/80">Voice:</span>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger className="w-48 bg-white/20 border-white/30 text-white">
                  <SelectValue placeholder="Choose voice" />
                </SelectTrigger>
                <SelectContent>
                  {availableVoices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={testVoice}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <Volume2 className="h-4 w-4" />
                Test
              </Button>
            </div>
          )}
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
          </div>

          {/* Input Area */}
          <div className="p-6 border-t bg-white">
            {useVoice ? (
              // Voice Mode
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-2 items-center">
                  <Button
                    onClick={isListening ? stopListening : startListening}
                    className={`rounded-full w-16 h-16 ${
                      isListening 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                        : 'bg-wellness-purple hover:bg-wellness-purple/90'
                    }`}
                  >
                    {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </Button>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  {isListening ? 'Listening... Tap to stop' : 'Tap to speak your thoughts'}
                </p>
                <Button 
                  onClick={toggleInputMode}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Type className="h-4 w-4" />
                  I prefer to type right now
                </Button>
              </div>
            ) : (
              // Text Mode
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder={userProfile ? "Share what's on your heart..." : "Type your message... (This is a demo)"}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => handleSendMessage()}
                    className="bg-wellness-purple hover:bg-wellness-purple/90"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  onClick={toggleInputMode}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 mx-auto"
                >
                  <Mic className="h-4 w-4" />
                  Switch to voice mode
                </Button>
              </div>
            )}
            
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
