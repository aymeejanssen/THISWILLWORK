
import { supabase } from '../integrations/supabase/client';

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  gender: 'FEMALE' | 'MALE';
  provider: 'google' | 'elevenlabs';
}

// Google Cloud Text-to-Speech voices with improved settings
export const googleVoices: VoiceOption[] = [
  { id: 'en-US-Neural2-F', name: 'Google Voice 1', description: 'Warm, empathetic female voice', gender: 'FEMALE', provider: 'google' },
  { id: 'en-US-Neural2-H', name: 'Google Voice 2', description: 'Soft, nurturing female voice', gender: 'FEMALE', provider: 'google' },
  { id: 'en-US-Neural2-A', name: 'Google Voice 3', description: 'Gentle, reassuring male voice', gender: 'MALE', provider: 'google' },
  { id: 'en-US-Neural2-J', name: 'Google Voice 4', description: 'Warm, understanding male voice', gender: 'MALE', provider: 'google' }
];

// ElevenLabs voices - much more human-like
export const elevenLabsVoices: VoiceOption[] = [
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', description: 'Natural, conversational female voice', gender: 'FEMALE', provider: 'elevenlabs' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Warm, empathetic female voice', gender: 'FEMALE', provider: 'elevenlabs' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', description: 'Gentle, caring female voice', gender: 'FEMALE', provider: 'elevenlabs' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', description: 'Calm, reassuring male voice', gender: 'MALE', provider: 'elevenlabs' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', description: 'Friendly, understanding male voice', gender: 'MALE', provider: 'elevenlabs' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', description: 'Deep, comforting male voice', gender: 'MALE', provider: 'elevenlabs' }
];

// Combined voices list
export const allVoices: VoiceOption[] = [...elevenLabsVoices, ...googleVoices];

class VoiceService {
  private audioContext: AudioContext | null = null;
  private currentAudioSource: AudioBufferSourceNode | null = null;
  private isEnabled: boolean = true;

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
      const provider = voice?.provider || 'elevenlabs'; // Default to ElevenLabs for better quality

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

      if (data?.audioContent && this.audioContext) {
        // Convert base64 to audio buffer
        const binaryString = atob(data.audioContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Decode and play audio
        const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer);
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioContext.destination);
        
        this.currentAudioSource = source;
        
        return new Promise((resolve, reject) => {
          source.onended = () => {
            console.log('Speech completed');
            this.currentAudioSource = null;
            resolve();
          };
          
          source.start(0);
          
          // Handle potential errors during playback
          setTimeout(() => {
            if (this.currentAudioSource === source) {
              console.log('Speech playback completed successfully');
              resolve();
            }
          }, 100);
        });
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
