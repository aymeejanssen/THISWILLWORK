
import { supabase } from '../integrations/supabase/client';

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  gender: 'FEMALE' | 'MALE';
}

export const googleVoices: VoiceOption[] = [
  { id: 'en-US-Neural2-F', name: 'Voice 1', description: 'Warm, empathetic female voice', gender: 'FEMALE' },
  { id: 'en-US-Neural2-H', name: 'Voice 2', description: 'Soft, nurturing female voice', gender: 'FEMALE' },
  { id: 'en-US-Neural2-A', name: 'Voice 3', description: 'Gentle, reassuring male voice', gender: 'MALE' },
  { id: 'en-US-Neural2-J', name: 'Voice 4', description: 'Warm, understanding male voice', gender: 'MALE' }
];

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

  async speak(text: string, voiceId: string = 'en-US-Neural2-F'): Promise<void> {
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

      // Call the text-to-speech edge function
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: text,
          voice: voiceId
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
          
          source.onerror = (error) => {
            console.error('Audio playback error:', error);
            this.currentAudioSource = null;
            reject(error);
          };
          
          source.start(0);
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
