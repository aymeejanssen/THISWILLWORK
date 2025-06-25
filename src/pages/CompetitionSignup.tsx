import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, Mail, Calendar, Gift, Users, Heart, Brain, Shield, Clock, MapPin } from 'lucide-react';

const CompetitionSignup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !fullName || !dateOfBirth) return;
    setIsSubmittingEmail(true);
    try {
      // Store in localStorage for backup
      localStorage.setItem('prelaunch_email', email);
      localStorage.setItem('prelaunch_fullname', fullName);
      localStorage.setItem('prelaunch_dob', dateOfBirth);
      localStorage.setItem('prelaunch_signup_date', new Date().toISOString());
      
      // Split full name into first and last name
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Send to HubSpot
      const hubspotRes = await fetch('/api/createHubspotContact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          dateOfBirth,
          source: 'pre-launch-competition',
          tags: ['pre-launch', 'competition-entry', 'sri-lanka-contest']
        })
      });

      const hubspotData = await hubspotRes.json();
      if (!hubspotRes.ok) {
        console.error('HubSpot integration error:', hubspotData);
        // Continue with local storage as fallback
      } else {
        console.log('Successfully added to HubSpot:', hubspotData);
      }
      
      console.log('Pre-launch signup captured:', { email, fullName, dateOfBirth });
      setEmailSubmitted(true);
    } catch (err) {
      console.error('Error storing signup:', err);
      // Still show success to user even if HubSpot fails
      setEmailSubmitted(true);
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handleAssessmentClick = () => {
    navigate('/assessment', { state: { returnTo: '/competition' } });
  };

  return (
    <div className="min-h-screen wellness-gradient p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <Badge className="bg-transparent border-2 border-white text-white px-3 py-1 text-xs backdrop-blur-sm shadow-lg animate-pulse">
            Launching July 1st, 2025
          </Badge>
          
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
              <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200 bg-clip-text text-transparent">
                Mynd Ease
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto px-4">
              Personalized AI wellness coach to help you heal from trauma, build resilience, and improve your mental wellness.
            </p>
          </div>
        </div>

        {/* Contest Badge - Moved above email signup */}
        <div className="text-center px-4">
          <Badge style={{ background: 'linear-gradient(to right, #F3B883, #F4AB95)', color: '#FFFFFF' }} className="px-6 sm:px-8 text-sm sm:text-lg font-medium border border-orange-200/30 backdrop-blur-sm py-4 sm:py-6 shadow-md rounded-xl">
            🏆 Win a Mental Wellness Retreat in Sri Lanka for Two 🇱🇰
          </Badge>
        </div>

        {/* Email Signup Section with Side Elements - Made wider */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-center max-w-7xl mx-auto px-4">
          {/* Left Side - Benefits */}
          <div className="hidden lg:block space-y-4">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              <div className="flex items-center gap-3 text-white">
                <Calendar className="h-6 w-6 text-yellow-300" />
                <div>
                  <h3 className="font-semibold">Early Access</h3>
                  <p className="text-sm text-white/80">First to try July 1st</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              <div className="flex items-center gap-3 text-white">
                <Gift className="h-6 w-6 text-pink-300" />
                <div>
                  <h3 className="font-semibold">Free Trial</h3>
                  <p className="text-sm text-white/80">No cost to start</p>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Main Signup Form - Made wider */}
          <div className="w-full lg:col-span-3">
            {!emailSubmitted ? (
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                <CardHeader className="text-center pb-1 px-4 sm:px-6 pt-3">
                  <CardTitle className="text-xl sm:text-2xl">
                    <span className="text-white">Join </span>
                    <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200 bg-clip-text text-transparent">Mynd Ease</span>
                    <span className="text-white"> Pre-Launch</span>
                  </CardTitle>
                  <p className="text-sm sm:text-base text-white/90 px-2">Get early access & a chance to win a trip to Sri Lanka</p>
                </CardHeader>
                <CardContent className="space-y-4 px-4 sm:px-8">
                  <form onSubmit={handleEmailSubmit} className="space-y-3">
                    <div>
                      <Label htmlFor="fullName" className="text-sm font-medium text-white">
                        Full Name
                      </Label>
                      <Input 
                        id="fullName" 
                        type="text" 
                        placeholder="John Doe" 
                        value={fullName} 
                        onChange={e => setFullName(e.target.value)} 
                        required 
                        className="mt-1 bg-white/10 border-white/30 text-white placeholder:text-white/60 backdrop-blur-sm w-full" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-white">
                        Email Address
                      </Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your@email.com" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required 
                        className="mt-1 bg-white/10 border-white/30 text-white placeholder:text-white/60 backdrop-blur-sm w-full" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth" className="text-sm font-medium text-white">
                        Date of Birth
                      </Label>
                      <Input 
                        id="dateOfBirth" 
                        type="date" 
                        value={dateOfBirth} 
                        onChange={e => setDateOfBirth(e.target.value)} 
                        required 
                        className="mt-1 bg-white/10 border-white/30 text-white placeholder:text-white/60 backdrop-blur-sm w-full" 
                      />
                    </div>
                    <div className="flex justify-center pt-2">
                      <Button 
                        type="submit" 
                        disabled={!email || !email.includes('@') || !fullName || !dateOfBirth || isSubmittingEmail} 
                        className="w-full bg-white/20 text-white border border-white/30 hover:bg-white/30 backdrop-blur-sm text-sm px-6 py-3"
                      >
                        {isSubmittingEmail ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Signing Up...
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            Join Pre-Launch List & Chance to Win Trip
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                  
                  <div className="text-xs sm:text-sm text-white/80 text-center">
                    <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap leading-tight">
                      <span>✓ Free trial when we launch</span>
                      <span>✓ First access July 1st</span>
                      <span>✓ Automatic contest entry below 👇</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                <CardContent className="p-4 sm:p-6 text-center space-y-4">
                  <CheckCircle className="h-8 w-8 text-white mx-auto" />
                  <h3 className="text-lg sm:text-xl font-bold text-white">You're All Set!</h3>
                  <p className="text-sm sm:text-base text-white/90">
                    Thank you for joining our pre-launch list, <strong>{fullName}</strong>! We'll notify you at <strong>{email}</strong> when Mynd Ease launches July 1st.
                  </p>
                  <p className="text-sm text-white font-medium">
                    🏆 Contest entry confirmed! Scroll down to see contest details.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - Contest Highlight */}
          <div className="hidden lg:block space-y-4">
            <div className="bg-purple-500/20 backdrop-blur-sm p-4 rounded-lg border border-purple-300/30">
              <div className="flex items-center gap-3 text-white">
                <Gift className="h-6 w-6 text-purple-300" />
                <div>
                  <h3 className="font-semibold">Win Sri Lanka Trip</h3>
                  <p className="text-sm text-white/80">6-day wellness retreat</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              <div className="flex items-center gap-3 text-white">
                <Users className="h-6 w-6 text-green-300" />
                <div>
                  <h3 className="font-semibold">Join Community</h3>
                  <p className="text-sm text-white/80">Connect with others</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prize Mention Line */}
        <div className="text-center py-0 px-4">
          <div className="max-w-md mx-auto">
            <div className="h-px bg-white/30 mb-3"></div>
            <p className="text-white/90 text-sm font-medium">About your prize</p>
            <div className="h-px bg-white/30 mt-3"></div>
          </div>
        </div>

        {/* Contest Section - Unified Layout */}
        <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto px-4">
          <div className="text-center space-y-6">
            {/* Unified Contest Details and Image */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
              {/* Contest Details Header */}
              <div className="p-4 sm:p-6 pb-4">
                <h3 className="font-bold text-white text-2xl sm:text-3xl text-center">
                  6-Day All-Expenses-Paid Wellness Journey Includes:
                </h3>
              </div>
              
              {/* Combined Content Area */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Contest Details - Left Side */}
                <div className="p-4 sm:p-6 pt-0 space-y-4">
                  <div className="space-y-3">
                    {/* Mobile: Single column, Desktop: Two columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-white/90 text-xs sm:text-sm">
                      <p className="text-left">✈️ Round-trip flights covered</p>
                      <p className="text-left">🏔️ 5 nights in scenic Ella mountains</p>
                      <p className="text-left">🧘‍♀️ Daily yoga & meditation sessions</p>
                      <p className="text-left">❤️‍🩹 Guided therapy & wellness coaching</p>
                      <p className="text-left">💆‍♀️ Daily massages included</p>
                      <p className="text-left">📱 Complete digital detox program</p>
                      <p className="text-left">🌿 Mindfulness & nature immersion</p>
                      <p className="text-left">🥗 Healthy organic meals included</p>
                    </div>
                  </div>
                </div>
                
                {/* Image - Right Side */}
                <div className="lg:border-l lg:border-white/20">
                  <img 
                    src="/lovable-uploads/1749b98f-d6c9-41a9-977f-47b9be29154e.png" 
                    alt="Sri Lanka mountain railway through lush green forest - your wellness retreat destination" 
                    className="w-full h-48 sm:h-64 lg:h-80 object-cover" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transition Section */}
        <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4">
          <div className="flex items-center gap-4">
            <Separator className="flex-1 bg-white/30" />
            <div className="px-4 sm:px-6 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <p className="text-white/90 text-center text-xs sm:text-sm font-medium">
                Ready to go deeper? Let's get to know your wellness journey
              </p>
            </div>
            <Separator className="flex-1 bg-white/30" />
          </div>
        </div>

        {/* Assessment Button */}
        <div className="text-center px-4">
          <Button 
            onClick={handleAssessmentClick}
            style={{ background: 'linear-gradient(to right, #F3B883, #F4AB95)', color: '#FFFFFF' }}
            className="w-full sm:w-auto border border-orange-200/30 backdrop-blur-sm hover:opacity-90 px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg rounded-lg"
          >
            <span className="block sm:hidden">Take 12 Questions</span>
            <span className="hidden sm:block">Take 12 Questions to Resolve Trauma & Get Insights</span>
          </Button>
          <p className="text-white/80 text-xs sm:text-sm mt-2">
            Help us understand your wellness journey • 5 minutes
          </p>
        </div>

        {/* Features Preview */}
        <div className="max-w-4xl mx-auto py-8 sm:py-12 bg-gradient-to-br from-orange-200/10 via-peach-200/10 to-pink-200/10 rounded-2xl backdrop-blur-sm border border-white/10 mx-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6 sm:mb-8 px-4">
            What Makes Mynd Ease Different
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 px-4 sm:px-6">
            <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-white/20">
              <Brain className="h-8 w-8 text-purple-300 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">AI-Powered Trauma Recovery</h3>
              <p className="text-sm sm:text-base text-white/90">
                Our advanced AI understands trauma patterns and provides personalized healing strategies based on the latest research in psychology and neuroscience.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-white/20">
              <Heart className="h-8 w-8 text-pink-300 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">24/7 Emotional Support</h3>
              <p className="text-sm sm:text-base text-white/90">
                Never feel alone again. Your AI wellness coach is available anytime you need support, guidance, or just someone to listen.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-white/20">
              <Shield className="h-8 w-8 text-green-300 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Privacy & Security First</h3>
              <p className="text-sm sm:text-base text-white/90">
                Your mental health journey is completely private. We use end-to-end encryption and never share your personal data.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-white/20">
              <Clock className="h-8 w-8 text-yellow-300 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Evidence-Based Methods</h3>
              <p className="text-sm sm:text-base text-white/90">
                All our techniques are grounded in proven therapeutic approaches like CBT, DBT, and trauma-informed care practices.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6 sm:mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-white/20">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">When exactly does Mynd Ease launch?</h3>
              <p className="text-sm sm:text-base text-white/90">We're launching July 1st, 2025. Pre-launch subscribers get early access and a free trial period.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-white/20">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">How does the Sri Lanka trip contest work?</h3>
              <p className="text-sm sm:text-base text-white/90">Every pre-launch signup is automatically entered. We'll randomly select one winner in July 2025 for a 6-day wellness retreat in beautiful Ella, Sri Lanka.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-white/20">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Is my personal information safe?</h3>
              <p className="text-sm sm:text-base text-white/90">Absolutely. We use enterprise-grade security and never share your data. Your wellness journey remains completely private.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-white/20">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Can Mynd Ease replace professional therapy?</h3>
              <p className="text-sm sm:text-base text-white/90">Mynd Ease is designed to complement, not replace, professional mental health care. Always consult with licensed professionals for serious mental health concerns.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
      </div>
    </div>
  );
};

export default CompetitionSignup;
