
import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff } from 'lucide-react';
import { toast } from 'sonner';

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
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamSourceNode | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceStartRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const SILENCE_THRESHOLD = 0.01;
  const SILENCE_DURATION = 1200; // 1.2 seconds
  const API_KEY = "sk-proj-abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yz5678abcd9012efghXDAA"; // Your API key ending in XDAA

  // Start recording with natural speech detection
  const startRecording = useCallback(async () => {
    if (!isMicEnabled) return;

    try {
      console.log('🎤 Starting natural speech recording...');
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
        console.log('🎤 Recording stopped, processing...');
        await processRecording();
      };

      mediaRecorderRef.current.start();

    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
      setCurrentStatus('Error: Microphone access denied');
      setIsRecording(false);
    }
  }, [isMicEnabled]);

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

  // Process the complete OpenAI flow
  const processRecording = useCallback(async () => {
    if (audioChunksRef.current.length === 0) return;

    setIsProcessing(true);
    setCurrentStatus('Processing your message...');

    try {
      // Create audio blob and file
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], "input.webm", { type: 'audio/webm' });

      console.log('🔄 Step 1: Transcribing with Whisper...');
      setCurrentStatus('Transcribing your speech...');

      // Step 1: Whisper STT
      const sttForm = new FormData();
      sttForm.append("file", audioFile);
      sttForm.append("model", "whisper-1");

      const sttResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${API_KEY}` 
        },
        body: sttForm
      });

      if (!sttResponse.ok) {
        throw new Error(`Whisper API error: ${await sttResponse.text()}`);
      }

      const { text } = await sttResponse.json();
      setLastTranscript(text);
      console.log('✅ Transcription:', text);

      console.log('🔄 Step 2: Getting GPT-4o response...');
      setCurrentStatus('Thinking...');

      // Step 2: GPT-4o
      const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
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

      console.log('🔄 Step 3: Converting to speech...');
      setCurrentStatus('Converting to speech...');

      // Step 3: TTS
      const ttsResponse = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "tts-1-hd",
          voice: "nova",
          input: aiResponse
        })
      });

      if (!ttsResponse.ok) {
        throw new Error(`TTS API error: ${await ttsResponse.text()}`);
      }

      const audioBlob2 = await ttsResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob2);

      console.log('🔄 Step 4: Playing audio...');
      setCurrentStatus('Speaking...');

      // Step 4: Play the audio
      await playAudio(audioUrl);

    } catch (error) {
      console.error('Processing error:', error);
      toast.error(`Error: ${error.message}`);
      setCurrentStatus('Error occurred');
    } finally {
      setIsProcessing(false);
    }
  }, [isSpeakerEnabled]);

  // Play audio
  const playAudio = useCallback(async (audioUrl: string) => {
    return new Promise<void>((resolve) => {
      try {
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
            Natural Voice Chat
          </CardTitle>
          <p className="text-sm text-gray-600">
            Speak naturally - AI detects when you're done talking
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
              <p className="text-gray-600">Click to begin natural voice conversation</p>
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
                  {isRecording ? 'Recording... Speak naturally' : 'Click to speak'}
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
