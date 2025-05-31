
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

  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const isRestartingRecognitionRef = useRef<boolean>(false);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // OpenAI TTS voices - 5 best options
  const openAIVoices = [
    { id: 'nova', name: 'Nova (Warm & Empathetic)', description: 'Warm, caring female voice' },
    { id: 'alloy', name: 'Alloy (Neutral)', description: 'Balanced, professional voice' },
    { id: 'echo', name: 'Echo (Gentle)', description: 'Soft, gentle male voice' },
    { id: 'onyx', name: 'Onyx (Deep)', description: 'Deep, calming male voice' },
    { id: 'shimmer', name: 'Shimmer (Bright)', description: 'Bright, encouraging female voice' }
  ];

  const forceStopAssistantSpeaking = useCallback(() => {
    console.log('Force stopping assistant speaking...');
    if (currentAudioSourceRef.current) {
      try {
        currentAudioSourceRef.current.stop();
        currentAudioSourceRef.current = null;
      } catch (error) {
        console.log('Error stopping audio source:', error);
      }
    }
    setIsAssistantSpeaking(false);
  }, []);

  const restartSpeechRecognition = useCallback(() => {
    if (!conversationStarted || !isMicrophoneEnabled || isAssistantSpeaking || isProcessingResponse) {
      console.log('Not restarting recognition - conditions not met:', {
        conversationStarted,
        isMicrophoneEnabled,
        isAssistantSpeaking,
        isProcessingResponse
      });
      return;
    }

    console.log('Restarting speech recognition...');
    isRestartingRecognitionRef.current = true;
    
    setTimeout(() => {
      try {
        if (recognitionRef.current && conversationStarted && isMicrophoneEnabled && !isAssistantSpeaking) {
          recognitionRef.current.start();
          console.log('Speech recognition restarted successfully');
        }
      } catch (error) {
        console.log('Error restarting recognition:', error);
      }
      isRestartingRecognitionRef.current = false;
    }, 500);
  }, [conversationStarted, isMicrophoneEnabled, isAssistantSpeaking, isProcessingResponse]);

  const generateAIResponse = async (userMessage: string) => {
    if (!userMessage.trim() || isProcessingResponse) return;
    
    setIsProcessingResponse(true);
    console.log('Generating AI response for:', userMessage);

    // Stop any ongoing speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log('Error stopping recognition:', error);
      }
    }

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

  const startSpeechRecognition = useCallback(() => {
    if (!recognitionRef.current || !conversationStarted || !isMicrophoneEnabled || isAssistantSpeaking || isRestartingRecognitionRef.current) {
      return;
    }

    try {
      console.log('Starting speech recognition...');
      recognitionRef.current.start();
    } catch (error) {
      console.log('Recognition already running or error:', error);
    }
  }, [conversationStarted, isMicrophoneEnabled, isAssistantSpeaking]);

  const stopSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      console.log('Stopping speech recognition...');
      recognitionRef.current.stop();
    }
  }, []);

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
      isRestartingRecognitionRef.current = false;
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
            
            // Stop recognition before processing
            stopSpeechRecognition();
            
            // Generate AI response
            generateAIResponse(messageToProcess);
          }
        }, 1500);
      }
      
      setMessage(interimTranscript);
    };

    recognitionRef.current.onend = () => {
      console.log("Speech recognition ended");
      setIsUserSpeaking(false);
      
      // Only restart if conversation is ongoing, mic is enabled, and AI is not speaking
      if (conversationStarted && isMicrophoneEnabled && !isAssistantSpeaking && !isProcessingResponse) {
        console.log('Attempting to restart recognition after natural end...');
        restartSpeechRecognition();
      }
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsUserSpeaking(false);
      
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        toast.error(`Speech recognition error: ${event.error}`);
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
      forceStopAssistantSpeaking();
    };
  }, [userProfile?.preferredLanguage, startSpeechRecognition, stopSpeechRecognition, restartSpeechRecognition, forceStopAssistantSpeaking]);

  const toggleMicrophone = () => {
    setIsMicrophoneEnabled(!isMicrophoneEnabled);
    if (!isMicrophoneEnabled && conversationStarted) {
      setTimeout(() => {
        startSpeechRecognition();
      }, 200);
    } else if (isMicrophoneEnabled) {
      stopSpeechRecognition();
    }
  };

  const toggleSpeaker = () => {
    if (isSpeakerEnabled) {
      // Stop any current speech
      forceStopAssistantSpeaking();
    }
    setIsSpeakerEnabled(!isSpeakerEnabled);
  };

  const testVoice = () => {
    const testText = "Hi there! This is how I sound. I'm here to support you with warmth and understanding. Does this voice feel comfortable to you?";
    speak(testText);
  };

  const startConversation = async () => {
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
    if (isMicrophoneEnabled) {
      setTimeout(() => {
        startSpeechRecognition();
        toast.success("Voice recognition started. Start speaking!");
      }, 500);
    }

    // Simulate initial AI message
    const greeting = getPersonalizedGreeting();
    await speak(greeting);
  };

  const endConversation = () => {
    setConversationStarted(false);
    setIsCallOngoing(false);
    stopSpeechRecognition();
    forceStopAssistantSpeaking();
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    
    finalTranscriptRef.current = '';
    setTranscript('');
    setMessage('');
    setConversationHistory([]);
    setIsProcessingResponse(false);
    toast.message("Conversation ended.");
  };

  const speak = async (text: string) => {
    if (!isSpeakerEnabled) return;
    
    console.log('Starting to speak:', text.substring(0, 50) + '...');
    setIsAssistantSpeaking(true);
    
    // Stop recognition while AI is speaking
    stopSpeechRecognition();
    
    try {
      console.log('Generating speech with voice:', selectedVoice);

      // Use OpenAI TTS for much more natural voice
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: text,
          voice: selectedVoice
        }
      });

      if (error) {
        console.error('Error generating speech:', error);
        setIsAssistantSpeaking(false);
        // Restart recognition even if speech fails
        if (conversationStarted && isMicrophoneEnabled) {
          setTimeout(() => restartSpeechRecognition(), 500);
        }
        return;
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
          console.log('AI finished speaking, clearing state and restarting recognition');
          currentAudioSourceRef.current = null;
          setIsAssistantSpeaking(false);
          
          // Force a small delay then restart recognition
          setTimeout(() => {
            if (conversationStarted && isMicrophoneEnabled && !isProcessingResponse) {
              console.log('Restarting recognition after AI speech ended');
              restartSpeechRecognition();
            }
          }, 800);
        };
        
        source.start(0);
        console.log('Audio playback started');
      } else {
        console.error('No audio content received');
        setIsAssistantSpeaking(false);
        // Restart recognition even if no audio
        if (conversationStarted && isMicrophoneEnabled) {
          setTimeout(() => restartSpeechRecognition(), 500);
        }
      }
    } catch (error) {
      console.error('Error with speech synthesis:', error);
      setIsAssistantSpeaking(false);
      // Restart recognition on error
      if (conversationStarted && isMicrophoneEnabled) {
        setTimeout(() => restartSpeechRecognition(), 500);
      }
    }
  };

  const getPersonalizedGreeting = () => {
    if (!userProfile) {
      return "Hi there! I'm your AI wellness companion. I'm here to listen and support you through whatever you're experiencing. What's on your mind today?";
    }

    const name = userProfile.name || 'dear';
    const struggles = userProfile.currentStruggles?.join(', ') || 'what you\'re going through';
    
    return `Hi ${name}... I'm really glad you're here. I know it takes courage to reach out, especially when you're dealing with ${struggles}. I'm here to listen and support you. What's been on your mind lately?`;
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
                disabled={isConnecting}
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
              <p className="text-gray-600 text-lg text-center">Tap to begin your voice conversation</p>
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
                          onClick={forceStopAssistantSpeaking}
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

                    {!isUserSpeaking && !isAssistantSpeaking && !isProcessingResponse && isMicrophoneEnabled && (
                      <div className="flex items-center justify-center">
                        <div className="h-3 w-3 bg-gray-400 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">Ready to listen...</span>
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
          </div>
        )}
      </Card>
    </div>
  );
};

export default VoiceOnlyChat;
