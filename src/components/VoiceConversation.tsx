
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, X, Clock } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VoiceConversationProps {
  onTimeUp: () => void;
  onClose: () => void;
  timeLimit: number; // in milliseconds
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const VoiceConversation: React.FC<VoiceConversationProps> = ({ onTimeUp, onClose, timeLimit }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isActive, setIsActive] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Timer effect
  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            setIsActive(false);
            onTimeUp();
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, timeRemaining, onTimeUp]);

  // Add welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      text: "Hi! I'm here to listen and help you process your thoughts and feelings. You have 5 minutes to talk with me about anything on your mind. What would you like to explore today?",
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const startRecording = async () => {
    if (!isActive) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        processSpeechToSpeech();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const processSpeechToSpeech = async () => {
    if (audioChunksRef.current.length === 0) return;

    setIsProcessing(true);
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      // Step 1: Transcribe speech to text
      const transcribeResponse = await supabase.functions.invoke('openai-voice-chat', {
        body: { action: 'transcribe', audio: base64Audio }
      });

      if (transcribeResponse.error) {
        throw new Error(transcribeResponse.error.message);
      }

      const userText = transcribeResponse.data.text;
      
      if (!userText || userText.trim().length === 0) {
        throw new Error('No speech detected');
      }

      addMessage(userText, true);

      // Step 2: Get AI response with therapy context
      const chatResponse = await supabase.functions.invoke('openai-voice-chat', {
        body: { 
          action: 'chat', 
          text: `As a compassionate AI therapist, respond to this person who just completed a mental health assessment: "${userText}"` 
        }
      });

      if (chatResponse.error) {
        throw new Error(chatResponse.error.message);
      }

      const aiText = chatResponse.data.response;
      addMessage(aiText, false);

      // Step 3: Convert AI response to speech and play it
      const ttsResponse = await supabase.functions.invoke('openai-voice-chat', {
        body: { action: 'speak', text: aiText }
      });

      if (ttsResponse.error) {
        throw new Error(ttsResponse.error.message);
      }

      // Play the AI's voice response
      const audioContent = ttsResponse.data.audioContent;
      const audioData = atob(audioContent);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }

      const responseBlog = new Blob([audioArray], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(responseBlog);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();

    } catch (error) {
      console.error('Speech-to-speech error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Speech processing failed",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-purple-700">
              Free Voice Therapy Session
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className={`font-mono text-lg ${timeRemaining < 60000 ? 'text-red-600' : 'text-gray-700'}`}>
                {formatTime(timeRemaining)}
              </span>
              <span className="text-sm text-gray-500">remaining</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Recording Controls */}
          <div className="text-center space-y-4">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing || !isActive}
              size="lg"
              className={`
                relative transition-all duration-200 
                ${isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-purple-500 hover:bg-purple-600'
                }
              `}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Processing...
                </>
              ) : isRecording ? (
                <>
                  <MicOff className="w-5 h-5 mr-2" />
                  Stop Speaking
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  Start Speaking
                </>
              )}
            </Button>

            {isRecording && (
              <div className="text-red-500 font-medium animate-pulse">
                🔴 Listening... Click to stop and get AI response
              </div>
            )}

            {!isActive && (
              <div className="text-orange-600 font-medium">
                ⏰ Your free 5-minute session has ended
              </div>
            )}
          </div>

          {/* Conversation History */}
          {messages.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.isUser
                      ? 'bg-purple-100 ml-8 text-right'
                      : 'bg-white mr-8 text-left border'
                  }`}
                >
                  <div className={`font-medium text-sm ${
                    message.isUser ? 'text-purple-600' : 'text-gray-600'
                  }`}>
                    {message.isUser ? 'You' : 'AI Therapist'}
                  </div>
                  <div className="text-gray-800 mt-1">{message.text}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceConversation;
