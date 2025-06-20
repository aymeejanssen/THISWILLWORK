
import { supabase } from '../integrations/supabase/client';

class OpenAIVoiceService {
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private currentAudio: HTMLAudioElement | null = null;
  
  // Make supabase accessible for the component
  public supabase = supabase;

  async initializeAudioContext(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        
        // Stop all tracks
        if (this.mediaRecorder?.stream) {
          this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const { data, error } = await supabase.functions.invoke('openai-speech-to-text', {
        body: formData
      });

      if (error) {
        console.error('Transcription error:', error);
        throw error;
      }

      return data.text || '';
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  }

  async generateChatResponse(userMessage: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<string> {
    try {
      // Create system message for natural conversation
      const systemMessage = {
        role: 'system',
        content: 'Je bent een behulpzame AI-assistent die natuurlijke gesprekken voert. Houd je antwoorden kort en conversationeel (maximaal 2-3 zinnen), alsof je een normaal gesprek voert. Spreek Nederlands en wees vriendelijk en persoonlijk.'
      };

      const messages = [
        systemMessage,
        ...conversationHistory,
        {
          role: 'user',
          content: userMessage
        }
      ];

      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          messages,
          maxTokens: 100 // Keep responses short for natural conversation
        }
      });

      if (error) {
        console.error('Chat error:', error);
        throw error;
      }

      return data.response || 'Sorry, ik kon geen antwoord genereren.';
    } catch (error) {
      console.error('Error generating chat response:', error);
      throw error;
    }
  }

  async textToSpeech(text: string, voice: string = 'nova'): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('openai-text-to-speech', {
        body: {
          text,
          voice
        }
      });

      if (error) {
        console.error('Text-to-speech error:', error);
        throw error;
      }

      // Return base64 audio data
      return `data:audio/mp3;base64,${data.audioContent}`;
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  }

  async playAudio(audioDataUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Stop current audio if playing
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }

      this.currentAudio = new Audio(audioDataUrl);
      
      this.currentAudio.onended = () => {
        this.currentAudio = null;
        resolve();
      };

      this.currentAudio.onerror = (error) => {
        console.error('Audio playback error:', error);
        this.currentAudio = null;
        reject(error);
      };

      this.currentAudio.play().catch(reject);
    });
  }

  stopCurrentAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }

  cleanup(): void {
    this.stopCurrentAudio();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const openaiVoiceService = new OpenAIVoiceService();
