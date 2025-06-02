
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, Mail } from 'lucide-react';

const CompetitionSignup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    
    setIsSubmittingEmail(true);
    
    try {
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

  return (
    <div className="min-h-screen wellness-gradient p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Launch & Contest Section with Image */}
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
                Be among the first to experience AI wellness coaching with our free trial.
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

        {/* Email Form */}
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
          <div className="max-w-md mx-auto space-y-4">
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
            
            {/* Assessment Button */}
            <div className="text-center">
              <Button 
                onClick={() => navigate('/assessment')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
              >
                Take 12 Questions to Resolve Trauma & Get Insights
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitionSignup;
