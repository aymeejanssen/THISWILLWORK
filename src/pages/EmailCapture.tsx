
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { Brain, Heart, Users, Briefcase, Compass, UserCircle, CheckCircle, ArrowRight, Loader2, Clock, Zap, Calendar, MessageCircle, Shield, Star, Headphones, AlertTriangle, X, Mail, Sparkles, Plane, MapPin, Flower2 } from 'lucide-react';
import { useAssessment } from '../contexts/AssessmentContext';
import { supabase } from '../integrations/supabase/client';
import ConsentModal from '../components/ConsentModal';
import DataManagement from '../components/DataManagement';
import { usePrivacyConsent } from '../hooks/usePrivacyConsent';

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

const EmailCapture = () => {
  const navigate = useNavigate();
  const { responses } = useAssessment();
  const { hasConsent, showConsentModal, grantConsent, closeConsentModal } = usePrivacyConsent();
  
  const [aiInsights, setAiInsights] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    
    setIsSubmittingEmail(true);
    
    try {
      // Store email in localStorage for now (you can integrate with Supabase later)
      localStorage.setItem('prelaunch_email', email);
      localStorage.setItem('prelaunch_signup_date', new Date().toISOString());
      
      console.log('Pre-launch email captured:', email);
      setEmailSubmitted(true);
    } catch (err) {
      console.error('Error storing email:', err);
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handleConsentDecline = () => {
    alert('Consent is required to use this mental wellness service. You will be redirected to the homepage.');
    navigate('/');
  };

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

  if (showConsentModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        <ConsentModal
          isOpen={showConsentModal}
          onConsent={grantConsent}
          onDecline={handleConsentDecline}
        />
      </div>
    );
  }

  if (showDataManagement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Button 
            variant="ghost" 
            onClick={() => setShowDataManagement(false)} 
            className="mb-4"
          >
            ← Back to Summary
          </Button>
          <DataManagement />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Your privacy is protected. Data processed with your consent.
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDataManagement(true)}
              className="text-blue-600 border-blue-300"
            >
              Manage Data
            </Button>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 rounded-full px-4 py-2 mb-2">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Assessment Complete</span>
          </div>
          <h1 className="text-4xl font-bold wellness-text-gradient">Your Journey Starts Here</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-tight">
            You are not alone in this journey, and your willingness to address these challenges speaks volumes about your strength and commitment to your well-being.
          </p>
        </div>

        {/* Contest Announcement */}
        <Card className="shadow-xl border-none bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 overflow-hidden">
          <CardContent className="pt-6 pb-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Flower2 className="h-8 w-8 text-emerald-600" />
                <Badge className="bg-emerald-600 text-white px-6 py-3 text-xl font-bold">
                  🏆 EXCLUSIVE CONTEST
                </Badge>
                <Plane className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Win a 7-Day Mental Wellness Retreat in Sri Lanka!</h2>
              <p className="text-gray-700 leading-tight text-xl mb-6 max-w-3xl mx-auto">
                Join our pre-launch and get a chance to win an all-expenses-paid wellness journey featuring:
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-6">
                <div className="bg-white/80 rounded-lg p-4 text-center">
                  <Flower2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-800">Daily Yoga</h4>
                  <p className="text-sm text-gray-600">Sunrise sessions</p>
                </div>
                <div className="bg-white/80 rounded-lg p-4 text-center">
                  <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-800">Guided Therapy</h4>
                  <p className="text-sm text-gray-600">1-on-1 sessions</p>
                </div>
                <div className="bg-white/80 rounded-lg p-4 text-center">
                  <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-800">Digital Detox</h4>
                  <p className="text-sm text-gray-600">Offline time</p>
                </div>
                <div className="bg-white/80 rounded-lg p-4 text-center">
                  <Heart className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-800">Mindfulness</h4>
                  <p className="text-sm text-gray-600">Meditation & nature</p>
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 max-w-2xl mx-auto">
                <p className="text-emerald-800 font-medium">
                  ✨ <strong>Worth $3,500+</strong> • Beautiful beachfront resort • Professional wellness coaches • All meals included
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Launch Announcement */}
        <Card className="shadow-xl border-none bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 overflow-hidden w-full">
          <CardContent className="pt-6 pb-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-orange-600" />
                <Badge className="bg-orange-600 text-white px-4 py-2 text-lg font-bold">
                  Launching July 1st, 2025
                </Badge>
                <Sparkles className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Be Among the First to Experience AI Wellness Coaching</h2>
              <p className="text-gray-700 leading-tight text-lg mb-6 max-w-2xl mx-auto">
                Join our exclusive pre-launch list and be the first to access personalized AI coaching for your <span className="font-semibold text-purple-700">{primaryConcern}</span> challenges when we officially launch.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Email Capture Form */}
        {!emailSubmitted ? (
          <Card className="shadow-xl bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-center wellness-text-gradient flex items-center justify-center gap-2">
                <Mail className="h-6 w-6" />
                Reserve Your Spot & Enter Contest
              </CardTitle>
              <p className="text-gray-600 text-center">Enter your email to join our pre-launch list and automatically enter the Sri Lanka wellness retreat contest!</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={!email || !email.includes('@') || isSubmittingEmail}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-3"
                >
                  {isSubmittingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Entering Contest...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Join Pre-Launch & Enter Contest
                    </>
                  )}
                </Button>
              </form>
              
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">What you'll get:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Automatic entry into Sri Lanka retreat contest
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    First access when we launch July 1st
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Exclusive pre-launch pricing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Your assessment results saved for launch day
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl bg-gradient-to-r from-green-50 to-blue-50 border-green-200 max-w-2xl mx-auto">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">You're All Set!</h3>
                <p className="text-gray-700 leading-relaxed">
                  Thank you for joining our pre-launch list! We'll notify you at <strong>{email}</strong> when Mynd Ease launches on July 1st, 2025.
                </p>
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 mt-4">
                  <p className="text-sm text-emerald-700 font-medium">
                    🏆 <strong>Contest Entry Confirmed!</strong> You're now entered to win the 7-day wellness retreat in Sri Lanka. Winner will be announced closer to launch date.
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                  <p className="text-sm text-blue-700">
                    Your assessment results have been saved and will be ready for you when we launch. Get ready to start your personalized AI wellness journey!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Insights Section - Same as original */}
        {aiInsights && aiInsights.insights.length > 0 && (
          <div className="space-y-6">
            <Card className="shadow-xl bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-3xl wellness-text-gradient mb-2 text-center">Preview: Your Personalized Insights</CardTitle>
                <p className="text-gray-600 text-lg text-center">Here's a preview of what our AI has identified about your situation</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {aiInsights.insights.slice(0, 1).map((insight, index) => (
                    <div key={index} className="bg-white rounded-lg p-6 shadow-md border border-purple-100">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-100 rounded-full">
                          <Heart className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xl text-purple-800 mb-2">{insight.title}</h4>
                          <div className="text-gray-700 leading-relaxed mb-3">
                            <p className="mb-2">{insight.description}</p>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h5 className="font-semibold text-blue-800 mb-2">Reframing Perspective</h5>
                            <p className="text-blue-700">{insight.reframe}</p>
                          </div>
                          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm text-yellow-800 font-medium">
                              📧 Get your complete personalized analysis when we launch July 1st!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
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

export default EmailCapture;
