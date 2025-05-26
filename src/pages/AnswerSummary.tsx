
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Heart } from 'lucide-react';
import { useAssessment } from '../contexts/AssessmentContext';

const AnswerSummary = () => {
  const navigate = useNavigate();
  const { questionNumber } = useParams();
  const { responses } = useAssessment();

  const currentQuestion = parseInt(questionNumber || '1');
  
  const getEncouragingMessage = () => {
    const messages = [
      "Thank you for sharing that with us. Your openness is the first step toward healing.",
      "Your self-awareness is truly remarkable. You're already showing incredible strength.",
      "Every answer you give helps us understand you better. You're doing amazing.",
      "Your honesty is beautiful. This kind of reflection takes real courage.",
      "You're being so thoughtful with your responses. This shows deep emotional intelligence.",
      "Thank you for trusting us with your feelings. Your vulnerability is a strength.",
      "Each answer brings more clarity. You're on a powerful journey of self-discovery.",
      "Your willingness to explore these feelings shows incredible bravery.",
      "You're giving yourself such a gift by taking time for this reflection.",
      "Thank you for being so genuine. Your authentic responses will help create meaningful insights."
    ];
    
    return messages[(currentQuestion - 1) % messages.length];
  };

  const getProgressMessage = () => {
    if (currentQuestion <= 3) {
      return "You're just getting started, and already showing such courage.";
    } else if (currentQuestion <= 6) {
      return "You're making wonderful progress. Keep going!";
    } else if (currentQuestion <= 9) {
      return "You're more than halfway through. Your dedication is inspiring.";
    } else {
      return "You're almost at the end. Your commitment to this process is beautiful.";
    }
  };

  const handleContinue = () => {
    navigate('/'); // Go back to continue the assessment
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6 flex items-center justify-center">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 rounded-full px-4 py-2 mb-4">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Answer {currentQuestion} Recorded</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Thank You for Sharing</h1>
        </div>

        <Card className="shadow-lg bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">Your Response Matters</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-700 text-lg leading-relaxed">
              {getEncouragingMessage()}
            </p>
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <p className="text-purple-800 font-medium">
                {getProgressMessage()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">What happens next?</h3>
              <p className="text-gray-600">
                We're carefully noting your response to create a personalized summary just for you. 
                Each answer helps us understand your unique journey better.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 text-sm">
                  💙 Your responses are being woven together to create insights that honor your individual experience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button 
            onClick={handleContinue} 
            className="bg-purple-600 hover:bg-purple-700" 
            size="lg"
          >
            Continue Assessment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnswerSummary;
