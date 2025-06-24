
import { supabase } from '../integrations/supabase/client';

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  gender: 'FEMALE' | 'MALE';
  provider: 'google' | 'elevenlabs' | 'elevenlabs-agent';
  type?: 'tts' | 'agent';
}

// ElevenLabs Conversational AI Agents
export const elevenLabsAgents: VoiceOption[] = [
  { id: 'agent_01jwnescvrf6ss64x4va4cvhqh', name: 'Agent 1', description: 'Your first conversational AI agent', gender: 'FEMALE', provider: 'elevenlabs-agent', type: 'agent' },
  { id: 'agent_01jwndvn51fhavtqj3vs2agfps', name: 'Agent 2', description: 'Your second conversational AI agent', gender: 'MALE', provider: 'elevenlabs-agent', type: 'agent' }
];

// ElevenLabs TTS voices - much more human-like
export const elevenLabsVoices: VoiceOption[] = [
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', description: 'Natural, conversational female voice', gender: 'FEMALE', provider: 'elevenlabs', type: 'tts' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Warm, empathetic female voice', gender: 'FEMALE', provider: 'elevenlabs', type: 'tts' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', description: 'Gentle, caring female voice', gender: 'FEMALE', provider: 'elevenlabs', type: 'tts' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', description: 'Calm, reassuring male voice', gender: 'MALE', provider: 'elevenlabs', type: 'tts' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', description: 'Friendly, understanding male voice', gender: 'MALE', provider: 'elevenlabs', type: 'tts' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', description: 'Deep, comforting male voice', gender: 'MALE', provider: 'elevenlabs', type: 'tts' }
];

// Google Cloud Text-to-Speech voices with improved settings
export const googleVoices: VoiceOption[] = [
  { id: 'en-US-Neural2-F', name: 'Google Voice 1', description: 'Warm, empathetic female voice', gender: 'FEMALE', provider: 'google', type: 'tts' },
  { id: 'en-US-Neural2-H', name: 'Google Voice 2', description: 'Soft, nurturing female voice', gender: 'FEMALE', provider: 'google', type: 'tts' },
  { id: 'en-US-Neural2-A', name: 'Google Voice 3', description: 'Gentle, reassuring male voice', gender: 'MALE', provider: 'google', type: 'tts' },
  { id: 'en-US-Neural2-J', name: 'Google Voice 4', description: 'Warm, understanding male voice', gender: 'MALE', provider: 'google', type: 'tts' }
];

// Combined voices list with agents at the top
export const allVoices: VoiceOption[] = [...elevenLabsAgents, ...elevenLabsVoices, ...googleVoices];

class VoiceService {
  private audioContext: AudioContext | null = null;
  private currentAudioSource: AudioBufferSourceNode | null = null;
  private isEnabled: boolean = true;
  private currentAgent: any = null; // For ElevenLabs conversational agent

  constructor() {
    // Initialize audio context when first used
  }

  async initializeAudioContext(): Promise<void> {
    if (!this.audioContext) {
      try {
        this.audioContext = new AudioContext();
      } catch (error) {
        console.error('Failed to create audio context:', error);
        throw error;
      }
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  stopCurrentAudio(): void {
    if (this.currentAudioSource) {
      try {
        this.currentAudioSource.stop();
      } catch (error) {
        console.log('Error stopping audio source:', error);
      }
      this.currentAudioSource = null;
    }
  }

  async initializeAgent(agentId: string): Promise<void> {
    console.log('Initializing ElevenLabs conversational agent:', agentId);
    
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-agent', {
        body: { 
          action: 'initialize',
          agentId: agentId
        }
      });

      if (error) {
        console.error('Error initializing agent:', error);
        throw error;
      }

      console.log('Agent initialized successfully');
      return data;
    } catch (error) {
      console.error('Error initializing ElevenLabs agent:', error);
      throw error;
    }
  }

  async sendMessageToAgent(agentId: string, message: string): Promise<string> {
    console.log('Sending message to agent:', agentId, message);
    
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-agent', {
        body: { 
          action: 'message',
          agentId: agentId,
          message: message
        }
      });

      if (error) {
        console.error('Error sending message to agent:', error);
        throw error;
      }

      if (data?.audioContent && this.audioContext) {
        // Play the audio response from the agent
        await this.playAudioFromBase64(data.audioContent);
      }

      return data?.response || "I'm here to listen and help you.";
    } catch (error) {
      console.error('Error with agent conversation:', error);
      throw error;
    }
  }

  private async playAudioFromBase64(base64Audio: string): Promise<void> {
    if (!this.audioContext) {
      await this.initializeAudioContext();
    }

    // Convert base64 to audio buffer
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Decode and play audio
    const audioBuffer = await this.audioContext!.decodeAudioData(bytes.buffer);
    const source = this.audioContext!.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext!.destination);
    
    this.currentAudioSource = source;
    
    return new Promise((resolve) => {
      source.onended = () => {
        console.log('Agent audio completed');
        this.currentAudioSource = null;
        resolve();
      };
      
      source.start(0);
    });
  }

  async speak(text: string, voiceId: string = '9BWtsMINqrJLrRacOk9x'): Promise<void> {
    if (!this.isEnabled || !text.trim()) {
      console.log('Voice disabled or empty text');
      return;
    }

    console.log('Speaking with voice:', voiceId, 'Text:', text.substring(0, 50) + '...');

    // Stop any current audio
    this.stopCurrentAudio();

    try {
      // Initialize audio context if needed
      await this.initializeAudioContext();

      // Determine provider based on voice ID
      const voice = allVoices.find(v => v.id === voiceId);
      const provider = voice?.provider || 'elevenlabs';

      console.log('Using provider:', provider);

      // Call the text-to-speech edge function
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: text,
          voice: voiceId,
          provider: provider
        }
      });

      if (error) {
        console.error('Error generating speech:', error);
        throw error;
      }

      if (data?.audioContent) {
        await this.playAudioFromBase64(data.audioContent);
      } else {
        throw new Error('No audio content received');
      }
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      throw error;
    }
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopCurrentAudio();
    }
  }

  isAudioEnabled(): boolean {
    return this.isEnabled;
  }

  cleanup(): void {
    this.stopCurrentAudio();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Export a singleton instance
export const voiceService = new VoiceService();
