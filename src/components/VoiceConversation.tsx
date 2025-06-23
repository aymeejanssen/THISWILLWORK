import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, X, Clock, Volume2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface VoiceConversationProps {
  onTimeUp: () => void;
  onClose: () => void;
  timeLimit: number;
  assessmentResponses?: any;
}

const VoiceConversation: React.FC<VoiceConversationProps> = ({ onTimeUp, onClose, timeLimit, assessmentResponses }) => {
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
  const { toast } = useToast();

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
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeRemaining, onTimeUp]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const fetchChatResponse = async (text: string) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a compassionate AI therapist. Respond conversationally.' },
          { role: 'user', content: text }
        ]
      })
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "I'm here to support you.";
  };

  const fetchTTS = async (text: string) => {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: 'shimmer',
        input: text
      })
    });
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    return new Promise(resolve => {
      audio.onended = resolve;
      audio.onerror = resolve;
      audio.play();
    });
  };

  const transcribeAudio = async (base64Audio: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', new Blob([Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0))], { type: 'audio/webm' }));
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: formData
    });
    const result = await response.json();
    return result.text || '';
  };

  const processUserSpeech = async () => {
    if (audioChunksRef.current.length === 0) return startListening();
    setIsProcessing(true);
    setCurrentStatus("Processing your message...");
    try {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const buffer = await blob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      const userText = await transcribeAudio(base64Audio);
      if (!userText.trim()) return startListening();

      const aiResponse = await fetchChatResponse(userText);
      setCurrentStatus("AI is responding...");
      setIsSpeaking(true);
      await fetchTTS(aiResponse);
    } catch (err) {
      console.error('Error:', err);
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setIsSpeaking(false);
      if (isActive) setTimeout(startListening, 500);
    }
  };

  const startListening = async () => {
    if (!isActive || isSpeaking) return;
    try {
      setCurrentStatus("Listening... speak naturally");
      setIsListening(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = e => e.data.size > 0 && audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = processUserSpeech;
      mediaRecorderRef.current.start();
      setTimeout(() => stopListening(), 5000);
    } catch (err) {
      toast({ title: "Error", description: "Mic not accessible", variant: "destructive" });
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setIsListening(false);
  };

  const startConversation = async () => {
    if (!isActive) return;
    setConversationStarted(true);
    setCurrentStatus("AI is reviewing your assessment...");
    setIsSpeaking(true);
    try {
      const introText = `Welcome! Let's talk about your recent assessment.`;
      await fetchTTS(introText);
    } catch (err) {
      toast({ title: "Error", description: "Could not start session", variant: "destructive" });
    } finally {
      setIsSpeaking(false);
      startListening();
    }
  };

  const endConversation = () => {
    setIsActive(false);
    stopListening();
    onClose();
  };

  useEffect(() => {
    return () => {
      stopListening();
      if (timerRef.current) clearInterval(timerRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-purple-700">Free Intake Session</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className={`font-mono text-lg ${timeRemaining < 60000 ? 'text-red-600' : 'text-gray-700'}`}>{formatTime(timeRemaining)}</span>
              <span className="text-sm text-gray-500">remaining</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={endConversation}><X className="h-4 w-4" /></Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {!conversationStarted ? (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <Volume2 className="h-16 w-16 text-purple-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Start the Conversation</h3>
                  <p className="text-gray-600 text-sm">I'll start by discussing your assessment responses, then we can explore your thoughts and feelings together.</p>
                </div>
              </div>
              <Button onClick={startConversation} disabled={!isActive} size="lg" className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4">
                <Mic className="w-5 h-5 mr-2" /> Start Intake Session
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center space-x-3">
                  {isListening && <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>}
                  {isProcessing && <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>}
                  {isSpeaking && <Volume2 className="w-4 h-4 text-green-500 animate-pulse" />}
                </div>
                <p className="text-sm text-gray-700 font-medium mt-2">{currentStatus}</p>
              </div>
              <div className="space-y-4">
                {isListening && <div className="flex justify-center space-x-1">{[...Array(5)].map((_, i) => <div key={i} className="w-2 bg-red-500 rounded-full animate-pulse" style={{ height: Math.random() * 30 + 10, animationDelay: `${i * 0.1}s` }}></div>)}</div>}
                {isSpeaking && <div className="flex justify-center space-x-1">{[...Array(5)].map((_, i) => <div key={i} className="w-2 bg-green-500 rounded-full animate-bounce" style={{ height: Math.random() * 30 + 10, animationDelay: `${i * 0.2}s` }}></div>)}</div>}
              </div>
              {!isActive && <div className="text-orange-600 font-medium">⏰ Your free 5-minute session has ended</div>}
              <Button onClick={endConversation} variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">End Session</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceConversation;
