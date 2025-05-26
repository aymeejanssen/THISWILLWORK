
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, User, X, Heart } from "lucide-react";

interface ChatInterfaceProps {
  onClose: () => void;
  userProfile?: any;
}

const ChatInterface = ({ onClose, userProfile }: ChatInterfaceProps) => {
  const getPersonalizedGreeting = () => {
    if (!userProfile) {
      return "Hello! I'm here to listen and support you. Feel free to share what's on your mind today. Remember, this is a safe, judgment-free space. 💜";
    }

    const name = userProfile.name || 'friend';
    const struggles = userProfile.currentStruggles?.join(', ') || 'life challenges';
    const language = userProfile.preferredLanguage || 'English';
    
    return `Hello ${name}! 🌸 I'm so glad you're here and ready to begin this journey with me. I understand you're working through ${struggles}, and I want you to know that your feelings are completely valid. 

I'll be communicating with you in ${language} and I'm here to listen with cultural sensitivity and understanding. This is your safe space - feel free to share whatever is on your heart today. 💜

What would you like to talk about first?`;
  };

  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: getPersonalizedGreeting(),
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const sampleResponses = [
    "I understand that work burnout can feel overwhelming. Let's explore what's making you feel this way...",
    "It sounds like you're going through a difficult time with relationships. Your feelings are completely valid...",
    "Cultural identity questions can be complex. Tell me more about what you're experiencing...",
    "Self-doubt is something many people struggle with. You're not alone in feeling this way..."
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newUserMessage = {
      type: 'user' as const,
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');

    // Simulate AI response
    setTimeout(() => {
      const randomResponse = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
      const aiResponse = {
        type: 'ai' as const,
        content: randomResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
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
          <Badge className="bg-white/20 text-white border-white/30 w-fit">
            {userProfile ? 'Personalized Support Session' : 'Demo Mode - Experience the conversation'}
          </Badge>
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
            <div className="flex gap-2">
              <Input
                placeholder={userProfile ? "Share what's on your heart..." : "Type your message... (This is a demo)"}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                className="bg-wellness-purple hover:bg-wellness-purple/90"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
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
