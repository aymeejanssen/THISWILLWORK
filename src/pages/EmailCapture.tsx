import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { Brain, Heart, CheckCircle, Loader2, Shield, Mail, Sparkles, Flower2 } from 'lucide-react';
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
      <div className="min-h-screen wellness-gradient p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-white" />
            <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Responses</h2>
            <p className="text-white/80">Please wait while we process your assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen wellness-gradient p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-white/80 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-white/20 hover:bg-white/30 text-white border border-white/30">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showConsentModal) {
    return (
      <div className="min-h-screen wellness-gradient p-6">
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
      <div className="min-h-screen wellness-gradient p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Button 
            variant="ghost" 
            onClick={() => setShowDataManagement(false)} 
            className="mb-4 text-white hover:bg-white/20"
          >
            ← Back to Summary
          </Button>
          <DataManagement />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen wellness-gradient p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Privacy Notice */}
        <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-white" />
            <span className="text-sm text-white">
              Your privacy is protected. Data processed with your consent.
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDataManagement(true)}
            className="text-white border-white/30 hover:bg-white/20"
          >
            Manage Data
          </Button>
        </div>

        {/* Launch & Contest Section with Image - MOVED UP */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <Badge className="bg-white text-gray-900 px-4 py-2 text-lg font-semibold mb-4">
                Launching July 1st, 2025
              </Badge>
              
              <div className="space-y-4">
                <Badge className="bg-purple-500/20 text-white px-4 py-2 text-lg font-semibold border border-purple-300/30 backdrop-blur-sm">
                  🏆 Win a Mental Wellness Retreat in Sri Lanka
                </Badge>
                <h2 className="text-2xl font-bold text-white">Join Our Pre-Launch & Enter to Win</h2>
                
                {/* Contest Details */}
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20 space-y-4">
                  <h3 className="text-lg font-semibold text-white">6-Day All-Expenses-Paid Wellness Journey Includes:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left text-white/90 text-sm">
                    <div className="space-y-2">
                      <p>✈️ Round-trip flights covered</p>
                      <p>🏔️ 5 nights in scenic Ella mountains</p>
                      <p>🧘‍♀️ Daily yoga & meditation sessions</p>
                      <p>❤️‍🩹 Guided therapy & wellness coaching</p>
                      <p>💆‍♀️ Daily massages included</p>
                    </div>
                    <div className="space-y-2">
                      <p>📱 Complete digital detox program</p>
                      <p>🌿 Mindfulness & nature immersion</p>
                      <p>🥗 Healthy organic meals included</p>
                      <p>👨‍🍳 Daily activities like cooking classes</p>
                      <p>🧘 Personal wellness assessments</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-white/80 max-w-xl mx-auto lg:mx-0 mt-4">
                Be among the first to experience AI wellness coaching for your <span className="font-semibold">{primaryConcern}</span> challenges with our free trial.
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="order-first lg:order-last">
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <img 
                src="/lovable-uploads/1749b98f-d6c9-41a9-977f-47b9be29154e.png" 
                alt="Sri Lanka mountain railway through lush green forest - your wellness retreat destination"
                className="w-full h-64 lg:h-80 object-cover"
              />
            </div>
          </div>
        </div>

        {/* Email Form - MOVED UP */}
        {!emailSubmitted ? (
          <div className="max-w-md mx-auto space-y-4">
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="text-left">
                <Label htmlFor="email" className="text-sm font-medium text-white">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 bg-white/10 border-white/30 text-white placeholder:text-white/60 backdrop-blur-sm"
                />
              </div>
              <Button 
                type="submit" 
                disabled={!email || !email.includes('@') || isSubmittingEmail}
                className="w-full bg-white text-gray-900 hover:bg-white/90"
              >
                {isSubmittingEmail ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Entering Contest...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Join Pre-Launch & Enter Contest
                  </>
                )}
              </Button>
            </form>
            
            <div className="text-sm text-white/80 space-y-1 text-center">
              <p>✓ Automatic contest entry</p>
              <p>✓ Free trial when we launch</p>
              <p>✓ First access July 1st</p>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20 text-center space-y-4">
              <CheckCircle className="h-8 w-8 text-white mx-auto" />
              <h3 className="text-xl font-bold text-white">You're All Set!</h3>
              <p className="text-white/90">
                Thank you for joining our pre-launch list! We'll notify you at <strong>{email}</strong> when we launch July 1st.
              </p>
              <p className="text-sm text-white font-medium">
                🏆 Contest entry confirmed! Winner announced closer to launch date.
              </p>
            </div>
          </div>
        )}

        {/* AI Insights Preview - MOVED DOWN */}
        {aiInsights && aiInsights.insights.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Preview: Your Personalized Insights</h2>
              <p className="text-white/80">Here's a preview of what our AI has identified about your situation</p>
            </div>
            
            {aiInsights.insights.slice(0, 1).map((insight, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-500/20 rounded-full backdrop-blur-sm">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-white mb-2">{insight.title}</h4>
                    <p className="text-white/90 mb-3">{insight.description}</p>
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10 backdrop-blur-sm">
                      <h5 className="font-medium text-white mb-2">Reframing Perspective</h5>
                      <p className="text-white/80 text-sm">{insight.reframe}</p>
                    </div>
                  </div>
                </div>
                <div className="text-center p-3 bg-yellow-500/20 rounded-lg border border-yellow-300/30 backdrop-blur-sm">
                  <p className="text-sm text-white">
                    📧 Get your complete personalized analysis when we launch July 1st!
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <Button onClick={() => navigate('/')} variant="outline" className="border-white/30 text-white hover:bg-white/20">
            Take Assessment Again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailCapture;
