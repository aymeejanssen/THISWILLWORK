
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Brain, Heart, Users, Briefcase, Compass, UserCircle, CheckCircle, ArrowRight, Loader2, Clock, Zap, Calendar, MessageCircle, Shield, Star, Headphones } from 'lucide-react';
import { useAssessment } from '../contexts/AssessmentContext';
import { supabase } from '../integrations/supabase/client';
import ChatInterface from '../components/ChatInterface';

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
  const [showPricing, setShowPricing] = useState(false);
  const [showFreeTrialChat, setShowFreeTrialChat] = useState(false);
  const [trialTimeRemaining, setTrialTimeRemaining] = useState(300); // 5 minutes in seconds

  // Get the primary concern from responses
  const primaryConcern = responses.primaryConcern || 'general wellness';

  useEffect(() => {
    const generateInsights = async () => {
      try {
        console.log('Calling AI function with responses:', responses);
        
        const { data, error } = await supabase.functions.invoke('generate-assessment-insights', {
          body: { responses, primaryConcern }
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

    if (Object.keys(responses).length > 0) {
      generateInsights();
    } else {
      setIsLoading(false);
    }
  }, [responses, primaryConcern]);

  const handleStartSession = () => {
    setShowPricing(true);
  };

  const handleStartFreeTrial = () => {
    setShowFreeTrialChat(true);
    // Start 5-minute countdown
    const timer = setInterval(() => {
      setTrialTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowFreeTrialChat(false);
          setShowPricing(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const PricingCard = ({ title, price, sessions, features, isPopular = false }: {
    title: string;
    price: string;
    sessions: string;
    features: string[];
    isPopular?: boolean;
  }) => (
    <Card className={`relative ${isPopular ? 'border-purple-500 border-2' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-purple-600 text-white px-4 py-1">Most Popular</Badge>
        </div>
      )}
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{title}</CardTitle>
        <div className="text-3xl font-bold text-purple-600">{price}</div>
        <p className="text-gray-600">{sessions}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
            <span className="text-sm text-gray-700">{feature}</span>
          </div>
        ))}
        <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
          Choose Plan
        </Button>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
          <Card className="shadow-lg p-8 text-center">
            <CardContent>
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Responses</h2>
              <p className="text-gray-600">Please wait while we process your assessment...</p>
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

  if (showFreeTrialChat) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50">
          <Card className="bg-purple-600 text-white border-purple-500">
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Trial: {formatTime(trialTimeRemaining)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        <ChatInterface 
          onClose={() => {
            setShowFreeTrialChat(false);
            setShowPricing(true);
          }}
          userProfile={{ 
            name: 'Trial User',
            currentStruggles: [primaryConcern],
            preferredLanguage: 'English'
          }}
        />
      </>
    );
  }

  if (showPricing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <Button 
              variant="ghost" 
              onClick={() => setShowPricing(false)}
              className="mb-4"
            >
              ← Back to Summary
            </Button>
            <h1 className="text-4xl font-bold text-gray-900">Choose Your Healing Journey</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Start your personalized {primaryConcern} sessions and get the support you deserve
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <PricingCard
              title="Weekly Support"
              price="29.99 AED"
              sessions="4 sessions per month"
              features={[
                "Once a week sessions",
                "30-minute conversations",
                "Flexible scheduling",
                "Personal growth tracking",
                "Basic emotional support",
                "Stress management techniques",
                "Goal setting guidance"
              ]}
            />
            
            <PricingCard
              title="Regular Care"
              price="49.99 AED"
              sessions="3 times per week"
              features={[
                "12 sessions per month",
                "30-minute sessions",
                "Any time, any day",
                "Faster progress tracking",
                "Priority support",
                "Advanced coping strategies",
                "Relationship guidance",
                "Trauma-informed approach",
                "Mood pattern analysis"
              ]}
            />
            
            <PricingCard
              title="Unlimited Support"
              price="99.99 AED"
              sessions="Unlimited access"
              features={[
                "24/7 availability",
                "Unlimited conversations",
                "Always there when you need support",
                "Immediate anxiety relief",
                "Companion during lonely moments",
                "Timeless sessions",
                "Crisis intervention support",
                "Personalized therapy plans",
                "Progress insights & reports",
                "Advanced emotional coaching",
                "Sleep & wellness guidance",
                "Family relationship support"
              ]}
              isPopular={true}
            />
          </div>

          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="pt-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">What You'll Experience</h3>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Brain className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Deep Conversations</h4>
                      <p className="text-sm text-gray-600">Get to the root of your challenges through meaningful dialogue</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">At Your Own Pace</h4>
                      <p className="text-sm text-gray-600">No pressure - progress at a speed that feels right for you</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Practical Exercises</h4>
                      <p className="text-sm text-gray-600">Guided activities to help you process and heal</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <UserCircle className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Clear Explanations</h4>
                      <p className="text-sm text-gray-600">Understand why you feel certain ways and how past experiences shape your responses</p>
                    </div>
                  </div>
                </div>
              </div>
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
          <h1 className="text-4xl font-bold text-gray-900">Your Journey Starts Here</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            You are not alone in this journey, and your willingness to address these challenges speaks volumes about your strength and commitment to your well-being.
          </p>
        </div>

        {/* Enhanced AI Therapy Trial Button with foggy, cloudy, organic design */}
        <Card className="shadow-xl border-none bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-200/20 via-pink-200/20 to-yellow-200/20 blur-3xl"></div>
          <CardContent className="pt-8 pb-8 text-center space-y-6 relative z-10">
            <div className="flex justify-center">
              <div className="relative">
                {/* Outermost foggy cloud layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-300/15 via-pink-300/15 to-yellow-300/15 blur-3xl scale-[2.5] animate-pulse opacity-40 rounded-[60% 40% 70% 30% / 60% 30% 70% 40%]" style={{animationDelay: '0s', animationDuration: '4s'}}></div>
                
                {/* Second cloud layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-yellow-400/20 blur-2xl scale-[2] animate-pulse opacity-50 rounded-[40% 60% 30% 70% / 70% 40% 60% 30%]" style={{animationDelay: '1s', animationDuration: '3s'}}></div>
                
                {/* Third cloud layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/25 via-pink-500/25 to-yellow-500/25 blur-xl scale-[1.6] animate-pulse opacity-60 rounded-[70% 30% 60% 40% / 40% 70% 30% 60%]" style={{animationDelay: '2s', animationDuration: '3.5s'}}></div>
                
                {/* Inner glow layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 via-pink-400/30 to-yellow-400/30 blur-lg scale-[1.3] animate-pulse opacity-70 rounded-[50% 50% 60% 40% / 60% 40% 50% 50%]" style={{animationDelay: '0.5s', animationDuration: '2.8s'}}></div>
                
                <div className="absolute inset-0 bg-gradient-to-br from-purple-300/35 via-pink-300/35 to-yellow-300/35 blur-md scale-[1.15] animate-pulse opacity-80 rounded-[45% 55% 35% 65% / 55% 35% 65% 45%]" style={{animationDelay: '1.5s', animationDuration: '2.5s'}}></div>
                
                {/* Main organic button */}
                <Button 
                  onClick={handleStartFreeTrial}
                  className="relative bg-gradient-to-br from-purple-500 via-pink-400 to-yellow-400 hover:from-purple-600 hover:via-pink-500 hover:to-yellow-500 text-white w-36 h-36 flex items-center justify-center shadow-2xl border-4 border-white/30 backdrop-blur-sm hover:scale-105 transform transition-all duration-700 group overflow-hidden"
                  style={{
                    borderRadius: '45% 55% 60% 40% / 55% 45% 40% 60%',
                    animation: 'float 6s ease-in-out infinite'
                  }}
                  size="lg"
                >
                  {/* Inner organic gradient overlays */}
                  <div className="absolute inset-1 bg-gradient-to-br from-white/15 to-transparent rounded-[40% 60% 55% 45% / 50% 40% 60% 50%]"></div>
                  <div className="absolute inset-2 bg-gradient-to-br from-transparent to-white/10 rounded-[35% 65% 45% 55% / 45% 55% 35% 65%]"></div>
                  
                  {/* Floating internal clouds */}
                  <div className="absolute top-4 left-6 w-4 h-4 bg-white/20 rounded-full blur-sm animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute bottom-6 right-4 w-3 h-3 bg-white/15 rounded-full blur-sm animate-pulse" style={{animationDelay: '1.2s'}}></div>
                  <div className="absolute top-8 right-8 w-2 h-2 bg-white/25 rounded-full blur-sm animate-pulse" style={{animationDelay: '2s'}}></div>
                  
                  {/* Brain icon with soft glow */}
                  <div className="relative z-10">
                    <div className="absolute inset-0 text-white/40 blur-md">
                      <Brain className="h-16 w-16" />
                    </div>
                    <div className="absolute inset-0 text-white/60 blur-sm">
                      <Brain className="h-16 w-16" />
                    </div>
                    <Brain className="h-16 w-16 relative z-10 group-hover:scale-110 transition-transform duration-500 drop-shadow-lg" />
                  </div>
                </Button>
                
                {/* Floating badge with organic shape */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <Badge className="bg-white/95 backdrop-blur-md text-purple-800 text-sm px-6 py-3 shadow-xl border border-purple-200/30 rounded-[30% 70% 60% 40% / 40% 60% 70% 30%]">
                    <Clock className="h-3 w-3 mr-2" />
                    Try AI Therapy Free - 5 min
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Experience AI Therapy</h3>
              <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto text-lg">
                Try our AI therapy companion for free! Have a real conversation about your <span className="font-semibold text-purple-700">{primaryConcern}</span> challenges. 
                No commitment needed - just click and start talking.
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-purple-200 shadow-lg">
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-1 rounded-full">
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Available 24/7 for panic attacks or anxiety</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-1 rounded-full">
                    <Heart className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>Companion when you're feeling lonely</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-1 rounded-full">
                    <Brain className="h-4 w-4 text-purple-600" />
                  </div>
                  <span>Emotional education and awareness building</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-pink-100 p-1 rounded-full">
                    <Headphones className="h-4 w-4 text-pink-600" />
                  </div>
                  <span>Understanding trauma responses in adulthood</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Pricing Plans - showing all features */}
        <Card className="shadow-lg border-purple-200">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 text-center">Choose Your Plan</CardTitle>
            <p className="text-center text-gray-600">Start your personalized {primaryConcern} sessions</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 border rounded-xl hover:border-purple-300 transition-colors hover:shadow-lg">
                <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-bold text-xl mb-2">Weekly Support</h4>
                <div className="text-3xl font-bold text-purple-600 my-3">29.99 AED</div>
                <p className="text-sm text-gray-600 mb-4">4 sessions per month</p>
                
                <div className="space-y-2 mb-6 text-left">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Once a week sessions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>30-minute conversations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Flexible scheduling</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Personal growth tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Basic emotional support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Stress management techniques</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Goal setting guidance</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full" onClick={handleStartSession}>
                  Choose Plan
                </Button>
              </div>
              
              <div className="text-center p-6 border rounded-xl hover:border-purple-300 transition-colors hover:shadow-lg">
                <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-bold text-xl mb-2">Regular Care</h4>
                <div className="text-3xl font-bold text-purple-600 my-3">49.99 AED</div>
                <p className="text-sm text-gray-600 mb-4">12 sessions per month</p>
                
                <div className="space-y-2 mb-6 text-left">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>3 times per week sessions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>30-minute sessions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Any time, any day</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Faster progress tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Priority support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Advanced coping strategies</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Relationship guidance</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Trauma-informed approach</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Mood pattern analysis</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full" onClick={handleStartSession}>
                  Choose Plan
                </Button>
              </div>
              
              <div className="text-center p-6 border-2 border-purple-500 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 relative hover:shadow-xl transition-shadow">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white px-4 py-2 shadow-lg">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-full w-fit mx-auto mb-4">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-bold text-xl mb-2">Unlimited Support</h4>
                <div className="text-3xl font-bold text-purple-600 my-3">99.99 AED</div>
                <p className="text-sm text-gray-600 mb-4">Unlimited access</p>
                
                <div className="space-y-2 mb-6 text-left">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>24/7 availability</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Unlimited conversations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Always there when you need support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Immediate anxiety relief</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Companion during lonely moments</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Timeless sessions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Crisis intervention support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Personalized therapy plans</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Progress insights & reports</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Advanced emotional coaching</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Sleep & wellness guidance</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Family relationship support</span>
                  </div>
                </div>
                
                <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleStartSession}>
                  Choose Plan
                </Button>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <Button variant="link" onClick={handleStartSession} className="text-purple-600 hover:text-purple-700">
                View detailed plan comparison →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Existing AI Insights */}
        {aiInsights && aiInsights.insights.length > 0 && (
          <Card className="shadow-lg bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 text-center">What We See In You</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiInsights.insights.slice(0, 2).map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Heart className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">• {insight.title}</h4>
                      <p className="text-gray-700 text-sm">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {aiInsights && aiInsights.actionSteps.length > 0 && (
          <Card className="shadow-lg bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-xl text-blue-800">Your First Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiInsights.actionSteps.slice(0, 2).map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-1 bg-blue-100 rounded-full">
                      <ArrowRight className="h-3 w-3 text-blue-600" />
                    </div>
                    <p className="text-gray-700 text-sm">• {step.action}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate('/')} variant="outline" size="lg">
            Take Assessment Again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentSummary;
