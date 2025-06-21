
import React from 'react';
import VoiceChat from '@/components/VoiceChat';

const Conversation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AI Voice Conversation
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience real-time voice conversation with AI. Speak naturally and get instant voice responses 
            powered by advanced AI models.
          </p>
        </div>
        
        <VoiceChat />
      </div>
    </div>
  );
};

export default Conversation;
