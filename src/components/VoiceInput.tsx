
import React, { useState, useEffect } from 'react';
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
  const [recognition, setRecognition] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

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
        onListeningChange(false);
      };

      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        onListeningChange(false);
      };

      setRecognition(recognitionInstance);
      setIsSupported(true);
    } else {
      console.warn('Speech recognition not supported in this browser');
      setIsSupported(false);
    }
  }, [onTranscript, onListeningChange]);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      onListeningChange(false);
    } else {
      recognition.start();
      onListeningChange(true);
    }
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
