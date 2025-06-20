
import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

const OpenAIVoiceChat = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('Ready to start conversation');
  const [lastTranscript, setLastTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Step 1: Start recording audio
  const startRecording = useCallback(async () => {
    if (!isMicEnabled) return;

    try {
      console.log('🎤 Starting audio recording...');
      setCurrentStatus('Listening...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log('🎤 Recording stopped, processing...');
        await processRecording();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
      setCurrentStatus('Error: Microphone access denied');
    }
  }, [isMicEnabled]);

  // Step 2: Stop recording and process the audio
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('🛑 Stopping recording...');
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  }, [isRecording]);

  // Steps 3-6: Process the complete flow
  const processRecording = useCallback(async () => {
    if (audioChunksRef.current.length === 0) return;

    setIsProcessing(true);
    setCurrentStatus('Processing your message...');

    try {
      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Convert to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      console.log('🔄 Step 1: Transcribing with Whisper...');
      setCurrentStatus('Transcribing your speech...');

      // Step 1: Transcribe with Whisper
      const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke('openai-voice-chat', {
        body: { 
          action: 'transcribe',
          audio: base64Audio 
        }
      });

      if (transcribeError || !transcribeData?.text) {
        throw new Error('Failed to transcribe audio');
      }

      const transcript = transcribeData.text;
      setLastTranscript(transcript);
      console.log('✅ Transcription:', transcript);

      console.log('🔄 Step 2: Getting GPT-4o response...');
      setCurrentStatus('Thinking...');

      // Step 2: Get GPT-4o response
      const { data: chatData, error: chatError } = await supabase.functions.invoke('openai-voice-chat', {
        body: { 
          action: 'chat',
          text: transcript 
        }
      });

      if (chatError || !chatData?.response) {
        throw new Error('Failed to get AI response');
      }

      const aiResponse = chatData.response;
      setLastResponse(aiResponse);
      console.log('✅ AI Response:', aiResponse);

      if (!isSpeakerEnabled) {
        setCurrentStatus('Response ready (speaker disabled)');
        setIsProcessing(false);
        return;
      }

      console.log('🔄 Step 3: Converting to speech...');
      setCurrentStatus('Converting to speech...');

      // Step 3: Convert to speech
      const { data: ttsData, error: ttsError } = await supabase.functions.invoke('openai-voice-chat', {
        body: { 
          action: 'speak',
          text: aiResponse 
        }
      });

      if (ttsError || !ttsData?.audioContent) {
        throw new Error('Failed to generate speech');
      }

      console.log('🔄 Step 4: Playing audio...');
      setCurrentStatus('Speaking...');

      // Step 4: Play the audio
      await playAudio(ttsData.audioContent);

    } catch (error) {
      console.error('Processing error:', error);
      toast.error(`Error: ${error.message}`);
      setCurrentStatus('Error occurred');
    } finally {
      setIsProcessing(false);
    }
  }, [isSpeakerEnabled]);

  // Play audio from base64
  const playAudio = useCallback(async (base64Audio: string) => {
    return new Promise<void>((resolve) => {
      try {
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const audioBlob = new Blob([bytes], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.onended = () => {
            console.log('🔊 Audio playback finished');
            setIsPlaying(false);
            setCurrentStatus('Ready - Click mic to speak again');
            URL.revokeObjectURL(audioUrl);
            resolve();
          };
          audioRef.current.onerror = () => {
            console.error('Audio playback error');
            setIsPlaying(false);
            setCurrentStatus('Audio playback failed');
            resolve();
          };
          
          setIsPlaying(true);
          audioRef.current.play();
        }
      } catch (error) {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
        setCurrentStatus('Audio playback failed');
        resolve();
      }
    });
  }, []);

  const startConversation = () => {
    setConversationStarted(true);
    setCurrentStatus('Ready - Click mic to speak');
    toast.success('Voice chat started! Click the microphone to begin speaking.');
  };

  const endConversation = () => {
    if (isRecording) {
      stopRecording();
    }
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setConversationStarted(false);
    setCurrentStatus('Conversation ended');
    setLastTranscript('');
    setLastResponse('');
  };

  const handleMicClick = () => {
    if (isProcessing || isPlaying) return;
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-gradient-to-br from-purple-50 to-pink-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-700">
            OpenAI Voice Chat
          </CardTitle>
          <p className="text-sm text-gray-600">
            Speak naturally with AI using only OpenAI APIs
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!conversationStarted ? (
            <div className="text-center space-y-4">
              <Button
                onClick={startConversation}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xl font-bold"
              >
                Start Chat
              </Button>
              <p className="text-gray-600">Click to begin voice conversation</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status */}
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 font-medium">{currentStatus}</p>
              </div>

              {/* Main microphone button */}
              <div className="text-center">
                <Button
                  onClick={handleMicClick}
                  disabled={isProcessing || isPlaying}
                  className={`w-20 h-20 rounded-full ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  <Mic className="h-8 w-8" />
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  {isRecording ? 'Recording... Click to stop' : 'Click to speak'}
                </p>
              </div>

              {/* Last transcript and response */}
              {lastTranscript && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium">You said:</p>
                  <p className="text-sm text-blue-800">{lastTranscript}</p>
                </div>
              )}
              
              {lastResponse && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 font-medium">AI responded:</p>
                  <p className="text-sm text-green-800">{lastResponse}</p>
                </div>
              )}

              {/* Controls */}
              <div className="flex justify-around pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMicEnabled(!isMicEnabled)}
                  className={isMicEnabled ? 'text-green-600' : 'text-red-600'}
                >
                  {isMicEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSpeakerEnabled(!isSpeakerEnabled)}
                  className={isSpeakerEnabled ? 'text-green-600' : 'text-red-600'}
                >
                  {isSpeakerEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={endConversation}
                  className="text-red-600"
                >
                  <PhoneOff className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Hidden audio element for playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default OpenAIVoiceChat;
