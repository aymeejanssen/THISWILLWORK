import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MessageCircle } from 'lucide-react';
import { useAssessment } from "@/contexts/AssessmentContext";
import { supabase } from "@/integrations/supabase/client";
import VoiceConversation from "@/components/VoiceConversation";
import SubscriptionModal from "@/components/SubscriptionModal";

interface AssessmentInsights {
  insights: Array<{
    title: string;
    description: string;
    reframe: string;
  }>;
  actionSteps: Array<{
    title: string;
    description: string;
    action: string;
  }>;
  supportiveMessage: string;
}

const AssessmentSummary = () => {
  const { responses } = useAssessment();
  const [insights, setInsights] = useState<AssessmentInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [conversationTimeUp, setConversationTimeUp] = useState(false);

  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Generating insights for responses:', responses);

      const { data, error } = await supabase.functions.invoke('generate-assessment-insights', {
        body: {
          responses: responses,
          primaryConcern: responses.primaryConcern || 'General wellbeing'
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate insights');
      }

      console.log('Generated insights:', data);
      setInsights(data);
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartVoiceChat = () => {
    setShowVoiceChat(true);
  };

  const handleTimeUp = () => {
    setConversationTimeUp(true);
    setShowVoiceChat(false);
    setShowSubscription(true);
  };

  const handleCloseSubscription = () => {
    setShowSubscription(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
            <h3 className="text-lg font-semibold mb-2">Analyzing Your Responses</h3>
            <p className="text-gray-600">Our AI is generating personalized insights based on your assessment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2 text-red-600">Analysis Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={generateInsights} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-purple-700">
              Your Personal Insights
            </CardTitle>
            <p className="text-sm text-gray-600">
              AI-powered analysis of your assessment responses
            </p>
          </CardHeader>
        </Card>

        {insights && (
          <>
            {/* Supportive Message */}
            <Card>
              <CardContent className="p-6">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="text-blue-800 leading-relaxed">{insights.supportiveMessage}</p>
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Key Insights About You</h3>
              {insights.insights.map((insight, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-purple-700 mb-3">{insight.title}</h4>
                    <p className="text-gray-700 mb-3">{insight.description}</p>
                    <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                      <p className="text-green-800 font-medium">{insight.reframe}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Steps */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Recommended Next Steps</h3>
              {insights.actionSteps.map((step, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-purple-700 mb-2">{step.title}</h4>
                    <p className="text-gray-600 mb-3">{step.description}</p>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg">
                      <p className="text-yellow-800 font-medium">This week: {step.action}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Voice Conversation CTA */}
            <Card className="border-2 border-purple-200">
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-purple-700 mb-3">
                  Personalized Intake Session
                </h3>
                <p className="text-gray-600 mb-6">
                  Ready to dive deeper? Have a voice conversation with our AI therapist who will discuss your specific assessment responses - completely free for 5 minutes.
                </p>
                <Button 
                  onClick={handleStartVoiceChat}
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                  disabled={conversationTimeUp}
                >
                  {conversationTimeUp ? "Free Session Complete" : "Start Free Intake Session"}
                </Button>
                {conversationTimeUp && (
                  <p className="text-sm text-gray-500 mt-2">
                    Want to continue? Check out our subscription options.
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Voice Conversation Modal/Component */}
      {showVoiceChat && (
        <VoiceConversation 
          onTimeUp={handleTimeUp}
          onClose={() => setShowVoiceChat(false)}
          timeLimit={5 * 60 * 1000} // 5 minutes in milliseconds
          assessmentResponses={responses}
        />
      )}

      {/* Subscription Modal */}
      {showSubscription && (
        <SubscriptionModal 
          isOpen={showSubscription}
          onClose={handleCloseSubscription}
        />
      )}
    </div>
  );
};

export default AssessmentSummary;
