
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Heart, AlertTriangle, Brain, Sparkles } from 'lucide-react';

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
            <Sparkles className="h-6 w-6 text-purple-600" />
            Unlock Your Personalized AI Coach
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-96">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-800">Why We Need Your Data</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Your AI coach needs to remember your stories, struggles, and progress to provide truly personalized guidance. 
                    The more your AI understands you, the better support it can offer.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 border border-blue-200 rounded-lg bg-blue-50">
                <Checkbox 
                  checked={consents.dataProcessing}
                  onCheckedChange={(checked) => handleConsentChange('dataProcessing', !!checked)}
                  className="mt-1"
                />
                <div>
                  <h4 className="font-semibold text-blue-900">Remember Your Journey (Required)</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Allow your AI coach to store and remember your assessment responses, personal concerns, and emotional patterns. 
                    This helps build a complete picture of your wellness journey so your coach can provide increasingly personalized support.
                  </p>
                  <div className="mt-2 text-xs text-blue-600 bg-blue-100 p-2 rounded">
                    ✨ <strong>Benefit:</strong> Your AI remembers past conversations and can reference your progress over time
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border border-purple-200 rounded-lg bg-purple-50">
                <Checkbox 
                  checked={consents.aiAnalysis}
                  onCheckedChange={(checked) => handleConsentChange('aiAnalysis', !!checked)}
                  className="mt-1"
                />
                <div>
                  <h4 className="font-semibold text-purple-900">Smart Insights & Advice (Required)</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Enable your AI to analyze your responses and generate personalized insights, actionable recommendations, 
                    and tailored coaching conversations that evolve with your needs.
                  </p>
                  <div className="mt-2 text-xs text-purple-600 bg-purple-100 p-2 rounded">
                    ✨ <strong>Benefit:</strong> Get advice that's specifically crafted for your unique situation and goals
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border border-green-200 rounded-lg bg-green-50">
                <Checkbox 
                  checked={consents.voiceRecording}
                  onCheckedChange={(checked) => handleConsentChange('voiceRecording', !!checked)}
                  className="mt-1"
                />
                <div>
                  <h4 className="font-semibold text-green-900">Natural Voice Conversations (Optional)</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Have natural, flowing conversations with your AI coach using your voice. Voice data is processed 
                    in real-time for speech recognition only - no recordings are permanently stored.
                  </p>
                  <div className="mt-2 text-xs text-green-600 bg-green-100 p-2 rounded">
                    ✨ <strong>Benefit:</strong> More natural, therapy-like conversations that feel personal and engaging
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <Checkbox 
                  checked={consents.analytics}
                  onCheckedChange={(checked) => handleConsentChange('analytics', !!checked)}
                  className="mt-1"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">Improve Your Experience (Optional)</h4>
                  <p className="text-sm text-gray-700 mt-1">
                    Help us understand how you use the app so we can make your AI coach even better at supporting 
                    people with similar challenges. All data is anonymous.
                  </p>
                  <div className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded">
                    ✨ <strong>Benefit:</strong> Contribute to making AI coaching more effective for everyone
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800">You're Always in Control</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    You can change your mind anytime. Withdraw consent, delete your data, or download everything you've shared. 
                    Your privacy and control matter to us. Contact privacy@mynde.ase for any requests.
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
            Not Right Now
          </Button>
          <Button 
            onClick={() => onConsent(consents)}
            disabled={!canProceed}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            Start My AI Coaching Journey
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsentModal;
