
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Home, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { openaiVoiceService } from '../services/openaiVoiceService';

interface SimpleVoiceChatProps {
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SimpleVoiceChat = ({ onClose }: SimpleVoiceChatProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  // Audio state
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);

  useEffect(() => {
    // Initialize audio context
    openaiVoiceService.initializeAudioContext();
    
    // Welcome message
    const welcomeMessage: Message = {
      role: 'assistant',
      content: 'Hallo! Ik ben je AI-assistent. Druk op de microfoon en begin te praten.',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);

    // Cleanup on unmount
    return () => {
      openaiVoiceService.cleanup();
    };
  }, []);

  const startRecording = async () => {
    if (!isMicEnabled) {
      toast.error('Microfoon is uitgeschakeld');
      return;
    }

    try {
      setIsRecording(true);
      setCurrentTranscript('Aan het luisteren...');
      await openaiVoiceService.startRecording();
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Kon niet beginnen met opnemen. Controleer je microfoon.');
      setIsRecording(false);
      setCurrentTranscript('');
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    try {
      setIsRecording(false);
      setIsProcessing(true);
      setCurrentTranscript('Verwerken...');

      // Stop recording and get audio
      const audioBlob = await openaiVoiceService.stopRecording();
      console.log('Recording stopped, audio blob size:', audioBlob.size);

      // Transcribe audio
      setCurrentTranscript('Transcriberen...');
      const transcript = await openaiVoiceService.transcribeAudio(audioBlob);
      console.log('Transcript:', transcript);

      if (!transcript.trim()) {
        toast.error('Geen spraak gedetecteerd. Probeer opnieuw.');
        setCurrentTranscript('');
        setIsProcessing(false);
        return;
      }

      // Add user message
      const userMessage: Message = {
        role: 'user',
        content: transcript,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setCurrentTranscript('');

      // Generate AI response
      setCurrentTranscript('AI aan het denken...');
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const aiResponse = await openaiVoiceService.generateChatResponse(transcript, conversationHistory);
      console.log('AI Response:', aiResponse);

      // Add AI message
      const aiMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Convert to speech and play
      if (isSpeakerEnabled) {
        setCurrentTranscript('Audio genereren...');
        setIsPlayingAudio(true);
        await openaiVoiceService.textToSpeech(aiResponse);
        setIsPlayingAudio(false);
      }

      setCurrentTranscript('');
      setIsProcessing(false);
    } catch (error) {
      console.error('Error in voice processing:', error);
      toast.error('Er ging iets mis. Probeer opnieuw.');
      setCurrentTranscript('');
      setIsProcessing(false);
      setIsPlayingAudio(false);
    }
  };

  const toggleMicrophone = () => {
    setIsMicEnabled(!isMicEnabled);
    if (isRecording) {
      stopRecording();
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerEnabled(!isSpeakerEnabled);
    if (!isSpeakerEnabled) {
      openaiVoiceService.stopCurrentAudio();
      setIsPlayingAudio(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{
        background: "linear-gradient(135deg, #f5f3ff 0%, #f9e8fd 50%, #cef2fd 100%)",
      }}
    >
      <Card
        className="w-full max-w-xl min-h-[70vh] flex flex-col rounded-3xl border-0 shadow-xl"
        style={{
          background: "linear-gradient(132deg, rgba(167,138,176,0.21) 0%, rgba(245,168,154,0.18) 40%, rgba(59,140,138,0.14) 100%)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 8px 32px 0 rgba(31,38,135,0.16)",
        }}
      >
        <CardHeader className="bg-transparent px-8 py-7">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-3 text-purple-700">
              <Mic className="h-6 w-6" />
              Spraak Chat
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleMicrophone} className="text-purple-600 hover:bg-purple-50">
                {isMicEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleSpeaker} className="text-purple-600 hover:bg-purple-50">
                {isSpeakerEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-purple-600 hover:bg-purple-50">
                <Home className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col px-8 pb-6 bg-transparent">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/70 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            
            {/* Current status */}
            {currentTranscript && (
              <div className="flex justify-center">
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm">
                  {currentTranscript}
                </div>
              </div>
            )}
          </div>

          {/* Voice Control */}
          <div className="flex justify-center">
            <Button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={(e) => {
                e.preventDefault();
                startRecording();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                stopRecording();
              }}
              disabled={isProcessing || !isMicEnabled || isPlayingAudio}
              className={`w-24 h-24 rounded-full text-white font-bold transition-all duration-200 ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110'
                  : isProcessing || isPlayingAudio
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 hover:scale-105'
              }`}
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : isPlayingAudio ? (
                <Volume2 className="h-8 w-8" />
              ) : isRecording ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
          </div>
          
          <p className="text-center text-gray-600 mt-4 text-sm">
            {isProcessing 
              ? 'Een moment geduld...'
              : isPlayingAudio
              ? 'AI spreekt...'
              : isRecording 
              ? 'Laat los om te stoppen'  
              : 'Houd ingedrukt om te spreken'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleVoiceChat;
