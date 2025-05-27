
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Brain, Heart, Users, Briefcase, Compass, UserCircle, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAssessment } from '../contexts/AssessmentContext';
import { supabase } from '../integrations/supabase/client';

interface AIInsight {
  title: string;
  description: string;
  reframe: string;
}

interface AIActionStep {
  title: string;
  description: string;
  action: string;
}

interface AIResponse {
  insights: AIInsight[];
  actionSteps: AIActionStep[];
  supportiveMessage: string;
}

const AssessmentSummary = () => {
  const navigate = useNavigate();
  const { responses } = useAssessment();
  const [aiInsights, setAiInsights] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateInsights = async () => {
      try {
        console.log('Calling AI function with responses:', responses);
        
        const { data, error } = await supabase.functions.invoke('generate-assessment-insights', {
          body: { responses }
        });

        if (error) {
          console.error('Supabase function error:', error);
          throw error;
        }

        console.log('AI insights generated:', data);
        setAiInsights(data);
      } catch (err) {
        console.error('Error generating AI insights:', err);
        setError('Failed to generate personalized insights. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    // Only generate insights if we have responses
    if (Object.keys(responses).length > 0) {
      generateInsights();
    } else {
      setIsLoading(false);
    }
  }, [responses]);

  const personalizedMessage = () => {
    if (aiInsights) {
      return aiInsights.supportiveMessage;
    }
    
    return "Thank you for sharing with us. Every journey to better mental health starts with a single step, and you've already taken that step by being here.";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
          <Card className="shadow-lg p-8 text-center">
            <CardContent>
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Responses</h2>
              <p className="text-gray-600">Our AI is generating personalized insights just for you...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-red-200">
            <CardContent className="pt-6 text-center">
              <h2 className="text-2xl font-bold text-red-800 mb-4">Something went wrong</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 rounded-full px-4 py-2 mb-4">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Assessment Complete</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">You Are Seen and Understood</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {personalizedMessage()}
          </p>
        </div>

        {aiInsights && aiInsights.insights.length > 0 ? (
          <>
            <Card className="shadow-lg bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">What Your Responses Tell Us About You</h2>
                <p className="text-gray-700 text-center leading-relaxed">
                  Your answers reveal someone with deep emotional intelligence, strong values, and a genuine desire for growth. 
                  Here's what we see in you:
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-6">
              {aiInsights.insights.map((insight, index) => (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="flex flex-row items-center space-y-0 space-x-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Heart className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-gray-900">{insight.title}</CardTitle>
                      <Badge className="mt-2 bg-purple-100 text-purple-800 border-purple-200">
                        Core Strength
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-gray-700 leading-relaxed">{insight.description}</p>
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                      <p className="text-blue-800 italic font-medium">💙 {insight.reframe}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {aiInsights.actionSteps.length > 0 && (
              <Card className="shadow-lg bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-2xl text-green-800 flex items-center gap-2">
                    <ArrowRight className="h-6 w-6" />
                    Your Personalized Next Steps
                  </CardTitle>
                  <p className="text-green-700">Small, gentle steps that honor where you are right now</p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {aiInsights.actionSteps.map((step, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-400">
                        <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
                        <p className="text-gray-600 mb-2">{step.description}</p>
                        <div className="bg-green-50 p-3 rounded border">
                          <p className="text-green-800 text-sm font-medium">✨ {step.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-lg bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="pt-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Remember This</h3>
                <p className="text-gray-700 italic text-lg leading-relaxed max-w-2xl mx-auto">
                  "You are not broken and you don't need fixing. You are a human being with a beautiful, complex inner world who deserves love, understanding, and gentle growth. Every step you take toward healing is an act of courage."
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600">
                Thank you for beginning this journey with us. Every path to wellness starts with a single step, 
                and you've already taken that step by being here.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate('/')} variant="outline" size="lg">
            Take Assessment Again
          </Button>
          <Button onClick={() => navigate('/chat')} className="bg-purple-600 hover:bg-purple-700" size="lg">
            Start Your Healing Journey
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentSummary;
