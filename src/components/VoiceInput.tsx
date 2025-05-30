
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isListening: boolean;
  onListeningChange: (listening: boolean) => void;
  className?: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  isListening,
  onListeningChange,
  className
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (isInitializedRef.current) return;
    
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      console.log('Initializing speech recognition...');
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        console.log('Speech recognition started');
      };

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          console.log('Voice transcript:', finalTranscript);
          onTranscript(finalTranscript);
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'aborted') {
          onListeningChange(false);
        }
      };

      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        onListeningChange(false);
      };

      recognitionRef.current = recognitionInstance;
      setIsSupported(true);
      isInitializedRef.current = true;
    } else {
      console.warn('Speech recognition not supported in this browser');
      setIsSupported(false);
    }

    // Cleanup function
    return () => {
      if (recognitionRef.current && isListening) {
        console.log('Cleaning up speech recognition...');
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping recognition during cleanup:', error);
        }
      }
    };
  }, []); // Empty dependency array - only run once

  // Handle listening state changes
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      try {
        console.log('Starting speech recognition...');
        recognition.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        onListeningChange(false);
      }
    } else {
      try {
        console.log('Stopping speech recognition...');
        recognition.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  }, [isListening, onListeningChange]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      console.error('Recognition not initialized');
      return;
    }

    console.log('Toggling listening state from:', isListening);
    onListeningChange(!isListening);
  };

  if (!isSupported) {
    return null; // Hide the button if not supported
  }

  return (
    <Button
      type="button"
      variant={isListening ? "default" : "outline"}
      size="sm"
      onClick={toggleListening}
      className={cn(
        "flex items-center gap-2 transition-all duration-200",
        isListening && "bg-red-500 hover:bg-red-600 text-white animate-pulse",
        className
      )}
    >
      {isListening ? (
        <>
          <MicOff className="h-4 w-4" />
          Stop Recording
        </>
      ) : (
        <>
          <Mic className="h-4 w-4" />
          Speak Answer
        </>
      )}
    </Button>
  );
};

export default VoiceInput;
