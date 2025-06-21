
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const VoiceChat: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        processSpeechToSpeech();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      toast({
        title: "Listening...",
        description: "Speak now, I'm listening",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const processSpeechToSpeech = async () => {
    if (audioChunksRef.current.length === 0) return;

    setIsProcessing(true);
    
    try {
      // Convert audio to base64
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      console.log('Starting speech-to-speech chain...');

      // Step 1: Transcribe speech to text
      const transcribeResponse = await supabase.functions.invoke('ai-voice-conversation', {
        body: { action: 'transcribe', audio: base64Audio }
      });

      if (transcribeResponse.error) {
        throw new Error(transcribeResponse.error.message);
      }

      const userText = transcribeResponse.data.text;
      console.log('User said:', userText);
      
      if (!userText || userText.trim().length === 0) {
        throw new Error('No speech detected');
      }

      addMessage(userText, true);

      // Step 2: Get AI response
      const chatResponse = await supabase.functions.invoke('ai-voice-conversation', {
        body: { action: 'chat', text: userText }
      });

      if (chatResponse.error) {
        throw new Error(chatResponse.error.message);
      }

      const aiText = chatResponse.data.response;
      console.log('AI responded:', aiText);
      addMessage(aiText, false);

      // Step 3: Convert AI response to speech and play it
      const ttsResponse = await supabase.functions.invoke('ai-voice-conversation', {
        body: { action: 'speak', text: aiText }
      });

      if (ttsResponse.error) {
        throw new Error(ttsResponse.error.message);
      }

      // Play the AI's voice response
      const audioContent = ttsResponse.data.audioContent;
      const audioData = atob(audioContent);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }

      const audioBlob2 = new Blob([audioArray], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob2);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        console.log('AI speech completed');
      };
      
      await audio.play();

      toast({
        title: "Complete!",
        description: "Speech-to-speech conversation complete",
      });

    } catch (error) {
      console.error('Speech-to-speech error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Speech processing failed",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Speech-to-Speech AI</h2>
            <p className="text-gray-600">
              Have a natural voice conversation with AI. Click to speak, release to get an instant voice response.
            </p>
            
            <div className="flex justify-center">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                size="lg"
                className={`
                  relative transition-all duration-200 
                  ${isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-blue-500 hover:bg-blue-600'
                  }
                `}
              >
                {isProcessing ? (
                  <>
                    <Volume2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing Speech...
                  </>
                ) : isRecording ? (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    Stop & Process
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Speaking
                  </>
                )}
              </Button>
            </div>

            {isRecording && (
              <div className="text-red-500 font-medium animate-pulse">
                🔴 Recording... Click to stop and get AI response
              </div>
            )}

            {isProcessing && (
              <div className="text-blue-500 font-medium">
                🧠 Processing your speech through AI...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {messages.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Conversation</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-100 ml-8 text-right'
                      : 'bg-gray-100 mr-8 text-left'
                  }`}
                >
                  <div className={`font-medium text-sm ${
                    message.isUser ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {message.isUser ? 'You' : 'AI'}
                  </div>
                  <div className="text-gray-800 mt-1">{message.text}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </div>
  );
};

export default VoiceChat;
