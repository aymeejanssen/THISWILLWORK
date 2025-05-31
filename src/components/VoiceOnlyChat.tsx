import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [sampleResponses, setSampleResponses] = useState([
    "Tell me about a time you felt really happy.",
    "What's a challenge you're currently facing?",
    "Describe your ideal day.",
    "What are you grateful for today?",
    "How do you usually cope with stress?",
  ]);

  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

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
      setIsUserSpeaking(true);
      console.log("Speech recognition service has started");
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          setTranscript((prevTranscript) => prevTranscript + event.results[i][0].transcript);
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setMessage(interimTranscript);
    };

    recognitionRef.current.onend = () => {
      setIsUserSpeaking(false);
      console.log("Speech recognition service disconnected");
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsUserSpeaking(false);
      console.error("Speech recognition error:", event.error);
      toast.error(`Speech recognition error: ${event.error}`);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [userProfile?.preferredLanguage]);

  const toggleMicrophone = () => {
    setIsMicrophoneEnabled(!isMicrophoneEnabled);
  };

  const toggleSpeaker = () => {
    setIsSpeakerEnabled(!isSpeakerEnabled);
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
      audioContextRef.current = new AudioContext();
    }

    // Start speech recognition
    if (recognitionRef.current && isMicrophoneEnabled) {
      try {
        recognitionRef.current.start();
        toast.success("Voice recognition started. Start speaking!");
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast.error("Failed to start voice recognition. Please check microphone permissions.");
      }
    }

    // Simulate initial AI message
    const greeting = getPersonalizedGreeting();
    await speak(greeting);
  };

  const endConversation = () => {
    setConversationStarted(false);
    setIsCallOngoing(false);
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    toast.message("Conversation ended.");
  };

  const handleSampleResponse = async (response: string) => {
    setMessage(response);
    await speak("Okay, processing your request: " + response);
  };

  const speak = async (text: string) => {
    if (!isSpeakerEnabled) return;
    
    setIsAssistantSpeaking(true);
    
    try {
      // Use OpenAI TTS for much more natural voice
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: text,
          voice: 'nova' // Nova voice is warm, caring, and reassuring
        }
      });

      if (error) {
        console.error('Error generating speech:', error);
        // Fallback to browser speech synthesis
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = userProfile?.preferredLanguage || 'en-US';
        speechSynthesis.speak(utterance);
        utterance.onend = () => {
          setIsAssistantSpeaking(false);
        };
        return;
      }

      if (data?.audioContent) {
        // Initialize audio context if needed
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
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
        
        source.onended = () => {
          setIsAssistantSpeaking(false);
        };
        
        source.start(0);
      }
    } catch (error) {
      console.error('Error with OpenAI TTS:', error);
      setIsAssistantSpeaking(false);
      
      // Fallback to browser speech synthesis
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = userProfile?.preferredLanguage || 'en-US';
      speechSynthesis.speak(utterance);
      utterance.onend = () => {
        setIsAssistantSpeaking(false);
      };
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
                  <p className="text-gray-700 italic">{transcript || "Listening..."}</p>
                  {isAssistantSpeaking && (
                    <div className="flex items-center justify-center mt-4">
                      <div className="animate-pulse h-3 w-3 bg-purple-500 rounded-full mr-2"></div>
                      <span className="text-sm text-purple-600">Assistant is speaking...</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {sampleResponses.map((response, index) => (
                    <Button
                      key={index}
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSampleResponse(response)}
                    >
                      {response}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-around w-full p-4 border-t border-gray-200">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMicrophone}
                  className="text-gray-700 hover:bg-gray-100"
                >
                  {isMicrophoneEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSpeaker}
                  className="text-gray-700 hover:bg-gray-100"
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
            <h4 className="text-lg font-semibold mb-2">Settings</h4>
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Microphone:</label>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMicrophone}
              >
                {isMicrophoneEnabled ? "Disable" : "Enable"}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
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
