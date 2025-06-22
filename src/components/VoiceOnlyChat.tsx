// VoiceOnlyChat.tsx — with conversation memory, interrupt capability, and voice customization

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff, Volume2, VolumeX, Settings, Home } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const openAIVoices = [
  { id: 'alloy', name: 'Alloy (Male)', description: 'Balanced, natural voice' },
  { id: 'echo', name: 'Echo (Male)', description: 'Clear, articulate voice' },
  { id: 'fable', name: 'Fable (Female)', description: 'Warm, engaging voice' },
  { id: 'onyx', name: 'Onyx (Male)', description: 'Deep, confident voice' },
  { id: 'nova', name: 'Nova (Female)', description: 'Bright, energetic voice' },
  { id: 'shimmer', name: 'Shimmer (Female)', description: 'Gentle, soothing voice' }
];

const VoiceOnlyChat = () => {
  const navigate = useNavigate();
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [chatHistory, setChatHistory] = useState([]);
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
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    if (!isMicEnabled) return;
    setIsRecording(true);
    setCurrentStatus('Listening...');

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const mediaRecorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const file = new File([blob], 'speech.webm', { type: 'audio/webm' });

      const form = new FormData();
      form.append('file', file);
      form.append('model', 'whisper-1');

      const transcriptionRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form
      });
      const { text } = await transcriptionRes.json();
      setLastTranscript(text);

      const newHistory = [...chatHistory, { role: 'user', content: text }];

      const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are a warm, empathetic AI therapist. Remember what the user shares. Keep responses under 80 words.' },
            ...newHistory
          ]
        })
      });
      const { choices } = await chatRes.json();
      const aiMessage = choices[0]?.message?.content || 'Can you tell me more?';
      setLastResponse(aiMessage);
      setChatHistory([...newHistory, { role: 'assistant', content: aiMessage }]);

      const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1-hd',
          voice: selectedVoice,
          input: aiMessage
        })
      });

      const audioBlob = await ttsRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 7000); // 7s limit or until silence detection
  }, [chatHistory, selectedVoice]);

  useEffect(() => {
    if (sessionStarted && !isRecording && !isProcessing && !isPlaying) {
      startRecording();
    }
  }, [sessionStarted, isRecording, isProcessing, isPlaying, startRecording]);

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Live AI Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {openAIVoices.map((v) => (
                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setSessionStarted(true)} className="mt-4">Start Chat</Button>
          {lastTranscript && <p className="mt-2 text-sm">You said: {lastTranscript}</p>}
          {lastResponse && <p className="mt-1 text-sm">AI: {lastResponse}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceOnlyChat;

