
import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff, Volume2, VolumeX, Settings, Home } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// OpenAI TTS voices only
const openAIVoices = [
  { id: 'alloy', name: 'Alloy', description: 'Balanced, natural voice' },
  { id: 'echo', name: 'Echo', description: 'Clear, articulate voice' },
  { id: 'fable', name: 'Fable', description: 'Warm, engaging voice' },
  { id: 'onyx', name: 'Onyx', description: 'Deep, confident voice' },
  { id: 'nova', name: 'Nova', description: 'Bright, energetic voice' },
  { id: 'shimmer', name: 'Shimmer', description: 'Gentle, soothing voice' }
];

const VoiceOnlyChat = () => {
  const navigate = useNavigate();
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('Choose your AI voice and tap to begin');
  const [lastTranscript, setLastTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceStartRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const SILENCE_THRESHOLD = 0.01;
  const SILENCE_DURATION = 1200; // 1.2 seconds

  // Start recording with natural speech detection
  const startRecording = useCallback(async () => {
    if (!isMicEnabled) return;

    try {
      console.log('🎤 Starting OpenAI voice recording...');
      setCurrentStatus('Listening... speak naturally');
      setIsRecording(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      streamRef.current = stream;
      audioContextRef.current = new AudioContext();

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = audioContextRef.current.createScriptProcessor(2048, 1, 1);

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];
      silenceStartRef.current = null;

      // Set up silence detection
      processorRef.current.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        const isSilent = input.every(sample => Math.abs(sample) < SILENCE_THRESHOLD);
        const now = Date.now();

        if (!isSilent) {
          silenceStartRef.current = null;
        } else {
          if (!silenceStartRef.current) {
            silenceStartRef.current = now;
          } else if (now - silenceStartRef.current > SILENCE_DURATION) {
            console.log('🤫 Silence detected, stopping recording...');
            stopRecording();
          }
        }
      };

      sourceRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log('🎤 Recording stopped, processing with OpenAI...');
        await processWithOpenAI();
      };

      mediaRecorderRef.current.start();

    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
      setCurrentStatus('Error: Microphone access denied');
      setIsRecording(false);
    }
  }, [isMicEnabled, selectedVoice]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('🛑 Stopping recording...');
      mediaRecorderRef.current.stop();
      
      // Clean up audio processing
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      setIsRecording(false);
    }
  }, [isRecording]);

  // Process the complete OpenAI flow: Whisper → GPT-4o → TTS
  const processWithOpenAI = useCallback(async () => {
    if (audioChunksRef.current.length === 0) return;

    setIsProcessing(true);
    setCurrentStatus('Processing with OpenAI...');

    try {
      // Create audio blob and file
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      console.log('🔄 Using Supabase Edge Function for OpenAI processing...');
      setCurrentStatus('Processing your voice...');

      // Convert audio to base64 for the edge function
      const reader = new FileReader();
      const audioBase64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(audioBlob);
      });

      // Step 1: Transcribe with Whisper
      const transcribeResponse = await supabase.functions.invoke('openai-voice-chat', {
        body: { 
          action: 'transcribe',
          audio: audioBase64
        }
      });

      if (transcribeResponse.error) {
        throw new Error(`Transcription error: ${transcribeResponse.error.message}`);
      }

      const transcript = transcribeResponse.data.text;
      setLastTranscript(transcript);
      console.log('✅ Whisper transcription:', transcript);

      // Step 2: Get GPT-4o response
      setCurrentStatus('Getting AI response...');
      const chatResponse = await supabase.functions.invoke('openai-voice-chat', {
        body: { 
          action: 'chat',
          text: transcript
        }
      });

      if (chatResponse.error) {
        throw new Error(`Chat error: ${chatResponse.error.message}`);
      }

      const aiResponse = chatResponse.data.response;
      setLastResponse(aiResponse);
      console.log('✅ GPT-4o response:', aiResponse);

      if (!isSpeakerEnabled) {
        setCurrentStatus('Response ready (speaker disabled)');
        setIsProcessing(false);
        return;
      }

      // Step 3: Convert to speech
      setCurrentStatus('Converting to speech...');
      const speechResponse = await supabase.functions.invoke('openai-voice-chat', {
        body: { 
          action: 'speak',
          text: aiResponse
        }
      });

      if (speechResponse.error) {
        throw new Error(`Speech error: ${speechResponse.error.message}`);
      }

      // Convert base64 audio to blob and play
      const audioContent = speechResponse.data.audioContent;
      const audioBytes = Uint8Array.from(atob(audioContent), c => c.charCodeAt(0));
      const audioBlob2 = new Blob([audioBytes], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob2);

      console.log('🔊 Playing OpenAI audio...');
      setCurrentStatus('Playing response...');
      await playAudio(audioUrl);

    } catch (error) {
      console.error('OpenAI processing error:', error);
      toast.error(`Error: ${error.message}`);
      setCurrentStatus('Error occurred');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedVoice, isSpeakerEnabled]);

  // Play audio
  const playAudio = useCallback(async (audioUrl: string) => {
    return new Promise<void>((resolve) => {
      try {
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.onended = () => {
            console.log('🔊 OpenAI audio playback finished');
            setIsPlaying(false);
            setCurrentStatus('Ready - Tap mic to speak again');
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

  const startSession = () => {
    setSessionStarted(true);
    setCurrentStatus('Ready - Tap the microphone to speak');
    toast.success('OpenAI voice session started! Tap the microphone to begin speaking.');
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
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-purple-600"
            >
              <Home className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-white text-xs">🤖</span>
              </div>
              <CardTitle className="text-xl font-bold text-purple-700">
                OpenAI Voice Chat
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-purple-600"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!sessionStarted ? (
            <div className="space-y-6">
              {/* Voice Selection */}
              <div className="space-y-3">
                <h3 className="text-center text-lg font-medium text-gray-800">
                  Choose Your OpenAI Voice
                </h3>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {openAIVoices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{voice.name}</span>
                          <span className="text-sm text-gray-500">{voice.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Session Button */}
              <div className="text-center space-y-4">
                <Button
                  onClick={startSession}
                  className="w-full py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg font-semibold rounded-xl"
                >
                  Start OpenAI Chat
                </Button>
                <p className="text-sm text-gray-600">
                  Powered by OpenAI • Whisper + GPT-4o + TTS
                </p>
              </div>
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
                  {isRecording ? 'Recording... Speak naturally' : 'Tap to speak'}
                </p>
                {isRecording && (
                  <p className="text-xs text-orange-600 mt-1">
                    Will auto-stop after 1.2s of silence
                  </p>
                )}
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
                  <p className="text-xs text-green-600 font-medium">OpenAI responded:</p>
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
                  onClick={() => {
                    setSessionStarted(false);
                    setLastTranscript('');
                    setLastResponse('');
                    setCurrentStatus('Choose your OpenAI voice and tap to begin');
                  }}
                  className="text-red-600"
                >
                  End
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

export default VoiceOnlyChat;
