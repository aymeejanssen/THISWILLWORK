
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Heart, AlertTriangle } from 'lucide-react';

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
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-blue-600" />
            Data Privacy Consent
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-96">
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800">Sensitive Personal Data Notice</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    This app processes sensitive mental health data. Your explicit consent is required under GDPR.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 border border-blue-200 rounded-lg">
                <Checkbox 
                  checked={consents.dataProcessing}
                  onCheckedChange={(checked) => handleConsentChange('dataProcessing', !!checked)}
                  className="mt-1"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">Data Processing (Required)</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    I consent to the processing of my sensitive mental health data including assessment responses, 
                    personal concerns, and emotional state information for the purpose of providing AI wellness coaching.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border border-purple-200 rounded-lg">
                <Checkbox 
                  checked={consents.aiAnalysis}
                  onCheckedChange={(checked) => handleConsentChange('aiAnalysis', !!checked)}
                  className="mt-1"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">AI Analysis (Required)</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    I consent to AI analysis of my responses to generate personalized insights, 
                    recommendations, and coaching conversations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border border-green-200 rounded-lg">
                <Checkbox 
                  checked={consents.voiceRecording}
                  onCheckedChange={(checked) => handleConsentChange('voiceRecording', !!checked)}
                  className="mt-1"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">Voice Recording (Optional)</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    I consent to voice recording during AI coaching sessions for speech-to-text processing. 
                    Voice data is processed in real-time and not permanently stored.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                <Checkbox 
                  checked={consents.analytics}
                  onCheckedChange={(checked) => handleConsentChange('analytics', !!checked)}
                  className="mt-1"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">Usage Analytics (Optional)</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    I consent to anonymous usage analytics to improve the service quality and user experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800">Your Rights</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    You can withdraw consent, request data deletion, or access your data at any time. 
                    Contact privacy@mynde.ase for any privacy-related requests.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4">
          <Button 
            onClick={onDecline} 
            variant="outline" 
            className="flex-1"
          >
            Decline
          </Button>
          <Button 
            onClick={() => onConsent(consents)}
            disabled={!canProceed}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Accept & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsentModal;
