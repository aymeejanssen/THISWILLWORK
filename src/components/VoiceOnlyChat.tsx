
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, PhoneOff, Settings, Home, Volume2, VolumeX, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import { openaiVoiceService } from '../services/openaiVoiceService';
import ListeningIndicator from "./ListeningIndicator";

interface VoiceOnlyChatProps {
  onClose: () => void;
}

const VoiceOnlyChat = ({ onClose }: VoiceOnlyChatProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  // Mute states
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);

  // Conversation history for context
  const conversationHistory = useRef<Array<{role: string, content: string}>>([]);

  useEffect(() => {
    // Initialize audio context
    openaiVoiceService.initializeAudioContext();
    
    // Cleanup on unmount
    return () => {
      stopConversation();
      openaiVoiceService.cleanup();
    };
  }, []);

  const startConversation = async () => {
    if (!isMicrophoneEnabled) {
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
    conversationHistory.current = [];
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

      // Step 4: Generate AI response with GPT-4o
      setCurrentStatus('AI denkt...');
      const aiResponse = await openaiVoiceService.generateChatResponse(transcript, conversationHistory.current);

      // Update conversation history
      conversationHistory.current.push(
        { role: 'user', content: transcript },
        { role: 'assistant', content: aiResponse }
      );

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
    const nextState = !isMicrophoneEnabled;
    setIsMicrophoneEnabled(nextState);
    if (nextState === false && isActive) {
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
      <div
        className="w-full max-w-xl min-h-[60vh] flex flex-col items-center justify-center rounded-3xl border-0 shadow-xl backdrop-blur-md px-0 sm:px-0 animate-fade-in"
        style={{
          background: "linear-gradient(132deg, rgba(167,138,176,0.21) 0%, rgba(245,168,154,0.18) 40%, rgba(59,140,138,0.14) 100%)",
          boxShadow: "0 8px 32px 0 rgba(31,38,135,0.16)",
        }}
      >
        <CardHeader className="bg-transparent px-8 py-7 rounded-t-3xl w-full">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-3 text-purple-700">
              <Mic className="h-6 w-6" />
              AI Voice Chat
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} className="text-purple-600 hover:bg-purple-50">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-purple-600 hover:bg-purple-50">
                <Home className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col items-center justify-center w-full px-8 pb-6 bg-transparent">
          {!isActive ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6 w-full">
              <Button
                onClick={startConversation}
                className="relative bg-gradient-to-br from-purple-500 via-pink-400 to-red-400 hover:from-purple-600 hover:via-pink-500 hover:to-red-500 text-white w-32 h-32 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transform transition-all duration-300 text-2xl font-bold border-purple-200 border-4 mx-auto"
                disabled={!isMicrophoneEnabled}
                style={{ fontSize: 26 }}
              >
                Start
              </Button>
              <p className="text-gray-700 text-lg text-center font-medium">
                Tap to begin your session
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-between h-full w-full">
              <div className="flex-1 flex flex-col items-center justify-center p-4 w-full text-center">
                <ListeningIndicator isListening={isRecording && isMicrophoneEnabled} size={120} />
                <div className="mt-4 text-gray-800 text-lg font-semibold mb-2">Status:</div>
                <p className="whitespace-pre-wrap text-gray-600 min-h-[50px]">{currentStatus}</p>
              </div>

              <div className="flex items-center justify-around w-full p-4 border-t border-gray-200">
                <Button variant="outline" size="sm" onClick={toggleMicrophone} className="flex items-center gap-2">
                  {isMicrophoneEnabled ? <Mic /> : <MicOff />}
                  {isMicrophoneEnabled ? "Mute Mic" : "Unmute"}
                </Button>
                <Button variant="outline" size="sm" onClick={toggleSpeaker} className="flex items-center gap-2">
                  {isSpeakerEnabled ? <Volume2 /> : <VolumeX />}
                  {isSpeakerEnabled ? "Mute" : "Unmute"}
                </Button>
                <Button variant="destructive" size="sm" onClick={stopConversation} className="flex items-center gap-2">
                  <PhoneOff />
                  End Call
                </Button>
                
                {/* Barge-in button */}
                {isPlayingAudio && (
                  <Button
                    onClick={handleBargeIn}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg animate-pulse"
                  >
                    Onderbreek AI
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>

        {showSettings && (
          <div className="w-full px-8 py-6 border-t border-purple-100 bg-white/70 rounded-b-3xl">
            <h4 className="text-lg font-semibold text-purple-700 mb-4">Settings</h4>
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-700">Microphone:</label>
              <Button variant="outline" size="sm" onClick={toggleMicrophone}>
                {isMicrophoneEnabled ? "Mute" : "Unmute"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Speaker:</label>
              <Button variant="outline" size="sm" onClick={toggleSpeaker}>
                {isSpeakerEnabled ? "Mute" : "Unmute"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceOnlyChat;
