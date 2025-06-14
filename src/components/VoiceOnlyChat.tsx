import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff, Settings, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { voiceService, allVoices } from '../services/voiceService';
import AudioLevelIndicator from './AudioLevelIndicator';
import VoiceInput from './VoiceInput';
import ListeningIndicator from "./ListeningIndicator";

// TypeScript declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface VoiceOnlyChatProps {
  onClose: () => void;
  userProfile?: {
    name?: string;
    preferredLanguage?: string;
    currentStruggles?: string[];
    culturalBackground?: string;
  };
}

const limitedVoices = [
  // Choose top voices: 3 ElevenLabs voices and 1 Google (change as needed)
  // You can update these to reflect your actual favorite voices!
  ...allVoices.filter(v => v.provider === 'elevenlabs' && v.type === 'tts').slice(0, 3),
  ...allVoices.filter(v => v.provider === 'google').slice(0, 1)
];

const VoiceOnlyChat = ({ onClose, userProfile }: VoiceOnlyChatProps) => {
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [message, setMessage] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [isCallOngoing, setIsCallOngoing] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>(limitedVoices[0]?.id || '9BWtsMINqrJLrRacOk9x');
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [audioLevel, setAudioLevel] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isVoiceInputListening, setIsVoiceInputListening] = useState(false);

  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Ref to track AudioContext: we will ONLY close this at the very end
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioAnalyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isListeningRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Add this ref for cleanup guard
  const audioContextCleaningRef = useRef(false);

  // Audio level monitoring (changed: ensure audioContext is reused and not closed prematurely)
  const startAudioLevelMonitoring = useCallback(async () => {
    console.log('🎤 Starting audio monitoring...');
    // Do NOT create a new AudioContext if we have one
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 44100 });
      console.log('[Audio] Created AudioContext for monitoring');
    } else {
      console.log('[Audio] AudioContext already exists');
    }
    if (!mediaStreamRef.current) {
      console.error('❌ No media stream for monitoring');
      return;
    }
    try {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);

      audioAnalyzerRef.current = audioContextRef.current.createAnalyser();
      audioAnalyzerRef.current.fftSize = 256;
      audioAnalyzerRef.current.smoothingTimeConstant = 0.3;

      source.connect(audioAnalyzerRef.current);

      const dataArray = new Uint8Array(audioAnalyzerRef.current.frequencyBinCount);

      const updateLevel = () => {
        if (!audioAnalyzerRef.current || !conversationStarted) return;

        audioAnalyzerRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const level = Math.min(100, (average / 128) * 100);

        setAudioLevel(level);

        if (conversationStarted) {
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        }
      };
      updateLevel();
      console.log('✅ Audio monitoring started');
    } catch (error) {
      console.error('❌ Audio monitoring error:', error);
    }
  }, [conversationStarted]);

  // Request microphone permission (no changes to AudioContext logic here)
  const requestMicrophonePermission = async () => {
    try {
      console.log('🎤 Requesting microphone...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      mediaStreamRef.current = stream;
      setMicrophonePermission('granted');
      console.log('✅ Microphone granted');
      
      await startAudioLevelMonitoring();
      toast.success("Microphone access granted!");
      return true;
    } catch (error) {
      console.error('❌ Microphone denied:', error);
      setMicrophonePermission('denied');
      toast.error("Microphone access required for voice conversation.");
      return false;
    }
  };

  // Stop listening function
  const stopListening = useCallback(() => {
    console.log("🎙️ stopListening called");
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    if (recognitionRef.current && isListeningRef.current) {
      console.log("🎙️ Actually stopping speech recognition...");
      try {
        recognitionRef.current.stop();
        console.log("🎙️ Speech recognition stopped");
      } catch (error) {
        console.error("🎙️ Error stopping recognition:", error);
      }
      isListeningRef.current = false;
      setIsUserSpeaking(false);
    }
  }, []);

  // Setup speech recognition with improved error handling
  const setupSpeechRecognition = useCallback(() => {
    console.log('🎙️ Setting up speech recognition...');
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Speech Recognition not supported. Please use Chrome.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    // Optimized settings for continuous listening
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => {
      console.log("🎙️ ✅ Speech recognition STARTED");
      setIsUserSpeaking(true);
      isListeningRef.current = true;
      setLiveTranscript('');
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      console.log("🎙️ Speech result received");
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        console.log("🎙️ Result:", transcript, "Final:", event.results[i].isFinal);
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update live transcript
      setLiveTranscript(interimTranscript + finalTranscript);
      
      if (finalTranscript.trim()) {
        console.log("🔄 Processing final transcript:", finalTranscript);
        setTranscript(finalTranscript);
        
        // Stop listening and process the message
        stopListening();
        
        // Process the message after a short delay
        setTimeout(() => {
          if (finalTranscript.trim() && !isProcessingResponse) {
            generateAIResponse(finalTranscript.trim());
          }
        }, 300);
      }
    };

    recognitionRef.current.onend = () => {
      console.log("🎙️ Speech recognition ended");
      setIsUserSpeaking(false);
      isListeningRef.current = false;
      
      // Auto restart if conversation is ongoing and not processing
      if (conversationStarted && isMicrophoneEnabled && !isAssistantSpeaking && 
          !isProcessingResponse && microphonePermission === 'granted') {
        console.log("🔄 Auto restarting speech recognition...");
        restartTimeoutRef.current = setTimeout(() => {
          startListening();
        }, 1000);
      }
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("🎙️ Speech error:", event.error);
      setIsUserSpeaking(false);
      isListeningRef.current = false;
      
      if (event.error === 'not-allowed') {
        setMicrophonePermission('denied');
        toast.error("Microphone access denied.");
      } else if (event.error !== 'aborted') {
        console.error("Speech recognition error:", event.error);
        // Auto restart on recoverable errors
        if (conversationStarted && isMicrophoneEnabled && microphonePermission === 'granted') {
          restartTimeoutRef.current = setTimeout(() => {
            console.log("🔄 Restarting after error:", event.error);
            startListening();
          }, 2000);
        }
      }
    };

    console.log('✅ Speech recognition setup complete');
  }, [conversationStarted, isMicrophoneEnabled, isAssistantSpeaking, isProcessingResponse, microphonePermission, stopListening]);

  // Start listening with improved reliability
  const startListening = useCallback(() => {
    console.log("🎙️ startListening called - checking conditions...", {
      hasRecognition: !!recognitionRef.current,
      isListening: isListeningRef.current,
      isAssistantSpeaking,
      isProcessingResponse,
      micPermission: microphonePermission,
      conversationStarted,
      isMicrophoneEnabled
    });

    if (!recognitionRef.current) {
      console.log("❌ No recognition object - setting up...");
      setupSpeechRecognition();
      setTimeout(() => startListening(), 500);
      return;
    }

    if (isListeningRef.current) {
      console.log("❌ Already listening, skipping");
      return;
    }

    if (isAssistantSpeaking || isProcessingResponse) {
      console.log("❌ Assistant speaking or processing, skipping");
      return;
    }

    if (microphonePermission !== 'granted') {
      console.log("❌ No microphone permission");
      return;
    }

    if (!conversationStarted || !isMicrophoneEnabled) {
      console.log("❌ Conversation not started or mic disabled");
      return;
    }

    try {
      console.log("🎙️ ACTUALLY starting speech recognition...");
      recognitionRef.current.start();
      console.log("🎙️ Speech recognition start() called successfully");
    } catch (error) {
      console.error("🎙️ Start listening error:", error);
      // If already started, just continue
      if (error.name === 'InvalidStateError') {
        console.log("🎙️ Recognition already running");
        isListeningRef.current = true;
        setIsUserSpeaking(true);
      } else {
        // Retry after a short delay for other errors
        restartTimeoutRef.current = setTimeout(() => {
          console.log("🎙️ Retrying start listening after error...");
          startListening();
        }, 1000);
      }
    }
  }, [isAssistantSpeaking, isProcessingResponse, microphonePermission, conversationStarted, isMicrophoneEnabled, setupSpeechRecognition]);

  // Handle VoiceInput transcript
  const handleVoiceInputTranscript = async (transcript: string) => {
    if (!transcript.trim() || isProcessingResponse) return;
    setTranscript(transcript);
    setIsProcessingResponse(true);

    try {
      // Use the same response generation as before (AI/agent response, TTS, conversation history)
      const selectedVoiceOption = allVoices.find(v => v.id === selectedVoice);
      if (selectedVoiceOption?.type === 'agent') {
        const aiResponse = await voiceService.sendMessageToAgent(selectedVoice, transcript);
        setConversationHistory(prev => [...prev, `User: ${transcript}`, `AI: ${aiResponse}`]);
      } else {
        const conversationContext = [
          ...conversationHistory,
          `User: ${transcript}`
        ].join('\n');

        const systemPrompt = `You are a warm, empathetic AI wellness coach. Keep responses conversational, supportive, and under 100 words. Focus on ${userProfile?.currentStruggles?.join(', ') || 'general wellness'}. Respond naturally as if speaking aloud.`;

        const { data, error } = await supabase.functions.invoke('generate-assessment-insights', {
          body: {
            prompt: transcript,
            context: conversationContext,
            systemPrompt: systemPrompt,
            maxTokens: 150
          }
        });

        if (error) {
          console.error('🤖 AI response error:', error);
          throw error;
        }

        const aiResponse = data?.response || "I understand. Could you tell me more about that?";
        setConversationHistory(prev => [...prev, `User: ${transcript}`, `AI: ${aiResponse}`]);
        await speak(aiResponse);
      }
    } catch (error) {
      console.error('🤖 AI error:', error);
      const fallbackResponse = "I'm here to listen. Please continue sharing what's on your mind.";
      await speak(fallbackResponse);
    } finally {
      setIsProcessingResponse(false);
      setTranscript('');
    }
  };

  // Generate AI response
  const generateAIResponse = async (userMessage: string) => {
    if (!userMessage.trim() || isProcessingResponse) return;
    
    setIsProcessingResponse(true);
    console.log('🤖 Generating response for:', userMessage);

    try {
      const selectedVoiceOption = allVoices.find(v => v.id === selectedVoice);
      
      if (selectedVoiceOption?.type === 'agent') {
        console.log('🤖 Using ElevenLabs agent:', selectedVoice);
        const aiResponse = await voiceService.sendMessageToAgent(selectedVoice, userMessage);
        setConversationHistory(prev => [...prev, `User: ${userMessage}`, `AI: ${aiResponse}`]);
      } else {
        const conversationContext = [
          ...conversationHistory,
          `User: ${userMessage}`
        ].join('\n');

        const systemPrompt = `You are a warm, empathetic AI wellness coach. Keep responses conversational, supportive, and under 100 words. Focus on ${userProfile?.currentStruggles?.join(', ') || 'general wellness'}. Respond naturally as if speaking aloud.`;

        // ADDED: log before calling backend
        console.log('[VoiceOnlyChat] Invoking backend AI for:', userMessage, { conversationContext, systemPrompt });

        const { data, error } = await supabase.functions.invoke('generate-assessment-insights', {
          body: {
            prompt: userMessage,
            context: conversationContext,
            systemPrompt: systemPrompt,
            maxTokens: 150
          }
        });

        // ADDED: log exact error and data
        if (error) {
          console.error('🤖 AI response error:', error);
          toast.error(`AI backend error: ${error.message || error}`);
        }

        if (!error && data?.response) {
          const aiResponse = data.response;
          console.log('🤖 AI response:', aiResponse);
          setConversationHistory(prev => [...prev, `User: ${userMessage}`, `AI: ${aiResponse}`]);
          await speak(aiResponse);
        } else {
          // If backend fails or returns no response, fallback once
          console.warn('[VoiceOnlyChat] No AI response, using fallback.');
          const fallbackResponse = "Sorry, I didn't catch that. Could you say it another way?";
          setConversationHistory(prev => [...prev, `User: ${userMessage}`, `AI: ${fallbackResponse}`]);
          await speak(fallbackResponse);
        }
      }
      
    } catch (error) {
      console.error('🤖 AI error:', error);
      toast.error("AI error: " + (error?.message || error));
      const fallbackResponse = "I'm here to listen. Please continue sharing what's on your mind.";
      await speak(fallbackResponse);
    } finally {
      setIsProcessingResponse(false);
      // Clear transcript after processing
      setLiveTranscript('');
      setTranscript('');
    }
  };

  // Speak function
  const speak = async (text: string) => {
    if (!isSpeakerEnabled || !text.trim()) return;
    
    console.log('🔊 Speaking:', text.substring(0, 50) + '...');
    setIsAssistantSpeaking(true);
    
    try {
      await voiceService.speak(text, selectedVoice);
      console.log('🔊 Finished speaking');
    } catch (error) {
      console.error('🔊 Speech error:', error);
      toast.error("Could not play response audio.");
    } finally {
      setIsAssistantSpeaking(false);
      
      // Restart listening after speaking
      if (conversationStarted && isMicrophoneEnabled && microphonePermission === 'granted') {
        setTimeout(() => {
          startListening();
        }, 500);
      }
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    console.log('🔧 Initializing speech recognition...');
    setupSpeechRecognition();
    
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [setupSpeechRecognition]);

  // Start conversation
  const startConversation = async () => {
    console.log('🚀 Starting conversation...');
    if (microphonePermission !== 'granted') {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) return;
    }

    setIsConnecting(true);
    // Shorten connection delay dramatically
    await new Promise(resolve => setTimeout(resolve, 250));
    setIsConnecting(false);
    setConversationStarted(true);
    setIsCallOngoing(true);

    // NO artificial delays - immediately start speech
    if (isMicrophoneEnabled && microphonePermission === 'granted') {
      setTimeout(() => {
        console.log('🎙️ First attempt to start listening...');
        startListening();
        setTimeout(() => {
          if (!isListeningRef.current) {
            console.log('🎙️ BACKUP attempt to start listening...');
            startListening();
          }
        }, 500);
        toast.success("Voice recognition started! Start speaking.");
      }, 100);
    }

    // Immediate initial greeting
    const selectedVoiceOption = allVoices.find(v => v.id === selectedVoice);
    if (selectedVoiceOption?.type !== 'agent') {
      const greeting = getPersonalizedGreeting();
      speak(greeting);
    }
  };

  // End conversation
  const endConversation = () => {
    setConversationStarted(false);
    setIsCallOngoing(false);
    stopListening();
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setTranscript('');
    setMessage('');
    setLiveTranscript('');
    setConversationHistory([]);
    setIsProcessingResponse(false);
    setAudioLevel(0);
    toast.message("Conversation ended.");
  };

  // Toggle microphone
  const toggleMicrophone = () => {
    const newState = !isMicrophoneEnabled;
    setIsMicrophoneEnabled(newState);
    
    if (newState && conversationStarted && microphonePermission === 'granted') {
      setTimeout(() => startListening(), 500);
    } else if (!newState) {
      stopListening();
    }
  };

  // Toggle speaker
  const toggleSpeaker = () => {
    if (isSpeakerEnabled) {
      voiceService.stopCurrentAudio();
    }
    setIsSpeakerEnabled(!isSpeakerEnabled);
  };

  // Test voice
  const testVoice = () => {
    const testText = "Hi there! This is how I sound. I'm here to support you with warmth and understanding.";
    speak(testText);
  };

  // Get personalized greeting
  const getPersonalizedGreeting = () => {
    if (!userProfile) {
      return "Hi there! I'm your AI wellness companion. I'm here to listen and support you. What's on your mind today?";
    }

    const name = userProfile.name || 'dear';
    const struggles = userProfile.currentStruggles?.join(', ') || 'what you\'re going through';
    
    return `Hi ${name}! I'm really glad you're here. I know it takes courage to reach out, especially when dealing with ${struggles}. I'm here to listen and support you. What's been on your mind lately?`;
  };

  // Set voice service enabled state
  useEffect(() => {
    voiceService.setEnabled(isSpeakerEnabled);
  }, [isSpeakerEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      voiceService.cleanup();
    };
  }, []);

  // Clean up ONLY ONCE at true end of conversation or component unmount!
  const cleanUpAudioResources = useCallback(() => {
    console.log('[Audio] Cleaning up audio resources...');
    const ctx = audioContextRef.current;
    if (!ctx) {
      console.log('[Audio] No AudioContext to clean.');
      return;
    }
    if (ctx.state === 'closed') {
      console.log('[Audio] AudioContext already closed; cleanup only.');
      audioContextRef.current = null;
      return;
    }
    if (audioContextCleaningRef.current) {
      console.log('[Audio] Cleanup already in progress!');
      return;
    }
    audioContextCleaningRef.current = true;
    try {
      ctx.close()
        .then(() => {
          console.log('[Audio] AudioContext closed');
        })
        .catch((e) => {
          if (e?.name === 'InvalidStateError' || ctx.state === 'closed') {
            console.log('[Audio] Tried to close AudioContext, but it was already closed.');
          } else {
            console.warn('[Audio] Error closing AudioContext:', e);
          }
        })
        .finally(() => {
          audioContextRef.current = null;
          audioContextCleaningRef.current = false;
        });
    } catch (e) {
      // Synchronous error: this should not happen but let's cover it.
      if (e?.name === 'InvalidStateError' || ctx.state === 'closed') {
        console.log('[Audio] (Sync) Already closed, safe to ignore.');
      } else {
        console.warn('[Audio] (Sync) Error closing AudioContext:', e);
      }
      audioContextRef.current = null;
      audioContextCleaningRef.current = false;
    }

    if (audioAnalyzerRef.current) {
      try {
        audioAnalyzerRef.current.disconnect();
      } catch {}
      audioAnalyzerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        background: "linear-gradient(135deg, #f5f3ff 0%, #f9e8fd 50%, #cef2fd 100%)",
      }}
    >
      <div
        className="w-full max-w-xl min-h-[60vh] flex flex-col items-center justify-center rounded-3xl border-0 shadow-xl backdrop-blur-md px-0 sm:px-0 animate-fade-in"
        style={{
          background:
            "linear-gradient(132deg, rgba(167,138,176,0.21) 0%, rgba(245,168,154,0.18) 40%, rgba(59,140,138,0.14) 100%)",
          boxShadow: "0 8px 32px 0 rgba(31,38,135,0.16)",
        }}
      >
        <CardHeader className="bg-transparent px-8 py-7 rounded-t-3xl w-full">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-3 text-purple-700">
              <Phone className="h-6 w-6" />
              Your Therapy Session
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
                className="text-purple-600 hover:bg-purple-50"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-purple-600 hover:bg-purple-50"
              >
                <Home className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center w-full px-8 pb-6 bg-transparent">
          {!conversationStarted ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6 w-full">
              {microphonePermission === "denied" && (
                <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-700 text-sm text-center">
                    Microphone access is required. Please enable microphone access and refresh the page.
                  </p>
                </div>
              )}
              <div className="mb-4 w-full max-w-sm">
                <label className="block text-sm font-medium text-gray-800 mb-2 text-center">
                  Choose Your AI Voice
                </label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger
                    className="w-full bg-white/70 border-purple-300 border-2 rounded-lg text-gray-900 justify-center text-center font-medium text-lg h-14 shadow-md"
                  >
                    <div className="w-full flex justify-center items-center text-center">
                      <SelectValue
                        placeholder="Select voice"
                        className="w-full text-center font-medium"
                      />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {limitedVoices.map((voice) => (
                      <SelectItem
                        key={voice.id}
                        value={voice.id}
                        className="flex flex-col items-center text-center w-full px-0 py-2"
                      >
                        <span className="font-medium w-full text-center text-base">
                          {voice.name}
                        </span>
                        {voice.description && (
                          <span className="text-xs text-gray-500 w-full text-center block">
                            {voice.description}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testVoice}
                  className="mt-3 w-full flex justify-center items-center font-medium text-base bg-white/60 border-2 border-gray-200 shadow"
                  disabled={isAssistantSpeaking}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span role="img" aria-label="music">🎵</span> Test Voice
                  </span>
                </Button>
              </div>
              <Button
                onClick={startConversation}
                className="relative bg-gradient-to-br from-purple-500 via-pink-400 to-red-400 hover:from-purple-600 hover:via-pink-500 hover:to-red-500 text-white w-32 h-32 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transform transition-all duration-300 text-2xl font-bold border-purple-200 border-4 mx-auto"
                disabled={isConnecting || microphonePermission === 'denied'}
                style={{ fontSize: 26 }}
              >
                {isConnecting ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mb-2"></div>
                    <span className="text-sm">Connecting...</span>
                  </div>
                ) : (
                  "Start"
                )}
              </Button>
              <p className="text-gray-700 text-lg text-center font-medium">
                {microphonePermission === 'denied'
                  ? "Please allow microphone access to start"
                  : "Tap to begin your session"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-between h-full w-full">
              <div className="flex-1 flex flex-col items-center justify-center p-4 w-full">
                <div className="mb-2 flex flex-col items-center justify-center">
                  {/* Show cloud animation when listening */}
                  <ListeningIndicator
                    isListening={isListeningRef.current}
                    size={120}
                  />
                </div>
                {/* VoiceInput stays for handling transcript but UI is now cloud only */}
                <div className="sr-only">
                  <VoiceInput
                    onTranscript={handleVoiceInputTranscript}
                    isListening={isVoiceInputListening}
                    onListeningChange={setIsVoiceInputListening}
                  />
                </div>
                {/* Transcript textarea and live transcript are now hidden */}
                {/* <Textarea
                  value={transcript}
                  placeholder="Recognized transcript will appear here."
                  readOnly
                  className="min-h-[70px] bg-gray-50 border-2 border-gray-200 text-sm mb-2"
                /> */}
                {/* <div className="mt-4 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🎙️ Live Speech Recognition:
                  </label>
                  <Textarea
                    value={liveTranscript}
                    placeholder="Your speech will appear here in real-time..."
                    readOnly
                    className="min-h-[100px] bg-gray-50 border-2 border-gray-200 text-sm"
                  />
                </div> */}
                {/* State descriptions are now hidden or replaced */}
                {/* <div className="mb-4 text-xs text-gray-500 italic">
                  {isVoiceInputListening
                    ? "Listening... Speak your message."
                    : "Click 'Speak Answer' to start voice input."}
                </div> */}
              </div>
              {/* Conversation status and controls remain */}
              <div className="mt-6 mb-4">
                <AudioLevelIndicator 
                  audioLevel={audioLevel} 
                  isActive={isMicrophoneEnabled && microphonePermission === 'granted'} 
                />
                {/* ... keep existing status and indicators ... */}
                <div className="mt-2 text-xs text-gray-500">
                  Audio Level: {Math.round(audioLevel)}% | Mic: {isMicrophoneEnabled ? 'On' : 'Off'}
                </div>
              </div>
              {/* Conversation controls */}
              <div className="flex items-center justify-around w-full p-4 border-t border-gray-200">
                {/* ... keep existing controls ... */}
                {/* ... Button row unchanged ... */}
              </div>
            </div>
          )}
        </CardContent>

        {showSettings && (
          <div className="w-full px-8 py-6 border-t border-purple-100 bg-white/70 rounded-b-3xl">
            <h4 className="text-lg font-semibold text-purple-700 mb-4">Settings</h4>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Voice Selection
              </label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger className="w-full bg-white/70 border-purple-200 border-2 rounded-lg text-gray-900 justify-center text-center font-medium text-lg h-14 shadow-md">
                  <div className="w-full flex justify-center items-center text-center">
                    <SelectValue
                      placeholder="Select voice"
                      className="w-full text-center font-medium"
                    />
                  </div>
                </SelectTrigger>
                <SelectContent className="w-full">
                  {limitedVoices.map((voice) => (
                    <SelectItem
                      key={voice.id}
                      value={voice.id}
                      className="flex flex-col items-center text-center w-full px-0 py-2"
                    >
                      <span className="font-medium w-full text-center text-base">
                        {voice.name}
                      </span>
                      {voice.description && (
                        <span className="text-xs text-gray-500 w-full text-center block">
                          {voice.description}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={testVoice}
                className="mt-2 w-full flex justify-center items-center font-medium text-base bg-white/60 border-2 border-gray-200 shadow"
                disabled={isAssistantSpeaking}
              >
                <span className="flex items-center justify-center gap-2">
                  <span role="img" aria-label="music">🎵</span> Test Voice
                </span>
              </Button>
            </div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-700">Microphone:</label>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMicrophone}
                disabled={microphonePermission === 'denied'}
              >
                {isMicrophoneEnabled ? "Disable" : "Enable"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Speaker:</label>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSpeaker}
              >
                {isSpeakerEnabled ? "Disable" : "Enable"}
              </Button>
            </div>
            {microphonePermission === 'denied' && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
                <p className="text-yellow-800 text-sm">
                  Microphone access was denied. Please refresh the page and allow microphone access when prompted.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceOnlyChat;
