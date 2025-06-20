
import React, { useState, useEffect } from 'react';
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
  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStatus, setCurrentStatus] = useState('');
  
  // Audio controls
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);

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
    setCurrentStatus('Gesprek gestart');
    await startVoiceLoop();
  };

  const stopConversation = () => {
    setIsActive(false);
    setIsRecording(false);
    setIsProcessing(false);
    setIsPlayingAudio(false);
    setCurrentStatus('Gesprek gestopt');
    openaiVoiceService.stopCurrentAudio();
  };

  const startVoiceLoop = async () => {
    if (!isActive) return;

    try {
      // Step 1: Start recording
      setIsRecording(true);
      setCurrentStatus('Luisteren... (spreek nu)');
      
      await openaiVoiceService.startRecording();
      
      // Record for 5 seconds or until manually stopped
      setTimeout(async () => {
        if (isRecording && isActive) {
          await processVoiceInput();
        }
      }, 5000);

    } catch (error) {
      console.error('Error in voice loop:', error);
      toast.error('Er ging iets mis met de microfoon');
      setIsRecording(false);
      setCurrentStatus('Fout opgetreden');
    }
  };

  const processVoiceInput = async () => {
    if (!isActive) return;

    try {
      setIsRecording(false);
      setIsProcessing(true);

      // Step 2: Stop recording and get audio
      setCurrentStatus('Audio verwerken...');
      const audioBlob = await openaiVoiceService.stopRecording();

      // Check if audio is too small (likely silence)
      if (audioBlob.size < 1000) {
        setCurrentStatus('Geen spraak gedetecteerd, opnieuw luisteren...');
        setIsProcessing(false);
        setTimeout(() => startVoiceLoop(), 1000);
        return;
      }

      // Step 3: Transcribe with Whisper
      setCurrentStatus('Transcriberen...');
      const transcript = await openaiVoiceService.transcribeAudio(audioBlob);

      if (!transcript.trim()) {
        setCurrentStatus('Geen tekst gedetecteerd, opnieuw luisteren...');
        setIsProcessing(false);
        setTimeout(() => startVoiceLoop(), 1000);
        return;
      }

      // Add user message
      const userMessage: Message = {
        role: 'user',
        content: transcript,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      // Step 4: Generate AI response with GPT-4o
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

      // Step 5: Generate and play speech
      if (isSpeakerEnabled && isActive) {
        setCurrentStatus('Audio genereren...');
        const audioDataUrl = await openaiVoiceService.textToSpeech(aiResponse, 'nova');

        setCurrentStatus('AI spreekt...');
        setIsPlayingAudio(true);
        setIsProcessing(false);

        // Play audio and wait for it to finish
        await openaiVoiceService.playAudio(audioDataUrl);
        
        setIsPlayingAudio(false);

        // Step 6: Restart the loop automatically
        if (isActive) {
          setCurrentStatus('Klaar om opnieuw te luisteren...');
          setTimeout(() => startVoiceLoop(), 1000);
        }
      } else {
        setIsProcessing(false);
        if (isActive) {
          setTimeout(() => startVoiceLoop(), 1000);
        }
      }

    } catch (error) {
      console.error('Error processing voice input:', error);
      toast.error('Er ging iets mis tijdens het verwerken');
      setIsProcessing(false);
      setIsPlayingAudio(false);
      
      if (isActive) {
        setTimeout(() => startVoiceLoop(), 2000);
      }
    }
  };

  const handleBargeIn = () => {
    if (isPlayingAudio) {
      console.log('Barge-in detected - interrupting AI speech');
      openaiVoiceService.stopCurrentAudio();
      setIsPlayingAudio(false);
      setIsProcessing(false);
      setCurrentStatus('Onderbroken - opnieuw luisteren...');
      setTimeout(() => startVoiceLoop(), 500);
    }
  };

  const toggleMicrophone = () => {
    setIsMicEnabled(!isMicEnabled);
    if (isMicEnabled && isActive) {
      stopConversation();
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerEnabled(!isSpeakerEnabled);
    if (isSpeakerEnabled && isPlayingAudio) {
      openaiVoiceService.stopCurrentAudio();
      setIsPlayingAudio(false);
      if (isActive) {
        setTimeout(() => startVoiceLoop(), 500);
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
                  isRecording ? 'bg-red-100 text-red-800' :
                  isProcessing ? 'bg-blue-100 text-blue-800' :
                  isPlayingAudio ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {currentStatus}
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
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
                
                {/* Manual stop recording button */}
                {isRecording && (
                  <Button
                    onClick={processVoiceInput}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                  >
                    Stop Opname
                  </Button>
                )}
                
                {/* Barge-in button */}
                {isPlayingAudio && (
                  <Button
                    onClick={handleBargeIn}
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
              : isRecording 
              ? 'Spreek nu... (automatisch gestopt na 5 seconden)'
              : isProcessing 
              ? 'Verwerken van je bericht...'
              : isPlayingAudio
              ? 'AI spreekt... (je kunt onderbreken)'
              : 'Wachten op volgende input...'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleVoiceChat;
