
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, PhoneOff, Settings, Home, StopCircle, Volume2, VolumeX, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import ListeningIndicator from "./ListeningIndicator";

interface MessageEventData {
  type: string;
  [key: string]: any;
}

const wsUrl = "wss://pjwwdktyzmpldfjfnehe.functions.supabase.co/functions/v1/ai-voice-realtime";

interface VoiceOnlyChatProps {
  onClose: () => void;
}

const VoiceOnlyChat = ({ onClose }: VoiceOnlyChatProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCallOngoing, setIsCallOngoing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Realtime audio states
  const [connected, setConnected] = useState(false);
  const [replyText, setReplyText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Audio playback
  const audioQueue = useRef<Uint8Array[]>([]);
  const [playing, setPlaying] = useState(false);
  
  // Mute states
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);

  // Refs for audio processing
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // Util: base64 -> Uint8Array
  const base64ToUint8 = (base64: string): Uint8Array => {
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    return bytes;
  }

  // Util: PCM -> WAV for playback
  const pcmToWav = (pcm: Uint8Array, sampleRate = 24000) => {
    const buffer = new ArrayBuffer(44 + pcm.length);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + pcm.length, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, pcm.length, true);

    new Uint8Array(buffer, 44).set(pcm);
    return buffer;
  }

  const safeCloseAudioContext = useCallback(async () => {
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        await audioContextRef.current.close();
        console.log("AudioContext closed!");
      } catch (e) {
        console.warn("Error closing AudioContext: ", e);
      }
      audioContextRef.current = null;
    }
  }, []);

  const stopMicStream = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  const playAudioQueue = useCallback(async () => {
    if (playing || audioQueue.current.length === 0 || !isSpeakerEnabled) return;

    setPlaying(true);
    while (audioQueue.current.length > 0) {
      const next = audioQueue.current.shift();
      if (next && audioContextRef.current) {
        try {
          const wav = pcmToWav(next);
          const buf = await audioContextRef.current.decodeAudioData(wav.slice(0));
          const src = audioContextRef.current.createBufferSource();
          src.buffer = buf;
          src.connect(audioContextRef.current.destination);
          await new Promise<void>((res) => {
            src.onended = () => res();
            src.start();
          });
        } catch (e) {
          console.error("Audio playback error:", e);
          continue;
        }
      }
    }
    setPlaying(false);
  }, [playing, isSpeakerEnabled]);

  const startMicStream = useCallback(async () => {
    if (!navigator.mediaDevices) return;
    try {
      if (!audioContextRef.current || audioContextRef.current.state === "closed") {
        audioContextRef.current = new window.AudioContext({ sampleRate: 24000 });
      }
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 24000, channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      
      const audioContext = audioContextRef.current;
      const input = audioContext.createMediaStreamSource(mediaStreamRef.current);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (event) => {
        const inbuf = event.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inbuf.length);
        for (let i = 0; i < inbuf.length; i++) {
          const s = Math.max(-1, Math.min(1, inbuf[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        const pcmU8 = new Uint8Array(pcm16.buffer);
        const chunkBin = String.fromCharCode(...pcmU8);
        const b64 = btoa(chunkBin);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: "input_audio_buffer.append",
            audio: b64
          }));
        }
      };
      input.connect(processor);
      processor.connect(audioContext.destination);
      processorRef.current = processor;
    } catch (e: any) {
      setErrorMsg("Microphone access failed. Please enable it in your browser settings.");
      toast.error("Microphone access failed: " + (e?.message || e));
      endConversation();
    }
  }, []);

  const connectWS = useCallback(() => {
    if (wsRef.current) return;
    setErrorMsg(null);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      if (isMicrophoneEnabled) {
          startMicStream();
      }
    };

    ws.onmessage = (event) => {
      try {
        const data: MessageEventData = JSON.parse(event.data);
        if (data.type === "error" && data.message) {
          setErrorMsg("AI Service error: " + data.message);
          return;
        }
        if (data.type === 'response.audio.delta' && data.delta) {
          audioQueue.current.push(base64ToUint8(data.delta));
          playAudioQueue();
        }
        if (data.type === 'response.audio_transcript.delta' && data.delta) {
          setReplyText((prev) => prev + data.delta);
        }
        if (data.type === 'response.audio_transcript.done' && data.transcript) {
          setReplyText((_) => data.transcript);
        }
      } catch (e) {
        // non-JSON data
      }
    };

    ws.onclose = () => {
      setConnected(false);
      stopMicStream();
      wsRef.current = null;
    };

    ws.onerror = (ev) => {
      setErrorMsg("Connection to AI service failed.");
      setConnected(false);
      stopMicStream();
      wsRef.current = null;
    };
  }, [isMicrophoneEnabled, playAudioQueue, startMicStream, stopMicStream]);

  const startConversation = async () => {
    setIsConnecting(true);
    setErrorMsg(null);
    setReplyText('');
    
    // Check for mic permission
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // We only wanted to check permission
    } catch (e) {
        toast.error("Microphone access is required to start the call.");
        setErrorMsg("Please grant microphone access and try again.");
        setIsConnecting(false);
        return;
    }

    connectWS();
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsConnecting(false);
    setReplyText("Hello! I'm your AI wellness companion. I'm listening.");
    setIsCallOngoing(true);
  };

  const endConversation = useCallback(() => {
    wsRef.current?.close();
    stopMicStream();
    safeCloseAudioContext();
    setIsCallOngoing(false);
    setConnected(false);
    setReplyText('');
    toast.message("Conversation ended.");
  }, [stopMicStream, safeCloseAudioContext]);

  const toggleMicrophone = () => {
    const nextState = !isMicrophoneEnabled;
    setIsMicrophoneEnabled(nextState);
    if (connected) {
      if (nextState) {
        startMicStream();
      } else {
        stopMicStream();
      }
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerEnabled(!isSpeakerEnabled);
  };

  useEffect(() => {
    return () => {
      endConversation();
    };
  }, [endConversation]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{
        background: "linear-gradient(135deg, #f5f3ff 0%, #f9e8fd 50%, #cef2fd 100%)",
      }}
    >
      <div
        className="w-full max-w-xl min-h-[60vh] flex flex-col items-center justify-center rounded-3xl border-0 shadow-xl backdrop-blur-md px-0 sm:px-0 animate-fade-in"
        style={{
          background: "linear-gradient(132deg, rgba(167,138,176,0.21) 0%, rgba(245,168,154,0.18) 40%, rgba(59,140,138,0.14) 100%)",
          boxShadow: "0 8px 32px 0 rgba(31,38,135,0.16)",
        }}
      >
        <CardHeader className="bg-transparent px-8 py-7 rounded-t-3xl w-full">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-3 text-purple-700">
              <Mic className="h-6 w-6" />
              AI Voice Chat
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} className="text-purple-600 hover:bg-purple-50">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-purple-600 hover:bg-purple-50">
                <Home className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col items-center justify-center w-full px-8 pb-6 bg-transparent">
          {errorMsg && (
            <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg w-full">
              <p className="text-red-700 text-sm text-center font-bold">Error</p>
              <p className="text-red-600 text-sm text-center">{errorMsg}</p>
            </div>
          )}

          {!isCallOngoing ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6 w-full">
              <Button
                onClick={startConversation}
                className="relative bg-gradient-to-br from-purple-500 via-pink-400 to-red-400 hover:from-purple-600 hover:via-pink-500 hover:to-red-500 text-white w-32 h-32 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transform transition-all duration-300 text-2xl font-bold border-purple-200 border-4 mx-auto"
                disabled={isConnecting}
                style={{ fontSize: 26 }}
              >
                {isConnecting ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                ) : (
                  "Start"
                )}
              </Button>
              <p className="text-gray-700 text-lg text-center font-medium">
                {isConnecting ? "Connecting..." : "Tap to begin your session"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-between h-full w-full">
              <div className="flex-1 flex flex-col items-center justify-center p-4 w-full text-center">
                <ListeningIndicator isListening={connected && isMicrophoneEnabled} size={120} />
                <div className="mt-4 text-gray-800 text-lg font-semibold mb-2">AI Reply:</div>
                <p className="whitespace-pre-wrap text-gray-600 min-h-[50px]">{replyText}</p>
              </div>

              <div className="flex items-center justify-around w-full p-4 border-t border-gray-200">
                <Button variant="outline" size="sm" onClick={toggleMicrophone} className="flex items-center gap-2">
                  {isMicrophoneEnabled ? <Mic /> : <MicOff />}
                  {isMicrophoneEnabled ? "Mute Mic" : "Unmute"}
                </Button>
                <Button variant="outline" size="sm" onClick={toggleSpeaker} className="flex items-center gap-2">
                  {isSpeakerEnabled ? <Volume2 /> : <VolumeX />}
                  {isSpeakerEnabled ? "Mute" : "Unmute"}
                </Button>
                <Button variant="destructive" size="sm" onClick={endConversation} className="flex items-center gap-2">
                  <PhoneOff />
                  End Call
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        {showSettings && (
          <div className="w-full px-8 py-6 border-t border-purple-100 bg-white/70 rounded-b-3xl">
            <h4 className="text-lg font-semibold text-purple-700 mb-4">Settings</h4>
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-700">Microphone:</label>
              <Button variant="outline" size="sm" onClick={toggleMicrophone}>
                {isMicrophoneEnabled ? "Mute" : "Unmute"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Speaker:</label>
              <Button variant="outline" size="sm" onClick={toggleSpeaker}>
                {isSpeakerEnabled ? "Mute" : "Unmute"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceOnlyChat;
