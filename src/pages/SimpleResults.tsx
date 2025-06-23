
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, RefreshCw, Home } from 'lucide-react';

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

const SimpleResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const responses = location.state?.responses;
  
  const [insights, setInsights] = useState<AssessmentInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!responses) {
      navigate('/simple-assessment');
      return;
    }
    
    // Simulate AI analysis
    generateMockInsights();
  }, [responses, navigate]);

  const generateMockInsights = () => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const mockInsights: AssessmentInsights = {
        supportiveMessage: "Thank you for taking the time to reflect on your mental health. Your responses show self-awareness and a willingness to understand your experiences better, which are important steps toward wellness.",
        insights: [
          {
            title: "Emotional Awareness",
            description: "Your responses indicate a good level of self-awareness about your emotional states and patterns.",
            reframe: "This self-awareness is a significant strength that will serve you well in your wellness journey."
          },
          {
            title: "Support Systems",
            description: "Based on your responses about connections with others, there may be opportunities to strengthen your support network.",
            reframe: "Building meaningful connections is a gradual process, and recognizing this need is an important first step."
          },
          {
            title: "Stress Management",
            description: "Your responses suggest that stress and worry may be impacting your daily life in various ways.",
            reframe: "Learning effective stress management techniques can significantly improve your overall well-being and quality of life."
          }
        ],
        actionSteps: [
          {
            title: "Daily Mindfulness Practice",
            description: "Incorporating mindfulness into your routine can help manage stress and improve emotional regulation.",
            action: "Try 5-10 minutes of meditation or deep breathing exercises each morning."
          },
          {
            title: "Sleep Hygiene",
            description: "Quality sleep is fundamental to mental health and emotional stability.",
            action: "Establish a consistent bedtime routine and limit screen time before sleep."
          },
          {
            title: "Social Connection",
            description: "Nurturing relationships and building new connections can provide crucial emotional support.",
            action: "Reach out to one friend or family member this week for a meaningful conversation."
          }
        ]
      };

      setInsights(mockInsights);
      setIsLoading(false);
    }, 2000);
  };

  const handleRetakeAssessment = () => {
    navigate('/simple-assessment');
  };

  const handleGoHome = () => {
    navigate('/simple');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
            <h3 className="text-lg font-semibold mb-2">Analyzing Your Responses</h3>
            <p className="text-gray-600">Generating personalized insights based on your assessment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-purple-700">
              Your Personal Insights
            </CardTitle>
            <p className="text-sm text-gray-600">
              Analysis based on your assessment responses
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

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6 text-center space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">What's Next?</h3>
                <p className="text-gray-600 mb-4">
                  Consider these insights as a starting point for your wellness journey. 
                  Remember that seeking professional support is always a valuable option.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={handleRetakeAssessment}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retake Assessment
                  </Button>
                  <Button 
                    onClick={handleGoHome}
                    className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default SimpleResults;
