
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
  const [selectedVoice, setSelectedVoice] = useState<string>('9BWtsMINqrJLrRacOk9x');
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [audioLevel, setAudioLevel] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');

  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioAnalyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isListeningRef = useRef(false);

  // Audio level monitoring
  const startAudioLevelMonitoring = useCallback(async () => {
    console.log('🎤 Starting audio monitoring...');
    
    if (!mediaStreamRef.current) {
      console.error('❌ No media stream for monitoring');
      return;
    }

    try {
      audioContextRef.current = new AudioContext({ sampleRate: 44100 });
      
      if (audioContextRef.current.state === 'suspended') {
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

  // Request microphone permission
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

  // EXACTLY like assessment - simple speech recognition
  const setupSpeechRecognition = useCallback(() => {
    console.log('🎙️ Setting up speech recognition...');
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Speech Recognition not supported. Please use Chrome.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    // EXACT same settings as assessment
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => {
      console.log("🎙️ Speech recognition started");
      setIsUserSpeaking(true);
      isListeningRef.current = true;
      setLiveTranscript('');
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      console.log("🎙️ Speech result received", event);
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
      
      // Update live transcript (just like assessment)
      setLiveTranscript(interimTranscript + finalTranscript);
      
      if (finalTranscript.trim()) {
        console.log("🔄 Processing final transcript:", finalTranscript);
        setTranscript(finalTranscript);
        
        // Process the message after a short delay
        setTimeout(() => {
          if (finalTranscript.trim() && !isProcessingResponse) {
            generateAIResponse(finalTranscript.trim());
          }
        }, 500);
      }
    };

    recognitionRef.current.onend = () => {
      console.log("🎙️ Speech recognition ended");
      setIsUserSpeaking(false);
      isListeningRef.current = false;
      
      // Auto restart if conversation is ongoing (like assessment)
      if (conversationStarted && isMicrophoneEnabled && !isAssistantSpeaking && !isProcessingResponse && microphonePermission === 'granted') {
        console.log("🔄 Auto restarting speech recognition...");
        setTimeout(() => {
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
        // Auto restart on other errors
        if (conversationStarted && isMicrophoneEnabled && microphonePermission === 'granted') {
          setTimeout(() => {
            startListening();
          }, 2000);
        }
      }
    };

    console.log('✅ Speech recognition setup complete');
  }, [conversationStarted, isMicrophoneEnabled, isAssistantSpeaking, isProcessingResponse, microphonePermission]);

  // Simple start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListeningRef.current || isAssistantSpeaking || isProcessingResponse || microphonePermission !== 'granted') {
      console.log("❌ Cannot start listening:", {
        hasRecognition: !!recognitionRef.current,
        isListening: isListeningRef.current,
        isAssistantSpeaking,
        isProcessingResponse,
        micPermission: microphonePermission
      });
      return;
    }

    try {
      console.log("🎙️ Starting to listen...");
      recognitionRef.current.start();
    } catch (error) {
      console.log("🎙️ Start listening error:", error);
    }
  }, [isAssistantSpeaking, isProcessingResponse, microphonePermission]);

  // Simple stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      console.log("🛑 Stopping listening...");
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log("🛑 Stop error:", error);
      }
    }
  }, []);

  // Generate AI response
  const generateAIResponse = async (userMessage: string) => {
    if (!userMessage.trim() || isProcessingResponse) return;
    
    setIsProcessingResponse(true);
    console.log('🤖 Generating response for:', userMessage);

    stopListening();

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

        const { data, error } = await supabase.functions.invoke('generate-assessment-insights', {
          body: {
            prompt: userMessage,
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
        console.log('🤖 AI response:', aiResponse);

        setConversationHistory(prev => [...prev, `User: ${userMessage}`, `AI: ${aiResponse}`]);
        await speak(aiResponse);
      }
      
    } catch (error) {
      console.error('🤖 AI error:', error);
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
    
    stopListening();
    
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
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsConnecting(false);
    setConversationStarted(true);
    setIsCallOngoing(true);

    // IMPORTANT: Start speech recognition immediately after conversation starts
    setTimeout(() => {
      console.log('🎙️ Starting speech recognition after conversation start...');
      if (isMicrophoneEnabled && microphonePermission === 'granted') {
        setupSpeechRecognition(); // Re-setup to ensure it's fresh
        setTimeout(() => {
          startListening();
          toast.success("Voice recognition started! Start speaking.");
        }, 500);
      }
    }, 1000);

    // Initial greeting
    setTimeout(() => {
      const selectedVoiceOption = allVoices.find(v => v.id === selectedVoice);
      if (selectedVoiceOption?.type !== 'agent') {
        const greeting = getPersonalizedGreeting();
        speak(greeting);
      }
    }, 1500);
  };

  // End conversation
  const endConversation = () => {
    setConversationStarted(false);
    setIsCallOngoing(false);
    stopListening();
    
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
    setIsMicrophoneEnabled(!isMicrophoneEnabled);
    if (!isMicrophoneEnabled && conversationStarted && microphonePermission === 'granted') {
      setTimeout(() => startListening(), 500);
    } else if (isMicrophoneEnabled) {
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[80vh] bg-white/95 backdrop-blur-sm shadow-2xl border-0 flex flex-col">
        <CardHeader className="bg-gradient-to-r from-purple-500 via-pink-400 to-red-400 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Phone className="h-6 w-6" />
              Voice Conversation
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:bg-white/20"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <Home className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-purple-50/30 to-teal-50/30">
          {!conversationStarted ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              {microphonePermission === 'denied' && (
                <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-700 text-sm text-center">
                    Microphone access is required. Please enable microphone access and refresh the page.
                  </p>
                </div>
              )}

              <div className="mb-6 w-full max-w-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Your AI Experience
                </label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a voice or agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1 text-xs font-semibold text-green-600 bg-green-50">
                      🤖 Your ElevenLabs Conversational Agents
                    </div>
                    {allVoices.filter(voice => voice.type === 'agent').map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{voice.name}</span>
                          <span className="text-xs text-gray-500">{voice.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1 text-xs font-semibold text-purple-600 bg-purple-50 mt-2">
                      🎭 Premium Human-like Voices (ElevenLabs)
                    </div>
                    {allVoices.filter(voice => voice.provider === 'elevenlabs' && voice.type === 'tts').map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{voice.name}</span>
                          <span className="text-xs text-gray-500">{voice.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 mt-2">
                      🤖 Google Text-to-Speech
                    </div>
                    {allVoices.filter(voice => voice.provider === 'google').map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{voice.name}</span>
                          <span className="text-xs text-gray-500">{voice.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {allVoices.find(v => v.id === selectedVoice)?.type === 'tts' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={testVoice}
                    className="mt-2 w-full"
                    disabled={isAssistantSpeaking}
                  >
                    {isAssistantSpeaking ? 'Playing...' : '🎵 Test Voice'}
                  </Button>
                )}
                
                <div className="mt-2 text-xs text-gray-600 text-center">
                  {allVoices.find(v => v.id === selectedVoice)?.type === 'agent' ? (
                    <span className="text-green-600">🤖 Using your ElevenLabs conversational AI agent</span>
                  ) : allVoices.find(v => v.id === selectedVoice)?.provider === 'elevenlabs' ? (
                    <span className="text-purple-600">✨ Using premium ElevenLabs voice for natural speech</span>
                  ) : (
                    <span className="text-blue-600">🤖 Using Google Text-to-Speech</span>
                  )}
                </div>
              </div>

              <Button 
                onClick={startConversation}
                className="relative bg-gradient-to-br from-purple-500 via-pink-400 to-red-400 hover:from-purple-600 hover:via-pink-500 hover:to-red-500 text-white w-32 h-32 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transform transition-all duration-300 text-xl font-bold"
                disabled={isConnecting || microphonePermission === 'denied'}
              >
                {isConnecting ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                    <span className="text-sm">Connecting...</span>
                  </div>
                ) : (
                  "Start"
                )}
              </Button>
              <p className="text-gray-600 text-lg text-center">
                {microphonePermission === 'denied' 
                  ? "Please allow microphone access to start" 
                  : allVoices.find(v => v.id === selectedVoice)?.type === 'agent'
                    ? "Tap to begin conversation with your AI agent"
                    : "Tap to begin your voice conversation"
                }
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-between h-full w-full">
              <div className="flex-1 overflow-y-auto p-4 w-full">
                <div className="mb-4 text-center">
                  <p className="text-gray-700 italic min-h-[1.5em]">
                    {transcript || message || (isUserSpeaking ? "Listening..." : "Say something...")}
                  </p>
                  
                  {/* Live transcript display - EXACTLY like assessment */}
                  <div className="mt-4 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🎙️ Live Speech Recognition (Matching Assessment):
                    </label>
                    <Textarea
                      value={liveTranscript}
                      placeholder="Your speech will appear here in real-time..."
                      readOnly
                      className="min-h-[100px] bg-gray-50 border-2 border-gray-200 text-sm"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Recognition Status: {isListeningRef.current ? '🟢 LISTENING' : '🔴 NOT LISTENING'} | 
                      Permission: {microphonePermission} | 
                      Mic: {isMicrophoneEnabled ? 'ON' : 'OFF'} |
                      Continuous: false (same as assessment) |
                      HasRecognition: {recognitionRef.current ? 'YES' : 'NO'}
                    </div>
                  </div>
                  
                  <div className="mt-6 mb-4">
                    <AudioLevelIndicator 
                      audioLevel={audioLevel} 
                      isActive={isMicrophoneEnabled && microphonePermission === 'granted'} 
                    />
                    <div className="text-xs text-gray-500 mt-2">
                      Audio Level: {Math.round(audioLevel)}% | Listening: {isListeningRef.current ? 'Yes' : 'No'} | Mic: {isMicrophoneEnabled ? 'On' : 'Off'}
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    {isAssistantSpeaking && (
                      <div className="flex items-center justify-center">
                        <div className="animate-pulse h-3 w-3 bg-purple-500 rounded-full mr-2"></div>
                        <span className="text-sm text-purple-600">Assistant is speaking...</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => voiceService.stopCurrentAudio()}
                          className="ml-2 text-xs"
                        >
                          Skip
                        </Button>
                      </div>
                    )}
                    
                    {isProcessingResponse && !isAssistantSpeaking && (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500 mr-2"></div>
                        <span className="text-sm text-purple-600">Thinking...</span>
                      </div>
                    )}
                    
                    {isUserSpeaking && !isAssistantSpeaking && !isProcessingResponse && (
                      <div className="flex items-center justify-center">
                        <div className="animate-pulse h-3 w-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-green-600">You're speaking...</span>
                      </div>
                    )}

                    {!isUserSpeaking && !isAssistantSpeaking && !isProcessingResponse && isMicrophoneEnabled && microphonePermission === 'granted' && (
                      <div className="flex items-center justify-center">
                        <div className="h-3 w-3 bg-gray-400 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">Ready to listen...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-around w-full p-4 border-t border-gray-200">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMicrophone}
                  className={`text-gray-700 hover:bg-gray-100 ${!isMicrophoneEnabled ? 'bg-red-100 text-red-600' : ''}`}
                  disabled={microphonePermission === 'denied'}
                >
                  {isMicrophoneEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSpeaker}
                  className={`text-gray-700 hover:bg-gray-100 ${!isSpeakerEnabled ? 'bg-red-100 text-red-600' : ''}`}
                >
                  {isSpeakerEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={endConversation}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        {showSettings && (
          <div className="p-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold mb-4">Settings</h4>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Voice Selection
              </label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a voice or agent" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1 text-xs font-semibold text-green-600 bg-green-50">
                    🤖 Your ElevenLabs Conversational Agents
                  </div>
                  {allVoices.filter(voice => voice.type === 'agent').map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{voice.name}</span>
                        <span className="text-xs text-gray-500">{voice.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1 text-xs font-semibold text-purple-600 bg-purple-50 mt-2">
                    🎭 Premium Human-like Voices (ElevenLabs)
                  </div>
                  {allVoices.filter(voice => voice.provider === 'elevenlabs' && voice.type === 'tts').map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{voice.name}</span>
                        <span className="text-xs text-gray-500">{voice.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 mt-2">
                    🤖 Google Text-to-Speech
                  </div>
                  {allVoices.filter(voice => voice.provider === 'google').map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{voice.name}</span>
                        <span className="text-xs text-gray-500">{voice.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {allVoices.find(v => v.id === selectedVoice)?.type === 'tts' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testVoice}
                  className="mt-2"
                  disabled={isAssistantSpeaking}
                >
                  {isAssistantSpeaking ? 'Playing...' : '🎵 Test Voice'}
                </Button>
              )}
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
      </Card>
    </div>
  );
};

export default VoiceOnlyChat;
