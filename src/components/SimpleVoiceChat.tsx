
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
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStatus, setCurrentStatus] = useState('');
  const [isActive, setIsActive] = useState(false);
  
  // Audio state
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  
  // Refs for audio management
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInterruptedRef = useRef(false);

  useEffect(() => {
    // Initialize audio context
    openaiVoiceService.initializeAudioContext();
    
    // Welcome message
    const welcomeMessage: Message = {
      role: 'assistant',
      content: 'Hallo! Ik ben je AI-assistent. Klik op "Start Gesprek" en begin gewoon te praten.',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);

    // Cleanup on unmount
    return () => {
      stopConversation();
      openaiVoiceService.cleanup();
    };
  }, []);

  const startConversation = async () => {
    if (!isMicEnabled) {
      toast.error('Microfoon is uitgeschakeld');
      return;
    }

    setIsActive(true);
    setCurrentStatus('Gesprek gestart - begin te praten...');
    await startListening();
  };

  const stopConversation = () => {
    setIsActive(false);
    setIsListening(false);
    setIsProcessing(false);
    setIsPlayingAudio(false);
    setCurrentStatus('Gesprek gestopt');
    
    // Clean up audio and timeouts
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    
    openaiVoiceService.stopCurrentAudio();
  };

  const startListening = async () => {
    if (!isActive || isListening) return;

    try {
      setIsListening(true);
      setCurrentStatus('Luisteren...');
      isInterruptedRef.current = false;
      
      await openaiVoiceService.startRecording();
      
      // Set silence timeout - if no speech detected, process what we have
      silenceTimeoutRef.current = setTimeout(() => {
        if (isListening && !isInterruptedRef.current) {
          stopListeningAndProcess();
        }
      }, 3000); // 3 seconds of silence
      
    } catch (error) {
      console.error('Failed to start listening:', error);
      toast.error('Kon niet beginnen met luisteren');
      setIsListening(false);
      setCurrentStatus('Fout bij luisteren');
    }
  };

  const stopListeningAndProcess = async () => {
    if (!isListening) return;

    try {
      setIsListening(false);
      setIsProcessing(true);
      setCurrentStatus('Verwerken...');

      // Clear silence timeout
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }

      // Stop recording and get audio
      const audioBlob = await openaiVoiceService.stopRecording();
      
      if (audioBlob.size < 1000) { // Very small audio file, probably silence
        if (isActive) {
          setCurrentStatus('Geen spraak gedetecteerd, opnieuw luisteren...');
          setIsProcessing(false);
          setTimeout(() => startListening(), 500);
        }
        return;
      }

      // Step 1: Transcribe with Whisper
      setCurrentStatus('Transcriberen...');
      const transcript = await openaiVoiceService.transcribeAudio(audioBlob);

      if (!transcript.trim()) {
        if (isActive) {
          setCurrentStatus('Geen tekst gedetecteerd, opnieuw luisteren...');
          setIsProcessing(false);
          setTimeout(() => startListening(), 500);
        }
        return;
      }

      // Add user message
      const userMessage: Message = {
        role: 'user',
        content: transcript,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      // Step 2: Send to GPT-4o
      setCurrentStatus('AI denkt...');
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const aiResponse = await openaiVoiceService.generateChatResponse(transcript, conversationHistory);

      // Add AI message
      const aiMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Step 3: Convert to speech and play
      if (isSpeakerEnabled && isActive) {
        setCurrentStatus('Audio genereren...');
        setIsPlayingAudio(true);
        
        // Generate audio
        const { data, error } = await openaiVoiceService.supabase.functions.invoke('openai-text-to-speech', {
          body: {
            text: aiResponse,
            voice: 'nova'
          }
        });

        if (error) {
          console.error('TTS error:', error);
          toast.error('Fout bij audio generatie');
          setIsPlayingAudio(false);
          setIsProcessing(false);
          if (isActive) {
            setTimeout(() => startListening(), 500);
          }
          return;
        }

        // Play audio
        const audioData = `data:audio/mp3;base64,${data.audioContent}`;
        const audio = new Audio(audioData);
        currentAudioRef.current = audio;
        
        setCurrentStatus('AI spreekt...');
        
        audio.onended = () => {
          setIsPlayingAudio(false);
          setIsProcessing(false);
          currentAudioRef.current = null;
          
          // Automatically start listening again for next input
          if (isActive && !isInterruptedRef.current) {
            setCurrentStatus('Klaar om te luisteren...');
            setTimeout(() => startListening(), 1000);
          }
        };

        audio.onerror = () => {
          console.error('Audio playback error');
          setIsPlayingAudio(false);
          setIsProcessing(false);
          currentAudioRef.current = null;
          
          if (isActive) {
            setTimeout(() => startListening(), 500);
          }
        };

        await audio.play();
      } else {
        setIsProcessing(false);
        if (isActive) {
          setTimeout(() => startListening(), 500);
        }
      }

    } catch (error) {
      console.error('Error in voice processing:', error);
      toast.error('Er ging iets mis in het gesprek');
      setIsProcessing(false);
      setIsPlayingAudio(false);
      
      if (isActive) {
        setTimeout(() => startListening(), 1000);
      }
    }
  };

  // Barge-in: interrupt when user starts speaking during AI playback
  const handleBargein = () => {
    if (isPlayingAudio && currentAudioRef.current) {
      console.log('Barge-in detected - interrupting AI speech');
      isInterruptedRef.current = true;
      
      // Stop current audio
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setIsPlayingAudio(false);
      setIsProcessing(false);
      
      // Start listening immediately
      setCurrentStatus('Onderbroken - luisteren...');
      setTimeout(() => startListening(), 100);
    }
  };

  const toggleMicrophone = () => {
    setIsMicEnabled(!isMicEnabled);
    if (!isMicEnabled && isActive) {
      stopConversation();
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerEnabled(!isSpeakerEnabled);
    if (!isSpeakerEnabled && currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setIsPlayingAudio(false);
      if (isActive) {
        setTimeout(() => startListening(), 500);
      }
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
              AI Spraak Assistent
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
            {currentStatus && (
              <div className="flex justify-center">
                <div className={`px-4 py-2 rounded-lg text-sm ${
                  isListening ? 'bg-green-100 text-green-800' :
                  isProcessing ? 'bg-blue-100 text-blue-800' :
                  isPlayingAudio ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {currentStatus}
                </div>
              </div>
            )}
          </div>

          {/* Conversation Controls */}
          <div className="flex justify-center gap-4">
            {!isActive ? (
              <Button
                onClick={startConversation}
                disabled={!isMicEnabled}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
              >
                Start Gesprek
              </Button>
            ) : (
              <>
                <Button
                  onClick={stopConversation}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
                >
                  Stop Gesprek
                </Button>
                
                {/* Barge-in button - only show during AI speech */}
                {isPlayingAudio && (
                  <Button
                    onClick={handleBargein}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg animate-pulse"
                  >
                    Onderbreek AI
                  </Button>
                )}
              </>
            )}
          </div>
          
          <p className="text-center text-gray-600 mt-4 text-sm">
            {!isActive 
              ? 'Klik "Start Gesprek" om te beginnen'
              : isListening 
              ? 'Spreek nu... (automatisch verwerkt na stilte)'
              : isProcessing 
              ? 'Verwerken van je bericht...'
              : isPlayingAudio
              ? 'AI spreekt... (je kunt onderbreken)'
              : 'Klaar om te luisteren...'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleVoiceChat;
