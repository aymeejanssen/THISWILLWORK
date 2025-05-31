import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff, Settings, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

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
  const [selectedVoice, setSelectedVoice] = useState<string>('nova');
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRestartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // OpenAI TTS voices - 5 best options
  const openAIVoices = [
    { id: 'nova', name: 'Nova (Warm & Empathetic)', description: 'Warm, caring female voice' },
    { id: 'alloy', name: 'Alloy (Neutral)', description: 'Balanced, professional voice' },
    { id: 'echo', name: 'Echo (Gentle)', description: 'Soft, gentle male voice' },
    { id: 'onyx', name: 'Onyx (Deep)', description: 'Deep, calming male voice' },
    { id: 'shimmer', name: 'Shimmer (Bright)', description: 'Bright, encouraging female voice' }
  ];

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      console.log('Requesting microphone permission...');
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
      console.log('Microphone permission granted');
      toast.success("Microphone access granted!");
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setMicrophonePermission('denied');
      toast.error("Microphone access is required for voice conversation. Please allow microphone access and try again.");
      return false;
    }
  };

  const stopCurrentAudio = useCallback(() => {
    console.log('Stopping current audio...');
    if (currentAudioSourceRef.current) {
      try {
        currentAudioSourceRef.current.stop();
      } catch (error) {
        console.log('Error stopping audio source:', error);
      }
      currentAudioSourceRef.current = null;
    }
    setIsAssistantSpeaking(false);
  }, []);

  const startSpeechRecognition = useCallback(() => {
    if (!recognitionRef.current || !conversationStarted || !isMicrophoneEnabled || isAssistantSpeaking || microphonePermission !== 'granted') {
      console.log('Not starting recognition - conditions not met:', {
        conversationStarted,
        isMicrophoneEnabled,
        isAssistantSpeaking,
        microphonePermission
      });
      return;
    }

    try {
      console.log('Starting speech recognition...');
      recognitionRef.current.start();
    } catch (error) {
      console.log('Recognition start error (probably already running):', error);
    }
  }, [conversationStarted, isMicrophoneEnabled, isAssistantSpeaking, microphonePermission]);

  const stopSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      console.log('Stopping speech recognition...');
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log('Error stopping recognition:', error);
      }
    }
  }, []);

  const restartSpeechRecognitionDelayed = useCallback(() => {
    // Clear any existing restart timeout
    if (recognitionRestartTimeoutRef.current) {
      clearTimeout(recognitionRestartTimeoutRef.current);
    }

    // Set a new restart timeout
    recognitionRestartTimeoutRef.current = setTimeout(() => {
      console.log('Attempting delayed recognition restart...');
      if (conversationStarted && isMicrophoneEnabled && !isAssistantSpeaking && !isProcessingResponse && microphonePermission === 'granted') {
        startSpeechRecognition();
      }
    }, 1000);
  }, [conversationStarted, isMicrophoneEnabled, isAssistantSpeaking, isProcessingResponse, microphonePermission, startSpeechRecognition]);

  const generateAIResponse = async (userMessage: string) => {
    if (!userMessage.trim() || isProcessingResponse) return;
    
    setIsProcessingResponse(true);
    console.log('Generating AI response for:', userMessage);

    // Stop any ongoing speech recognition
    stopSpeechRecognition();

    try {
      // Create conversation context
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
        console.error('Error generating AI response:', error);
        throw error;
      }

      const aiResponse = data?.response || "I understand. Could you tell me more about that?";
      console.log('AI response generated:', aiResponse);

      // Update conversation history
      setConversationHistory(prev => [...prev, `User: ${userMessage}`, `AI: ${aiResponse}`]);
      
      // Speak the response
      await speak(aiResponse);
      
    } catch (error) {
      console.error('Error in AI response generation:', error);
      const fallbackResponse = "I'm here to listen. Please continue sharing what's on your mind.";
      await speak(fallbackResponse);
    } finally {
      setIsProcessingResponse(false);
    }
  };

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error("Speech Recognition not supported in this browser. Please try Chrome.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = userProfile?.preferredLanguage || 'en-US';

    recognitionRef.current.onstart = () => {
      console.log("Speech recognition started");
      setIsUserSpeaking(true);
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;
        setTranscript(finalTranscriptRef.current);
        console.log('Final transcript:', finalTranscriptRef.current);
        
        // Clear any existing silence timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        
        // Set a timeout to process the response after silence
        silenceTimeoutRef.current = setTimeout(() => {
          if (finalTranscriptRef.current.trim()) {
            console.log('Processing speech after silence:', finalTranscriptRef.current);
            const messageToProcess = finalTranscriptRef.current.trim();
            finalTranscriptRef.current = '';
            setTranscript('');
            setMessage('');
            
            // Generate AI response
            generateAIResponse(messageToProcess);
          }
        }, 2000); // Increased to 2 seconds for better user experience
      }
      
      setMessage(interimTranscript);
    };

    recognitionRef.current.onend = () => {
      console.log("Speech recognition ended");
      setIsUserSpeaking(false);
      
      // Only restart if conditions are met
      if (conversationStarted && isMicrophoneEnabled && !isAssistantSpeaking && !isProcessingResponse && microphonePermission === 'granted') {
        console.log('Restarting recognition after natural end...');
        restartSpeechRecognitionDelayed();
      }
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsUserSpeaking(false);
      
      if (event.error === 'not-allowed') {
        setMicrophonePermission('denied');
        toast.error("Microphone access denied. Please allow microphone access in your browser settings.");
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        toast.error(`Speech recognition error: ${event.error}`);
        // Try to restart on error (except for abort or no-speech)
        restartSpeechRecognitionDelayed();
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (recognitionRestartTimeoutRef.current) {
        clearTimeout(recognitionRestartTimeoutRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      stopCurrentAudio();
    };
  }, [userProfile?.preferredLanguage, restartSpeechRecognitionDelayed, microphonePermission]);

  const toggleMicrophone = () => {
    setIsMicrophoneEnabled(!isMicrophoneEnabled);
    if (!isMicrophoneEnabled && conversationStarted && microphonePermission === 'granted') {
      setTimeout(() => {
        startSpeechRecognition();
      }, 500);
    } else if (isMicrophoneEnabled) {
      stopSpeechRecognition();
    }
  };

  const toggleSpeaker = () => {
    if (isSpeakerEnabled) {
      stopCurrentAudio();
    }
    setIsSpeakerEnabled(!isSpeakerEnabled);
  };

  const testVoice = () => {
    const testText = "Hi there! This is how I sound. I'm here to support you with warmth and understanding. Does this voice feel comfortable to you?";
    speak(testText);
  };

  const startConversation = async () => {
    // First request microphone permission
    if (microphonePermission !== 'granted') {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        return;
      }
    }

    setIsConnecting(true);
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsConnecting(false);
    setConversationStarted(true);
    setIsCallOngoing(true);

    // Initialize audio context
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new AudioContext();
      } catch (error) {
        console.error('Failed to create audio context:', error);
      }
    }

    // Start speech recognition
    if (isMicrophoneEnabled && microphonePermission === 'granted') {
      setTimeout(() => {
        startSpeechRecognition();
        toast.success("Voice recognition started. Start speaking!");
      }, 1000);
    }

    // Simulate initial AI message
    const greeting = getPersonalizedGreeting();
    setTimeout(() => {
      speak(greeting);
    }, 1500);
  };

  const endConversation = () => {
    setConversationStarted(false);
    setIsCallOngoing(false);
    stopSpeechRecognition();
    stopCurrentAudio();
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    
    if (recognitionRestartTimeoutRef.current) {
      clearTimeout(recognitionRestartTimeoutRef.current);
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    finalTranscriptRef.current = '';
    setTranscript('');
    setMessage('');
    setConversationHistory([]);
    setIsProcessingResponse(false);
    toast.message("Conversation ended.");
  };

  const speak = async (text: string) => {
    if (!isSpeakerEnabled || !text.trim()) {
      console.log('Skipping speech - speaker disabled or empty text');
      return;
    }
    
    console.log('Starting to speak:', text.substring(0, 50) + '...');
    setIsAssistantSpeaking(true);
    
    // Stop recognition while AI is speaking
    stopSpeechRecognition();
    
    try {
      console.log('Generating speech with voice:', selectedVoice);

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: text,
          voice: selectedVoice
        }
      });

      if (error) {
        console.error('Error generating speech:', error);
        throw error;
      }

      if (data?.audioContent) {
        // Initialize audio context if needed
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }

        // Resume audio context if suspended
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        // Decode base64 audio
        const binaryString = atob(data.audioContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Decode and play audio
        const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        // Store reference to current audio source
        currentAudioSourceRef.current = source;
        
        source.onended = () => {
          console.log('AI finished speaking, restarting recognition');
          currentAudioSourceRef.current = null;
          setIsAssistantSpeaking(false);
          
          // Restart recognition after AI finishes speaking
          setTimeout(() => {
            if (conversationStarted && isMicrophoneEnabled && !isProcessingResponse && microphonePermission === 'granted') {
              console.log('Restarting recognition after AI speech');
              startSpeechRecognition();
            }
          }, 500);
        };
        
        source.start(0);
        console.log('Audio playback started');
      } else {
        console.error('No audio content received');
        setIsAssistantSpeaking(false);
        restartSpeechRecognitionDelayed();
      }
    } catch (error) {
      console.error('Error with speech synthesis:', error);
      setIsAssistantSpeaking(false);
      restartSpeechRecognitionDelayed();
      
      // Show a fallback message
      toast.error("Sorry, I couldn't speak that response. Please try again.");
    }
  };

  const getPersonalizedGreeting = () => {
    if (!userProfile) {
      return "Hi there! I'm your AI wellness companion. I'm here to listen and support you through whatever you're experiencing. What's on your mind today?";
    }

    const name = userProfile.name || 'dear';
    const struggles = userProfile.currentStruggles?.join(', ') || 'what you\'re going through';
    
    return `Hi ${name}! I'm really glad you're here. I know it takes courage to reach out, especially when you're dealing with ${struggles}. I'm here to listen and support you. What's been on your mind lately?`;
  };

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
              {/* Microphone permission status */}
              {microphonePermission === 'denied' && (
                <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-700 text-sm text-center">
                    Microphone access is required for voice conversation. Please enable microphone access in your browser settings and refresh the page.
                  </p>
                </div>
              )}

              {/* Voice Selection */}
              <div className="mb-6 w-full max-w-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Your Voice
                </label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {openAIVoices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{voice.name}</span>
                          <span className="text-xs text-gray-500">{voice.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testVoice}
                  className="mt-2 w-full"
                  disabled={isAssistantSpeaking}
                >
                  {isAssistantSpeaking ? 'Playing...' : 'Test Voice'}
                </Button>
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
                  
                  {/* Status indicators */}
                  <div className="mt-4 space-y-2">
                    {isAssistantSpeaking && (
                      <div className="flex items-center justify-center">
                        <div className="animate-pulse h-3 w-3 bg-purple-500 rounded-full mr-2"></div>
                        <span className="text-sm text-purple-600">Assistant is speaking...</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={stopCurrentAudio}
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

                    {microphonePermission === 'denied' && (
                      <div className="flex items-center justify-center">
                        <div className="h-3 w-3 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-sm text-red-600">Microphone access denied</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Control buttons */}
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
            
            {/* Voice Selection in Settings */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice Selection
              </label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {openAIVoices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{voice.name}</span>
                        <span className="text-xs text-gray-500">{voice.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testVoice}
                className="mt-2"
                disabled={isAssistantSpeaking}
              >
                {isAssistantSpeaking ? 'Playing...' : 'Test Voice'}
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
      </Card>
    </div>
  );
};

export default VoiceOnlyChat;
