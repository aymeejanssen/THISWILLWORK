
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, User, X, Heart, Mic, MicOff, Type } from "lucide-react";

interface ChatInterfaceProps {
  onClose: () => void;
  userProfile?: any;
}

const ChatInterface = ({ onClose, userProfile }: ChatInterfaceProps) => {
  const [isListening, setIsListening] = useState(false);
  const [useVoice, setUseVoice] = useState(true);
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  const getPersonalizedGreeting = () => {
    if (!userProfile) {
      return ""; // No greeting for trial users
    }

    const name = userProfile.name || 'friend';
    const struggles = userProfile.currentStruggles?.join(', ') || 'life challenges';
    const language = userProfile.preferredLanguage || 'English';
    
    return `Hello ${name}! I'm so glad you're here and ready to begin this journey with me. I understand you're working through ${struggles}, and I want you to know that your feelings are completely valid. I'll be communicating with you in ${language} and I'm here to listen with cultural sensitivity and understanding. This is your safe space - feel free to share whatever is on your heart today. What would you like to talk about first?`;
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
    "I hear you, and I understand that work burnout can feel really overwhelming. It's like carrying a heavy weight that just keeps getting heavier, isn't it? Let's explore what's making you feel this way...",
    "It sounds like you're going through a difficult time with relationships, and that can be so hard. Your feelings are completely valid, and you're not alone in this. Can you tell me more about what you're experiencing?",
    "Questions about cultural identity can feel really complex and sometimes isolating. I appreciate you sharing this with me. Tell me more about what you're experiencing...",
    "Self-doubt is something so many people struggle with, even though it might feel like you're the only one. You're definitely not alone in feeling this way. What thoughts have been coming up for you lately?"
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

    // Speak the initial greeting if voice is enabled and there's a greeting
    if (useVoice && speechSynthesisRef.current && initialGreeting) {
      // Small delay to ensure the interface is ready
      setTimeout(() => {
        speakText(initialGreeting);
      }, 500);
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
      // Cancel any ongoing speech
      speechSynthesisRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Make voice more natural and human-like
      utterance.rate = 0.85; // Slightly slower for more natural conversation
      utterance.pitch = 0.95; // Slightly lower pitch for warmth
      utterance.volume = 0.9;
      
      // Try to use a more natural voice if available
      const voices = speechSynthesisRef.current.getVoices();
      
      // Look for high-quality voices (often contain "premium", "enhanced", or specific names)
      const preferredVoices = voices.filter(voice => 
        voice.lang.startsWith('en') && (
          voice.name.includes('Samantha') || 
          voice.name.includes('Alex') ||
          voice.name.includes('Premium') ||
          voice.name.includes('Enhanced') ||
          voice.name.includes('Natural') ||
          voice.name.includes('Neural')
        )
      );
      
      // Fallback to any English voice that sounds natural
      const englishVoices = voices.filter(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Female')
      );
      
      // Set the best available voice
      if (preferredVoices.length > 0) {
        utterance.voice = preferredVoices[0];
      } else if (englishVoices.length > 0) {
        utterance.voice = englishVoices[0];
      } else if (voices.length > 0) {
        // Fallback to first English voice
        const fallbackVoice = voices.find(voice => voice.lang.startsWith('en'));
        if (fallbackVoice) utterance.voice = fallbackVoice;
      }
      
      console.log('Using voice:', utterance.voice?.name || 'default');
      
      speechSynthesisRef.current.speak(utterance);
    }
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
        // Small delay to make conversation feel more natural
        setTimeout(() => {
          speakText(randomResponse);
        }, 300);
      }
    }, 1200); // Slightly longer delay for more natural conversation rhythm
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
