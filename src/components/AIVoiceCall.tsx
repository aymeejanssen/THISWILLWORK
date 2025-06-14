import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle } from "lucide-react";

interface MessageEventData {
  type: string;
  [key: string]: any;
}

const wsUrl = "wss://pjwwdktyzmpldfjfnehe.functions.supabase.co/functions/v1/ai-voice-realtime";

const AIVoiceCall: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [replyText, setReplyText] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Debug and error state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [debugResult, setDebugResult] = useState<string>("");

  // Audio queue and playback
  const audioQueue = useRef<Uint8Array[]>([]);
  const [playing, setPlaying] = useState(false);

  // Microphone stream setup
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // Util: base64 -> Uint8Array
  function base64ToUint8(base64: string): Uint8Array {
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    return bytes;
  }

  // PCM -> WAV (16-bit, 24kHz, mono)
  function pcmToWav(pcm: Uint8Array, sampleRate = 24000) {
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

  // Audio queue playback
  const playAudioQueue = async () => {
    if (playing || audioQueue.current.length === 0) return;

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
          await new Promise((res) => {
            src.onended = () => res(true);
            src.start();
          });
        } catch (e) {
          // Skip corrupted chunk
          continue;
        }
      }
    }
    setPlaying(false);
  };

  // Defensive close for AudioContext
  const safeCloseAudioContext = async () => {
    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state !== "closed") {
          await audioContextRef.current.close();
          console.log("AudioContext closed!");
        } else {
          console.log("Attempted to close an already closed AudioContext.");
        }
      } catch (e) {
        console.warn("Error closing AudioContext: ", e);
      }
      audioContextRef.current = null;
    }
  };

  // WebSocket setup
  const connectWS = () => {
    if (wsRef.current) return;
    setErrorMsg(null); // Reset errors on connect
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setReplyText('');
      setTranscript('');
      startMicStream();
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
        if (data.type === 'response.audio.done') {
          // No specific UI needed
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
      setErrorMsg("WebSocket connection failed.");
      setConnected(false);
      stopMicStream();
      wsRef.current = null;
    };
  };

  // Microphone streaming, with robust AudioContext checks
  const startMicStream = async () => {
    if (!navigator.mediaDevices) return;
    try {
      if (audioContextRef.current == null || audioContextRef.current.state === "closed") {
        audioContextRef.current = new window.AudioContext({ sampleRate: 24000 });
        console.log("Created new AudioContext.");
      } else {
        console.log("Re-using already open AudioContext.", audioContextRef.current.state);
      }
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      const stream = mediaStreamRef.current;
      if (!stream) return;
      const audioContext = audioContextRef.current;
      const input = audioContext.createMediaStreamSource(stream);
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
      setErrorMsg("Microphone or AudioContext failed: " + (e?.message || e));
    }
  };

  const stopMicStream = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    // Use safe close:
    safeCloseAudioContext();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMicStream();
      wsRef.current?.close();
      wsRef.current = null;
      safeCloseAudioContext();
    };
  }, []);

  // UI actions
  const handleStart = () => {
    setErrorMsg(null);
    connectWS();
  };
  const handleStop = () => {
    wsRef.current?.close();
    stopMicStream();
    setConnected(false);
  };

  // --- DEBUG PANEL ---
  async function testFunction(name: "ai-voice-realtime" | "text-to-speech" | "elevenlabs-agent") {
    setDebugResult("Testing...");
    setErrorMsg(null);
    try {
      if (name === "ai-voice-realtime") {
        const ws = new WebSocket(wsUrl);
        return new Promise<void>((resolve) => {
          ws.onopen = () => {
            setDebugResult("ai-voice-realtime: WebSocket connected ✅");
            ws.close();
            resolve();
          };
          ws.onerror = () => {
            setDebugResult("ai-voice-realtime: WebSocket failed ❌");
            resolve();
          };
        });
      }
      if (name === "text-to-speech") {
        const res = await fetch(
          "https://pjwwdktyzmpldfjfnehe.functions.supabase.co/functions/v1/text-to-speech",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: "Test audio", provider: "google" }),
          }
        );
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (data.audioContent) setDebugResult("text-to-speech: Success ✅ (base64 audio returned)");
        else setDebugResult("text-to-speech: No audioContent ❌");
        return;
      }
      if (name === "elevenlabs-agent") {
        const res = await fetch(
          "https://pjwwdktyzmpldfjfnehe.functions.supabase.co/functions/v1/elevenlabs-agent",
          { method: "POST", body: JSON.stringify({ message: "Hello" }) }
        );
        if (res.ok) setDebugResult("elevenlabs-agent: Success ✅");
        else setDebugResult("elevenlabs-agent: Failed ❌: " + res.status);
        return;
      }
    } catch (err: any) {
      setDebugResult(name + ": Failed ❌: " + (err?.message || err));
    }
  }

  // --- RENDER ---
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-purple-700 mb-2">AI Voice Call (Realtime ChatGPT Voice)</h1>
        <p className="text-gray-700 mb-2 text-center">
          Press “Start Voice Call”, speak to the AI, and it will reply to you in a natural voice—with <b>real-time streaming</b>.
        </p>
      </div>
      {errorMsg && (
        <div className="bg-red-200 text-red-800 px-4 py-2 mb-2 rounded text-center">
          {errorMsg}
        </div>
      )}
      <div className="flex gap-4 mt-6">
        {!connected ? (
          <Button variant="default" className="flex items-center gap-2" onClick={handleStart}>
            <Mic className="w-5 h-5" /> Start Voice Call
          </Button>
        ) : (
          <Button variant="destructive" className="flex items-center gap-2" onClick={handleStop}>
            <StopCircle className="w-5 h-5" /> End Call
          </Button>
        )}
      </div>
      <div className="mt-8 w-full max-w-lg p-4 rounded border border-gray-200 bg-gray-50 min-h-[140px]">
        <div className="text-gray-800 text-lg font-semibold mb-2">AI Reply:</div>
        <p className="whitespace-pre-wrap">{replyText}</p>
      </div>
      {/* Debug Panel */}
      <div className="mt-10">
        <button
          onClick={() => setShowDebug(x => !x)}
          className="underline text-blue-500 text-xs"
        >
          {showDebug ? "Hide" : "Show"} Debug Panel
        </button>
        {showDebug && (
          <div className="bg-gray-200 text-xs rounded p-4 mt-2 w-[320px]">
            <div className="mb-1 font-semibold text-purple-700">Function Tests</div>
            <button
              className="px-2 py-1 bg-gray-50 border rounded mr-2 mb-2 text-black"
              onClick={() => testFunction("ai-voice-realtime")}
            >
              ai-voice-realtime
            </button>
            <button
              className="px-2 py-1 bg-gray-50 border rounded mr-2 mb-2 text-black"
              onClick={() => testFunction("text-to-speech")}
            >
              text-to-speech
            </button>
            <button
              className="px-2 py-1 bg-gray-50 border rounded mb-2 text-black"
              onClick={() => testFunction("elevenlabs-agent")}
            >
              elevenlabs-agent
            </button>
            <div className="text-gray-900 mt-2 break-words">{debugResult}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIVoiceCall;
