import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, X, Clock, Volume2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
interface VoiceConversationProps {
  onTimeUp: () => void;
  onClose: () => void;
  timeLimit: number; // in milliseconds
  assessmentResponses?: any; // Assessment responses to personalize the conversation
}
const VoiceConversation: React.FC<VoiceConversationProps> = ({
  onTimeUp,
  onClose,
  timeLimit,
  assessmentResponses
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isActive, setIsActive] = useState(true);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("Ready to start your intake session");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const {
    toast
  } = useToast();

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
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor(ms % 60000 / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  const startConversation = async () => {
    if (!isActive) return;
    setConversationStarted(true);
    setCurrentStatus("AI is reviewing your assessment...");
    setIsSpeaking(true);
    try {
      // Get personalized welcome message based on assessment
      const {
        data,
        error
      } = await supabase.functions.invoke('openai-voice-chat', {
        body: {
          action: 'start_session',
          assessmentResponses: assessmentResponses
        }
      });
      if (error) throw error;
      if (data?.response) {
        // Convert the personalized response to speech
        const ttsResponse = await supabase.functions.invoke('openai-voice-chat', {
          body: {
            action: 'speak',
            text: data.response
          }
        });
        if (ttsResponse.error) throw ttsResponse.error;
        if (ttsResponse.data?.audioContent) {
          await playAudio(ttsResponse.data.audioContent);
        }
      }
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: "Error",
        description: "Could not start intake session",
        variant: "destructive"
      });
    } finally {
      setIsSpeaking(false);
      startListening();
    }
  };
  const playAudio = async (base64Audio: string): Promise<void> => {
    return new Promise(resolve => {
      try {
        const audioData = atob(base64Audio);
        const audioArray = new Uint8Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          audioArray[i] = audioData.charCodeAt(i);
        }
        const audioBlob = new Blob([audioArray], {
          type: 'audio/mpeg'
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.play();
      } catch (error) {
        console.error('Error playing audio:', error);
        resolve();
      }
    });
  };
  const startListening = async () => {
    if (!isActive || isSpeaking) return;
    try {
      setCurrentStatus("Listening... speak naturally");
      setIsListening(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      streamRef.current = stream;

      // Set up audio analysis for silence detection
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 2048;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = () => {
        processUserSpeech();
      };
      mediaRecorderRef.current.start();

      // Monitor for silence
      const checkSilence = () => {
        if (!analyserRef.current || !isListening) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        if (average < 10) {
          // Very quiet
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              stopListening();
            }, 2000); // 2 seconds of silence
          }
        } else {
          // User is speaking, clear silence timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        }
        if (isListening) {
          requestAnimationFrame(checkSilence);
        }
      };
      checkSilence();
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive"
      });
      setIsListening(false);
    }
  };
  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };
  const processUserSpeech = async () => {
    if (audioChunksRef.current.length === 0) {
      startListening(); // Continue listening
      return;
    }
    setIsProcessing(true);
    setCurrentStatus("Processing your message...");
    try {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: 'audio/webm'
      });
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      // Step 1: Transcribe speech to text
      const transcribeResponse = await supabase.functions.invoke('openai-voice-chat', {
        body: {
          action: 'transcribe',
          audio: base64Audio
        }
      });
      if (transcribeResponse.error) {
        throw new Error(transcribeResponse.error.message);
      }
      const userText = transcribeResponse.data.text;
      if (!userText || userText.trim().length === 0) {
        startListening(); // Continue listening if no speech detected
        return;
      }
      console.log('User said:', userText);

      // Step 2: Get AI response
      const chatResponse = await supabase.functions.invoke('openai-voice-chat', {
        body: {
          action: 'chat',
          text: `As a compassionate AI therapist, respond conversationally to: "${userText}"`
        }
      });
      if (chatResponse.error) {
        throw new Error(chatResponse.error.message);
      }
      const aiText = chatResponse.data.response;
      console.log('AI responds:', aiText);

      // Step 3: Convert AI response to speech and play it
      setCurrentStatus("AI is responding...");
      setIsSpeaking(true);
      const ttsResponse = await supabase.functions.invoke('openai-voice-chat', {
        body: {
          action: 'speak',
          text: aiText
        }
      });
      if (ttsResponse.error) {
        throw new Error(ttsResponse.error.message);
      }

      // Play the AI's voice response
      await playAudio(ttsResponse.data.audioContent);
    } catch (error) {
      console.error('Speech processing error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Speech processing failed",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setIsSpeaking(false);

      // Continue the conversation loop
      if (isActive && !isSpeaking) {
        setTimeout(() => {
          startListening();
        }, 500);
      }
    }
  };
  const endConversation = () => {
    setIsActive(false);
    stopListening();
    onClose();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-purple-700">
              Intake Session
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className={`font-mono text-lg ${timeRemaining < 60000 ? 'text-red-600' : 'text-gray-700'}`}>
                {formatTime(timeRemaining)}
              </span>
              <span className="text-sm text-gray-500">remaining</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={endConversation}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!conversationStarted ? <div className="text-center space-y-6">
              <div className="space-y-4">
                <Volume2 className="h-16 w-16 text-purple-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Start the Conversation</h3>
                  <p className="text-gray-600 text-sm">
                    I'll start by discussing your assessment responses, then we can explore your thoughts and feelings together.
                  </p>
                </div>
              </div>
              
              <Button onClick={startConversation} disabled={!isActive} size="lg" className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4">
                <Mic className="w-5 h-5 mr-2" />
                Start Intake Session
              </Button>
            </div> : <div className="text-center space-y-6">
              {/* Status Display */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center space-x-3">
                  {isListening && <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>}
                  {isProcessing && <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>}
                  {isSpeaking && <Volume2 className="w-4 h-4 text-green-500 animate-pulse" />}
                </div>
                <p className="text-sm text-gray-700 font-medium mt-2">{currentStatus}</p>
              </div>

              {/* Visual Feedback */}
              <div className="space-y-4">
                {isListening && <div className="flex justify-center space-x-1">
                    {[...Array(5)].map((_, i) => <div key={i} className="w-2 bg-red-500 rounded-full animate-pulse" style={{
                height: Math.random() * 30 + 10,
                animationDelay: `${i * 0.1}s`
              }}></div>)}
                  </div>}

                {isSpeaking && <div className="flex justify-center space-x-1">
                    {[...Array(5)].map((_, i) => <div key={i} className="w-2 bg-green-500 rounded-full animate-bounce" style={{
                height: Math.random() * 30 + 10,
                animationDelay: `${i * 0.2}s`
              }}></div>)}
                  </div>}
              </div>

              {!isActive && <div className="text-orange-600 font-medium">
                  ⏰ Your free 5-minute session has ended
                </div>}

              <Button onClick={endConversation} variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                End Session
              </Button>
            </div>}
        </CardContent>
      </Card>
    </div>;
};
export default VoiceConversation;