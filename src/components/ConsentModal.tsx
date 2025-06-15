
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Sparkles } from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  onConsent: (consents: ConsentData) => void;
  onDecline: () => void;
}

interface ConsentData {
  dataProcessing: boolean;
  aiAnalysis: boolean;
  voiceRecording: boolean;
  analytics: boolean;
}

const ConsentModal = ({ isOpen, onConsent, onDecline }: ConsentModalProps) => {
  const [consents, setConsents] = useState<ConsentData>({
    dataProcessing: false,
    aiAnalysis: false,
    voiceRecording: false,
    analytics: false
  });

  const handleConsentChange = (key: keyof ConsentData, value: boolean) => {
    setConsents(prev => ({ ...prev, [key]: value }));
  };

  const canProceed = consents.dataProcessing && consents.aiAnalysis;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-xl max-h-[80vh] p-0 bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold mt-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            Unlock Your Personalized AI Coach
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-96 px-6 py-4">
          <div className="space-y-6">
            {/* Minimal intro */}
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-purple-400" />
              <span className="font-medium text-gray-700 text-base">We care about your privacy and personalized experience.</span>
            </div>

            {/* Consents - organized, minimal card for each */}
            <div className="space-y-4">

              <div className="flex gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200 items-start">
                <Checkbox 
                  checked={consents.dataProcessing}
                  onCheckedChange={(checked) => handleConsentChange('dataProcessing', !!checked)}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900 text-base">Remember Your Journey</h4>
                    <span className="text-xs bg-gray-200 text-gray-600 rounded px-2 py-0.5 ml-1 font-medium">Required</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">Let us save your answers and progress so your AI coach can support you better.</p>
                  <div className="text-xs text-gray-500 mt-1">AI will remember your journey and offer context over time.</div>
                </div>
              </div>

              <div className="flex gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200 items-start">
                <Checkbox 
                  checked={consents.aiAnalysis}
                  onCheckedChange={(checked) => handleConsentChange('aiAnalysis', !!checked)}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900 text-base">Smart Insights & Advice</h4>
                    <span className="text-xs bg-gray-200 text-gray-600 rounded px-2 py-0.5 ml-1 font-medium">Required</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">Allow your AI to analyze your responses and personalize its support.</p>
                  <div className="text-xs text-gray-500 mt-1">You'll receive advice tailored to your needs.</div>
                </div>
              </div>

              {/* Divide optional section */}
              <div className="pt-1 pb-1 text-xs text-gray-400 font-medium tracking-wide uppercase">Optional</div>
              
              <div className="flex gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200 items-start">
                <Checkbox 
                  checked={consents.voiceRecording}
                  onCheckedChange={(checked) => handleConsentChange('voiceRecording', !!checked)}
                  className="mt-1"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 text-base">Voice Conversations</h4>
                  <p className="text-sm text-gray-700 mt-1">Talk to your AI coach using voice (audio never saved).</p>
                  <div className="text-xs text-gray-500 mt-1">Enjoy natural spoken conversations.</div>
                </div>
              </div>

              <div className="flex gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200 items-start">
                <Checkbox 
                  checked={consents.analytics}
                  onCheckedChange={(checked) => handleConsentChange('analytics', !!checked)}
                  className="mt-1"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 text-base">Anonymous Analytics</h4>
                  <p className="text-sm text-gray-700 mt-1">Help us improve the app anonymously.</p>
                  <div className="text-xs text-gray-500 mt-1">Your use helps AI coaching support others.</div>
                </div>
              </div>
            </div>

            {/* Control info at the bottom */}
            <div className="border-t pt-4 mt-4">
              <span className="block text-xs text-gray-400">You can change your choices or delete your data anytime.</span>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-3 p-6 pt-0">
          <Button 
            onClick={onDecline} 
            variant="outline" 
            className="flex-1"
          >
            Not Right Now
          </Button>
          <Button 
            onClick={() => onConsent(consents)}
            disabled={!canProceed}
            className="flex-1 bg-purple-500 hover:bg-purple-600"
          >
            Start My AI Coaching Journey
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsentModal;
