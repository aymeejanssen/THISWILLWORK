
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff, Volume2, VolumeX, Settings, Home } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// OpenAI TTS voices only
const openAIVoices = [
  { id: 'alloy', name: 'Alloy', description: 'Balanced, natural voice' },
  { id: 'echo', name: 'Echo', description: 'Clear, articulate voice' },
  { id: 'fable', name: 'Fable', description: 'Warm, engaging voice' },
  { id: 'onyx', name: 'Onyx', description: 'Deep, confident voice' },
  { id: 'nova', name: 'Nova', description: 'Bright, energetic voice' },
  { id: 'shimmer', name: 'Shimmer', description: 'Gentle, soothing voice' }
];

const OPENAI_API_KEY = 'sk-proj-abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yz5678abcd9012efghXDAA'; // Your API key ending in XDAA

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
  const streamRef = useRef<MediaStream | null>(null);

  const SILENCE_THRESHOLD = 0.01;
  const SILENCE_DURATION = 1200; // 1.2 seconds

  const playAudio = useCallback(async (url: string) => {
    return new Promise<void>((resolve) => {
      const audio = new Audio(url);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
        resolve();
      };
      setIsPlaying(true);
      audio.play();
    });
  }, []);

  const startRecording = useCallback(async () => {
    if (!isMicEnabled) return;

    try {
      console.log('🎤 Starting automatic recording...');
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
            console.log('🤫 Silence detected, processing...');
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
        console.log('🎤 Recording stopped, processing...');
        setIsProcessing(true);
        setCurrentStatus('Processing your message...');
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioFile = new File([audioBlob], "input.webm", { type: 'audio/webm' });

          // Step 1: Whisper STT
          console.log('🔄 Step 1: Transcribing...');
          setCurrentStatus('Transcribing your speech...');
          
          const sttForm = new FormData();
          sttForm.append("file", audioFile);
          sttForm.append("model", "whisper-1");

          const sttResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: { 
              "Authorization": `Bearer ${OPENAI_API_KEY}` 
            },
            body: sttForm
          });

          if (!sttResponse.ok) {
            throw new Error(`Whisper API error: ${await sttResponse.text()}`);
          }

          const { text } = await sttResponse.json();
          setLastTranscript(text);
          console.log('✅ Transcription:', text);

          // Step 2: GPT-4o
          console.log('🔄 Step 2: Getting AI response...');
          setCurrentStatus('Getting AI response...');

          const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${OPENAI_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "gpt-4o",
              messages: [
                {
                  role: "system",
                  content: "You are a helpful, warm AI assistant. Keep your responses conversational and under 100 words since they will be spoken aloud."
                },
                {
                  role: "user", 
                  content: text
                }
              ],
              max_tokens: 150,
              temperature: 0.7
            })
          });

          if (!gptResponse.ok) {
            throw new Error(`GPT-4o API error: ${await gptResponse.text()}`);
          }

          const gptData = await gptResponse.json();
          const aiResponse = gptData.choices[0]?.message?.content || "I understand. Could you tell me more?";
          setLastResponse(aiResponse);
          console.log('✅ AI Response:', aiResponse);

          if (!isSpeakerEnabled) {
            setCurrentStatus('Response ready (speaker disabled)');
            setIsProcessing(false);
            return;
          }

          // Step 3: OpenAI TTS
          console.log('🔄 Step 3: Converting to speech...');
          setCurrentStatus('Converting to speech...');

          const ttsResponse = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${OPENAI_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "tts-1-hd",
              voice: selectedVoice,
              input: aiResponse
            })
          });

          if (!ttsResponse.ok) {
            throw new Error(`TTS API error: ${await ttsResponse.text()}`);
          }

          const audioBlob2 = await ttsResponse.blob();
          const audioUrl = URL.createObjectURL(audioBlob2);

          console.log('🔊 Playing AI response...');
          setCurrentStatus('AI is speaking...');
          await playAudio(audioUrl);

        } catch (error) {
          console.error('Processing error:', error);
          toast.error(`Error: ${error.message}`);
          setCurrentStatus('Error occurred');
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current.start();

    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
      setCurrentStatus('Error: Microphone access denied');
      setIsRecording(false);
    }
  }, [isMicEnabled, selectedVoice, isSpeakerEnabled, playAudio]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
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
  }, []);

  // Auto-loop: start recording when session is active and not busy
  useEffect(() => {
    if (sessionStarted && !isRecording && !isProcessing && !isPlaying && isMicEnabled) {
      const timer = setTimeout(() => {
        setCurrentStatus('Ready - Listening...');
        startRecording();
      }, 500); // Small delay to allow state to settle
      
      return () => clearTimeout(timer);
    }
  }, [sessionStarted, isRecording, isProcessing, isPlaying, isMicEnabled, startRecording]);

  const startSession = () => {
    setSessionStarted(true);
    setCurrentStatus('Starting voice session...');
    toast.success('OpenAI voice session started! The AI will listen automatically.');
  };

  const endSession = () => {
    stopRecording();
    setSessionStarted(false);
    setLastTranscript('');
    setLastResponse('');
    setCurrentStatus('Choose your AI voice and tap to begin');
    toast.info('Voice session ended');
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
                  Start Automatic Voice Chat
                </Button>
                <p className="text-sm text-gray-600">
                  Powered by OpenAI • Automatic conversation flow
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status */}
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 font-medium">{currentStatus}</p>
                {isRecording && (
                  <div className="mt-2">
                    <div className="w-8 h-8 mx-auto bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                      <Mic className="h-4 w-4 text-white" />
                    </div>
                  </div>
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
                  onClick={endSession}
                  className="text-red-600"
                >
                  End Chat
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceOnlyChat;
